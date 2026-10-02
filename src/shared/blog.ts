import {z} from 'zod';
const text=z.string().trim().min(1);
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Invalid calendar date');
export const articleSchema=z.object({slug:text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),status:z.enum(['draft','published']),title:text,description:text,category:text,author:text,publishedAt:date,updatedAt:date.optional(),introduction:text,sections:z.array(z.object({heading:text,paragraphs:z.array(text).min(1)}).strict()).min(1)}).strict().refine(a=>!a.updatedAt||a.updatedAt>=a.publishedAt,'Updated date precedes publication');
export type Article=z.infer<typeof articleSchema>;
export function publishedArticles(input:unknown[],now=new Date()):Article[]{const articles=input.map(a=>articleSchema.parse(a));const slugs=new Set<string>();for(const a of articles){if(slugs.has(a.slug))throw new Error('Duplicate article slug: '+a.slug);slugs.add(a.slug);}const today=now.toISOString().slice(0,10);return articles.filter(a=>a.status==='published'&&a.publishedAt<=today&&(!a.updatedAt||a.updatedAt<=today)).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)||a.slug.localeCompare(b.slug));}
export const escapeHtml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const articlePath=(a:Article)=>'/blog/'+a.slug;
