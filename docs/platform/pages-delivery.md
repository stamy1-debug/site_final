# Pagini de platformă — implementare locală

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

Migrarea `202609300001_program_catalog.sql` adaugă cele patru programe în catalog, fără Stripe price IDs fictive. Configurarea Stripe trebuie să creeze prețuri lunare RON cu sumele 35000, 53000, 58400 și 15200 în unități minore, apoi să le asocieze planurilor corecte. UI acceptă numai un preț activ returnat de API care corespunde exact codului, monedei, intervalului și sumei. Matricea de acces digital trebuie încă configurată în backend; ședințele și mentoratul sunt beneficii ale serviciului, nu funcționalități software inventate.

La conectarea Supabase, configurează redirecturile exacte `/auth/callback` și `/auth/callback?auth=recovery` pentru fiecare mediu. Stripe Checkout revine în `/cont?checkout=complete`, anularea în `/programe?checkout=cancelled`, iar Portalul în `/cont`. Redirectul nu confirmă o plată: UI așteaptă datele backendului.

## Verificare și limite

Build, lint, TypeScript și suite locală: 78 teste. Revizie independentă fără defecte blocante; afișarea stării newsletter după reload a fost corectată, cu test de regresie pentru ruta de citire. Verificare browser desktop și 390 px: programe, auth, navigare mobilă fără overflow, eroare onestă când auth/billing nu sunt configurate, checkbox-uri de consimțământ oprite, stare neautentificată a contului. Capturi în screenshots/.

Contul autentificat este conectat la API real, dar nu a fost validat end-to-end cu date remote deoarece cheile au fost amânate explicit. Nu există cont demo sau progres fictiv. Google, emailurile de confirmare/reset, plățile și datele reale vor fi testate după configurare.

Informarea juridică completă, identitatea operatorului și termenele de păstrare nu sunt inventate. Pagina de preferințe nu ține loc de termeni sau politică juridică aprobată. Formularul public de contact/lead și conținutul educațional propriu-zis nu sunt incluse în aceste pagini de cont. Newsletter campaigns, recompensele referral, erasure complet, worker programat, monitorizarea remote și deployment rămân în lista de infrastructură.
