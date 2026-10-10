import {sanitizeProperties} from '../shared/privacy.js';
import type {EventName} from '../shared/events.js';
export type AnalyticsSink={capture:(name:string,properties:Record<string,unknown>)=>void;reset:()=>void};
export class AnalyticsController{
 private enabled=false;private version=0;private sink?:AnalyticsSink;private seen=new Set<string>();
 constructor(private load:()=>Promise<AnalyticsSink>){}
 async consent(enabled:boolean){this.enabled=enabled;const version=++this.version;if(!enabled){this.sink?.reset();this.sink=undefined;this.seen.clear();return;}const sink=await this.load();if(version!==this.version||!this.enabled){sink.reset();return;}this.sink=sink;}
 async track(name:EventName,properties:Record<string,unknown>,id:string){if(!this.enabled||!this.sink||this.seen.has(id))return;this.seen.add(id);this.sink.capture(name,sanitizeProperties(properties));}
}
export function attribution(href:string,referrer:string){const url=new URL(href);const data:Record<string,string>={landing_page:url.pathname};try{data.referrer=new URL(referrer).origin;}catch{/* Direct navigation */}for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']){const v=url.searchParams.get(key);if(v)data[key]=v;}return sanitizeProperties(data);}

export async function recordConsentedPage(analytics:AnalyticsController,path:string,properties:Record<string,unknown>){
 await analytics.track('page_view',{...properties,path},'page:'+path);
 if(path==='/programe')await analytics.track('pricing_viewed',{path},'pricing:'+path);
}
