import {Resend} from 'resend';
import type {SupabaseClient} from '@supabase/supabase-js';
import {required,ServiceUnavailable} from './config.js';
import {captureConversion} from './analytics.js';
import {report} from './monitoring.js';
const templates:Record<string,{subject:string;body:string}>={welcome:{subject:'Bun venit la Mate cu succes',body:'Contul tău a fost creat. Poți începe explorarea matematicii.'},subscription_activated:{subject:'Abonamentul tău este activ',body:'Abonamentul tău a fost activat. Detaliile sunt disponibile în portalul de facturare.'},payment_confirmation:{subject:'Confirmarea plății',body:'Plata a fost confirmată. Factura este disponibilă în portalul de facturare.'},payment_failed:{subject:'O plată necesită atenție',body:'Plata nu a fost finalizată. Verifică metoda de plată în portalul de facturare.'},subscription_cancelled:{subject:'Abonamentul a fost anulat',body:'Anularea abonamentului a fost confirmată. Detaliile sunt disponibile în portalul de facturare.'},subscription_expiring:{subject:'Abonamentul se apropie de expirare',body:'Verifică perioada abonamentului în portalul de facturare.'},account_security:{subject:'Notificare de securitate',body:'A avut loc o schimbare privind securitatea contului. Contactează echipa dacă nu recunoști acțiunea.'}};
export function emailTemplate(kind:string){const template=templates[kind];if(!template)throw new Error('unknown_email_template');return {subject:template.subject,html:`<!doctype html><html lang="ro"><body><h1>${template.subject}</h1><p>${template.body}</p><p>Mate cu succes</p></body></html>`,text:template.body+'\nMate cu succes'};}
export function emailMessage(kind:string,from:string,to:string){return {from,to,replyTo:'stelutaenache05@gmail.com',...emailTemplate(kind)};}
export async function sendOutbox(db:SupabaseClient,environment:string){
 const emailReady=!!(process.env.RESEND_API_KEY&&process.env.RESEND_FROM&&process.env.EMAIL_SENDING_ENABLED==='true'&&(environment==='production'||process.env.RESEND_TEST_RECIPIENT));
 const analyticsReady=!!(process.env.POSTHOG_PUBLIC_KEY&&process.env.CONSENT_POLICY_VERSION);
 if(!emailReady&&!analyticsReady)return {delivered:0,failed:0};
 const resend=emailReady?new Resend(process.env.RESEND_API_KEY):undefined;
 const {data:jobs,error}=await db.rpc('claim_ready_outbox',{include_email:emailReady,include_analytics:analyticsReady});if(error)throw error;let delivered=0,failed=0;
 for(const job of (jobs??[]) as Array<{id:string;user_id:string;kind:string;dedupe_key:string;attempts:number;claim_id:string;created_at:string;payload?:{subscription_id?:string;period_end?:string}}>){
  try{
   if(job.kind.startsWith('analytics:')){
    const consent=await db.from('consents').select('granted,policy_version').eq('user_id',job.user_id).eq('category','analytics').order('revision',{ascending:false}).limit(1).maybeSingle();if(consent.error)throw consent.error;
    if(consent.data?.granted&&consent.data.policy_version===process.env.CONSENT_POLICY_VERSION)await captureConversion(job.kind.slice(10),job.user_id,job.dedupe_key,{});
    const saved=await db.from('outbox').update({delivered_at:new Date().toISOString(),locked_until:null}).eq('id',job.id).eq('claim_id',job.claim_id);if(saved.error)throw saved.error;delivered++;continue;
   }
   if(job.kind==='subscription_expiring'){
    const current=await db.from('subscriptions').select('status,cancel_at_period_end,current_period_end').eq('id',job.payload?.subscription_id??'').maybeSingle();if(current.error)throw current.error;
    const sub=current.data;
    if(!sub||!['ACTIVE','TRIALING'].includes(sub.status)||!sub.cancel_at_period_end||Date.parse(sub.current_period_end)!==Date.parse(job.payload?.period_end??'')||Date.parse(sub.current_period_end)<=Date.now()){
     const suppressed=await db.from('outbox').update({delivered_at:new Date().toISOString(),locked_until:null,last_error:null}).eq('id',job.id).eq('claim_id',job.claim_id);if(suppressed.error)throw suppressed.error;continue;
    }
   }
   if(!resend||process.env.EMAIL_SENDING_ENABLED!=='true')throw new ServiceUnavailable('email_sending_disabled');
   if(environment!=='production'&&!process.env.RESEND_TEST_RECIPIENT)throw new ServiceUnavailable('email_test_recipient');
   if(job.attempts>1&&Date.now()-Date.parse(job.created_at)>23*3600000)throw new Error('manual_reconciliation_required');
   const profile=await db.from('profiles').select('disabled_at').eq('user_id',job.user_id).single();if(profile.error||profile.data?.disabled_at)throw new Error('recipient_unavailable');
   const {data,error:authError}=await db.auth.admin.getUserById(job.user_id);if(authError||!data.user.email_confirmed_at||!data.user.email)throw new Error('recipient_unverified');
   const to=environment==='production'?data.user.email:required('RESEND_TEST_RECIPIENT');
   const sent=await resend.emails.send(emailMessage(job.kind,required('RESEND_FROM'),to),{idempotencyKey:job.dedupe_key});if(sent.error)throw new Error('email_provider_failure');
   const saved=await db.from('outbox').update({delivered_at:new Date().toISOString(),locked_until:null,last_error:null}).eq('id',job.id).eq('claim_id',job.claim_id);if(saved.error)throw saved.error;delivered++;
  }catch(error){failed++;const retry=await db.from('outbox').update({last_error:'delivery_failed',locked_until:null,available_at:new Date(Date.now()+Math.min(3600000,60000*2**job.attempts)).toISOString()}).eq('id',job.id).eq('claim_id',job.claim_id);if(retry.error)await report(retry.error,'outbox_retry_failed',job.id);await report(error,'email_delivery_failed',job.id);}
 }return {delivered,failed};
}
