# PRD — stare și acoperire, 10 octombrie 2026

## Stare curentă

Implementarea locală este construită, iar integrările Supabase, Stripe sandbox, Resend test și PostHog au fost configurate și verificate parțial cu conturile proprietarului. Acest lucru nu înseamnă acceptanță de producție. Deploymentul rămâne suspendat conform cererii proprietarului. Tabelul de mai jos descrie ce există în cod; secțiunea „Acceptanță externă rămasă” separă verificările care încă nu pot fi declarate trecute.

## Domeniul acceptat

Utilizatorul a cerut finalizarea implementării fără chei, conectarea furnizorilor sau deployment. „Local” în acest raport înseamnă cod, migrări, interfețe și verificări offline. Nu echivalează cu acceptanța în producție din secțiunile 119–128 ale PRD-ului.

| Secțiuni PRD | Rezultat local | Dovezi / activare rămasă |
|---|---|---|
| 1–12, 130–132: arhitectură, frontend, autonomie | Stack-ul fix păstrat; frontend static, fără migrare de framework. UI suplimentar aprobat explicit. | `dist/` neschimbat; build adaugă pagini/linkuri aprobate. Three.js nu a fost rescris. |
| 13–17: Auth, Google, roluri | SDK Supabase PKCE, email/parolă, confirmare, recovery, logout, JWT verificat server-side și RBAC. Înregistrarea și autentificarea reală au fost efectuate. | Google OAuth încă nu este configurat; redirecturile locale pentru callback și recovery au fost setate. |
| 18–23: schemă, migrări, RLS | Migrări ordonate, chei/indexuri, RLS pe toate tabelele, privilegii service-only, teste cu identități distincte. | `supabase/migrations/`, `database.test.ts`, `workflows.test.ts`; PGlite nu înlocuiește Supabase hosted. |
| 24: Storage | Bucket public de imagini și privat de PDF, limitări MIME/dimensiune, acces pe identitate, signed URL cu durată scurtă. | SQL + API; fișierele reale/uploadurile sunt administrate ulterior prin Supabase. |
| 25–29: API, planuri, drepturi | API v1, reguli pe server; catalog și beneficii pentru STARTER/PRO/ELITE/INDEPENDENT; acces dinamic după status/perioadă. | Migrarea `program_features`; fără conținut educațional fictiv sau drepturi acordate de client. |
| 30–37: Stripe | Checkout/Portal, mod test implicit, validare raw signature, ledger atomic, retry/idempotency, status abonament/plată/refund. Checkout sandbox cu plată reușită și abonament STARTER au fost confirmate. | Eșec de plată, anulare, rambursare și redelivery webhook încă necesită acceptanță sandbox. Live rămâne oprit. |
| 38: cupoane | Coduri promo gestionate de Stripe Checkout; schema campaniilor/redemptions și atribuirea există. | Nicio promoție, reducere sau valoare financiară inventată. Configurarea campaniilor rămâne decizie comercială. |
| 39: recomandări | Generare cod, asociere unică înainte de cumpărare, refuz autorecomandare, conversie după plată pozitivă confirmată. | SQL tranzacțional și teste; nu acordă recompense financiare. Schema recompenselor este pregătită. |
| 40–43, 84: email | Șabloane versionate în cod, welcome/payment/subscription hooks, notificare la expirare programată, outbox cu retries/lease/dedupe. Testul Resend a ajuns în inboxul autorizat. | Trimiterea automată rămâne oprită; domeniul expeditorului și schedulerul nu sunt configurate. Mesajele de securitate/future educaționale au șabloane, nu automatizări noi. |
| 44–51: analytics/CRO | SDK cu consimțământ, taxonomie, first/last attribution în dispozitiv, evenimente UI și conversii backend, flags fără experimente vizuale. Proiectul PostHog, evenimentele `page_view`/`pricing_viewed` și dashboardul KPI inițial sunt verificate. | Funnel-ul checkout → abonament și măsurătorile de retenție așteaptă evenimente reale; replay rămâne oprit. |
| 52–59: SEO/AEO/GEO | Canonical, OG, robots, sitemap al rutelor publice reale, WebSite JSON-LD, model pentru conținut educațional viitor. | Teste SEO/build; contul și rutele auth sunt noindex. Nu sunt inventate lecții/FAQ indexabile sau promisiuni de rezultate. |
| 60: performanță | SDK-uri împărțite și încărcate la nevoie; Three.js original păstrat; stiluri responsive și reduced-motion. | Browser local și verificare payload. Core Web Vitals pe domeniul real necesită deployment. |
| 61–66: hosting, medii, monitorizare, securitate | Config Vercel/Node22, headers/CSP, izolarea mediilor, Sentry redactat, autorizare/validare și interdicția cheilor private în bundle. | Proiectul Vercel și domeniul nu sunt conectate; DSN-urile Sentry și alertele lipsesc. |
| 67–68: throttling și secrete | Quota atomică pe operațiile aplicației; Auth folosește Supabase; `.env.example` fără valori secrete. | Teste; rate limits/CAPTCHA de furnizor trebuie configurate în cont. |
| 69–74: confidențialitate/minori | Preferințe separate, retragere/versionare, sincronizare conservatoare, export paginat, cereri de ștergere și dosar erasure persistent. | Ștergerea oprește consimțămintele opționale. Finalizarea erasure cere identitate eliminată și confirmări de furnizor. Informarea juridică/retention sunt decizii ale operatorului, nu fabricate. |
| 75–81: administrare | Dashboardurile rămân cele ale furnizorilor. Endpointuri limitate pentru roluri/dezactivare/erasure, audit în aceeași tranzacție. | Fără dashboard custom redundant; first SUPER_ADMIN se atribuie ulterior prin operațiune de owner. |
| 82–83: leads/newsletter | Interes înregistrat per cont fără duplicate, atribuire doar cu consent actual, newsletter opt-in separat și stare încărcată la reload. | API + UI + SQL; nu sunt activate campanii sau trimise mesaje. |
| 85–88: operare | Health/readiness, loguri structurate, integrare Sentry, outbox, audit, adaptor job secret-checked și checklist backup/restore. | Sentry, secretul jobului, schedulerul și restore-ul remote lipsesc. |
| 89–97: verificare | Teste unit/API/SDK boundaries, SQL local, RLS, build/source freeze, browser desktop/mobil și acceptanță parțială cu furnizorii conectați. | Rezultatul curent al suitei și testele rulate în sandbox sunt raportate în `delivery.md`; scenariile remote rămase sunt enumerate acolo. |
| 98–118: proces și documentație | Audit inițial, planuri, migrare incrementală, `.env.example`, runbooks, raport offline și revizie independentă. | `npm run readiness` nu contactează furnizori și nu afișează secrete. |
| 119–129: acceptanță și raport final | Raport de livrare locală și pași pentru acceptanța viitoare. | Definițiile de done ale serviciilor live NU sunt bifate fără testare reală. |

## Acceptanță externă rămasă

- Google OAuth în Supabase și verificarea sesiunii pe două conturi.
- Stripe sandbox: eșec de plată, anulare, rambursare și redelivery webhook; verificarea funnel-ului complet în PostHog.
- Resend: domeniu verificat și test inbox de pe expeditorul final. Până atunci emailul automat rămâne dezactivat.
- Sentry: proiect, DSN-uri, test controlat redactat și alertă verificată.
- Job runner periodic secret-protected, backup și restore Supabase demonstrate pe mediu de test.
- Domeniu și environment Vercel, apoi verificări publice de securitate, SEO și performanță. Deploymentul nu este autorizat în această etapă.
- Informare juridică, operator, contact și perioade de retenție aprobate de proprietar; aceste valori nu se inventează.
- Experimente vizuale, recompense referral și campanii newsletter rămân inactive până la aprobarea regulilor comerciale/editoriale.

## Nu sunt blocaje de implementare

Paginile, modelele, endpointurile și adaptoarele pentru domeniul de infrastructură sunt disponibile local. Integrarea nu este simulată în aplicație: lipsa cheilor produce mesaje explicite sau răspunsuri 503. Testele folosesc fixture-uri izolate, nu conturi demo prezentate vizitatorilor. Starea actuală a variabilelor locale poate fi citită fără afișarea valorilor cu `node --env-file=.env --import tsx scripts/readiness.ts`; aceasta raportează prezența configurației, nu verifică serviciile.

Prețurile anuale nu sunt publicate în sursa furnizată. Motorul suportă intervalul anual, dar UI afișează doar oferta lunară aprobată. Recompensele financiare și campaniile agresive nu sunt cerințe de activat; PRD cere explicit pregătire și evitarea activării neaprobate.
