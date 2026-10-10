import {expect,it} from 'vitest';
import {AnalyticsController,recordConsentedPage} from '../src/browser/analytics-core.js';
it('records pricing with the page only after consent and deduplicates both',async()=>{
 const events:string[]=[];
 const analytics=new AnalyticsController(async()=>({capture:name=>events.push(name),reset:()=>{}}));
 await recordConsentedPage(analytics,'/programe',{});
 expect(events).toEqual([]);
 await analytics.consent(true);
 await recordConsentedPage(analytics,'/programe',{});
 await recordConsentedPage(analytics,'/programe',{});
 expect(events).toEqual(['page_view','pricing_viewed']);
 await analytics.consent(false);
 await recordConsentedPage(analytics,'/programe',{});
 expect(events).toEqual(['page_view','pricing_viewed']);
});
it('does not record pricing on other pages',async()=>{
 const events:string[]=[];
 const analytics=new AnalyticsController(async()=>({capture:name=>events.push(name),reset:()=>{}}));
 await analytics.consent(true);
 await recordConsentedPage(analytics,'/blog',{});
 expect(events).toEqual(['page_view']);
});
