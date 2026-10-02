import {it,expect} from 'vitest';
import {createClient} from '@supabase/supabase-js';
import type Stripe from 'stripe';
import {checkout} from '../src/server/billing.js';
function fixture(){
 let slot:Record<string,unknown>|null=null;let failSave=true;const sessions=new Map<string,{id:string;url:string;status:string}>();
 const db=createClient('https://fixture.supabase.co','fixture-key',{global:{fetch:async(input,init)=>{
  const url=new URL(String(input));const table=url.pathname.split('/').at(-1);let data:unknown=null;
  const value=init?.body?JSON.parse(String(init.body)):{};
  if(table==='claim_billing_lock')data='lease-fixture';
  if(table==='prices')data={stripe_price_id:'price_fixture',plan_id:'plan_fixture',plans:{active:true}};
  if(table==='billing_customers')data={stripe_customer_id:'cus_fixture'};
  if(table==='subscriptions')data=[];
  if(table==='checkout_sessions'){
   if(init?.method==='POST'){
    if(value.stripe_session_id&&failSave){failSave=false;return new Response(JSON.stringify({message:'temporary DB failure'}),{status:500,headers:{'content-type':'application/json'}});}
    slot={...slot,...value,created_at:new Date().toISOString()};
   }else if(init?.method==='DELETE')slot=null;
   else data=slot;
  }
  return new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json'}});
 }}});
 const stripe={checkout:{sessions:{create:async(_params:unknown,options:{idempotencyKey:string})=>{if(!sessions.has(options.idempotencyKey)){const n=sessions.size+1;sessions.set(options.idempotencyKey,{id:'cs_'+n,url:'https://checkout.stripe.com/'+n,status:'open'});}return sessions.get(options.idempotencyKey);},retrieve:async(sessionId:string)=>[...sessions.values()].find(s=>s.id===sessionId)}}} as unknown as Stripe;
 return {db,stripe,sessions};
}
it('reuses durable Stripe idempotency generation after successful create but failed database save',async()=>{
 const f=fixture();const user={id:'user_fixture'};
 await expect(checkout(f.stripe,f.db,user,'price_id','request-one','https://site.test')).rejects.toBeTruthy();
 expect(await checkout(f.stripe,f.db,user,'price_id','request-two','https://site.test')).toEqual({url:'https://checkout.stripe.com/1'});
 expect(f.sessions.size).toBe(1);
});
it('repeated checkout after saved pending slot reuses the same payable session',async()=>{
 const f=fixture();const user={id:'user_fixture'};
 try{await checkout(f.stripe,f.db,user,'price_id','request-one','https://site.test');}catch{/* injected failure */}
 await checkout(f.stripe,f.db,user,'price_id','request-two','https://site.test');
 await checkout(f.stripe,f.db,user,'price_id','request-three','https://site.test');expect(f.sessions.size).toBe(1);
});
