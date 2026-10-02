import {persistAuthenticatedConsent,reconcileConsent,reportConsentedLogin} from './consent.js';
import {AnalyticsController,attribution} from './analytics-core.js';
import {sanitizeProperties,scrubEvent} from '../shared/privacy.js';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {EventName} from '../shared/events.js';
type Config={supabaseUrl?:string;supabaseKey?:string;posthogKey?:string;posthogHost?:string;sentryDsn?:string;environment:string;release?:string;policyVersion?:string};
const node=document.querySelector('#platform-config');const config:Config=node?JSON.parse(node.textContent??'{}'):{};
const consentKey='mate-consent-v1';
type Consent={analytics:boolean;marketing:boolean;preferences:boolean;policy_version:string;at:string};
let saved:Consent|undefined;try{saved=JSON.parse(localStorage.getItem(consentKey)??'null')??undefined;}catch{/* Restricted storage */}
if(saved?.policy_version!==config.policyVersion)saved=undefined;
let posthog:import('posthog-js').PostHog|undefined;
let closeSentry:(()=>Promise<boolean>)|undefined;
const analytics=new AnalyticsController(async()=>{
 if(!config.posthogKey)throw new Error('PostHog configuration required');
 const {posthog:ph}=await import('posthog-js');posthog=ph;
 ph.init(config.posthogKey,{api_host:config.posthogHost??'https://eu.i.posthog.com',autocapture:false,capture_pageview:false,capture_pageleave:false,disable_session_recording:true,disable_surveys:true,disable_external_dependency_loading:true,persistence:'localStorage',person_profiles:'identified_only',ip:false,before_send:event=>{if(event)event.properties={...sanitizeProperties(event.properties),distinct_id:event.properties.distinct_id,token:event.properties.token,$lib:event.properties.$lib,$lib_version:event.properties.$lib_version};return event;},property_denylist:['$current_url','$referrer','$pathname','$host','$initial_current_url','$initial_referrer']});
 ph.opt_in_capturing();
 return {capture:(name,properties)=>ph.capture(name,properties),reset:()=>{ph.opt_out_capturing();ph.reset();}};
});
async function monitoring(enabled:boolean){if(!enabled){await closeSentry?.();closeSentry=undefined;return;}if(!config.sentryDsn)return;const sentry=await import('@sentry/browser');if(!saved?.analytics)return;sentry.init({dsn:config.sentryDsn,environment:config.environment,release:config.release,tracesSampleRate:0,beforeSend:e=>scrubEvent(e),integrations:defaults=>defaults.filter(i=>!['Breadcrumbs','BrowserSession','BrowserTracing'].includes(i.name))});closeSentry=()=>sentry.close(1000);}
async function setTracking(enabled:boolean){try{await analytics.consent(enabled&&!!config.posthogKey);await monitoring(enabled);}catch{window.dispatchEvent(new CustomEvent('mate:integration-error',{detail:{service:'telemetry'}}));}}
let pendingLogin:{userId:string;eventId:string}|undefined;
let clientPromise:Promise<SupabaseClient>|undefined;
async function client(){
 if(!config.supabaseUrl||!config.supabaseKey)throw new Error('Supabase configuration required');
 clientPromise??=import('@supabase/supabase-js').then(({createClient})=>{
 const c=createClient(config.supabaseUrl!,config.supabaseKey!,{auth:{flowType:'pkce',detectSessionInUrl:false,persistSession:true,autoRefreshToken:true}});
 c.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'&&session){pendingLogin={userId:session.user.id,eventId:`login:${session.user.id}:${session.user.last_sign_in_at}`};}if(event==='SIGNED_OUT'){pendingLogin=undefined;posthog?.reset();}window.dispatchEvent(new CustomEvent('mate:auth',{detail:{event,authenticated:!!session}}));});return c;});
 return clientPromise;
}
async function api(path:string,method='GET',data?:unknown){const c=await client();const {data:session}=await c.auth.getSession();if(!session.session)throw new Error('Authentication required');const result=await fetch('/api/v1/'+path,{method,headers:{Authorization:'Bearer '+session.session.access_token,'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data),credentials:'omit'});const output=await result.json();if(!result.ok)throw new Error(output.error?.code??'Request failed');return output;}
async function syncConsent(){
 if(!config.policyVersion)return false;
 try{
  if(config.supabaseUrl&&config.supabaseKey){const session=await(await client()).auth.getSession();if(session.data.session){const result=await api('consents');if(result.consents.length){saved={...reconcileConsent(saved,result.consents,config.policyVersion),at:new Date().toISOString()};}else if(saved){await persistAuthenticatedConsent(saved,async()=>true,value=>api('consents','POST',value));}}}
  if(saved){try{localStorage.setItem(consentKey,JSON.stringify(saved));if(!saved.analytics)localStorage.removeItem('mate-attribution');}catch{/* restricted storage */}await setTracking(saved.analytics);if(saved.analytics)await recordPage();}
 reportConsentedLogin(!!saved?.analytics,pendingLogin,id=>posthog?.identify(id),id=>{void analytics.track('login_completed',{},id);});pendingLogin=undefined;
 return true;
 }catch{pendingLogin=undefined;await setTracking(false);window.dispatchEvent(new CustomEvent('mate:integration-error',{detail:{service:'consent'}}));return false;}
}
const platform={
 syncConsent,
 async stopOptionalTracking(){saved={analytics:false,marketing:false,preferences:false,policy_version:config.policyVersion??'',at:new Date().toISOString()};try{localStorage.setItem(consentKey,JSON.stringify(saved));localStorage.removeItem('mate-attribution');}catch{/* restricted storage */}await setTracking(false);},
 configuration:{auth:!!(config.supabaseUrl&&config.supabaseKey),policyVersion:config.policyVersion},
 consentState:()=>saved?{...saved}:undefined,
 attribution:()=>{if(!saved?.analytics)return {};try{return sanitizeProperties(JSON.parse(localStorage.getItem('mate-attribution')??'{}').first??{});}catch{return {};}},
 auth:{
  async signUp(email:string,password:string){await analytics.track('signup_started',{},crypto.randomUUID());const c=await client();const result=await c.auth.signUp({email,password,options:{emailRedirectTo:location.origin+'/auth/callback'}});if(result.error)throw result.error;if(result.data.user)await analytics.track('signup_completed',{},'signup:'+result.data.user.id);return result.data;},
  async signIn(email:string,password:string){const result=await(await client()).auth.signInWithPassword({email,password});if(result.error)throw result.error;return result.data;},
  async google(){const result=await(await client()).auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+'/auth/callback'}});if(result.error)throw result.error;return result.data;},
  async signOut(allDevices=false){const result=await(await client()).auth.signOut({scope:allDevices?'global':'local'});if(result.error)throw result.error;await analytics.track('logout_completed',{},crypto.randomUUID());},
  async resetPassword(email:string){const r=await(await client()).auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/auth/callback?auth=recovery'});if(r.error)throw r.error;},
  async changePassword(password:string){const r=await(await client()).auth.updateUser({password});if(r.error)throw r.error;},
  async session(){return(await client()).auth.getSession();}
 },
 async consent(value:Omit<Consent,'at'>){
  if(!config.policyVersion||value.policy_version!==config.policyVersion)throw new Error('Approved consent policy required');
  saved={analytics:!!value.analytics,marketing:!!value.marketing,preferences:!!value.preferences,policy_version:value.policy_version,at:new Date().toISOString()};
  try{localStorage.setItem(consentKey,JSON.stringify(saved));if(!saved.analytics){localStorage.removeItem('mate-attribution');}}catch{/* memory-only consent */}
  await setTracking(saved.analytics);
  // Authenticated consent has durable server evidence. Anonymous evidence stays device-local pending approved UI.
  if(config.supabaseUrl&&config.supabaseKey)await persistAuthenticatedConsent(saved,async()=>{const session=await(await client()).auth.getSession();return !!session.data.session;},value=>api('consents','POST',value));
  if(saved.analytics)await recordPage();
 },
 api,
 async checkout(price_id:string){const response=await api('checkout','POST',{price_id,request_id:crypto.randomUUID()});await analytics.track('checkout_started',{price_id},crypto.randomUUID());location.assign(response.url);},
 async billingPortal(){location.assign((await api('portal','POST',{})).url);},
 track:(name:EventName,properties:Record<string,unknown>,id:string)=>analytics.track(name,properties,id),
 featureFlag:(key:string)=>saved?.analytics?posthog?.getFeatureFlag(key,{send_event:false}):undefined,
};
declare global{interface Window{matePlatform:typeof platform;}}
window.matePlatform=platform;
async function recordPage(){const data=attribution(location.href,document.referrer);try{const previous=JSON.parse(localStorage.getItem('mate-attribution')??'null');localStorage.setItem('mate-attribution',JSON.stringify({first:previous?.first??data,last:data}));}catch{/* memory-only */}await analytics.track('page_view',{path:location.pathname,...data},'page:'+location.pathname);}

const ctaIds=new Map<Element,string>();document.querySelectorAll('a.button,a.nav-cta').forEach((el,i)=>ctaIds.set(el,`existing-cta-${i+1}`));
document.addEventListener('click',event=>{const anchor=(event.target as Element)?.closest?.('a');const id=anchor&&ctaIds.get(anchor);if(id)void analytics.track('cta_clicked',{cta_id:id,path:location.pathname},crypto.randomUUID());},{passive:true});
// Consumers await this promise before reading session state on callback routes.
export const authReady=(async()=>{
 const url=new URL(location.href);const code=url.searchParams.get('code');
 if(url.searchParams.has('error')){history.replaceState(null,'',url.pathname);throw new Error('auth_link_invalid');}
 if(!code)return;
 url.searchParams.delete('code');history.replaceState(null,'',url.pathname+url.search+url.hash);
 const result=await(await client()).auth.exchangeCodeForSession(code);
 if(result.error)throw new Error('auth_link_invalid');
 window.dispatchEvent(new CustomEvent('mate:auth-callback',{detail:{success:true,recovery:url.searchParams.get('auth')==='recovery'}}));
})();
void authReady.catch(()=>window.dispatchEvent(new CustomEvent('mate:integration-error',{detail:{service:'auth'}})));

if(saved)void authReady.then(syncConsent).catch(()=>setTracking(false));
