# Livrare locală — 1 octombrie 2026

Implementarea infrastructurii din PRD este pregătită local, în domeniul cerut: fără chei, conectări la conturi externe, plăți, emailuri reale sau deployment. Verificarea serviciilor reale este o etapă separată și nu este declarată completă.

## Completări față de livrarea paginilor

- Patru programe cu prețurile confirmate și matrice de beneficii/acces; vechile planuri generice nu mai sunt oferite.
- Formular de interes în cont, deduplicare și atribuire condiționată de consimțământ.
- Asociere cod de recomandare, protecție împotriva autorecomandării/reasocierii și conversie numai după plată confirmată. Fără recompense automate.
- GET `/api/v1/internal/jobs` compatibil cu scheduler: secret, pregătire notificări de expirare, procesare outbox; nu există cron activat.
- Actualizări administrative și audit în aceeași tranzacție.
- Export paginat extins cu cupoane, recompense, date de erasure și acțiuni de audit relevante. Contul dezactivat poate păstra accesul la export înaintea ștergerii identității.
- Cererea de ștergere revocă preferințele opționale; dosarul de erasure supraviețuiește ștergerii identității. Finalizarea necesită confirmările operatorului pentru serviciile externe și retention.
- Consimțământ reconciliat cu serverul; formularul așteaptă sincronizarea înainte de activarea controalelor.
- `npm run readiness`: raport offline cu numele variabilelor lipsă, fără valorile lor și fără solicitări externe.

## Verificare

104 teste în 19 fișiere, lint, TypeScript și build. Toate cele șase migrări SQL sunt aplicate în bazele de test PGlite. Testele verifică RLS, fluxuri comerciale, erasure, controlul joburilor, configurația, privacy și build. Revizia independentă a fluxurilor noi a găsit o problemă de sincronizare a controalelor consent; remediată și testată.

Interfețele autentificate sunt conectate la API, însă nu sunt declarate validate end-to-end cu Supabase/Stripe. Fără chei, testarea browserului verifică randarea, navigarea, validarea locală și stările neconfigurate. Testele server folosesc fixture-uri și SQL local.

Vezi [acoperirea fiecărui grup de cerințe](prd-coverage.md), [setup](setup.md), [operare](operations.md) și [confidențialitate](privacy.md).

## Delimitări păstrate

Frontendul original `dist/` și Three.js sunt neschimbate. Build-ul include linkuri și pagini aprobate. Problema preexistentă de click pe selectorul 3D rămâne documentată; tastatura funcționează. Nu au fost inventate materiale educaționale, termeni juridici, date despre operator sau promisiuni de note.

Nu există taxe noi activate sau conexiuni la conturile furnizorilor. Nu se poate afirma că PRD-ul este acceptat în producție până la parcurgerea verificărilor live din documentație.

## Verificare suplimentară — 1 octombrie 2026

Trei probleme corectate cu teste de regresie: canalele de livrare neconfigurate nu mai consumă încercările din outbox; exportul cupoanelor folosește cheia unică pentru paginare; identificarea și evenimentul de autentificare pentru analytics sunt amânate până după sincronizarea consimțământului. Migrarea `202610010001_outbox_readiness.sql` selectează doar canalele activate, fără să activeze ea însăși vreun furnizor.

Ultima rulare completă pe Node 22: 104/104 teste, lint, TypeScript și build trecute. Nu s-au făcut modificări vizuale în această verificare suplimentară.

Adaptorul HTTP real este verificat printr-un server local: health și headerele de cache, refuzul accesului fără autentificare, diferențierea 404/405, blocarea mutațiilor cu origine străină și limita de 1 MB pentru corpul cererii. Cele cinci teste nu contactează furnizorii externi.
