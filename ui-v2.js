(() => {
  const FOOD_PHOTOS = {
    pure: [
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=900&q=82"
    ],
    fruit: [
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=82"
    ],
    breakfast: [
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=82"
    ],
    fish: [
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=82"
    ],
    veg: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=82"
    ],
    meal: [
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=82"
    ]
  };

  const safeJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };

  const hash = value => {
    let h = 0;
    const text = String(value || "");
    for (let i = 0; i < text.length; i++) h = (((h << 5) - h) + text.charCodeAt(i)) | 0;
    return Math.abs(h);
  };

  const choosePhoto = (name = "", type = "") => {
    const text = `${name} ${type}`.toLowerCase();
    let pool = FOOD_PHOTOS.meal;
    if (/puré|pure|crema/.test(text)) pool = FOOD_PHOTOS.pure;
    else if (/potito|fruta|manzana|pera|plátano|platano|mango|fresa|kiwi/.test(text)) pool = FOOD_PHOTOS.fruit;
    else if (/desayuno|avena|tortita|pancake/.test(text)) pool = FOOD_PHOTOS.breakfast;
    else if (/merluza|salmón|salmon|pescado|bacalao/.test(text)) pool = FOOD_PHOTOS.fish;
    else if (/blw|brócoli|brocoli|calabaza|boniato|zanahoria|verdura/.test(text)) pool = FOOD_PHOTOS.veg;
    return pool[hash(name || type || "babyfood") % pool.length];
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
      inicio: "Inicio", recetas: "Recetas", "detalle-receta": "Receta",
      favoritos: "Favoritos", plan: "Plan semanal", perfil: "Perfil",
      alergenos: "Alérgenos", registro: "Nuevo registro"
    };
    const label = document.getElementById("view-label");
    if (label) label.textContent = labels[view] || "BabyFood";
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

  const readMeta = card => {
    const paragraphs = [...card.querySelectorAll("p")];
    const read = label => {
      const el = paragraphs.find(p => p.textContent.trim().startsWith(label));
      return el ? el.textContent.replace(label, "").trim() : "";
    };
    return { type: read("Tipo:"), age: read("Edad:"), time: read("Tiempo:") };
  };

  const enhanceRecipes = () => {
    const section = document.querySelector("#content > section");
    if (!section || !section.querySelector("#recipe-search")) return;

    const filter = section.querySelector("#recipe-search")?.closest(".card.compact");
    if (filter && filter.dataset.v2Stable !== "1") {
      filter.classList.add("v2-filter-panel", "v2-filter-stable");
      filter.dataset.v2Stable = "1";
    }

    const cards = [...section.querySelectorAll(".recipe-detail-btn")]
      .map(btn => btn.closest(".card"))
      .filter((card, i, all) => card && all.indexOf(card) === i);

    cards.forEach(card => {
      if (card.dataset.v2Stable === "1") return;
      const name = card.querySelector("h2")?.textContent.trim() || "Receta";
      const meta = readMeta(card);
      const photo = document.createElement("div");
      photo.className = "recipe-photo-stable";
      photo.innerHTML = `<img src="${choosePhoto(name, meta.type)}" alt="${name}" loading="lazy" decoding="async">`;
      card.insertBefore(photo, card.firstChild);
      card.classList.add("recipe-card-stable");
      card.dataset.v2Stable = "1";
    });
  };

  const enhanceRecipeDetail = () => {
    const section = document.querySelector("#content > section");
    const back = section?.querySelector("#back-recipes");
    if (!section || !back || section.dataset.v2Detail === "1") return;
    const card = [...section.querySelectorAll(".card")].find(c => c.querySelector("h2"));
    const title = card?.querySelector("h2");
    if (!card || !title) return;

    const name = title.textContent.trim();
    const meta = readMeta(card);
    const hero = document.createElement("div");
    hero.className = "recipe-detail-hero";
    hero.innerHTML = `<img src="${choosePhoto(name, meta.type)}" alt="${name}" decoding="async"><div class="recipe-detail-title"><strong>${name}</strong><span>${[meta.age, meta.time, meta.type].filter(Boolean).join(" · ")}</span></div>`;
    back.insertAdjacentElement("afterend", hero);
    section.dataset.v2Detail = "1";
  };

  const normalizeWeightValue = value => {
    const n = parseFloat(String(value ?? "").replace(",", ".").replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const enhanceProfile = () => {
    const section = document.querySelector("#content > section");
    if (!section || !section.querySelector("#profile-name") || section.dataset.v2Profile === "1") return;
    const profile = safeJSON("babyProfile", {});
    const allergenDiary = safeJSON("allergenDiary", {});
    const summary = document.createElement("div");
    summary.className = "v2-profile-summary";
    summary.innerHTML = `<div class="v2-profile-stat"><span>Bebé</span><strong>${profile.name || "Sin nombre"}</strong></div><div class="v2-profile-stat"><span>Peso</span><strong>${profile.currentWeight || "—"}</strong></div><div class="v2-profile-stat"><span>Alérgenos</span><strong>${Object.keys(allergenDiary).length}</strong></div>`;
    section.querySelector(".section-subtitle")?.insertAdjacentElement("afterend", summary);
    section.dataset.v2Profile = "1";
  };

  let timer = null;
  const process = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const view = detectView();
      updateShell(view);
      if (view === "inicio") enhanceHome();
      if (view === "recetas") enhanceRecipes();
      if (view === "detalle-receta") enhanceRecipeDetail();
      if (view === "perfil") enhanceProfile();
    }, 20);
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("header-profile-btn")?.addEventListener("click", () => {
      document.querySelector('.nav-btn[data-section="perfil"]')?.click();
    });

    const target = document.getElementById("content");
    if (target) new MutationObserver(process).observe(target, { childList: true });
    document.addEventListener("click", () => setTimeout(process, 0), true);
    process();
  });
})();