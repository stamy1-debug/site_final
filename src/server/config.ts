import { z } from 'zod';
const envSchema=z.object({APP_ENV:z.enum(['development','test','preview','production']).default('development'),STRIPE_SECRET_KEY:z.string().optional(),STRIPE_LIVE_ENABLED:z.string().optional(),SITE_URL:z.string().url().default('http://localhost:4174')});
export function configuration(env:Record<string,string|undefined>=process.env){
 const e=envSchema.parse(env);const live=e.STRIPE_SECRET_KEY?.startsWith('sk_live_')||e.STRIPE_SECRET_KEY?.startsWith('rk_live_');
 if(live&&(e.APP_ENV!=='production'||e.STRIPE_LIVE_ENABLED!=='true'))throw new Error('Live payments not enabled');
 if(env.VERCEL_ENV==='preview'&&e.APP_ENV==='production')throw new Error('Preview cannot use production environment');
 if(e.APP_ENV==='production'&&!e.SITE_URL.startsWith('https://'))throw new Error('Production requires HTTPS SITE_URL');
 return {environment:e.APP_ENV,siteUrl:new URL(e.SITE_URL).origin,live:!!live};
}
export function required(name:string):string{const value=process.env[name];if(!value)throw new ServiceUnavailable(name);return value;}
export class ServiceUnavailable extends Error{status=503;constructor(public service:string){super('Service not configured');}}
