import {it,expect} from 'vitest';
import {AnalyticsController,attribution} from '../src/browser/analytics-core.js';
it('does not initialize or capture without consent',async()=>{let loads=0;const a=new AnalyticsController(async()=>{loads++;return {capture:()=>{},reset:()=>{}};});await a.track('page_view',{},'page');expect(loads).toBe(0);});
it('emits once, scrubs properties and disables on withdrawal',async()=>{
 const events:unknown[]=[];let resets=0;const a=new AnalyticsController(async()=>({capture:(name,props)=>events.push([name,props]),reset:()=>{resets++;}}));
 await a.consent(true);await a.track('cta_clicked',{cta_id:'hero',email:'private@example.com'},'same');await a.track('cta_clicked',{cta_id:'hero'},'same');
 expect(events).toEqual([['cta_clicked',{cta_id:'hero'}]]);await a.consent(false);await a.track('page_view',{},'after');expect(events).toHaveLength(1);expect(resets).toBe(1);
});
it('withdrawal while SDK loads cannot capture afterward',async()=>{
 let resolve!:(v:{capture:()=>void;reset:()=>void})=>void;let calls=0;
 const a=new AnalyticsController(()=>new Promise(r=>{resolve=r;}));const pending=a.consent(true);await a.consent(false);resolve({capture:()=>{calls++;},reset:()=>{}});await pending;await a.track('page_view',{},'race');expect(calls).toBe(0);
});
it('attribution strips arbitrary queries and user-specific referrer paths',()=>{
 const data=attribution('https://site.test/?utm_source=tiktok&email=x@example.com#access_token=secret','https://search.test/private/person?q=name');
 expect(data).toEqual({utm_source:'tiktok',landing_page:'/',referrer:'https://search.test'});
});
