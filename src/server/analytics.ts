import {eventNames} from '../shared/events.js';
import {sanitizeProperties} from '../shared/privacy.js';
import {required} from './config.js';
export function analyticsPayload(event:string,userId:string,eventId:string,properties:Record<string,unknown>){
 if(!(eventNames as readonly string[]).includes(event))throw new Error('unknown_analytics_event');
 return {event,properties:{...sanitizeProperties(properties),distinct_id:userId,$insert_id:eventId}};
}
export async function captureConversion(event:string,userId:string,eventId:string,properties:Record<string,unknown>){
 const host=new URL(process.env.POSTHOG_HOST??'https://eu.i.posthog.com');if(host.protocol!=='https:'||!host.hostname.endsWith('.posthog.com'))throw new Error('invalid_posthog_host');
 const response=await fetch(new URL('/capture/',host),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:required('POSTHOG_PUBLIC_KEY'),...analyticsPayload(event,userId,eventId,properties)}),signal:AbortSignal.timeout(5000)});if(!response.ok)throw new Error('analytics_delivery_failed');
}
