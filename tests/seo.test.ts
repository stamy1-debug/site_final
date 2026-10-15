import {it,expect} from 'vitest';
import {renderHead,robots,sitemap} from '../src/shared/seo.js';
it('previews are noindex and do not advertise fictional routes',()=>{expect(robots(false,'https://site.test')).toContain('Disallow: /');expect(renderHead('https://site.test',false)).toContain('noindex, nofollow');expect(sitemap('https://site.test')).not.toContain('/bac');});
it('production emits absolute canonical, truthful WebSite and social metadata',()=>{const html=renderHead('https://site.test',true);expect(html).toContain('rel="canonical" href="https://site.test/"');expect(html).toContain('og:title');expect(html).toContain('"@type":"WebSite"');expect(html).not.toContain('FAQPage');expect(robots(true,'https://site.test')).toContain('Disallow: /api/');});
it('includes the public privacy notice in the production sitemap',()=>{expect(sitemap('https://site.test')).toContain('https://site.test/confidentialitate');});
it('rejects unsafe canonical origins',()=>expect(()=>renderHead('javascript:alert(1)',true)).toThrow());
