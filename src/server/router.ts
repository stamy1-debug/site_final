import {randomUUID} from 'node:crypto';
import {z,ZodError} from 'zod';
import {ApiError,authenticate,requireRole} from './auth.js';
import {configuration,required,ServiceUnavailable} from './config.js';
import {supabase,serviceDb,stripeClient} from './services.js';
import {checkout,processStripeEvent,verifyStripeEvent} from './billing.js';
import {report} from './monitoring.js';
import {sendOutbox} from './email.js';
import {authorizeJob,jobSecret} from './jobs.js';
import {exportRows,exportOrder} from './export.js';
import {sanitizeProperties} from '../shared/privacy.js';
import {minorRegistrationData} from '../shared/signup.js';
const paths:Record<string,string[]>={health:['GET'],ready:['GET'],me:['GET','PATCH','DELETE'],'me/export':['GET'],plans:['GET'],entitlements:['GET'],subscriptions:['GET'],payments:['GET'],checkout:['POST'],portal:['POST'],consents:['GET','POST'],leads:['POST'],newsletter:['GET','POST','DELETE'],referrals:['GET','POST'],'referrals/claim':['POST'],'storage/signed-url':['POST'],'webhooks/stripe':['POST'],'internal/email':['POST'],'internal/jobs':['GET'],'admin/disable':['POST'],'admin/roles':['POST'],'admin/erasure':['POST']};
const profileSchema=z.object({display_name:z.string().trim().max(100).optional(),grade:z.number().int().min(1).max(12).nullable().optional(),exam_type:z.enum(['EN','BAC']).nullable().optional()}).strict();
const consentSchema=z.object({category:z.enum(['necessary','analytics','marketing','preferences']),granted:z.boolean(),policy_version:z.string().min(1).max(80)}).strict();
function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}});}
async function body(req:Request){const raw=await req.text();if(raw.length>16384)throw new ApiError(413,'body_too_large');try{return JSON.parse(raw) as unknown;}catch{throw new ApiError(400,'invalid_json');}}
function assertDb<T>(result:{data:T;error:unknown}):T{if(result.error)throw result.error;return result.data;}
export async function route(req:Request):Promise<Response>{
 const requestId=randomUUID();const url=new URL(req.url);const path=url.pathname.replace(/^\/api\/v1\/?/,'').replace(/\/$/,'');
 try{
  if(!paths[path])throw new ApiError(404,'not_found');
  if(!paths[path].includes(req.method))throw new ApiError(405,'method_not_allowed');
  if(path==='health')return json({status:'ok'});
  const cfg=configuration();const origin=req.headers.get('origin');if(origin&&origin!==cfg.siteUrl)throw new ApiError(403,'origin_not_allowed');
  if(path==='ready'){const result=await supabase().from('plans').select('id').limit(1);if(result.error)throw new ServiceUnavailable('database');return json({status:'ready'});}
  if(path==='webhooks/stripe'){
   const raw=Buffer.from(await req.arrayBuffer());if(raw.length>1048576)throw new ApiError(413,'body_too_large');
   let event;const stripe=stripeClient();try{event=verifyStripeEvent(stripe,raw,req.headers.get('stripe-signature')??'',required('STRIPE_WEBHOOK_SECRET'),cfg.live);}catch(e){if(e instanceof ServiceUnavailable)throw e;throw new ApiError(400,'invalid_webhook');}
   return json({status:await processStripeEvent(stripe,serviceDb(),event)});
  }
  if(path==='internal/email'||path==='internal/jobs'){
   authorizeJob(req.headers.get('authorization'),path==='internal/jobs'?jobSecret():required('JOB_SECRET'));
   const db=serviceDb();const queued=assertDb(await db.rpc('prepare_jobs'));
   return json({queued,...await sendOutbox(db,cfg.environment)});
  }
  if(path==='plans')return json({plans:assertDb(await supabase().from('plans').select('id,code,name,prices(id,interval,currency,unit_amount),plan_features(feature_key)').eq('active',true))});
  const bearer=req.headers.get('authorization')??undefined;
  const user=await authenticate(bearer,async token=>{const {data,error}=await supabase().auth.getUser(token);return error?null:data.user;});
  const db=supabase(bearer!.slice(7));
  const profile=assertDb(await db.from('profiles').select('*').eq('user_id',user.id).single());if(!profile||profile.disabled_at){
   if(['me','me/export'].includes(path)&&req.method==='GET'){/* data rights remain accessible after disable */}else throw new ApiError(403,'account_disabled');
  }
  // Managed Supabase Auth throttles login/signup/reset. Custom costly operations use an atomic DB quota.
  if(req.method!=='GET'||path==='me/export'){
   const limit=path==='me/export'?3:10;
   const allowed=assertDb(await serviceDb().rpc('consume_rate_limit',{bucket:`${user.id}:${path}`,max_hits:limit,window_seconds:60}));if(!allowed)throw new ApiError(429,'rate_limited');
  }
  if(path==='me'&&req.method==='GET')return json({user:{id:user.id,email:user.email,...minorRegistrationData(user.user_metadata??{})},profile,roles:assertDb(await db.from('user_roles').select('role'))});
  if(path==='me'&&req.method==='PATCH'){const values=profileSchema.parse(await body(req));return json({profile:assertDb(await db.from('profiles').update(values).eq('user_id',user.id).select().single())});}
  if(path==='me'&&req.method==='DELETE'){
   z.object({confirmation:z.literal('DELETE_ACCOUNT')}).strict().parse(await body(req));
   assertDb(await serviceDb().rpc('request_deletion',{uid:user.id}));return json({status:'REQUESTED',message:'Deletion and external erasure require the documented retention workflow.'},202);
  }
  if(path==='me/export'){
   const exported:Record<string,unknown>={identity:{id:user.id,email:user.email,...minorRegistrationData(user.user_metadata??{})},profile};
   for(const table of ['user_roles','subscriptions','payments','entitlements','consents','leads','newsletter_subscribers','deletion_requests','coupon_redemptions','erasure_cases'])exported[table]=await exportRows(db,table,'user_id',user.id,'*',exportOrder(table));
   exported.referrals=await exportRows(db,'referrals','referrer_user_id',user.id,'referral_code,status,created_at,converted_at');
   exported.referral_rewards=await exportRows(db,'referral_rewards',null,user.id,'id,reward_type,reward_value,status,created_at');
   exported.audit=await exportRows(serviceDb(),'audit_logs','target_id',user.id,'id,action,created_at');
   return json(exported);
  }
  if(path==='entitlements')return json({entitlements:assertDb(await db.rpc('my_entitlements'))});
  if(path==='subscriptions'||path==='payments')return json({[path]:assertDb(await db.from(path).select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100))});
  if(path==='checkout'){
   const value=z.object({price_id:z.uuid(),request_id:z.uuid()}).strict().parse(await body(req));return json(await checkout(stripeClient(),serviceDb(),user,value.price_id,value.request_id,cfg.siteUrl));
  }
  if(path==='portal'){
   const c=assertDb(await serviceDb().from('billing_customers').select('stripe_customer_id').eq('user_id',user.id).maybeSingle());if(!c)throw new ApiError(404,'billing_customer_missing');
   const session=await stripeClient().billingPortal.sessions.create({customer:c.stripe_customer_id,return_url:cfg.siteUrl+'/cont'});return json({url:session.url});
  }
  if(path==='consents'&&req.method==='GET')return json({consents:assertDb(await db.from('consents').select('category,granted,policy_version,created_at').order('revision',{ascending:false}))});
  if(path==='consents'){
   const value=consentSchema.parse(await body(req));if(value.policy_version!==required('CONSENT_POLICY_VERSION'))throw new ApiError(409,'policy_version_mismatch');
   assertDb(await serviceDb().rpc('record_consent',{uid:user.id,category_name:value.category,is_granted:value.granted,version:value.policy_version}));return json({saved:true});
  }
  if(path==='leads'){
   const value=z.object({source:z.string().max(80).optional(),attribution:z.record(z.string(),z.unknown()).default({})}).strict().parse(await body(req));
   assertDb(await serviceDb().rpc('register_lead',{uid:user.id,email_address:user.email,source_name:value.source??'account',attribution_data:sanitizeProperties(value.attribution),version:process.env.CONSENT_POLICY_VERSION??''}));return json({saved:true});
  }
  if(path==='newsletter'){
   if(req.method==='GET')return json({subscription:assertDb(await db.from('newsletter_subscribers').select('status,policy_version').eq('user_id',user.id).maybeSingle())});
   if(req.method==='DELETE'){assertDb(await serviceDb().rpc('record_consent',{uid:user.id,category_name:'marketing',is_granted:false,version:required('CONSENT_POLICY_VERSION')}));return json({subscribed:false});}
   const result=await serviceDb().rpc('subscribe_newsletter',{uid:user.id,email_address:user.email,version:required('CONSENT_POLICY_VERSION')});if(result.error){if(result.error.message.includes('marketing_consent_required'))throw new ApiError(403,'marketing_consent_required');throw result.error;}return json({subscribed:true});
  }
  if(path==='referrals/claim'){
   const value=z.object({code:z.string().trim().min(6).max(64).regex(/^[a-zA-Z0-9]+$/)}).strict().parse(await body(req));
   const result=await serviceDb().rpc('attach_referral',{uid:user.id,code:value.code});
   if(result.error){if(['invalid_referral','referral_already_set','referral_after_purchase'].some(code=>result.error.message.includes(code)))throw new ApiError(409,'referral_unavailable');throw result.error;}
   return json({saved:true});
  }
  if(path==='referrals'){
   if(req.method==='GET')return json({referrals:assertDb(await db.from('referrals').select('referral_code,status,created_at,converted_at').eq('referrer_user_id',user.id))});
   const existing=assertDb(await db.from('referrals').select('referral_code').eq('referrer_user_id',user.id).is('referred_user_id',null).limit(1).maybeSingle());if(existing)return json(existing);
   const referral_code=randomUUID().replaceAll('-','');assertDb(await serviceDb().from('referrals').insert({referrer_user_id:user.id,referral_code}));return json({referral_code},201);
  }
  if(path==='storage/signed-url'){
   const value=z.object({path:z.string().min(1).max(300)}).strict().parse(await body(req));if(!value.path.startsWith(user.id+'/')||value.path.includes('..'))throw new ApiError(403,'forbidden');
   return json(assertDb(await db.storage.from('private-resources').createSignedUrl(value.path,60)));
  }
  if(path.startsWith('admin/')){
   const roles=(assertDb(await db.from('user_roles').select('role'))??[]).map(r=>r.role as string);requireRole(roles,['admin/roles','admin/erasure'].includes(path)?['SUPER_ADMIN']:['ADMIN','SUPER_ADMIN']);
   const admin=serviceDb();
   if(path==='admin/erasure'){
    const checkpoint=z.enum(['done','not_applicable']);
    const value=z.object({case_id:z.uuid(),status:z.enum(['PROCESSING','EXTERNAL_ERASURE_PENDING','COMPLETED']),checks:z.object({identity:checkpoint.optional(),storage:checkpoint.optional(),stripe:checkpoint.optional(),resend:checkpoint.optional(),posthog:checkpoint.optional(),sentry:checkpoint.optional(),retention_review:checkpoint.optional()}).strict()}).strict().parse(await body(req));
    assertDb(await admin.rpc('advance_erasure',{actor:user.id,case_id:value.case_id,new_status:value.status,evidence:value.checks}));return json({saved:true});
   }

   if(path==='admin/disable'){
    const value=z.object({user_id:z.uuid()}).strict().parse(await body(req));if(value.user_id===user.id)throw new ApiError(400,'cannot_disable_self');
    assertDb(await admin.rpc('admin_change',{actor:user.id,target:value.user_id,operation:'disable',new_role:null}));
    const result=await admin.auth.admin.updateUserById(value.user_id,{ban_duration:'876000h'});if(result.error)throw result.error;
    return json({disabled:true});
   }
   const value=z.object({user_id:z.uuid(),role:z.enum(['STUDENT','PARENT','TEACHER','ADMIN','SUPER_ADMIN'])}).strict().parse(await body(req));
   assertDb(await admin.rpc('admin_change',{actor:user.id,target:value.user_id,operation:'role',new_role:value.role}));return json({saved:true});
  }
  throw new ApiError(404,'not_found');
 }catch(error){
  const status=error instanceof ApiError?error.status:error instanceof ZodError?400:error instanceof ServiceUnavailable?503:500;
  if(status>=500)await report(error,'api_failure',requestId);
  return json({error:{code:error instanceof ApiError?error.code:status===400?'invalid_request':status===503?'service_unavailable':'internal_error',request_id:requestId}},status);
 }
}
