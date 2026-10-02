# Publicarea articolelor

Creează câte un fișier `.json` în acest director. Numele fișierului este pentru organizare; `slug` definește URL-ul. Nu sunt necesare conturi sau chei externe. Nu există un editor vizual/CMS.

Model (înlocuiește toate textele înainte de publicare):

```json
{
  "slug": "titlul-articolului",
  "status": "draft",
  "title": "Titlul articolului",
  "description": "Descriere scurtă și specifică pentru pagina articolului.",
  "category": "Algebră",
  "author": "Numele autorului real",
  "publishedAt": "2026-10-02",
  "introduction": "Întrebarea și răspunsul direct, pe scurt.",
  "sections": [
    {"heading": "Explicație pas cu pas", "paragraphs": ["Primul paragraf.", "Exemplul rezolvat și verificat."]},
    {"heading": "Greșeli frecvente", "paragraphs": ["O greșeală și cum o eviți."]}
  ]
}
```

1. Redactează cu `status: draft`; verifică matematica, autorul și descrierea.
2. Pentru publicare schimbă statusul în `published` și pune data reală. `updatedAt` este opțional și nu poate preceda publicarea.
3. Rulează `npm run verify`. Build-ul generează lista, `/blog/<slug>/index.html`, metadatele Article și sitemap-ul.
4. Verifică pagina local. Publicarea pe internet necesită ulterior un deployment.

Drafturile și datele viitoare (UTC) nu sunt generate. Data viitoare nu activează singură o publicare: trebuie rulat un build după acea dată. Un build nou elimină din rezultat articolele retrase în draft. Orice fișier JSON invalid, inclusiv un draft, oprește build-ul înainte să elimine rezultatul precedent.

Textul este tratat ca text simplu și escapate caracterele HTML. Nu se acceptă HTML, Markdown sau formule LaTeX; folosește text și simboluri Unicode pentru formule simple. Pentru formule avansate se poate extinde ulterior rendererul. Slugul acceptă litere mici fără diacritice, cifre și cratimă. Nu schimba slugul publicat fără redirect, pentru a păstra linkurile existente.

Blogul devine indexabil doar când există cel puțin un articol publicat și build-ul de producție permite indexarea. Preview-urile rămân noindex.
