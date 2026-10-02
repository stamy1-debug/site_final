import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import {ApiError} from './auth.js';
export function billingState(status:string):string{return ({active:'ACTIVE',trialing:'TRIALING',past_due:'PAST_DUE',unpaid:'EXPIRED',canceled:'CANCELLED',incomplete:'INCOMPLETE',incomplete_expired:'EXPIRED',paused:'EXPIRED'} as Record<string,string>)[status]??'INCOMPLETE';}
export function verifyStripeEvent(stripe:Stripe,raw:Buffer,signature:string,secret:string,live:boolean){const event=stripe.webhooks.constructEvent(raw,signature,secret);if(event.livemode!==live)throw new ApiError(400,'stripe_mode_mismatch');return event;}
export function subscriptionSnapshot(s:Stripe.Subscription){
 if(s.items.data.length!==1)throw new ApiError(422,'unsupported_subscription_items');
 const item=s.items.data[0];return {stripe_subscription_id:s.id,stripe_customer_id:typeof s.customer==='string'?s.customer:s.customer.id,stripe_price_id:item.price.id,status:billingState(s.status),current_period_start:new Date(item.current_period_start*1000).toISOString(),current_period_end:new Date(item.current_period_end*1000).toISOString(),cancel_at_period_end:s.cancel_at_period_end};
}
function id(value:unknown):string|undefined{if(typeof value==='string')return value;if(value&&typeof value==='object'&&'id' in value)return String(value.id);}
function object(value:unknown):Record<string,unknown>{return value&&typeof value==='object'?value as Record<string,unknown>:{};}
export const stripeEvents=new Set(['checkout.session.completed','invoice.paid','invoice.payment_failed','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','charge.refunded']);
export async function processStripeEvent(stripe:Stripe,db:SupabaseClient,event:Stripe.Event){
 if(!stripeEvents.has(event.type))return 'ignored';
 const obj=object(event.data.object);const customer=id(obj.customer);if(!customer)throw new ApiError(422,'missing_stripe_customer');
 const existing=await db.from('payment_events').select('id').eq('id',event.id).maybeSingle();if(existing.error)throw existing.error;if(existing.data)return 'duplicate';
 const lock=await db.rpc('claim_billing_lock',{lock_key:customer});if(lock.error)throw lock.error;if(!lock.data)throw new ApiError(503,'billing_busy_retry');
 try{
  let subId:string|undefined;let payment:Record<string,unknown>|null=null;
  if(event.type.startsWith('customer.subscription.'))subId=String(obj.id);
  else if(event.type==='checkout.session.completed')subId=id(obj.subscription);
  else if(event.type.startsWith('invoice.')){
   // Retrieve current state so late failure events cannot overwrite a paid invoice.
   const invoice=await stripe.invoices.retrieve(String(obj.id),{expand:['payments']});
   const parent=object(invoice.parent);subId=id(object(parent.subscription_details).subscription);
   const invoicePayments=object(invoice.payments).data;
   const first=Array.isArray(invoicePayments)?object(invoicePayments[0]):{};
   const paymentIntent=id(object(first.payment).payment_intent);
   payment={billing_reason:invoice.billing_reason,stripe_invoice_id:invoice.id,stripe_payment_intent_id:paymentIntent,status:invoice.status==='paid'?'PAID':'FAILED',amount:invoice.amount_paid||invoice.amount_due,currency:invoice.currency};
  }else if(event.type==='charge.refunded'){
   const charge=await stripe.charges.retrieve(String(obj.id));
   payment={stripe_payment_intent_id:id(charge.payment_intent),amount_refunded:charge.amount_refunded,status:charge.refunded?'REFUNDED':'PARTIALLY_REFUNDED'};
  }
  const snapshot=subId?subscriptionSnapshot(await stripe.subscriptions.retrieve(subId)):null;
  const result=await db.rpc('apply_billing_event',{event_id:event.id,event_type:event.type,event_created:event.created,customer_id:customer,snapshot,payment});if(result.error)throw result.error;return result.data;
 }finally{const release=await db.rpc('release_billing_lock',{lock_key:customer,lock_lease:lock.data});if(release.error)console.error(JSON.stringify({event:'billing_lock_release_failed',event_id:event.id}));}
}
async function createCheckout(stripe:Stripe,db:SupabaseClient,user:{id:string;email?:string},priceId:string,requestId:string,siteUrl:string){
 const price=await db.from('prices').select('stripe_price_id,plan_id,plans!inner(active)').eq('id',priceId).eq('active',true).eq('plans.active',true).single();if(price.error||!price.data)throw new ApiError(400,'price_unavailable');
 let customer=(await db.from('billing_customers').select('stripe_customer_id').eq('user_id',user.id).maybeSingle());if(customer.error)throw customer.error;
 if(!customer.data){
  const created=await stripe.customers.create({email:user.email,metadata:{supabase_user_id:user.id}},{idempotencyKey:`customer:${user.id}`});
  const result=await db.from('billing_customers').upsert({user_id:user.id,stripe_customer_id:created.id},{onConflict:'user_id',ignoreDuplicates:true});if(result.error)throw result.error;
  customer=await db.from('billing_customers').select('stripe_customer_id').eq('user_id',user.id).single();if(customer.error)throw customer.error;
 }
 let pending=await db.from('checkout_sessions').select('stripe_session_id,price_id,request_id,created_at').eq('user_id',user.id).maybeSingle();if(pending.error)throw pending.error;
 if(pending.data?.stripe_session_id){
  const prior=await stripe.checkout.sessions.retrieve(pending.data.stripe_session_id);
  if(prior.status==='open'){if(pending.data.price_id!==priceId)throw new ApiError(409,'checkout_in_progress');return {url:prior.url};}
  if(prior.status==='complete'){
   const subId=id(prior.subscription);if(!subId)throw new ApiError(409,'payment_sync_pending');
   const live=await stripe.subscriptions.retrieve(subId);if(!['canceled','incomplete_expired'].includes(live.status))throw new ApiError(409,'use_customer_portal');
  }
  const removed=await db.from('checkout_sessions').delete().eq('user_id',user.id);if(removed.error)throw removed.error;pending={...pending,data:null,error:null};
 }
 if(pending.data&&pending.data.price_id!==priceId)throw new ApiError(409,'checkout_in_progress');
 // Stripe only promises idempotency retention for 24h. Uncertain old attempts require reconciliation, never a second charge.
 if(pending.data&&!pending.data.stripe_session_id&&Date.now()-Date.parse(pending.data.created_at)>23*3600000)throw new ApiError(409,'checkout_reconciliation_required');
 const generation=pending.data?.request_id??requestId;
 if(!pending.data){const reserved=await db.from('checkout_sessions').insert({user_id:user.id,price_id:priceId,request_id:generation});if(reserved.error)throw reserved.error;}
 const active=await db.from('subscriptions').select('id').eq('user_id',user.id).in('status',['ACTIVE','TRIALING','PAST_DUE','INCOMPLETE']).limit(1);if(active.error)throw active.error;if(active.data?.length)throw new ApiError(409,'use_customer_portal');
 const session=await stripe.checkout.sessions.create({mode:'subscription',customer:customer.data!.stripe_customer_id,line_items:[{price:price.data.stripe_price_id,quantity:1}],allow_promotion_codes:true,client_reference_id:user.id,subscription_data:{metadata:{supabase_user_id:user.id}},success_url:siteUrl+'/cont?checkout=complete',cancel_url:siteUrl+'/programe?checkout=cancelled'},{idempotencyKey:`checkout:${user.id}:${generation}`});
 const saved=await db.from('checkout_sessions').upsert({user_id:user.id,stripe_session_id:session.id,price_id:priceId,request_id:generation});if(saved.error)throw saved.error;
 return {url:session.url};
}

export async function checkout(stripe:Stripe,db:SupabaseClient,user:{id:string;email?:string},priceId:string,requestId:string,siteUrl:string){
 const lockKey='checkout:'+user.id;const lock=await db.rpc('claim_billing_lock',{lock_key:lockKey});if(lock.error)throw lock.error;if(!lock.data)throw new ApiError(409,'checkout_in_progress');
 try{return await createCheckout(stripe,db,user,priceId,requestId,siteUrl);}finally{const r=await db.rpc('release_billing_lock',{lock_key:lockKey,lock_lease:lock.data});if(r.error)console.error(JSON.stringify({event:'checkout_lock_release_failed'}));}
}
