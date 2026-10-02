const allowed=new Set(['plan_code','price_id','interval','cta_id','path','source','utm_source','utm_medium','utm_campaign','utm_content','utm_term','referrer','landing_page','environment','status','feature','currency']);
export function sanitizeProperties(input:Record<string,unknown>):Record<string,string|number|boolean>{
 const result:Record<string,string|number|boolean>={};
 for(const [key,value] of Object.entries(input))if(allowed.has(key)&&['string','number','boolean'].includes(typeof value)){
  if(typeof value==='string'){if(value.includes('@')||/bearer|access_token|refresh_token|sk_live_|sk_test_|eyJ/i.test(value))continue;result[key]=value.slice(0,120);}else result[key]=value as number|boolean;
 }return result;
}
export function sanitizeUrl(value:string):string|undefined{try{const url=new URL(value);if(!['https:','http:'].includes(url.protocol))return;return url.origin+url.pathname;}catch{return;}}
export function scrubEvent<T extends {request?:unknown;user?:unknown;extra?:unknown;contexts?:unknown;breadcrumbs?:unknown;message?:unknown;exception?:unknown}>(event:T):T{
 // Error messages and breadcrumbs can embed user input. Only static error type/stack frames survive.
 const copy={...event};delete copy.request;delete copy.user;delete copy.extra;delete copy.contexts;delete copy.breadcrumbs;delete copy.message;
 if(copy.exception&&typeof copy.exception==='object'){
  const exc=copy.exception as {values?:Array<{type?:string;value?:string;stacktrace?:{frames?:Array<{filename?:string;function?:string;lineno?:number;colno?:number}>}}>};
  copy.exception={values:exc.values?.map(e=>({type:e.type,value:'[redacted]',stacktrace:{frames:e.stacktrace?.frames?.map(f=>({filename:f.filename?sanitizeUrl(f.filename):undefined,function:f.function,lineno:f.lineno,colno:f.colno}))}}))};
 }return copy;
}
