import {beforeAll,it,expect} from 'vitest';
import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync,statSync} from 'node:fs';
beforeAll(()=>{execFileSync(process.execPath,['--import','tsx','scripts/build.ts'],{env:{PATH:process.env.PATH,APP_ENV:'preview',SITE_URL:'https://preview.example.test',SUPABASE_SERVICE_ROLE_KEY:'service-role-must-never-leak',STRIPE_SECRET_KEY:'sk_test_should_never_leak'}});});
it('generated HTML retains the public body except approved navigation links and shared footer',()=>{
 const original=readFileSync('dist/index.html','utf8');const built=readFileSync('build/index.html','utf8');expect(built.replace(/<a href="\/(?:programe|cont|confidentialitate|blog)" data-platform-nav>[^<]+<\/a>/g,'').replace(/<footer[\s\S]*?<\/footer>/,'').split('<body>')[1]).toBe(original.replace(/<footer[\s\S]*?<\/footer>/,'').split('<body>')[1]);
});
it('build adds only approved invisible head elements',()=>{const html=readFileSync('build/index.html','utf8');expect(html).toContain('noindex, nofollow');expect(html).not.toContain('service-role-must-never-leak');expect(html).not.toContain('sk_test_should_never_leak');expect(html).toContain('platform-config');});
it('visual and 3D assets are unchanged in deployment output',()=>{for(const path of ['style.css','app.js','vendor/three.module.js','vendor/three.core.js'])expect(readFileSync('build/'+path)).toEqual(readFileSync('dist/'+path));});
it('initial invisible loader has a bounded payload',()=>{expect(statSync('build/platform/platform.js').size).toBeLessThan(20000);});

it('build publishes all approved flows with private account routes excluded from indexing',()=>{for(const path of ['blog','programe','autentificare','inregistrare','recuperare','parola-noua','auth/callback','cont','confidentialitate']){const html=readFileSync('build/'+path+'/index.html','utf8');expect(html).toContain('lang="ro"');expect(html).toContain('/platform/ui.js');expect(html).toContain('noindex, nofollow');expect(html).not.toContain('service-role-must-never-leak');}expect(readFileSync('build/programe/index.html','utf8')).toContain('584');});
it('same-origin API calls retain Vercel preview authorization cookies',()=>{const files=readdirSync('build/platform/chunks').filter(file=>file.endsWith('.js'));const appChunk=files.map(file=>'build/platform/chunks/'+file).filter(path=>statSync(path).size<100_000).map(path=>readFileSync(path,'utf8')).find(bundle=>bundle.includes('fetch("/api/v1/"'));expect(appChunk? /fetch\("\/api\/v1\/"\+.{0,350}credentials:"same-origin"\}\)/.test(appChunk):false).toBe(true);});
