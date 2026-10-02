import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {route} from '../src/server/router.js';
const root=resolve('build');const types:Record<string,string>={'.html':'text/html','.js':'text/javascript','.css':'text/css','.xml':'application/xml','.txt':'text/plain'};
createServer(async(req,res)=>{
 try{
 const url=new URL(req.url??'/','http://localhost:4174');
 if(url.pathname.startsWith('/api/v1/')){const parts:Buffer[]=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>1048576){res.writeHead(413);res.end();return;}parts.push(Buffer.from(chunk));}const response=await route(new Request(url,{method:req.method,headers:req.headers as Record<string,string>,body:['GET','HEAD'].includes(req.method??'GET')?undefined:Buffer.concat(parts)}));res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());return;}
 let file=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(file.startsWith(root+'/')&&(await stat(file)).isDirectory())file=resolve(file,'index.html');if(!file.startsWith(root+'/')||!(await stat(file)).isFile())throw new Error('not_found');res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream','X-Robots-Tag':'noindex, nofollow'});res.end(await readFile(file));
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(4174,'127.0.0.1',()=>console.log('http://localhost:4174'));
