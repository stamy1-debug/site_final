import {it,expect} from 'vitest';
import Stripe from 'stripe';
import { billingState, verifyStripeEvent, subscriptionSnapshot } from '../src/server/billing.js';
const stripe=new Stripe('sk_test_local_fixture');
it.each([['active','ACTIVE'],['trialing','TRIALING'],['past_due','PAST_DUE'],['unpaid','EXPIRED'],['canceled','CANCELLED'],['incomplete','INCOMPLETE'],['incomplete_expired','EXPIRED'],['paused','EXPIRED']])('maps %s into %s',(a,b)=>expect(billingState(a)).toBe(b));
it('unknown statuses fail closed',()=>expect(billingState('new_status')).toBe('INCOMPLETE'));
it('signature verification accepts signed raw bytes and rejects tampering',()=>{
 const payload=JSON.stringify({id:'evt_fixture',object:'event',type:'checkout.session.completed',livemode:false,data:{object:{}}});
 const secret='whsec_local_fixture';const signature=stripe.webhooks.generateTestHeaderString({payload,secret});
 expect(verifyStripeEvent(stripe,Buffer.from(payload),signature,secret,false).id).toBe('evt_fixture');
 expect(()=>verifyStripeEvent(stripe,Buffer.from(payload+' '),signature,secret,false)).toThrow();
});
it('refuses live events in test mode',()=>{
 const payload=JSON.stringify({id:'evt_fixture',object:'event',livemode:true,data:{object:{}}});const secret='whsec_local_fixture';const signature=stripe.webhooks.generateTestHeaderString({payload,secret});
 expect(()=>verifyStripeEvent(stripe,Buffer.from(payload),signature,secret,false)).toThrow();
});
it('snapshot only contains necessary billing fields',()=>{
 const s={id:'sub_1',customer:'cus_1',status:'active',cancel_at_period_end:true,items:{data:[{price:{id:'price_1'},current_period_start:100,current_period_end:200}]}} as unknown as Stripe.Subscription;
 expect(subscriptionSnapshot(s)).toEqual({stripe_subscription_id:'sub_1',stripe_customer_id:'cus_1',stripe_price_id:'price_1',status:'ACTIVE',current_period_start:new Date(100000).toISOString(),current_period_end:new Date(200000).toISOString(),cancel_at_period_end:true});
});
it('rejects ambiguous multiple subscription items',()=>{
 const s={items:{data:[{},{}]}} as unknown as Stripe.Subscription;expect(()=>subscriptionSnapshot(s)).toThrow();
});
