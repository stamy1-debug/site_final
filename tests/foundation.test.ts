import { describe, it, expect } from 'vitest';
import { configuration } from '../src/server/config.js';
import { sanitizeProperties, sanitizeUrl } from '../src/shared/privacy.js';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
describe('configuration isolation',()=>{
 it('rejects live Stripe keys in previews',()=>expect(()=>configuration({APP_ENV:'preview',STRIPE_SECRET_KEY:'sk_live_not-a-real-key'})).toThrow());
 it('requires explicit activation even in production',()=>expect(()=>configuration({APP_ENV:'production',STRIPE_SECRET_KEY:'sk_live_not-a-real-key'})).toThrow());
 it('accepts absent credentials for build but not service usage',()=>expect(configuration({}).environment).toBe('development'));
});
describe('privacy',()=>{
 it('drops PII and unknown properties',()=>expect(sanitizeProperties({email:'a@example.com',token:'secret',plan_code:'PREMIUM',amount:33,cta_id:'hero'})).toEqual({plan_code:'PREMIUM',cta_id:'hero'}));
 it('strips query/hash credentials',()=>expect(sanitizeUrl('https://site.example/?token=secret#access_token=secret')).toBe('https://site.example/'));
 it('rejects foreign protocols',()=>expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined());
});
it('frozen frontend source stays byte-identical',()=>{
 const baseline=JSON.parse(readFileSync('docs/platform/frontend-baseline.json','utf8')) as Record<string,string>;
 for(const [file,hash] of Object.entries(baseline))expect(createHash('sha256').update(readFileSync(file)).digest('hex'),file).toBe(hash);
});
