# Pagini de platformă — implementare locală

Stare actuală: toate paginile enumerate au fost construite. Auth cu Supabase și Checkout STARTER cu Stripe sandbox au fost folosite de proprietar; nu se mai aplică nota istorică de mai jos conform căreia cheile fuseseră amânate.

Utilizatorul a aprobat explicit interfețele lipsă, a confirmat domeniul final matecusucces.com și a cerut implementarea înainte de chei/deploy. Această actualizare înlocuiește blocajul UI din raportul inițial pentru fluxurile enumerate mai jos.

## Pagini disponibile

- `/programe`: STARTER 350, PRO 530, ELITE 584, Elevul independent 152 lei/lună, beneficii, selecție și întoarcere din autentificare. Oferta provine de la https://www.matecusucces.com/8. Nu există ofertă anuală inventată.
- `/autentificare`: email/parolă, afișare/ascundere parolă, Google, redirecționare internă validată.
- `/inregistrare`: creare cont, parole de minimum 12 caractere, confirmare prin email; fără acord de marketing implicit.
- `/recuperare` și `/parola-noua`: cerere link, răspuns fără divulgarea existenței contului, confirmarea parolei și verificarea sesiunii.
- `/auth/callback`: schimb PKCE înainte de verificarea sesiunii; erori și rutare pentru recuperare.
- `/cont`: stări neautentificat/neconfigurat, profil, abonamente, plăți, portal, newsletter, cod de recomandare, export JSON și solicitare de ștergere.
- `/confidentialitate`: preferințe separate, retragere, funcții opționale oprite când versiunea informării nu este configurată.

Navigarea generată a paginii principale are două linkuri noi, Programe și Contul meu, inclusiv pe mobil. `dist/` și codul Three.js rămân neschimbate. Acesta este un adaos vizibil aprobat, nu mai descriem întregul build drept exclusiv invizibil.

## Integrare

HTML generat în build din `src/ui/pages.ts`, stiluri proprii în `src/ui/ui.css`, controller în `src/browser/ui.ts`; nicio migrare de framework. API-ul newsletter are acum GET autentificat pentru starea salvată. Checkbox-ul rămâne dezactivat până la încărcarea stării și dezabonarea este disponibilă separat.

Migrarea `202609300001_program_catalog.sql` adaugă cele patru programe în catalog. Prețurile lunare RON aprobate au fost configurate în Stripe sandbox și asociate planurilor; checkout-ul STARTER reușit confirmă că ruta principală folosește un preț valid. UI acceptă numai un preț activ returnat de API care corespunde exact codului, monedei, intervalului și sumei. Matricea de acces digital și verificarea drepturilor după plată trebuie încă acceptate end-to-end; ședințele și mentoratul sunt beneficii ale serviciului, nu funcționalități software inventate.

În proiectul Supabase local au fost setate redirecturile exacte `/auth/callback` și `/auth/callback?auth=recovery`; pentru orice nou mediu trebuie configurate URL-urile sale. Stripe Checkout revine în `/cont?checkout=complete`, anularea în `/programe?checkout=cancelled`, iar Portalul în `/cont`. Redirectul nu confirmă o plată: UI așteaptă datele backendului.

## Verificare și limite

Istoric: 78 teste la livrarea inițială a paginilor; la 10 octombrie 2026 verificarea completă Node 22 a trecut cu 111 teste în 21 fișiere, lint, TypeScript și build. Revizia independentă fără defecte blocante și verificarea browser desktop/390 px sunt păstrate ca dovezi pentru UI. Testarea UI cu furnizorii conectați este parțială; vezi [delivery.md](delivery.md).

Contul autentificat a fost creat și folosit cu Supabase. Google OAuth a fost configurat și testat cu succes în browser local la 11 octombrie 2026; acceptanța completă pe domeniul Production rămâne de făcut după deployment. Checkout-ul sandbox reușit și confirmarea prin email au fost testate; acceptanța pentru scenariile de plată eșuată/anulare/refund și pentru emailurile Resend automate rămâne deschisă. Nu există cont demo sau progres fictiv.

Informarea juridică completă, identitatea operatorului și termenele de păstrare nu sunt inventate. Pagina de preferințe nu ține loc de termeni sau politică juridică aprobată. Formularul public de contact/lead și conținutul educațional propriu-zis nu sunt incluse în aceste pagini de cont. Newsletter campaigns, recompensele referral, erasure complet, worker programat, monitorizarea remote și deployment rămân în lista de infrastructură.
