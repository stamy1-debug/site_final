import {it,expect} from 'vitest';
import {signupMetadata,minorRegistrationData} from '../src/shared/signup.js';

it('requires a parent email and recorded parent consent for a student under 18',()=>{
 expect(()=>signupMetadata({under18:true,parentEmail:'',parentConsent:false})).toThrow('parent_consent_required');
 expect(()=>signupMetadata({under18:true,parentEmail:'not-an-email',parentConsent:true})).toThrow('parent_email_invalid');
 expect(signupMetadata({under18:true,parentEmail:' parent@example.com ',parentConsent:true})).toMatchObject({is_under_18:true,parent_email:'parent@example.com',parental_consent:true});
 expect(typeof signupMetadata({under18:true,parentEmail:'parent@example.com',parentConsent:true}).parental_consent_at).toBe('string');
});

it('does not collect a parent email for an adult account',()=>{
 expect(signupMetadata({under18:false,parentEmail:'',parentConsent:false})).toEqual({is_under_18:false});
});

it('exports only the minor registration fields from auth metadata',()=>{
 expect(minorRegistrationData({is_under_18:true,parent_email:'parent@example.com',parental_consent:true,parental_consent_at:'2026-10-15T00:00:00.000Z',admin:true})).toEqual({is_under_18:true,parent_email:'parent@example.com',parental_consent:true,parental_consent_at:'2026-10-15T00:00:00.000Z'});
});
