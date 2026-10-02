import {expect,it,vi} from 'vitest';
import type {SupabaseClient} from '@supabase/supabase-js';
import {exportRows} from '../src/server/export.js';
it('exports all pages instead of silently applying the provider row cap',async()=>{
 const values=Array.from({length:1101},(_,id)=>({id}));
 const range=vi.fn(async(start:number,end:number)=>({data:values.slice(start,end+1),error:null}));
 const query={select:()=>query,eq:()=>query,order:()=>query,range};
 const db={from:()=>query} as unknown as SupabaseClient;
 expect(await exportRows(db,'payments','user_id','user')).toEqual(values);expect(range).toHaveBeenCalledTimes(3);
});
it('does not return a partial export when a page fails',async()=>{
 const query={select:()=>query,eq:()=>query,order:()=>query,range:async()=>({data:null,error:new Error('unavailable')})};
 await expect(exportRows({from:()=>query} as unknown as SupabaseClient,'payments','user_id','user')).rejects.toThrow('unavailable');
});
it('uses a unique row key for multi-row coupon exports',async()=>{
 const {exportOrder}=await import('../src/server/export.js');expect(exportOrder('coupon_redemptions')).toBe('id');expect(exportOrder('user_roles')).toBe('role');expect(exportOrder('newsletter_subscribers')).toBe('user_id');
});
