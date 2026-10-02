import { PGlite } from '@electric-sql/pglite';
import { readFileSync,readdirSync } from 'node:fs';
import { beforeAll, afterAll, it, expect } from 'vitest';
let db:PGlite;
const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
beforeAll(async()=>{
 db=new PGlite();
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; GRANT USAGE ON SCHEMA auth TO anon,authenticated,service_role; CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); CREATE TABLE storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,owner_id text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql AS $$ SELECT string_to_array($1,'/') $$;`);
 for(const file of readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(readFileSync('supabase/migrations/'+file,'utf8'));
 await db.exec(`INSERT INTO auth.users VALUES ('${a}','a@example.test'),('${b}','b@example.test');`);
},30000);
afterAll(async()=>{await db?.close();});
async function asUser<T>(user:string,query:string){await db.exec(`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${user}',false);`);try{return await db.query<T>(query);}finally{await db.exec('RESET ROLE');}}
it('profile trigger and own profile RLS',async()=>{const r=await asUser(a,'SELECT user_id FROM profiles');expect(r.rows).toEqual([{user_id:a}]);});
it('rejects client role escalation',async()=>{await expect(asUser(a,`INSERT INTO user_roles(user_id,role) VALUES ('${a}','SUPER_ADMIN')`)).rejects.toThrow();});
it('protects audit and other users payments',async()=>{await expect(asUser(a,'SELECT * FROM audit_logs')).rejects.toThrow();expect((await asUser(a,`SELECT * FROM payments WHERE user_id='${b}'`)).rows).toEqual([]);});
it('profile writes cannot disable own account or edit others',async()=>{await expect(asUser(a,`UPDATE profiles SET disabled_at=now()`)).rejects.toThrow();expect((await asUser(a,`UPDATE profiles SET display_name='Changed' WHERE user_id='${b}' RETURNING *`)).rows).toEqual([]);});
it('free plan cannot imply paid entitlement',async()=>{expect((await asUser<{has_entitlement:boolean}>(a,"SELECT has_entitlement('premium_content')")).rows[0].has_entitlement).toBe(false);});
it('subscription expiry/failure revoke plan features dynamically',async()=>{
 await db.exec(`INSERT INTO plan_features(plan_id,feature_key) SELECT id,'premium_content' FROM plans WHERE code='ELITE' ON CONFLICT DO NOTHING; INSERT INTO subscriptions(user_id,stripe_subscription_id,plan_id,status,current_period_end) SELECT '${a}','sub_test',id,'ACTIVE',now()+interval '1 day' FROM plans WHERE code='ELITE';`);
 expect((await asUser<{has_entitlement:boolean}>(a,"SELECT has_entitlement('premium_content')")).rows[0].has_entitlement).toBe(true);
 expect((await asUser<{has_entitlement:boolean}>(b,"SELECT has_entitlement('premium_content')")).rows[0].has_entitlement).toBe(false);
 for(const state of ['PAST_DUE','CANCELLED','EXPIRED','INCOMPLETE']){await db.exec(`UPDATE subscriptions SET status='${state}' WHERE stripe_subscription_id='sub_test'`);expect((await asUser<{has_entitlement:boolean}>(a,"SELECT has_entitlement('premium_content')")).rows[0].has_entitlement).toBe(false);}
 await db.exec("UPDATE subscriptions SET status='ACTIVE',current_period_end=now()-interval '1 day' WHERE stripe_subscription_id='sub_test'");
 expect((await asUser<{has_entitlement:boolean}>(a,"SELECT has_entitlement('premium_content')")).rows[0].has_entitlement).toBe(false);
});
it('rate limits are atomic and server-only',async()=>{
 await expect(asUser(a,"SELECT consume_rate_limit('test',2,60)")).rejects.toThrow();
 for(const value of [true,true,false])expect((await db.query<{consume_rate_limit:boolean}>("SELECT consume_rate_limit('test',2,60)")).rows[0].consume_rate_limit).toBe(value);
});
it('private storage cannot be read by another user',async()=>{
 await db.exec(`INSERT INTO storage.objects(bucket_id,name,owner_id) VALUES ('private-resources','${a}/file.pdf','${a}')`);
 expect((await asUser(a,'SELECT name FROM storage.objects')).rows).toHaveLength(1);
 expect((await asUser(b,'SELECT name FROM storage.objects')).rows).toHaveLength(0);
});
it('all application tables have RLS',async()=>{
 const r=await db.query<{relname:string}>("SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity");expect(r.rows).toEqual([]);
});
it('billing transaction is atomic, duplicate-safe and rejects stale subscription events',async()=>{
 await db.exec(`INSERT INTO billing_customers(user_id,stripe_customer_id) VALUES('${b}','cus_b'); INSERT INTO prices(plan_id,stripe_price_id,interval,currency,unit_amount) SELECT id,'price_b','month','ron',100 FROM plans WHERE code='ELITE';`);
 const snap={stripe_subscription_id:'sub_b',stripe_price_id:'price_b',status:'ACTIVE',current_period_start:new Date().toISOString(),current_period_end:new Date(Date.now()+86400000).toISOString(),cancel_at_period_end:false};
 const apply=(event:string,created:number,s= snap)=>db.query<{apply_billing_event:string}>('SELECT apply_billing_event($1,$2,$3,$4,$5::jsonb)',[event,'customer.subscription.created',created,'cus_b',JSON.stringify(s)]);
 expect((await apply('evt_first',20)).rows[0].apply_billing_event).toBe('processed');expect((await apply('evt_first',20)).rows[0].apply_billing_event).toBe('duplicate');
 await apply('evt_old',10,{...snap,status:'CANCELLED'});
 expect((await db.query<{status:string}>("SELECT status FROM subscriptions WHERE stripe_subscription_id='sub_b'")).rows[0].status).toBe('ACTIVE');
 expect((await db.query("SELECT * FROM outbox WHERE dedupe_key='evt_first:email'")).rows).toHaveLength(1);
 await expect(apply('evt_bad',30,{...snap,stripe_price_id:'unknown'})).rejects.toThrow('unmapped_price');expect((await db.query("SELECT * FROM payment_events WHERE id='evt_bad'")).rows).toHaveLength(0);
 await apply('evt_cancel',40,{...snap,status:'CANCELLED'});expect((await asUser<{has_entitlement:boolean}>(b,"SELECT has_entitlement('premium_content')")).rows[0].has_entitlement).toBe(false);
});
it('billing locks prevent concurrent subscription refresh',async()=>{const r=await db.query<{claim_billing_lock:string}>("SELECT claim_billing_lock('cus_lock')");expect(r.rows[0].claim_billing_lock).toBeTruthy();expect((await db.query<{claim_billing_lock:null}>("SELECT claim_billing_lock('cus_lock')")).rows[0].claim_billing_lock).toBeNull();});
it('consent withdrawal unsubscribes and deletion preserves billing',async()=>{
 await db.exec(`INSERT INTO newsletter_subscribers(user_id,email,status,policy_version) VALUES('${b}','b@example.test','subscribed','v1'); SELECT record_consent('${b}','marketing',false,'v1');`);
 expect((await db.query<{status:string}>(`SELECT status FROM newsletter_subscribers WHERE user_id='${b}'`)).rows[0].status).toBe('unsubscribed');
 await db.exec(`SELECT request_deletion('${b}');`);expect((await asUser<{active_user:boolean}>(b,'SELECT active_user()')).rows[0].active_user).toBe(false);
 expect((await db.query(`SELECT * FROM subscriptions WHERE user_id='${b}'`)).rows).toHaveLength(1);
});
it('refund is persisted and cannot be erased by delayed invoice delivery',async()=>{
 const paid={stripe_invoice_id:'in_b',stripe_payment_intent_id:'pi_b',status:'PAID',amount:100,currency:'ron'};
 await db.query('SELECT apply_billing_event($1,$2,$3,$4,NULL,$5::jsonb)',['evt_paid','invoice.paid',50,'cus_b',JSON.stringify(paid)]);
 await db.query('SELECT apply_billing_event($1,$2,$3,$4,NULL,$5::jsonb)',['evt_refund','charge.refunded',60,'cus_b',JSON.stringify({stripe_payment_intent_id:'pi_b',status:'REFUNDED',amount_refunded:100})]);
 await db.query('SELECT apply_billing_event($1,$2,$3,$4,NULL,$5::jsonb)',['evt_paid_late','invoice.paid',45,'cus_b',JSON.stringify(paid)]);
 expect((await db.query<{status:string}>("SELECT status FROM payments WHERE stripe_invoice_id='in_b'")).rows[0].status).toBe('REFUNDED');
});
it('late failure events cannot enqueue a false failure email after invoice has paid',async()=>{
 const payment={stripe_invoice_id:'in_late',stripe_payment_intent_id:'pi_late',status:'PAID',amount:100,currency:'ron'};
 await db.query('SELECT apply_billing_event($1,$2,$3,$4,NULL,$5::jsonb)',['evt_fail_late','invoice.payment_failed',50,'cus_b',JSON.stringify(payment)]);
 expect((await db.query("SELECT * FROM outbox WHERE dedupe_key='evt_fail_late:email'")).rows).toHaveLength(0);
});
it('server checkout slot exists and clients cannot tamper with it',async()=>{await expect(asUser(a,"INSERT INTO checkout_sessions(user_id,stripe_session_id,price_id) VALUES ('11111111-1111-4111-8111-111111111111','cs_x',gen_random_uuid())")).rejects.toThrow();expect((await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename='checkout_sessions'")).rows).toHaveLength(1);});
it('newsletter subscribe validates current consent inside the transaction',async()=>{
 await db.query('SELECT record_consent($1,$2,$3,$4)',[a,'marketing',false,'v1']);
 await expect(db.query('SELECT subscribe_newsletter($1,$2,$3)',[a,'a@example.test','v1'])).rejects.toThrow();
 await db.query('SELECT record_consent($1,$2,$3,$4)',[a,'marketing',true,'v1']);
 await db.query('SELECT subscribe_newsletter($1,$2,$3)',[a,'a@example.test','v1']);
 expect((await db.query<{status:string}>(`SELECT status FROM newsletter_subscribers WHERE user_id='${a}'`)).rows[0].status).toBe('subscribed');
});
it('anonymized financial records can receive refunds after identity erasure',async()=>{
 await db.exec(`DELETE FROM auth.users WHERE id='${b}'`);
 await expect(db.query('SELECT apply_billing_event($1,$2,$3,$4,NULL,$5::jsonb)',['evt_after_erasure','charge.refunded',100,'cus_b',JSON.stringify({stripe_payment_intent_id:'pi_b',status:'REFUNDED',amount_refunded:100})])).resolves.toBeTruthy();
 expect((await db.query<{user_id:null}>("SELECT user_id FROM payments WHERE stripe_payment_intent_id='pi_b'")).rows[0].user_id).toBeNull();
});
it('trusted service role can read protected records',async()=>{await db.exec('SET ROLE service_role');try{expect((await db.query('SELECT * FROM audit_logs')).rows.length).toBeGreaterThan(0);}finally{await db.exec('RESET ROLE');}});
it('no unapproved prices or paid features are seeded as products',async()=>{expect((await db.query("SELECT * FROM coupons WHERE active=true")).rows).toEqual([]);expect((await db.query("SELECT * FROM prices WHERE stripe_price_id<>'price_b'")).rows).toEqual([]);});

it('consent ordering is deterministic when timestamps are equal',async()=>{
 await db.exec('BEGIN');
 try{
  await db.query('SELECT record_consent($1,$2,$3,$4)',[a,'marketing',false,'tie-policy']);
  await db.query('SELECT record_consent($1,$2,$3,$4)',[a,'marketing',true,'tie-policy']);
  await db.query('SELECT subscribe_newsletter($1,$2,$3)',[a,'a@example.test','tie-policy']);
  expect((await db.query<{status:string}>(`SELECT status FROM newsletter_subscribers WHERE user_id='${a}'`)).rows[0].status).toBe('subscribed');
 }finally{await db.exec('ROLLBACK');}
});
