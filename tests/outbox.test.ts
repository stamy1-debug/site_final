import {it,expect,vi,afterEach} from 'vitest';
import {createClient} from '@supabase/supabase-js';
import {sendOutbox} from '../src/server/email.js';
afterEach(()=>vi.unstubAllEnvs());
function fixture(){const calls:Array<{path:string;body:unknown}>=[];const db=createClient('https://fixture.supabase.co','fixture',{global:{fetch:async(input,init)=>{calls.push({path:new URL(String(input)).pathname,body:JSON.parse(String(init?.body??'{}'))});return new Response('[]',{headers:{'content-type':'application/json'}});}}});return {db,calls};}
it('does not consume delivery attempts while all providers are intentionally disabled',async()=>{
 vi.stubEnv('RESEND_API_KEY','');vi.stubEnv('POSTHOG_PUBLIC_KEY','');vi.stubEnv('EMAIL_SENDING_ENABLED','false');const f=fixture();await sendOutbox(f.db,'development');expect(f.calls).toEqual([]);
});
it('claims analytics only when email is disabled',async()=>{
 vi.stubEnv('POSTHOG_PUBLIC_KEY','public-fixture');vi.stubEnv('CONSENT_POLICY_VERSION','v1');vi.stubEnv('EMAIL_SENDING_ENABLED','false');const f=fixture();await sendOutbox(f.db,'development');expect(f.calls).toEqual([{path:'/rest/v1/rpc/claim_ready_outbox',body:{include_email:false,include_analytics:true}}]);
});
it('does not claim test emails without an explicit test recipient',async()=>{
 vi.stubEnv('RESEND_API_KEY','re_fixture');vi.stubEnv('RESEND_FROM','test@example.test');vi.stubEnv('RESEND_TEST_RECIPIENT','');vi.stubEnv('EMAIL_SENDING_ENABLED','true');vi.stubEnv('POSTHOG_PUBLIC_KEY','');const f=fixture();await sendOutbox(f.db,'preview');expect(f.calls).toEqual([]);
});
