import {beforeAll,afterAll,it,expect} from 'vitest';
import {database} from './helpers/database.js';
import type {PGlite} from '@electric-sql/pglite';
let db:PGlite;
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
beforeAll(async()=>{db=await database();await db.exec(`INSERT INTO auth.users VALUES('${a}','a@example.test'),('${b}','b@example.test'); INSERT INTO referrals(referral_code,referrer_user_id) VALUES('code123','${a}');`);},30000);
afterAll(async()=>db?.close());
it('associates a referral only once and rejects self referral',async()=>{
 await expect(db.query('SELECT attach_referral($1,$2)',[a,'code123'])).rejects.toThrow('invalid_referral');
 await db.query('SELECT attach_referral($1,$2)',[b,'code123']);await db.query('SELECT attach_referral($1,$2)',[b,'code123']);
 expect((await db.query('SELECT * FROM referrals WHERE referred_user_id=$1',[b])).rows).toHaveLength(1);
});
it('only a recorded paid payment can convert a referral and cannot award money',async()=>{
 await expect(db.query('SELECT convert_referral($1)',[b])).resolves.toBeTruthy();
 expect((await db.query<{status:string}>('SELECT status FROM referrals WHERE referred_user_id=$1',[b])).rows[0].status).toBe('PENDING');
 await db.query("INSERT INTO payments(user_id,stripe_invoice_id,status,amount,currency) VALUES($1,'invoice_local','PAID',35000,'ron')",[b]);
 await db.query('SELECT convert_referral($1)',[b]);await db.query('SELECT convert_referral($1)',[b]);
 expect((await db.query<{status:string}>('SELECT status FROM referrals WHERE referred_user_id=$1',[b])).rows[0].status).toBe('CONVERTED');
 expect((await db.query('SELECT * FROM referral_rewards')).rows).toHaveLength(0);
});
it('maintenance queues a single expiring notice and keeps accounting records',async()=>{
 await db.query("INSERT INTO subscriptions(user_id,stripe_subscription_id,plan_id,status,current_period_end,cancel_at_period_end) SELECT $1,'expiry_local',id,'ACTIVE',now()+interval '2 days',true FROM plans WHERE code='STARTER'",[a]);
 await db.query('SELECT prepare_jobs()');await db.query('SELECT prepare_jobs()');
 expect((await db.query("SELECT * FROM outbox WHERE kind='subscription_expiring'")).rows).toHaveLength(1);
 expect((await db.query('SELECT * FROM payments')).rows).toHaveLength(1);
});
it('admin mutation requires authority and audits atomically',async()=>{
 await expect(db.query('SELECT admin_change($1,$2,$3,$4)',[a,b,'role','ADMIN'])).rejects.toThrow('forbidden');
 await db.query("INSERT INTO user_roles VALUES($1,'SUPER_ADMIN',now())",[a]);
 await db.query('SELECT admin_change($1,$2,$3,$4)',[a,b,'role','TEACHER']);
 expect((await db.query("SELECT * FROM audit_logs WHERE action='ROLE_CHANGED' AND target_id=$1",[b])).rows).toHaveLength(1);
});
it('lead registration deduplicates and drops attribution without analytics consent',async()=>{
 await db.query('SELECT register_lead($1,$2,$3,$4::jsonb,$5)',[a,'a@example.test','program:STARTER','{"utm_source":"campaign"}','v1']);
 await db.query('SELECT register_lead($1,$2,$3,$4::jsonb,$5)',[a,'a@example.test','program:STARTER','{"utm_source":"campaign"}','v1']);
 const rows=(await db.query<{attribution:object}>('SELECT attribution FROM leads WHERE user_id=$1',[a])).rows;expect(rows).toHaveLength(1);expect(rows[0].attribution).toEqual({});
});
it('business mutation functions are not callable by browser roles',async()=>{
 await db.exec('SET ROLE authenticated');try{await expect(db.query('SELECT prepare_jobs()')).rejects.toThrow('permission denied');await expect(db.query('SELECT attach_referral($1,$2)',[b,'code123'])).rejects.toThrow('permission denied');}finally{await db.exec('RESET ROLE');}
});
it('deletion revokes optional consent and keeps an erasure case after identity removal',async()=>{
 await db.query('SELECT record_consent($1,$2,$3,$4)',[b,'analytics',true,'v1']);
 await db.query('SELECT request_deletion($1)',[b]);
 expect((await db.query<{granted:boolean}>("SELECT granted FROM consents WHERE user_id=$1 AND category='analytics' ORDER BY revision DESC LIMIT 1",[b])).rows[0].granted).toBe(false);
 const caseId=(await db.query<{id:string}>('SELECT id FROM erasure_cases WHERE user_id=$1',[b])).rows[0].id;
 await db.query('DELETE FROM auth.users WHERE id=$1',[b]);
 expect((await db.query<{user_id:null}>('SELECT user_id FROM erasure_cases WHERE id=$1',[caseId])).rows[0].user_id).toBeNull();
 await expect(db.query('SELECT advance_erasure($1,$2,$3,$4::jsonb)',[a,caseId,'COMPLETED','{}'])).rejects.toThrow('external_erasure_unconfirmed');
});
it('published program entitlements match the supplied offer without giving independent students live mentoring',async()=>{
 const rows=(await db.query<{code:string;feature_key:string}>('SELECT p.code,f.feature_key FROM plans p JOIN plan_features f ON f.plan_id=p.id WHERE p.active')).rows;
 expect(rows).toContainEqual({code:'ELITE',feature_key:'premium_content'});expect(rows).toContainEqual({code:'PRO',feature_key:'mentor_support'});
 expect(rows.filter(r=>r.code==='INDEPENDENT').map(r=>r.feature_key)).not.toContain('weekly_lesson');
 expect((await db.query("SELECT * FROM plans WHERE code IN ('PREMIUM','PREMIUM_PLUS') AND active")).rows).toHaveLength(0);
});
it('outbox claims only enabled channels and preserves deferred attempt counts',async()=>{
 await db.exec('BEGIN');try{
  await db.exec("DELETE FROM outbox");
  await db.query("INSERT INTO outbox(dedupe_key,user_id,kind) VALUES('deferred-email',$1,'welcome'),('ready-analytics',$1,'analytics:page_view')",[a]);
  const jobs=await db.query<{kind:string}>('SELECT * FROM claim_ready_outbox(false,true)');expect(jobs.rows.map(j=>j.kind)).toEqual(['analytics:page_view']);
  expect((await db.query<{attempts:number}>("SELECT attempts FROM outbox WHERE dedupe_key='deferred-email'")).rows[0].attempts).toBe(0);
  expect((await db.query('SELECT * FROM claim_ready_outbox(false,true)')).rows).toHaveLength(0);
  expect((await db.query('SELECT * FROM claim_ready_outbox(true,false)')).rows).toHaveLength(1);
 }finally{await db.exec('ROLLBACK');}
});
