import {it,expect} from 'vitest';
import {persistAuthenticatedConsent} from '../src/browser/consent.js';
it('checks persisted authentication even if client was not previously initialized',async()=>{
 let checked=0;const writes:unknown[]=[];
 await persistAuthenticatedConsent({analytics:false,marketing:false,preferences:false,policy_version:'v1'},async()=>{checked++;return true;},async value=>{writes.push(value);});
 expect(checked).toBe(1);expect(writes).toContainEqual({category:'marketing',granted:false,policy_version:'v1'});
});
it('does not claim server consent persistence for anonymous users',async()=>{const writes:unknown[]=[];expect(await persistAuthenticatedConsent({analytics:false,marketing:false,preferences:false,policy_version:'v1'},async()=>false,async v=>{writes.push(v);})).toBe(false);expect(writes).toEqual([]);});
it('server withdrawal overrides a stale local grant',async()=>{
 const {reconcileConsent}=await import('../src/browser/consent.js');
 expect(reconcileConsent({analytics:true,marketing:false,preferences:false,policy_version:'v1'},[{category:'analytics',granted:false,policy_version:'v1'}],'v1').analytics).toBe(false);
});
it('old policy server grants cannot activate collection',async()=>{
 const {reconcileConsent}=await import('../src/browser/consent.js');
 expect(reconcileConsent(undefined,[{category:'analytics',granted:true,policy_version:'old'}],'new').analytics).toBe(false);
});
it('loads form choices only after asynchronous server reconciliation',async()=>{
 const {loadConsentChoice}=await import('../src/browser/consent.js');let enabled=true;let release!:()=>void;
 const gate=new Promise<void>(resolve=>{release=resolve;});
 const pending=loadConsentChoice(async()=>{await gate;enabled=false;return true;},()=>({analytics:enabled,marketing:false,preferences:false,policy_version:'v1'}));
 release();expect((await pending)?.analytics).toBe(false);
});
it('does not report an authenticated identity before consent synchronization succeeds',async()=>{
 const {reportConsentedLogin}=await import('../src/browser/consent.js');const actions:string[]=[];
 reportConsentedLogin(false,{userId:'user-b',eventId:'login-b'},id=>actions.push(id),id=>actions.push(id));expect(actions).toEqual([]);
 reportConsentedLogin(true,{userId:'user-b',eventId:'login-b'},id=>actions.push(id),id=>actions.push(id));expect(actions).toEqual(['user-b','login-b']);
});
