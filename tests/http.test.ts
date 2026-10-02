import {createServer,type Server} from 'node:http';
import type {AddressInfo} from 'node:net';
import {beforeAll,afterAll,it,expect} from 'vitest';
import handler from '../api/handler.js';
let server:Server;let origin:string;
beforeAll(async()=>{server=createServer((req,res)=>{void handler(req,res);});await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+(server.address() as AddressInfo).port;});
afterAll(async()=>{server.closeAllConnections();await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));});
it('serves health through the actual HTTP adapter with private response caching disabled',async()=>{
 const response=await fetch(origin+'/api/handler?route=health');expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toBe('no-store');expect(response.headers.get('x-robots-tag')).toContain('noindex');expect(await response.json()).toEqual({status:'ok'});
});
it('rejects unauthenticated profile access without contacting Supabase',async()=>{
 const response=await fetch(origin+'/api/handler?route=me');expect(response.status).toBe(401);const body=await response.json();expect(body.error.code).toBe('authentication_required');expect(body.error.request_id).toMatch(/^[a-f0-9-]{36}$/);
});
it('keeps unknown endpoints and forbidden methods distinct',async()=>{
 expect((await fetch(origin+'/api/handler?route=missing')).status).toBe(404);
 expect((await fetch(origin+'/api/handler?route=health',{method:'DELETE'})).status).toBe(405);
});
it('rejects foreign-origin mutation before provider access',async()=>{
 const response=await fetch(origin+'/api/handler?route=me',{method:'PATCH',headers:{Origin:'https://untrusted.example','Content-Type':'application/json'},body:'{}'});expect(response.status).toBe(403);expect((await response.json()).error.code).toBe('origin_not_allowed');
});
it('enforces the raw request size limit before route processing',async()=>{
 const response=await fetch(origin+'/api/handler?route=webhooks/stripe',{method:'POST',body:'x'.repeat(1048577)});expect(response.status).toBe(413);
});
