import * as Sentry from '@sentry/node';
import {scrubEvent} from '../shared/privacy.js';
let initialized=false;
export async function report(error:unknown,code:string,requestId:string){
 console.error(JSON.stringify({level:'error',event:code,request_id:requestId}));
 if(!process.env.SENTRY_DSN)return;
 if(!initialized){Sentry.init({dsn:process.env.SENTRY_DSN,environment:process.env.APP_ENV,release:process.env.VERCEL_GIT_COMMIT_SHA,tracesSampleRate:0,beforeSend:event=>scrubEvent(event)});initialized=true;}
 Sentry.captureException(error,{tags:{code,request_id:requestId}});await Sentry.flush(1500);
}
