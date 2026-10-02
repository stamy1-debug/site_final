import {publishedArticles,articlePath} from '../src/shared/blog.js';
import {renderArticle} from '../src/ui/article.js';
import {renderFooter} from '../src/ui/footer.js';
import {mkdir,cp,readFile,writeFile,rm,readdir} from 'node:fs/promises';
import {build} from 'esbuild';
import {configuration} from '../src/server/config.js';
import {uiPages,renderPage} from '../src/ui/pages.js';
import {renderHead,robots,sitemap} from '../src/shared/seo.js';
const articles=publishedArticles(await Promise.all((await readdir('content/blog')).filter(f=>f.endsWith('.json')).sort().map(async f=>JSON.parse(await readFile('content/blog/'+f,'utf8')))));
const cfg=configuration();const indexable=cfg.environment==='production'&&process.env.VERCEL_ENV!=='preview'&&process.env.SITE_INDEXABLE==='true';
await rm('build',{recursive:true,force:true});await mkdir('build',{recursive:true});await cp('dist','build',{recursive:true});
const publicConfig={supabaseUrl:process.env.SUPABASE_URL,supabaseKey:process.env.SUPABASE_ANON_KEY,posthogKey:process.env.POSTHOG_PUBLIC_KEY,posthogHost:process.env.POSTHOG_HOST,sentryDsn:process.env.SENTRY_PUBLIC_DSN,environment:cfg.environment,release:process.env.VERCEL_GIT_COMMIT_SHA,policyVersion:process.env.CONSENT_POLICY_VERSION};
if(publicConfig.supabaseKey?.startsWith('sb_secret_'))throw new Error('Secret key cannot be a public key');
if(publicConfig.supabaseKey?.startsWith('eyJ')){const claim=JSON.parse(Buffer.from(publicConfig.supabaseKey.split('.')[1],'base64url').toString());if(claim.role!=='anon')throw new Error('Only anon JWT may be public');}
const html=await readFile('dist/index.html','utf8');
const additions=renderHead(cfg.siteUrl,indexable)+`<link rel="stylesheet" href="/home-navigation.css"><link rel="stylesheet" href="/footer.css"><script type="application/json" id="platform-config">${JSON.stringify(publicConfig).replaceAll('<','\\u003c')}</script><script type="module" src="/platform/platform.js"></script>`;
await writeFile('build/index.html',html.replace('</head>',additions+'</head>').replace('<nav aria-label="Navigare principală">','<nav aria-label="Navigare principală"><a href="/programe" data-platform-nav>Programe</a><a href="/blog" data-platform-nav>Blog</a><a href="/cont" data-platform-nav>Contul meu</a>').replace(/<footer>[\s\S]*?<\/footer>/,renderFooter()));
for(const page of uiPages){await mkdir('build'+page.path,{recursive:true});await writeFile('build'+page.path+'/index.html',renderPage(page,JSON.stringify(publicConfig).replaceAll('<','\\u003c'),cfg.siteUrl,indexable,articles));}
for(const article of articles){const path='build'+articlePath(article);await mkdir(path,{recursive:true});await writeFile(path+'/index.html',renderArticle(article,cfg.siteUrl,indexable));}
await cp('src/ui/blog.css','build/blog.css');await cp('src/ui/footer.css','build/footer.css');await cp('src/ui/ui.css','build/ui.css');await cp('src/ui/home-navigation.css','build/home-navigation.css');
await writeFile('build/robots.txt',robots(indexable,cfg.siteUrl));await writeFile('build/sitemap.xml',sitemap(cfg.siteUrl,articles.map(a=>a.slug)));
await build({entryPoints:{platform:'src/browser/platform.ts',ui:'src/browser/ui.ts'},outdir:'build/platform',bundle:true,splitting:true,format:'esm',target:'es2022',minify:true,sourcemap:false,entryNames:'[name]',chunkNames:'chunks/[name]-[hash]',define:{'process.env.NODE_ENV':'"production"'}});
// Deployment headers use a restrictive static configuration; preview metadata is also noindex.
console.log(JSON.stringify({environment:cfg.environment,indexable,output:'build',frontendSource:'unchanged'}));
