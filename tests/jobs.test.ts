import {expect,it} from 'vitest';
import {authorizeJob} from '../src/server/jobs.js';
import {route} from '../src/server/router.js';
it('accepts only the exact job bearer secret',()=>{expect(()=>authorizeJob('Bearer local-test','local-test')).not.toThrow();for(const v of [null,'local-test','Bearer wrong','Bearer local-test-more'])expect(()=>authorizeJob(v,'local-test')).toThrow();});
it('scheduled job GET is gated before provider access',async()=>{process.env.CRON_SECRET='test-job-secret';try{const result=await route(new Request('http://localhost/api/v1/internal/jobs'));expect(result.status).toBe(401);}finally{delete process.env.CRON_SECRET;}});
