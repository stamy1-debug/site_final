# Raport de livrare — actualizat 15 octombrie 2026

## Starea curentă a integrărilor

| Serviciu | Stare verificată | Ce lipsește pentru acceptanță completă |
|---|---|---|
| Aplicație locală | Paginile platformei, structura blogului și serverul local sunt implementate; verificarea Node 22 a trecut. | Articolele blogului trebuie redactate/aprobate și publicate pentru efect SEO. |
| Supabase | Proiect conectat, migrări și Auth email/parolă verificate; Google OAuth a fost configurat și testat cu succes pe 11 octombrie 2026. Pe 11 octombrie, două conturi temporare au confirmat izolarea profilurilor, blocarea escaladării rolului și accesul privat Storage doar pentru proprietar; conturile și fișierul de test au fost șterse. Contul autorizat al proprietarului are rolurile STUDENT și SUPER_ADMIN. | Backup și restore. |
| Stripe | Checkout STARTER și plata inițială confirmate. Pe 11 octombrie, eșecul de plată, anularea programată și revenirea ei, refund-ul integral, replay-ul idempotent, schimbarea Starter → Pro și redelivery-ul nativ au trecut în sandbox; detalii în [billing.md](billing.md). Cele patru prețuri lunare aprobate sunt configurate în Portal, iar Supabase este sincronizat pe Pro. Endpointul HTTPS folosit la redelivery a fost temporar și este închis; webhookul permanent se configurează după hosting. Live este oprit. |
| Resend | Domeniul `matecusucces.com` este verificat în Resend: DKIM și ambele CNAME-uri (`resend`, `send`) au status Verified (14 octombrie 2026). Un mesaj de test direct prin Resend API a fost livrat în inboxul autorizat la 15 octombrie; expeditorul afișat este `notificari@matecusucces.com`. Mailerul setează adresa aprobată `stelutaenache05@gmail.com` ca Reply-To. Cheia `matecusucces-vercel-preview-2`, cu acces numai de trimitere și restricție la domeniu, și configurația `RESEND_FROM` sunt salvate numai în Vercel Preview pentru ramura `codex/matecusucces-preview-2026-10-14`. Cheia inițială `matecusucces-vercel-preview` rămâne activă și nefolosită. | Testul de email prin mailerul aplicației nu s-a făcut; trimiterea automată este oprită și schedulerul lipsește. |
| PostHog | Proiect EU și dashboard KPI inițial. Pe 14 octombrie a trecut funnel-ul complet cu un profil temporar, consimțământ analytics și o plată Stripe Sandbox Starter; evenimentele `checkout_completed` și `subscription_started` au fost acceptate în PostHog. Retragerea ulterioară a consimțământului a oprit complet cererile PostHog. | Cohorte și măsurători pe trafic real după lansare. Replay/heatmaps/autocapture sunt oprite. |
| Sentry | Proiect în regiunea EU. `Allowed Domains` este restrâns la `matecusucces.com` și `www.matecusucces.com`. Enhanced Privacy, scrubber-ele server/default și mascarea IP la proiect și organizație sunt active; partajarea publică a issue-urilor este dezactivată. Spike Protection și alerta email pentru prioritate ridicată sunt active. | Un eveniment vechi încă arată geolocație derivată; efectul setărilor pe un eveniment nou și retenția efectivă nu au putut fi confirmate în dashboard. |
| Vercel/domeniu | Proiectul existent `site-final` este conectat la `stamy1-debug/site_final`. Preview-ul este protejat. Production are setările site/Supabase; Preview are variabile Supabase/Stripe test și `RESEND_API_KEY` (secret) plus `RESEND_FROM` doar pentru ramura `codex/matecusucces-preview-2026-10-14`. Deploymentul nou `21ef412` este Ready și pagina publică plus `/api/v1/ready` au răspuns. `SENTRY_*`, `POSTHOG_*`, `SITE_INDEXABLE` și secretul joburilor lipsesc. Preview și Production folosesc proiectul Supabase existent. Deploymentul Production etapizat `Aqt423YhKzYi5YfSS49TctpF83AJ` rămâne READY, fără promovare pe domeniul personalizat. | Testul din aplicație pentru email, acceptanța completă OAuth hosted și celelalte release gates externe. Domeniul `matecusucces.com` continuă să servească vechiul site până la promovarea deploymentului etapizat. Checkoutul, emailurile automate și trackingul opțional rămân inactive. |

Variabilele actuale din `.env` sunt secrete și nu se raportează cu valorile lor. Comanda `node --env-file=.env --import tsx scripts/readiness.ts` arată numai configurația prezentă și lipsurile cunoscute; nu contactează furnizorii și nu dovedește acceptanța lor.

## Verificare locală — istoric și rularea curentă din 15 octombrie 2026

- `npm run verify` curent: lint, TypeScript, **119/119 teste în 23 fișiere** și build reușite. Rulările istorice de mai jos sunt păstrate doar ca jurnal.
- `npm audit --audit-level=low`: zero vulnerabilități după actualizarea tranzitivă `source-map-js` la versiunea 1.2.2.
- Build cu `.env`: development, neindexabil; sursa frontendului înghețat rămâne neschimbată (`git diff --exit-code -- dist`).
- `npm run readiness` cu `.env` pe 11 octombrie: hosting, Supabase identity, Stripe payments, PostHog analytics, Sentry și privacy configurate; Resend disabled intenționat; `JOB_SECRET` lipsește. Readiness verifică existența variabilelor, nu serviciile.
- 14 octombrie: lint, typecheck și toate cele 111 teste din 21 fișiere au trecut separat, pe Node `26.8.1` (proiectul cere Node 22.x). Buildul și readiness au trecut cu `.env` încărcat explicit; readiness este offline și semnalează doar lipsa `JOB_SECRET`. Rularea directă a `npm run verify` cu `.env` încărcat a făcut un test fail-closed să primească 200 în loc de 503; testele au trecut când au fost rulate fără `.env`. La build, mediul a fost development și indexarea dezactivată.
- După remedierea cookie-ului Vercel Preview: `npm run verify` a trecut din nou cu 112 teste în 21 fișiere, lint, TypeScript și build; GitHub CI a trecut și `npm audit --omit=dev --audit-level=high` nu a raportat probleme.
- 14 octombrie, PostHog: profilul temporar `prd-checkout-test-20261014@example.invalid` a avut consimțământ analytics activ; Checkout Stripe Sandbox Starter și webhookul semnat `checkout.session.completed` au fost procesate (`200 processed`). PostHog EU a acceptat conversiile de checkout și abonament. Consimțământul a fost retras, iar după reload nu s-au mai trimis cereri PostHog. Apoi abonamentul Sandbox a fost anulat, webhookul de ștergere procesat, identitatea Supabase temporară ștearsă și abonamentul verificat CANCELLED/anonymizat; Stripe păstrează obiectele sandbox, fără plată reală.
- 14 octombrie, backup Supabase: Dashboardul confirmă că proiectul este pe Free, care nu include backupuri programate; nu există backup disponibil. Restore-ul nu a fost încercat, iar un test complet necesită un backup și un proiect de test/destinație sigură. Nu s-a făcut upgrade și nu s-a creat un proiect nou.
- Sentry (verificare istorică din 14 octombrie, completată în sesiunea din 15 octombrie): organizația este în EU. La verificarea anterioară, trialul Business avea 11 zile rămase și consumul 3/1.000.000, fără metodă de plată. Acum `Allowed Domains` este `matecusucces.com` și `www.matecusucces.com`; mascarea IP este activă la proiect și organizație. Geolocația derivată și retention-ul efectiv rămân de confirmat.
- 14 octombrie, joburi: `npm test -- tests/jobs.test.ts` a trecut (2/2); testele confirmă autorizarea exactă a bearer secretului și protecția rutei înainte de accesul la provider. `JOB_SECRET` lipsește, iar schedulerul nu este configurat sau pornit.
- 15 octombrie: `npm run verify` a trecut lint, TypeScript, **119/119 teste în 23 fișiere** și build. Inventarul Vercel inițial a fost citit fără dezvăluirea valorilor. Cheia Resend cu Sending access restrâns la domeniu și `RESEND_FROM` sunt salvate numai în Preview pe ramura `codex/matecusucces-preview-2026-10-14`. Un email direct de test a ajuns în inbox; deploymentul Preview `21ef412` este Ready, iar pagina principală și `/api/v1/ready` răspund. `EMAIL_SENDING_ENABLED` rămâne fals, deci nu s-a trimis un email prin mailerul aplicației.
- 15 octombrie, Sentry: organizația EU are Enhanced Privacy, data scrubber + default scrubbers și prevenirea stocării IP la nivel de organizație active; proiectul acceptă doar cele două hostname-uri publice, iar public issue sharing este oprit. Istoricul unui eveniment mai vechi încă afișează oraș derivat. Retenția efectivă nu este vizibilă în pagina verificată. Permisiunea de source fetching a rămas activă deoarece Sentry avertizează că oprirea ei poate afecta gruparea issue-urilor când source maps lipsesc.
- Serverul local a fost repornit cu încărcarea explicită a `.env`; `/api/v1/ready` răspunde HTTP 200. Buildul local conține configurația publică de dezvoltare. Nu rula `npm run build` fără încărcarea `.env`, fiindcă ar suprascrie buildul cu valori de configurare absente.
- Verificare Supabase cu două conturi temporare: fiecare și-a putut citi profilul, niciunul nu a putut vedea sau edita profilul celuilalt, clientul nu și-a putut acorda rolul SUPER_ADMIN, iar un fișier privat a fost lizibil numai de utilizatorul proprietar. Conturile și fișierul au fost eliminate după test.
- Dovezi vizuale ale setărilor și dashboardului sunt în [captura PostHog](screenshots/posthog-kpi.png) și [captura redirecturilor Supabase](screenshots/supabase-auth-urls.png).

## Pași rămași, în ordinea dependențelor

1. Informarea publică este implementată cu operatorul, contactul și termenele de lucru aprobate. Înainte de acceptarea utilizatorilor sub 16 ani când temeiul este consimțământul, sunt necesare revizia juridică și o metodă reală de verificare a autorizării părintelui; checkbox-ul elevului nu o dovedește. Contabilul trebuie să confirme aplicarea termenelor financiare. Retenția automată în baza aplicației și retențiile furnizorilor Sentry/PostHog nu sunt activate sau verificate. Resend are domeniul verificat, secretul salvat doar în Preview și un test livrat; variabila se va activa după redeploy Preview. Rolul SUPER_ADMIN este acordat; Google OAuth este verificat local.
2. Stripe/PostHog: Portalul, schimbarea Starter → Pro, redelivery-ul nativ și funnel-ul de billing cu consimțământ au trecut în Sandbox/local. Webhookul permanent se configurează după hosting. Cohortele productive așteaptă trafic real.
3. Pregătirea operării: rolul SUPER_ADMIN este configurat; secretul și schedulerul joburilor se activează după alegerea runnerului/planului de hosting. Backup/restore necesită backup disponibil și destinație de test; planul Supabase Free nu oferă backupuri programate.
4. Sentry: verifică geolocația derivată pe un eveniment nou și cere/confirmă retenția efectivă prin setările sau documentația contului; setările de hostname, scrubbing, IP și public issue sharing au fost actualizate în această sesiune.
5. Preview-ul și un deployment Production etapizat sunt publicate în proiectul Vercel `site-final`. Production folosește proiectul Supabase existent, ales de proprietar; redirecturile exacte Google OAuth și recovery pentru `https://www.matecusucces.com/auth/callback` sunt acceptate de Supabase. Deploymentul Production etapizat trece health/readiness, răspunde `authentication_required` fără sesiune, acceptă originea canonică și respinge originile străine; `robots.txt` încă interzice indexarea. Nu a fost promovat pe domeniul personalizat. Înainte de promovare rămân acceptanța OAuth hosted, verificarea retențiilor și furnizorilor, backup/restore și decizia juridică privind minorii. Stripe Live, emailurile și trackingul opțional sunt dezactivate în Production.

Nu s-a creat încă un PRD acceptat pentru producție; criteriile de release externe rămân deschise. Raportul inițial de mai jos este istoric și nu reflectă serviciile conectate ulterior.

## Raportul final cerut de PRD §129

**Implementat:** infrastructura aplicației, rutele de cont, auth, catalog și Checkout, consimțământ, taxonomie analytics, blogul ca structură și SEO tehnic. Nu s-a schimbat framework-ul aprobat.

**Vercel:** Preview-ul proiectului existent `site-final` este publicat pe branch-ul `codex/deploy-preview-2026-10-14`; commitul de documentare `e6f3619` a trecut GitHub CI. Smoke-testurile Preview au trecut pentru rute, API, headers, origin checks, health/readiness, canonical/sitemap și noindex. Pentru domeniul Production, Supabase acceptă redirectul Google OAuth și recovery exact către `https://www.matecusucces.com/auth/callback`. Variabilele Supabase/site sunt în Environment Production; inventarul din 15 octombrie arată că lipsesc `RESEND_*`, `POSTHOG_*`, `SENTRY_*`, `SITE_INDEXABLE` și secretul joburilor în configurația Vercel verificată. Deploymentul Production etapizat `Aqt423YhKzYi5YfSS49TctpF83AJ` este READY și a trecut health/readiness, autentificarea obligatorie la `/api/v1/me`, API plans pe originea canonică, respingerea unei origini străine și noindex (`robots.txt` = `Disallow: /`). `vercel deploy --prod --skip-domain` a păstrat domeniul personalizat pe site-ul vechi. Nu s-au confirmat schimbul OAuth în browser, înregistrarea/sesiunea pe Production sau promovarea domeniului.

**Supabase:** migrările și tabelele sunt prezente; înregistrarea email/parolă, redirecturile locale callback/recovery, loginul Google end-to-end, izolarea multi-user RLS și accesul privat Storage au fost testate. Contul autorizat al operatorului are STUDENT și SUPER_ADMIN. Backup/restore hosted rămâne deschis: proiectul Free nu are backupuri programate și nu există un artefact de restore.

**Stripe:** checkout-ul lunar STARTER în sandbox a reușit. Testele din 11 octombrie au confirmat plata eșuată (Supabase `FAILED`, abonamentul păstrat `ACTIVE`), anularea programată și revenirea ei, refund-ul integral (Supabase `REFUNDED`), răspunsul `duplicate` la două replay-uri semnate și schimbarea Starter → Pro în Portal. Redelivery-ul nativ al `customer.subscription.updated` a fost confirmat cu HTTP 200 `processed`; evenimentul apare în Supabase, iar abonamentul este `ACTIVE` pe Pro. Endpointul temporar a fost șters după test. Prețuri anuale și Stripe live nu sunt activate.

**Resend:** domeniul `matecusucces.com` este verificat, iar testul unic din 15 octombrie a fost livrat la `stamalaurentiu0@gmail.com` de la `notificari@matecusucces.com`. Cheia `matecusucces-vercel-preview-2` are acces numai de trimitere pe domeniu și este salvată numai în Vercel Preview pentru ramura `codex/matecusucces-preview-2026-10-14`. Cheia inițială rămâne activă și nefolosită. Trimiterea automată este oprită; aplicația va vedea noua variabilă după redeploy Preview, iar workerul periodic nu este pregătit.

**PostHog:** proiectul EU și dashboardul KPI inițial există. Funnel-ul complet Starter Checkout → abonament a fost validat pe 14 octombrie cu profil temporar și acord analytics: webhookul procesat a trimis conversiile `checkout_completed` și `subscription_started`, ambele acceptate de PostHog. După retragerea acordului, reload-ul a produs zero cereri PostHog. Profilul de test a fost șters; replay, autocapture și heatmaps rămân oprite.

**Sentry:** proiectul și DSN-urile locale sunt configurate; issue-urile `NODE-2` (server), `NODE-3` și `NODE-4` (browser) sunt vizibile. Există o regulă activă de email pentru issue-uri cu prioritate ridicată și Spike Protection este pornită. Allowed Domains este restrâns la cele două hostname-uri publice; enhanced privacy, server/default scrubbers și IP scrubbing la nivel de organizație/proiect sunt active, iar public issue sharing este dezactivat. Un eveniment istoric afișează în continuare oraș derivat; un eveniment nou după modificări și retenția efectivă rămân de confirmat.

**SEO/AEO:** metadatele, canonical, sitemap, robots, Open Graph și datele structurate tehnice sunt în build. Blogul are nevoie de articole reale aprobate; validarea pe domeniul public și în instrumentele crawler nu se poate face înainte de deployment.

**Securitate și confidențialitate:** RLS, verificarea identității pe server, protecția secretelor, limite și consimțământul sunt implementate; auditul npm este curat. Exportul și cererea de ștergere există, iar erasure externă/retention sunt proceduri manuale. Operatorul, rolul SUPER_ADMIN și informarea publică sunt configurate; proprietarul a aprobat perioadele de lucru, iar termenele contabile, temeiurile juridice și modelul de consimțământ pentru minori necesită verificare profesională.

**Teste și regresie frontend:** ultima rulare `npm run verify` din 15 octombrie a trecut lint, TypeScript, 118 teste în 23 fișiere și build; GitHub CI a trecut și auditul runtime cu `npm audit --omit=dev --audit-level=high`. Buildul nu modifică `dist/`; rutele locale `/`, `/programe`, `/inregistrare`, `/confidentialitate` și `/blog` răspund 200. Paginile adăugate sunt aprobate; experiența Three.js originală rămâne intactă.

**Acțiuni externe rămase:** testul prin mailerul aplicației (trimiterea automată rămâne oprită); secretul și schedulerul joburilor; webhookul Stripe permanent (checkoutul live rămâne dezactivat); backup/restore Supabase (planul Free nu oferă backup programat); retențiile Sentry/PostHog și geolocația Sentry pe un eveniment nou; confirmarea temeiurilor pentru minori și termenelor contabile cu profesioniștii. DNS-ul Resend este verificat și testul unic a ajuns în inbox. Domeniile Sentry au fost restrânse și IP scrubbing-ul global activat. OAuth local, testele Sentry server/browser, testele multi-user RLS/Storage, funnel-ul PostHog cu consimțământ și redelivery-ul Stripe Sandbox au trecut. Preview-ul nou și deploymentul Production etapizat au trecut smoke-testele hosted; Production nu a fost promovat, iar domeniul servește încă deploymentul vechi.

**Limitări de plan și operare:** nu s-a cumpărat plan plătit. Frecvența schedulerului disponibilă în planul Vercel Hobby poate fi insuficientă pentru emailuri tranzacționale prompte; verifică planul curent și costul înainte de a activa workerul. Este configurată o alertă Sentry prin email pentru issue-uri cu prioritate ridicată; routingul și limitele complete ale furnizorului trebuie verificate înainte de lansare.

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
