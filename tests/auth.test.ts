import {it,expect} from 'vitest';
import {authenticate,requireRole} from '../src/server/auth.js';
it('rejects missing bearer before provider call',async()=>{await expect(authenticate(undefined,async()=>null)).rejects.toMatchObject({status:401});});
it.each(['invalid','expired'])('rejects %s token',async token=>{await expect(authenticate('Bearer '+token,async()=>null)).rejects.toMatchObject({status:401});});
it('accepts provider verified user',async()=>{expect(await authenticate('Bearer valid',async()=>({id:'user',email:'a@example.test'}))).toMatchObject({id:'user'});});
it('rejects user-controlled metadata as authorization',()=>{expect(()=>requireRole(['STUDENT'],['ADMIN'])).toThrow();});
it('accepts authoritative privileged role',()=>{expect(()=>requireRole(['ADMIN'],['ADMIN','SUPER_ADMIN'])).not.toThrow();});
