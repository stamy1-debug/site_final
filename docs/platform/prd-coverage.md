# PRD — acoperire locală, 1 octombrie 2026

## Domeniul acceptat

Utilizatorul a cerut finalizarea implementării fără chei, conectarea furnizorilor sau deployment. „Local” în acest raport înseamnă cod, migrări, interfețe și verificări offline. Nu echivalează cu acceptanța în producție din secțiunile 119–128 ale PRD-ului.

| Secțiuni PRD | Rezultat local | Dovezi / activare rămasă |
|---|---|---|
| 1–12, 130–132: arhitectură, frontend, autonomie | Stack-ul fix păstrat; frontend static, fără migrare de framework. UI suplimentar aprobat explicit. | `dist/` neschimbat; build adaugă pagini/linkuri aprobate. Three.js nu a fost rescris. |
| 13–17: Auth, Google, roluri | SDK Supabase PKCE, email/parolă, confirmare, recovery, logout, JWT verificat server-side și RBAC. | Pagini auth + `platform.ts`, `auth.ts`; OAuth și emailurile reale necesită configurare ulterioară. |
| 18–23: schemă, migrări, RLS | Migrări ordonate, chei/indexuri, RLS pe toate tabelele, privilegii service-only, teste cu identități distincte. | `supabase/migrations/`, `database.test.ts`, `workflows.test.ts`; PGlite nu înlocuiește Supabase hosted. |
| 24: Storage | Bucket public de imagini și privat de PDF, limitări MIME/dimensiune, acces pe identitate, signed URL cu durată scurtă. | SQL + API; fișierele reale/uploadurile sunt administrate ulterior prin Supabase. |
| 25–29: API, planuri, drepturi | API v1, reguli pe server; catalog și beneficii pentru STARTER/PRO/ELITE/INDEPENDENT; acces dinamic după status/perioadă. | Migrarea `program_features`; fără conținut educațional fictiv sau drepturi acordate de client. |
| 30–37: Stripe | Checkout/Portal, mod test implicit, validare raw signature, ledger atomic, retry/idempotency, status abonament/plată/refund. | SDK boundary tests și SQL. Produsele/price IDs, metodele oferite în Checkout și testele Stripe reale sunt amânate. |
| 38: cupoane | Coduri promo gestionate de Stripe Checkout; schema campaniilor/redemptions și atribuirea există. | Nicio promoție, reducere sau valoare financiară inventată. Configurarea campaniilor rămâne decizie comercială. |
| 39: recomandări | Generare cod, asociere unică înainte de cumpărare, refuz autorecomandare, conversie după plată pozitivă confirmată. | SQL tranzacțional și teste; nu acordă recompense financiare. Schema recompenselor este pregătită. |
| 40–43, 84: email | Șabloane versionate în cod, welcome/payment/subscription hooks, notificare la expirare programată, outbox cu retries/lease/dedupe. | Worker local și adaptor GET pentru scheduler. Expirarea este verificată din nou înainte de trimitere. Mesajele de securitate/future educaționale au șabloane, nu automatizări noi. |
| 44–51: analytics/CRO | SDK cu consimțământ, taxonomie, first/last attribution în dispozitiv, evenimente UI și conversii backend, flags fără experimente vizuale. | Teste privacy/consent/dedupe; funnels/cohorts/retention sunt specificate în `analytics.md`, necesită proiect PostHog pentru creare/verificare. Replay oprit. |
| 52–59: SEO/AEO/GEO | Canonical, OG, robots, sitemap al rutelor publice reale, WebSite JSON-LD, model pentru conținut educațional viitor. | Teste SEO/build; contul și rutele auth sunt noindex. Nu sunt inventate lecții/FAQ indexabile sau promisiuni de rezultate. |
| 60: performanță | SDK-uri împărțite și încărcate la nevoie; Three.js original păstrat; stiluri responsive și reduced-motion. | Browser local și verificare payload. Core Web Vitals pe domeniul real necesită deployment. |
| 61–66: hosting, medii, monitorizare, securitate | Config Vercel/Node22, headers/CSP, izolarea mediilor, Sentry redactat, autorizare/validare și interdicția cheilor private în bundle. | CI + teste. Proiectele, domeniul și alertele remote nu au fost conectate. |
| 67–68: throttling și secrete | Quota atomică pe operațiile aplicației; Auth folosește Supabase; `.env.example` fără valori secrete. | Teste; rate limits/CAPTCHA de furnizor trebuie configurate în cont. |
| 69–74: confidențialitate/minori | Preferințe separate, retragere/versionare, sincronizare conservatoare, export paginat, cereri de ștergere și dosar erasure persistent. | Ștergerea oprește consimțămintele opționale. Finalizarea erasure cere identitate eliminată și confirmări de furnizor. Informarea juridică/retention sunt decizii ale operatorului, nu fabricate. |
| 75–81: administrare | Dashboardurile rămân cele ale furnizorilor. Endpointuri limitate pentru roluri/dezactivare/erasure, audit în aceeași tranzacție. | Fără dashboard custom redundant; first SUPER_ADMIN se atribuie ulterior prin operațiune de owner. |
| 82–83: leads/newsletter | Interes înregistrat per cont fără duplicate, atribuire doar cu consent actual, newsletter opt-in separat și stare încărcată la reload. | API + UI + SQL; nu sunt activate campanii sau trimise mesaje. |
| 85–88: operare | Health/readiness, loguri structurate, Sentry, outbox, audit, adaptor job secret-checked, checklist backup/restore. | `operations.md`; nicio execuție periodică sau ștergere externă activată. |
| 89–97: verificare | Teste unit/API/SDK boundaries, SQL real local, RLS, build/source freeze, browser desktop/mobil. | 104 teste în 19 fișiere la ultima verificare; scenariile remote sunt explicit neexecutate. |
| 98–118: proces și documentație | Audit inițial, planuri, migrare incrementală, `.env.example`, runbooks, raport offline și revizie independentă. | `npm run readiness` nu contactează furnizori și nu afișează secrete. |
| 119–129: acceptanță și raport final | Raport de livrare locală și pași pentru acceptanța viitoare. | Definițiile de done ale serviciilor live NU sunt bifate fără testare reală. |

## Nu sunt blocaje de implementare pentru cheile amânate

Paginile, modelele, endpointurile și adaptoarele pentru domeniul de infrastructură sunt disponibile local. Integrarea nu este simulată în aplicație: lipsa cheilor produce mesaje explicite sau răspunsuri 503. Testele folosesc fixture-uri izolate, nu conturi demo prezentate vizitatorilor.

## Rămâne pentru etapa de lansare

Configurarea proiectelor/secrets/redirecturilor/DNS, importul prețurilor în Stripe, autorizarea planului de hosting și a schedulerului, informarea juridică și programul de retention, backup/restore, acceptanța în sandbox apoi producție. Niciuna nu a fost executată sau declarată trecută.

Prețurile anuale nu sunt publicate în sursa furnizată. Motorul suportă intervalul anual, dar UI afișează doar oferta lunară aprobată. Recompensele financiare și campaniile agresive nu sunt cerințe de activat; PRD cere explicit pregătire și evitarea activării neaprobate.
