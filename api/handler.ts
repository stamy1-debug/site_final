import type {IncomingMessage,ServerResponse} from 'node:http';
import {route} from '../src/server/router.js';
export const config={api:{bodyParser:false}};
export default async function handler(req:IncomingMessage,res:ServerResponse){
 const url=new URL(req.url??'/','http://localhost');const path=url.searchParams.get('route')??'';url.pathname='/api/v1/'+path;url.searchParams.delete('route');
 const chunks:Buffer[]=[];let size=0;for await(const chunk of req){const b=Buffer.from(chunk);size+=b.length;if(size>1048576){res.writeHead(413);res.end();return;}chunks.push(b);}
 const headers=new Headers();for(const [k,v]of Object.entries(req.headers)){if(v)headers.set(k,Array.isArray(v)?v.join(','):v);}
 const request=new Request(url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method??'GET')?undefined:Buffer.concat(chunks)});
 const result=await route(request);res.writeHead(result.status,Object.fromEntries(result.headers.entries()));res.end(await result.text());
}
