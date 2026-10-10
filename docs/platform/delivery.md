# Raport de livrare — 10 octombrie 2026

## Starea curentă a integrărilor

| Serviciu | Stare verificată | Ce lipsește pentru acceptanță completă |
|---|---|---|
| Aplicație locală | Paginile platformei, structura blogului și serverul local sunt implementate; verificarea Node 22 a trecut. | Articolele blogului trebuie redactate/aprobate și publicate pentru efect SEO. |
| Supabase | Proiect conectat, migrările și tabelele create, Auth cu email/parolă folosit pentru o înregistrare reală; redirecturile locale callback/recovery configurate. | Google OAuth, test multi-user RLS/Storage, backup și restore; operatorul SUPER_ADMIN trebuie stabilit. |
| Stripe | Sandbox conectat; Checkout test STARTER plătit, abonamentul și plata au fost confirmate. Portal configurat. | Teste sandbox pentru eșec, anulare, refund și redelivery webhook. Live este oprit. |
| Resend | Cheie conectată; un mesaj de integrare autorizat a ajuns în inboxul de test. | Domeniu și expeditor propriu verificate; trimiterea automată rămâne dezactivată; schedulerul lipsește. |
| PostHog | Proiect EU conectat, evenimentele `page_view`, `pricing_viewed`, `login_completed` și consimțământ observate; dashboard KPI inițial creat. | Funnel checkout–abonament și cohorte după evenimente reale. Replay/heatmaps/autocapture sunt oprite. |
| Sentry | Codul și redactarea sunt implementate. | Proiect și DSN-uri lipsesc; nu există test de eroare sau alerte remote. |
| Vercel/domeniu | Domeniul canonic confirmat: `matecusucces.com`; pregătirea locală este prezentă. Deploymentul nu a fost făcut. | Proiect, DNS, variabile hosted și validare hosted. Lansarea rămâne amânată la cererea proprietarului. |

Variabilele actuale din `.env` sunt secrete și nu se raportează cu valorile lor. Comanda `node --env-file=.env --import tsx scripts/readiness.ts` arată numai configurația prezentă și lipsurile cunoscute; nu contactează furnizorii și nu dovedește acceptanța lor.

## Verificare locală — 10 octombrie 2026

- `npm run verify`: lint, TypeScript, **111/111 teste în 21 fișiere** și build reușite.
- `npm audit --audit-level=low`: zero vulnerabilități după actualizarea tranzitivă `source-map-js` la versiunea 1.2.2.
- Build cu `.env`: development, neindexabil; sursa frontendului înghețat rămâne neschimbată (`git diff --exit-code -- dist`).
- `npm run readiness` cu `.env`: hosting, Supabase identity, Stripe payments, PostHog analytics și privacy configurate; Resend disabled intenționat; Sentry și JOB_SECRET lipsesc. Readiness verifică existența variabilelor, nu serviciile.
- Verificare read-only Supabase: un cont cu rol STUDENT și niciun SUPER_ADMIN. Bootstrap-ul administratorului rămâne operațiune explicită a proprietarului.
- Dovezi vizuale ale setărilor și dashboardului sunt în [captura PostHog](screenshots/posthog-kpi.png) și [captura redirecturilor Supabase](screenshots/supabase-auth-urls.png).

## Pași rămași, în ordinea dependențelor

1. Configurare de către proprietar: OAuth Google, DSN-urile Sentry, domeniul expeditorului Resend, identitatea operatorului și politica juridică de retenție.
2. Teste sandbox: eșec de plată, anulare, refund, replay webhook și verificarea stării drepturilor/outbox/PostHog.
3. Pregătirea operării: rolul SUPER_ADMIN, secretul și schedulerul joburilor, backup/restore demonstrat și alerte.
4. După alegerea domeniului și conectarea Vercel: acceptanță HTTPS/CSP/CORS, indexare, performanță reală și smoke-test complet. Deploymentul și activarea Stripe live sunt decizii distincte, încă neautorizate.

Nu s-a creat încă un PRD acceptat pentru producție; criteriile de release externe rămân deschise. Raportul inițial de mai jos este istoric și nu reflectă serviciile conectate ulterior.

## Raportul final cerut de PRD §129

**Implementat:** infrastructura aplicației, rutele de cont, auth, catalog și Checkout, consimțământ, taxonomie analytics, blogul ca structură și SEO tehnic. Nu s-a schimbat framework-ul aprobat.

**Vercel:** configurația locală este pregătită; proiectul, mediile și deploymentul hosted nu există încă. `matecusucces.com` este domeniul canonic confirmat, dar nu este conectat la acest deployment.

**Supabase:** migrările și tabelele sunt prezente; înregistrarea email/parolă și redirecturile locale au fost folosite cu succes. În datele citite acum există un rol STUDENT și niciun SUPER_ADMIN. Google OAuth, testul multi-user RLS, Storage și backup/restore hosted rămân deschise.

**Stripe:** checkout-ul lunar STARTER în sandbox a reușit și abonamentul/plata au fost confirmate. Anularea, plata eșuată, rambursarea, redelivery-ul și drepturile după tranziții nu au acceptanță completă. Prețuri anuale și Stripe live nu sunt activate.

**Resend:** emailul de test a ajuns în inboxul autorizat. Trimiterea automată este oprită; domeniul expeditorului și workerul periodic nu sunt pregătite.

**PostHog:** proiectul EU și dashboardul KPI inițial există; evenimentele de pagină, autentificare și programe au fost observate cu acord. Funnel-ul complet de plată și cohortele productive nu există încă; replay, autocapture și heatmaps rămân oprite.

**Sentry:** codul de raportare și redactarea există, dar proiectul/DSN-urile și alertele nu sunt configurate.

**SEO/AEO:** metadatele, canonical, sitemap, robots, Open Graph și datele structurate tehnice sunt în build. Blogul are nevoie de articole reale aprobate; validarea pe domeniul public și în instrumentele crawler nu se poate face înainte de deployment.

**Securitate și confidențialitate:** RLS, verificarea identității pe server, protecția secretelor, limite și consimțământul sunt implementate; auditul npm este curat. Exportul și cererea de ștergere există, iar erasure externă/retention sunt proceduri manuale. Operatorul, datele juridice, perioadele de retenție și rolul SUPER_ADMIN cer configurare de proprietar.

**Teste și regresie frontend:** `npm run verify` pe Node 22 a trecut lint, TypeScript, 111 teste în 21 fișiere și build; `npm audit --audit-level=low` raportează zero vulnerabilități. Buildul nu modifică `dist/`; rutele locale `/`, `/programe`, `/inregistrare`, `/confidentialitate` și `/blog` răspund 200. Paginile adăugate sunt aprobate; experiența Three.js originală rămâne intactă.

**Acțiuni externe rămase:** OAuth Google, DSN Sentry, DNS-ul expeditorului Resend, bootstrap-ul SUPER_ADMIN, secret/scheduler pentru joburi, scenariile sandbox Stripe, backup/restore și aprobarea documentelor juridice. Deploymentul rămâne amânat la cererea proprietarului.

**Limitări de plan și operare:** nu s-a cumpărat plan plătit. Frecvența schedulerului disponibilă în planul Vercel Hobby poate fi insuficientă pentru emailuri tranzacționale prompte; verifică planul curent și costul înainte de a activa workerul. Nu sunt configurate alerte pentru erori sau webhookuri.

**Funcții care încă nu au interfață sau reguli aprobate:** nu există flux complet de publicare editorială, cupoane, recompense referral sau campanii de newsletter. Acestea nu blochează paginile livrate, dar nu se declară implementate. Matricea beneficiilor digitale trebuie validată cu proprietarul înainte de acordarea accesului premium.

---

## Situația inițială — 30 septembrie 2026

> Actualizare ulterioară: utilizatorul a aprobat interfețele; cele opt pagini sunt implementate local. Vezi [raportul paginilor](pages-delivery.md) pentru starea curentă a UI, catalogului și testelor. Raportul de mai jos păstrează situația de dinaintea acestei aprobări.

**Stare: implementare locală verificată; platforma nu este încă lansată în producție.** PRD-ul nou este autoritatea pentru infrastructură. Experiența publică aprobată este păstrată.

## Implementat

| Modul | Cod disponibil și verificare locală | Configurare/acceptanță rămasă |
|---|---|---|
| Vercel | Build static separat, funcție Node 22, API v1, headers, preview noindex, CI | Proiect, medii, domeniu, deployment și verificare hosted |
| Supabase | Migrare SQL, profil/roluri, RLS, catalog, entitlements, Storage privat, SDK Auth PKCE, API | Proiecte test/producție, migrare reală, OAuth Google, email confirmation/reset, sesiuni și Storage testate real |
| Stripe | Checkout cu rezervare durabilă/idempotency, Portal, semnături raw, event ledger atomic, stări abonamente/plăți/refund | Produse/prețuri și matrice de acces aprobate; toate scenariile reale test-mode; live rămâne oprit |
| Resend | Șabloane, outbox cu lease/retry/idempotency, destinatar de test obligatoriu în afara producției | Cheie, domeniu verificat, inbox de test, runner periodic aprobat |
| PostHog | SDK lazy cu opt-in, taxonomie, atribuire, deduplicare, conversii din webhook prin outbox, flag getter | Proiect/cheie; observarea evenimentelor; funnels/cohorts/retention în dashboard; UI lipsă |
| Sentry | Browser după consent, server, redactare date, mediu/release, tracing oprit | DSN-uri, eroare observată în proiect, alerte |
| SEO | Canonical, robots, sitemap pentru ruta reală, Open Graph/Twitter, WebSite JSON-LD | Domeniu canonic și verificare deployment/CSP/crawler; fără imagine OG inventată |
| AEO/GEO | Model de date pentru conținut educațional viitor, metadate verificabile | Lecții/FAQ și validare editorială; nu au fost fabricate pagini sau rezultate |
| Securitate | JWT verificat cu Supabase, RBAC/RLS, private keys server-only, quota, validare input, fail-closed, audit | Validare pe serviciile reale și politici operaționale |
| Confidențialitate | Consent versionat/ordonat, retragere, newsletter atomic, export paginat, cerere de ștergere | Notice/retention aprobate, UI consent, proces de ștergere efectivă în toți furnizorii |

Nu au fost trimise emailuri reale, procesate plăți reale, aplicate migrări remote, cumpărate abonamente sau schimbate domenii. Preview-ul Sites anterior nu a fost actualizat; infrastructura nouă vizează exclusiv Vercel.

## Verificări efectuate

- `npm exec --yes --package=node@22 -- npm run verify`: **73/73 teste, 13 fișiere; lint, TypeScript și build reușite**, Node 22.23.3.
- `npm audit --audit-level=low`: **0 vulnerabilități raportate** la verificare.
- SQL executat în PGlite cu scheme minimale Auth/Storage, două identități și service role: RLS, escaladare roluri, entitlements, expirare, tranzacții, duplicate, evenimente vechi, consent, ștergere și retention financiar.
- Stripe: verificare criptografică a payloadurilor sintetice, respingere modificare/mod greșit, checkout retries cu provider mock. Nu sunt teste pe un cont Stripe configurat.
- Export: 1.101 rânduri în trei pagini și refuzul exportului parțial la eroare.
- Test dedicat pentru două decizii consent în aceeași tranzacție/cu aceeași dată; revision face ordinea deterministă.
- Teste pentru consent gating/retragere, analytics PII, șabloane email, auth/roles, API errors, SEO și chei private absente din build.
- `git diff --exit-code -- dist` fără diferențe; testele compară hashurile originale și corpul HTML. CSS, app.js și Three.js sunt identice.
- Browser local: dimensiuni/stiluri selectate identice desktop 1280 px și mobil 390 px; fără overflow la 390 px; grafic sinusoidal și slider funcționale, răspunsul corect la quiz afișat, WebGL vizibil și schimbare Tor/Nod prin Enter confirmată. Fără erori/warnings în jurnalul inspectat.
- Loader inițial: **7.643 bytes** în fișierul minificat, înainte de compresia HTTP. SDK-urile sunt în chunk-uri lazy.

Revizia independentă a găsit patru probleme, remediate și acoperite: rezervarea checkout înainte de apelul Stripe; consent după reload; serializarea newsletter/withdrawal; actualizări financiare după ștergerea identității. Verificarea finală a mai detectat ordonarea ambiguă a consent-urilor și a fost corectată.

## BLOCKER — acces și configurare externă

| Serviciu | Acțiune necesară | De ce / ce rămâne |
|---|---|---|
| Vercel | Cont/proiect și variabile separate; domeniu ales | Fără deployment nu pot fi validate funcțiile, headers și URL-urile publice |
| Supabase | Proiecte, chei în secret manager, migrare test, setări Auth/Google | Fără identitate/bază remote nu pot funcționa conturile reale |
| Stripe | Cont test, produse și prețuri aprobate, webhook/Portal | Plățile reale nu pot fi simulate prin date locale |
| Resend | Cheie, domeniu/DNS și destinatar de test | Livrarea și identitatea expeditorului necesită verificare |
| PostHog | Proiect/cheie/regiune | Dashboardurile și ingestia nu sunt configurate |
| Sentry | Proiecte/DSN și destinatar alerte | Nu există încă dovada erorilor observate remote |
| Outbox | Runner periodic compatibil cu POST + secret | Endpointul este implementat; nu există scheduler activ |

Cheile nu trebuie trimise în chat sau comise în Git. Configurați-le direct în mediile furnizorilor; pașii sunt în setup.md.

## UI REQUIRED

Login/signup/Google, verificare/reset parolă, cont/profil/export/ștergere, pricing/Checkout/Portal, cookie preferences, lead/newsletter și referral UI lipsesc din frontendul înghețat. PRD secțiunile 9–13 și 113 interzic adăugarea lor fără aprobare. Fațada și API-urile nu echivalează cu un flux public complet. Este necesară și alegerea prețurilor/matricei de funcționalități plătite.

## Limite și ce nu este finalizat

- Nu se declară îndeplinite definițiile de done ale furnizorilor: accesul și testele remote lipsesc.
- Vercel Hobby are restricție de utilizare necomercială; planul potrivit și costul curent trebuie aprobate înainte de lansarea comercială. Cron zilnic nu este suficient pentru email prompt. Nu s-a activat niciun cost.
- Backup/restore Supabase, livrare email, procesul complet GDPR și alertele nu sunt validate remote. Docker local nu a fost disponibil; PGlite nu reproduce integral serviciul Supabase.
- Ștergerea este cerere + dezactivare, nu erasure complet automat. Retention/purge și exporturile din furnizori sunt operațiuni documentate, încă neconfigurate.
- Cupoanele, conversia/recompensa referral, notificările de expirare/securitate automate, newsletter campaigns și modulele educaționale viitoare nu sunt fluxuri implementate complet; unele au doar modele/șabloane.
- Exportul paginează datele, dar conturile foarte mari pot depăși limitele serverless; necesită proces asistat. Nu există un snapshot unic între paginile exportului.
- Evenimentele care depind de UI lipsă și activarea educațională nu formează încă un funnel public complet. Replay/experimente/tracing sunt oprite.
- Testul browserului pentru click pe selectorul 3D nu a schimbat forma nici în original, nici după integrare. Enter funcționează. Problema este preexistentă; nu s-a modificat codul înghețat pentru a o repara.
- Nu există măsurători de producție Core Web Vitals sau garanții de performanță pe toate dispozitivele.

## Regresie frontend

**Sursele publice sunt neschimbate, byte-for-byte.** Comparația locală desktop/mobil nu a găsit diferențe în geometria/stilurile verificate; graficele, quizul și randarea WebGL sunt păstrate. Metadatele și loaderul invizibil sunt adăugate numai în build. Nu declarăm testarea exhaustivă a tuturor browserelor sau a deploymentului încă inexistent.
