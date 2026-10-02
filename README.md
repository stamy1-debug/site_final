# matecusucces

Site de matematică în română, cu Three.js local și infrastructură pentru Vercel, Supabase, Stripe, Resend, PostHog și Sentry.

Frontendul aprobat din `dist/` este păstrat. Build-ul separat adaugă metadate SEO, integrarea serviciilor și linkuri către paginile noi de programe și cont. Serviciile externe nu sunt încă activate.

## Pornire

Node 22: `npm ci`, `npm run build`, `npm run dev`.

Previzualizare: http://localhost:4174. Verificări: `npm run verify`. Configurație, fără conexiuni externe: `npm run readiness`.

Configurația este explicată în [setup](docs/platform/setup.md); nu introduce chei private în Git. Pagina originală poate fi servită fără compilare cu `python3 -m http.server 4173 --directory dist`.

## Documentație

- [Stare curentă: livrare locală](docs/platform/local-completion.md)
- [Acoperirea PRD-ului](docs/platform/prd-coverage.md)

- [Pagini noi: rute, integrare și verificări](docs/platform/pages-delivery.md)
- [Raport de livrare și dependențe de lansare](docs/platform/delivery.md)
- [Arhitectură și API](docs/platform/architecture.md)
- [Bază de date și RLS](docs/platform/database.md)
- [Plăți și webhooks](docs/platform/billing.md)
- [Analytics și CRO](docs/platform/analytics.md)
- [Confidențialitate și interfețe necesare](docs/platform/privacy.md)
- [Operare, limite și acceptanță](docs/platform/operations.md)
- [Design și referințe originale](docs/design.md)
