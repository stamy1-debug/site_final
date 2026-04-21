(function () {
  const categorySources = [
    "social-connection-and-longevity/index.html",
    "personal-identity-and-purpose/index.html"
  ];

  function unique(values) {
    return values.filter(function (value, index) {
      return values.indexOf(value) === index;
    });
  }

  function resolveCategoryCandidates(path) {
    const normalizedPath = path.replace(/^\/+/, "");
    const currentDirectory = window.location.pathname.endsWith("/")
      ? window.location.pathname
      : window.location.pathname.replace(/[^/]*$/, "");

    return unique([
      new URL(normalizedPath, window.location.origin + currentDirectory).toString(),
      new URL(normalizedPath, window.location.origin + "/the-intelligence-report/").toString()
    ]);
  }

  async function fetchCategoryPage(path) {
    const candidates = resolveCategoryCandidates(path);
    let lastError = null;

    for (const url of candidates) {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Nu am putut citi pagina: " + url);
        }
        return response.text();
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Nu am putut citi pagina: " + path);
  }

  function normalizeAssetPath(value) {
    if (!value || value.indexOf("../../") !== 0) {
      return value;
    }

    return value.replace(/^\.\.\//, "../");
  }

  function normalizeCardNode(node) {
    const elements = node.querySelectorAll("[href], [src], [data-src], [data-srcset]");

    elements.forEach(function (element) {
      if (element.hasAttribute("href")) {
        element.setAttribute("href", normalizeAssetPath(element.getAttribute("href")));
      }

      if (element.hasAttribute("src")) {
        element.setAttribute("src", normalizeAssetPath(element.getAttribute("src")));
      }

      if (element.hasAttribute("data-src")) {
        const src = normalizeAssetPath(element.getAttribute("data-src"));
        element.setAttribute("data-src", src);
        element.setAttribute("src", src);
      }

      if (element.hasAttribute("data-srcset")) {
        const srcset = normalizeAssetPath(element.getAttribute("data-srcset"));
        element.setAttribute("data-srcset", srcset);
        element.setAttribute("srcset", srcset);
      }
    });

    node.querySelectorAll('[data-component="lazyload"]').forEach(function (img) {
      img.removeAttribute("data-component");
      img.classList.remove("opacity-0");
    });
  }

  function buildCardsFromPage(htmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const cards = Array.from(doc.querySelectorAll('[data-posts-block] article[data-post]'));

    cards.forEach(normalizeCardNode);

    return cards;
  }

  function createFormuleInSpatiuCard() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML =
      '<article data-post="" data-post-categories="[&quot;all&quot;]">' +
      '<div class="py-24 px-16 lg:px-24 block">' +
      '<div class="mb-16 aspect-[378/260] overflow-hidden bg-gradient-to-b from-secondary-purple to-blue">' +
      '<picture class="w-full h-auto flex h-full" style="--aspect: 1.4534883720930232">' +
      '<img class="block w-full w-full h-full object-cover" src="../assets/images/formule-in-spatiu.png" alt="Formule in spatiu" width="1177" height="810" draggable="false">' +
      "</picture>" +
      "</div>" +
      '<div class="uppercase text-base mb-16 leading-small font-secondary"></div>' +
      '<h3 class="h5 mb-8 underline-title leading-small"><span>Formule in spatiu</span></h3>' +
      '<p class="mb-0 laptop:mb-8">Putina indrumare..ca sa nu te mai pierzi in spatiu.</p>' +
      '<div class="mt-16 flex justify-center laptop:justify-start">' +
      '<a href="../assets/pdf/fisa_cu_formule_in_spatiu-4.pdf" download="fisa_cu_formule_in_spatiu-4.pdf" class="btn btn--primary">Descarca acum</a>' +
      "</div>" +
      '<div class="justify-end pb-16 hidden laptop:flex">' +
      '<svg class="svgi post-hover-arrow" aria-labelledby="symbol-arrow-right-long-desc-formule-spatiu" role="group">' +
      '<desc id="symbol-arrow-right-long-desc-formule-spatiu">arrow-right-long icon</desc>' +
      '<use xlink:href="#svg-arrow-right-long"></use>' +
      "</svg>" +
      "</div>" +
      "</div>" +
      "</article>";

    return wrapper.firstElementChild;
  }

  async function renderMergedMathPosts() {
    const grid = document.getElementById("all-lessons-grid");

    if (!grid || grid.dataset.rendered === "true") {
      return;
    }

    try {
      const pages = await Promise.all(
        categorySources.map(function (path) {
          return fetchCategoryPage(path);
        })
      );

      const allCards = pages.flatMap(buildCardsFromPage);
      const formuleInSpatiuCard = createFormuleInSpatiuCard();
      grid.innerHTML = "";
      allCards.forEach(function (card) {
        grid.appendChild(card);
      });
      grid.appendChild(formuleInSpatiuCard);

      grid.dataset.rendered = "true";
    } catch (error) {
      console.error(error);
      grid.innerHTML =
        '<p class="py-24 px-16">Nu am putut incarca postarile de Algebra si Geometrie.</p>';
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderMergedMathPosts);
  } else {
    renderMergedMathPosts();
  }

  document.addEventListener("swup:contentReplaced", function () {
    const grid = document.getElementById("all-lessons-grid");
    if (grid) {
      delete grid.dataset.rendered;
    }
    renderMergedMathPosts();
  });
})();
