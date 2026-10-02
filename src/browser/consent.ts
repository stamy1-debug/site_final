export type ConsentChoice={analytics:boolean;marketing:boolean;preferences:boolean;policy_version:string};
export async function persistAuthenticatedConsent(choice:ConsentChoice,hasSession:()=>Promise<boolean>,write:(record:{category:string;granted:boolean;policy_version:string})=>Promise<unknown>):Promise<boolean>{
 if(!await hasSession())return false;
 for(const category of ['analytics','marketing','preferences'] as const)await write({category,granted:choice[category],policy_version:choice.policy_version});
 return true;
}
// History is newest-first. Never let stale local opt-in override a server withdrawal.
export function reconcileConsent(local:ConsentChoice|undefined,history:Array<{category:string;granted:boolean;policy_version:string}>,policy:string):ConsentChoice{
 const result:ConsentChoice={analytics:false,marketing:false,preferences:false,policy_version:policy};
 for(const category of ['analytics','marketing','preferences'] as const){const record=history.find(r=>r.category===category);result[category]=record?record.policy_version===policy&&record.granted&&(local?.[category]??true):!!local?.[category];}
 return result;
}
export async function loadConsentChoice(sync:()=>Promise<boolean>,read:()=>ConsentChoice|undefined){if(!await sync())throw new Error('consent_sync_failed');return read();}
export function reportConsentedLogin(allowed:boolean,login:{userId:string;eventId:string}|undefined,identify:(id:string)=>void,capture:(id:string)=>void){if(!allowed||!login)return;identify(login.userId);capture(login.eventId);}
