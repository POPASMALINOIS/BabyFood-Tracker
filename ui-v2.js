(() => {
  const RECIPE_IMAGES = {
    "Puré de calabaza, patata y pollo": "assets/recipes/001-pure-calabaza-patata-pollo.webp"
  };

  const safeJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };

  const detectView = () => {
    if (document.querySelector("#food-input")) return "registro";
    if (document.querySelector("#profile-name")) return "perfil";
    if (document.querySelector("#back-profile")) return "alergenos";
    if (document.querySelector("#recipe-search")) return "recetas";
    if (document.querySelector("#back-recipes")) return "detalle-receta";
    if (document.querySelector(".plan-top-nav")) return "plan";
    const title = document.querySelector(".section-title")?.textContent.trim().toLowerCase();
    if (title === "favoritos") return "favoritos";
    return "inicio";
  };

  const updateShell = view => {
    document.body.dataset.view = view;
    const labels = {
      inicio: "Inicio",
      recetas: "Recetas",
      "detalle-receta": "Receta",
      favoritos: "Favoritos",
      plan: "Plan semanal",
      perfil: "Perfil",
      alergenos: "Alérgenos",
      registro: "Nuevo registro"
    };
    const label = document.getElementById("view-label");
    if (label) label.textContent = labels[view] || "BabyFood";
  };

  const cleanLegacyRecipeVisuals = () => {
    const section = document.querySelector("#content > section");
    if (!section || !section.querySelector("#recipe-search")) return;

    section.querySelectorAll(".recipe-photo-stable, .recipe-photo, .recipe-detail-hero").forEach(el => el.remove());
    section.querySelectorAll(".recipe-card-stable, .recipe-card-v2").forEach(card => {
      card.classList.remove("recipe-card-stable", "recipe-card-v2");
      card.removeAttribute("data-v2-stable");
    });

    const filter = section.querySelector("#recipe-search")?.closest(".card.compact");
    if (filter) {
      filter.classList.remove("v2-filter-stable");
      filter.style.position = "static";
      filter.style.top = "auto";
    }
  };

  const enhanceRecipeSpecificImages = () => {
    const section = document.querySelector("#content > section");
    if (!section || !section.querySelector("#recipe-search")) return;

    section.querySelectorAll(".recipe-detail-btn").forEach(button => {
      const card = button.closest(".card");
      const title = card?.querySelector("h2")?.textContent.trim();
      const image = RECIPE_IMAGES[title];
      if (!card || !image || card.querySelector(".recipe-specific-photo")) return;

      const figure = document.createElement("div");
      figure.className = "recipe-specific-photo";
      figure.innerHTML = `<img src="${image}" alt="${title}" loading="lazy" decoding="async">`;
      card.insertBefore(figure, card.firstChild);
      card.classList.add("has-specific-photo");
    });
  };

  const enhanceRecipeDetailImage = () => {
    const section = document.querySelector("#content > section");
    if (!section || !section.querySelector("#back-recipes")) return;
    if (section.querySelector(".recipe-specific-detail-photo")) return;

    const card = [...section.querySelectorAll(".card")].find(item => item.querySelector("h2"));
    const title = card?.querySelector("h2")?.textContent.trim();
    const image = RECIPE_IMAGES[title];
    if (!card || !image) return;

    const figure = document.createElement("div");
    figure.className = "recipe-specific-detail-photo";
    figure.innerHTML = `<img src="${image}" alt="${title}" decoding="async">`;
    card.insertBefore(figure, card.firstChild);
  };

  const enhanceHome = () => {
    const section = document.querySelector("#content > section");
    if (!section || section.dataset.v2Home === "1") return;
    const title = section.querySelector(".section-title");
    if (!title || title.textContent.trim() !== "Inicio") return;

    const profile = safeJSON("babyProfile", {});
    const diary = safeJSON("foodDiary", []);
    const plan = safeJSON("weeklyPlan", {});
    const days = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
    const today = days[(new Date().getDay() + 6) % 7];
    const plannedToday = plan[today] ? Object.values(plan[today]).filter(Boolean).length : 0;
    const firstName = (profile.name || "tu bebé").split(" ")[0];
    const subtitle = section.querySelector(".section-subtitle");

    title.style.display = "none";
    if (subtitle) subtitle.style.display = "none";

    const hero = document.createElement("article");
    hero.className = "v2-home-hero";
    hero.innerHTML = `
      <span class="hero-kicker">${new Intl.DateTimeFormat("es-ES", { weekday:"long", day:"numeric", month:"long" }).format(new Date())}</span>
      <h2>Todo listo para ${firstName}</h2>
      <p>Recetas, evolución y planificación en un solo lugar.</p>
      <div class="v2-home-meta"><span>${plannedToday} comidas hoy</span><span>${diary.length} registros</span></div>`;
    section.insertBefore(hero, title.nextSibling);
    section.dataset.v2Home = "1";
  };

  const enhanceProfile = () => {
    const section = document.querySelector("#content > section");
    if (!section || !section.querySelector("#profile-name") || section.dataset.v2Profile === "1") return;
    const profile = safeJSON("babyProfile", {});
    const allergenDiary = safeJSON("allergenDiary", {});
    const summary = document.createElement("div");
    summary.className = "v2-profile-summary";
    summary.innerHTML = `
      <div class="v2-profile-stat"><span>Bebé</span><strong>${profile.name || "Sin nombre"}</strong></div>
      <div class="v2-profile-stat"><span>Peso</span><strong>${profile.currentWeight || "—"}</strong></div>
      <div class="v2-profile-stat"><span>Alérgenos</span><strong>${Object.keys(allergenDiary).length}</strong></div>`;
    section.querySelector(".section-subtitle")?.insertAdjacentElement("afterend", summary);
    section.dataset.v2Profile = "1";
  };

  const process = () => {
    const view = detectView();
    updateShell(view);
    if (view === "recetas") {
      cleanLegacyRecipeVisuals();
      enhanceRecipeSpecificImages();
    }
    if (view === "detalle-receta") enhanceRecipeDetailImage();
    if (view === "inicio") enhanceHome();
    if (view === "perfil") enhanceProfile();
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("header-profile-btn")?.addEventListener("click", () => {
      document.querySelector('.nav-btn[data-section="perfil"]')?.click();
    });

    const target = document.getElementById("content");
    if (target) {
      const observer = new MutationObserver(() => requestAnimationFrame(process));
      observer.observe(target, { childList: true, subtree: false });
    }

    document.addEventListener("click", () => requestAnimationFrame(process), true);
    process();
  });
})();