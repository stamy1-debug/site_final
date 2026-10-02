import {it,expect} from 'vitest';
import {readiness} from '../src/shared/readiness.js';
it('reports missing configuration without contacting services or exposing values',()=>{const report=readiness({STRIPE_SECRET_KEY:'sk_test_secret-not-for-output'});expect(JSON.stringify(report)).not.toContain('secret-not-for-output');expect(report.find(v=>v.area==='payments')?.missing).toEqual(['STRIPE_WEBHOOK_SECRET']);});
it('distinguishes configured sending from an explicitly disabled sender',()=>{expect(readiness({RESEND_API_KEY:'key',RESEND_FROM:'sender'}) .find(v=>v.area==='email')?.status).toBe('disabled');});
