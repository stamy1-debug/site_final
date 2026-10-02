import {it,expect} from 'vitest';
import {route} from '../src/server/router.js';
it('health does not need credentials or expose config',async()=>{const r=await route(new Request('http://localhost/api/v1/health'));expect(r.status).toBe(200);expect(await r.json()).toEqual({status:'ok'});});
it('readiness fails closed without configured providers',async()=>{const r=await route(new Request('http://localhost/api/v1/ready'));expect(r.status).toBe(503);});
it('missing bearer rejected before database access',async()=>{const r=await route(new Request('http://localhost/api/v1/me'));expect(r.status).toBe(401);});
it('unknown route is a genuine 404',async()=>{expect((await route(new Request('http://localhost/api/v1/missing'))).status).toBe(404);});
it('foreign origin is rejected',async()=>{expect((await route(new Request('http://localhost/api/v1/me',{method:'PATCH',headers:{origin:'https://attacker.test'}}))).status).toBe(403);});
it('unknown methods cannot mutate records',async()=>{expect((await route(new Request('http://localhost/api/v1/health',{method:'DELETE'}))).status).toBe(405);});
it('newsletter status is an authenticated read route',async()=>{expect((await route(new Request('http://localhost/api/v1/newsletter'))).status).toBe(401);});
