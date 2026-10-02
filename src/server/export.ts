import type {SupabaseClient} from '@supabase/supabase-js';
export function exportOrder(table:string){return table==='user_roles'?'role':['newsletter_subscribers','deletion_requests'].includes(table)?'user_id':'id';}
// PostgREST caps individual responses; never silently truncate a rights export.
export async function exportRows(db:SupabaseClient,table:string,column:string|null,userId:string,selection='*',order='id'){
 const rows:Record<string,unknown>[]=[];const pageSize=500;
 for(let offset=0;;offset+=pageSize){
  let query=db.from(table).select(selection);if(column)query=query.eq(column,userId);
  const {data,error}=await query.order(order).range(offset,offset+pageSize-1);
  if(error)throw error;
  const page=(data??[]) as unknown as Record<string,unknown>[];rows.push(...page);
  if(page.length<pageSize)return rows;
 }
}
