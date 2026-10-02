# Blog — 2 octombrie 2026

Mecanismul local de publicare este implementat. Sursa articolelor: `content/blog/*.json`. Instrucțiunile și modelul editorial sunt în `content/blog/README.md`.

Build-ul validează conținutul, exclude drafturile/datele viitoare, generează pagini individuale cu canonical, descriere, Open Graph, Article JSON-LD, autor/data vizibile și cuprins. Lista blogului și sitemap-ul includ automat articolele publicate. Blogul gol rămâne noindex; preview-urile nu sunt indexabile nici cu articole publicate.

Nu există încă articole reale sau CMS. Nu sunt necesari furnizori externi pentru redactare/build. Publicarea live necesită deployment. Formulele sunt momentan text/Unicode, fără motor LaTeX. Nu sunt inventați autori sau materiale editoriale.
