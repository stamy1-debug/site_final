import {it,expect} from 'vitest';
import {emailTemplate} from '../src/server/email.js';
it('templates contain no uncontrolled HTML',()=>{expect(emailTemplate('welcome').html).not.toContain('<script');expect(emailTemplate('payment_failed').subject).toContain('plată');});
it('unknown lifecycle hooks do not send arbitrary templates',()=>expect(()=>emailTemplate('arbitrary')).toThrow());
