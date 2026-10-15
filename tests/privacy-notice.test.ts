import {it,expect} from 'vitest';
import {uiPages,renderPage} from '../src/ui/pages.js';

it('renders an indexable privacy notice with the approved operator, contact and working retention periods',()=>{
 const page=uiPages.find(item=>item.kind==='privacy')!;
 const html=renderPage(page,'{}','https://matecusucces.com',true);
 for(const copy of ['SS TEAM S.R.L.','52720209','J2025079707003','stelutaenache05@gmail.com','Bascov','24 de luni','12 luni','14 luni','90 de zile','sub 18 ani','notificari@matecusucces.com'])expect(html).toContain(copy);
 expect(html).toContain('name="robots" content="index, follow"');
 expect(html).not.toContain('Informarea completă va fi disponibilă înainte de lansare');
});

it('renders conditional parental consent fields on email signup',()=>{
 const page=uiPages.find(item=>item.kind==='signup')!;
 const html=renderPage(page,'{}','https://matecusucces.com',true);
 expect(html).toContain('name="under18"');
 expect(html).toContain('name="parentEmail"');
 expect(html).toContain('name="parentConsent"');
 expect(html).toContain('noindex, nofollow');
});
