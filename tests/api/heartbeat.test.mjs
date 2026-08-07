import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createRequire } from 'node:module';
import { signPassToken } from '../../lib/pass-token.mjs';
const require = createRequire(import.meta.url);
const handler = require('../../api/heartbeat.js');
const secret = 'test-secret-0123456789abcdef';
function mockRes() { const out={statusCode:null,body:null,headers:{}}; return {setHeader:(k,v)=>{out.headers[k]=v;},status:(c)=>({json:(b)=>{out.statusCode=c;out.body=b;return out;},end:()=>{out.statusCode=c;return out;}}),end:()=>{},__out:out}; }
const req=(method, body, query)=>({method,body,query});
beforeAll(()=>{process.env.PASS_TOKEN_SECRET=secret;}); afterAll(()=>{delete process.env.PASS_TOKEN_SECRET;});
describe('heartbeat token enforcement',()=>{
 it('rejects POST without token',async()=>{const res=mockRes();await handler(req('POST',{jti:'hb-no-token',deviceId:'d'}),res);expect(res.__out.statusCode).toBe(401);expect(res.__out.body.error).toBe('invalid_pass');});
 it('rejects garbage token',async()=>{const res=mockRes();await handler(req('POST',{jti:'hb-garbage',deviceId:'d',token:'x.y.z'}),res);expect(res.__out.statusCode).toBe(401);});
 it('accepts valid POST',async()=>{const res=mockRes();await handler(req('POST',{jti:'hb-valid',deviceId:'d',token:signPassToken({},secret)}),res);expect(res.__out.statusCode).toBe(200);expect(res.__out.body.ok).toBe(true);});
 it('rejects GET without token',async()=>{const res=mockRes();await handler(req('GET',undefined,{jti:'hb-get',deviceId:'d'}),res);expect(res.__out.statusCode).toBe(401);});
 it('accepts valid GET',async()=>{const res=mockRes();await handler(req('GET',undefined,{jti:'hb-get-valid',deviceId:'d',token:signPassToken({},secret)}),res);expect(res.__out.statusCode).toBe(200);expect(res.__out.body.kill).toBe(false);});
});
