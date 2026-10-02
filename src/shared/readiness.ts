export type ReadinessItem={area:string;status:'configured'|'missing'|'disabled';missing:string[]};
export function readiness(env:Record<string,string|undefined>):ReadinessItem[]{
 const groups:Record<string,string[]>={hosting:['SITE_URL'],identity:['SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY'],payments:['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET'],email:['RESEND_API_KEY','RESEND_FROM'],analytics:['POSTHOG_PUBLIC_KEY','POSTHOG_HOST'],monitoring:['SENTRY_DSN','SENTRY_PUBLIC_DSN'],privacy:['CONSENT_POLICY_VERSION'],jobs:env.CRON_SECRET?['CRON_SECRET']:['JOB_SECRET']};
 return Object.entries(groups).map(([area,keys])=>{const missing=keys.filter(key=>!env[key]?.trim());return {area,status:missing.length?'missing':area==='email'&&env.EMAIL_SENDING_ENABLED!=='true'?'disabled':'configured',missing};});
}
