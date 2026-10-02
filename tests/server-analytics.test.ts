import {it,expect} from 'vitest';
import {analyticsPayload} from '../src/server/analytics.js';
it('server conversions carry dedupe id and no PII',()=>{
 const p=analyticsPayload('checkout_completed','user-fixture','evt-fixture',{email:'private@example.test',plan_code:'PREMIUM'});
 expect(p.properties).toEqual({distinct_id:'user-fixture',$insert_id:'evt-fixture',plan_code:'PREMIUM'});
});
it('rejects undefined event names',()=>expect(()=>analyticsPayload('arbitrary','u','e',{})).toThrow());
