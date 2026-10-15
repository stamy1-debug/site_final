import {z} from 'zod';

const emailSchema=z.string().trim().email().max(254);

export type SignupDetails={under18:boolean;parentEmail:string;parentConsent:boolean};
export function signupMetadata(details:SignupDetails){
 if(!details.under18)return {is_under_18:false};
 if(!details.parentConsent)throw new Error('parent_consent_required');
 const parsed=emailSchema.safeParse(details.parentEmail);
 if(!parsed.success)throw new Error('parent_email_invalid');
 return {is_under_18:true,parent_email:parsed.data,parental_consent:true,parental_consent_at:new Date().toISOString()};
}

export function minorRegistrationData(metadata:Record<string,unknown>){
 const result:Record<string,boolean|string>={};
 if(typeof metadata.is_under_18==='boolean')result.is_under_18=metadata.is_under_18;
 if(typeof metadata.parental_consent==='boolean')result.parental_consent=metadata.parental_consent;
 if(typeof metadata.parental_consent_at==='string'&&/^\d{4}-\d\d-\d\dT/.test(metadata.parental_consent_at))result.parental_consent_at=metadata.parental_consent_at;
 if(typeof metadata.parent_email==='string'){
  const parsed=emailSchema.safeParse(metadata.parent_email);
  if(parsed.success)result.parent_email=parsed.data;
 }
 return result;
}
