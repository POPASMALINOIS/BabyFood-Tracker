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
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=82"
    ]
  };

  let processing = false;
  let scheduled = false;

  const safeJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };

  const hash = value => {
    let h = 0;
    for (let i = 0; i < value.length; i++) h = (((h << 5) - h) + value.charCodeAt(i)) | 0;
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
      <p>Recetas, evolución y planificación en un solo lugar, sin ruido.</p>
      <div class="v2-home-meta"><span>${plannedToday} comidas hoy</span><span>${diary.length} registros</span></div>`;
    section.insertBefore(hero, title.nextSibling);
    section.dataset.v2Home = "1";
  };

  const getCardMeta = card => {
    const paragraphs = [...card.querySelectorAll(":scope > p, .recipe-card-body > p")];
    const read = label => {
      const p = paragraphs.find(el => el.textContent.trim().startsWith(label));
      return p ? p.textContent.replace(label, "").trim() : "";
    };
    return { type: read("Tipo:"), age: read("Edad:"), time: read("Tiempo:"), texture: read("Textura:") };
  };

  const enhanceRecipeFilters = section => {
    const panel = section.querySelector("#recipe-search")?.closest(".card.compact");
    if (!panel || panel.dataset.v2Filters === "1") return;
    panel.classList.add("v2-filter-panel");
    panel.dataset.v2Filters = "1";
  };

  const enhanceRecipeCards = section => {
    if (!section || section.dataset.v2Recipes === "1") return;

    const cards = [...section.querySelectorAll(".recipe-detail-btn")]
      .map(btn => btn.closest(".card"))
      .filter((card, index, array) => card && array.indexOf(card) === index);

    if (!cards.length) return;

    let grid = section.querySelector(":scope > .v2-recipe-grid");
    if (!grid) {
      grid = document.createElement("div");
      grid.className = "v2-recipe-grid";
      section.insertBefore(grid, cards[0]);
    }

    cards.forEach(card => {
      if (!card.classList.contains("recipe-card-v2")) {
        const name = card.querySelector("h2")?.textContent.trim() || "Receta";
        const meta = getCardMeta(card);
        const originalNodes = [...card.childNodes];

        const photo = document.createElement("div");
        photo.className = "recipe-photo";
        photo.innerHTML = `<img src="${choosePhoto(name, meta.type)}" alt="${name}" loading="lazy" decoding="async">`;

        const body = document.createElement("div");
        body.className = "recipe-card-body";
        originalNodes.forEach(node => body.appendChild(node));

        card.append(photo, body);
        card.classList.add("recipe-card-v2");

        const h2 = body.querySelector("h2");
        if (h2 && !body.querySelector(".v2-recipe-meta")) {
          const metaRow = document.createElement("div");
          metaRow.className = "v2-recipe-meta";
          [meta.age, meta.time, meta.type].filter(Boolean).forEach(value => {
            const span = document.createElement("span");
            span.textContent = value;
            metaRow.appendChild(span);
          });
          h2.insertAdjacentElement("afterend", metaRow);
        }
      }

      if (card.parentElement !== grid) grid.appendChild(card);
    });

    section.dataset.v2Recipes = "1";
  };

  const enhanceRecipeDetail = () => {
    const section = document.querySelector("#content > section");
    const back = section?.querySelector("#back-recipes");
    if (!section || !back || section.dataset.v2Detail === "1") return;
    const card = [...section.querySelectorAll(":scope > .card")].find(c => c.querySelector("h2"));
    const title = card?.querySelector("h2");
    if (!card || !title) return;

    const name = title.textContent.trim();
    const meta = getCardMeta(card);
    const hero = document.createElement("div");
    hero.className = "recipe-detail-hero";
    hero.innerHTML = `<img src="${choosePhoto(name, meta.type)}" alt="${name}" decoding="async"><div class="recipe-detail-title"><strong>${name}</strong><span>${[meta.age,meta.time,meta.type].filter(Boolean).join(" · ")}</span></div>`;
    back.insertAdjacentElement("afterend", hero);
    title.style.display = "none";
    section.dataset.v2Detail = "1";
  };

  const normalizeWeightValue = value => {
    const n = parseFloat(String(value ?? "").replace(",", ".").replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const buildWeightChart = history => {
    const points = history
      .map(item => ({ date: item.date, value: Number(item.value ?? normalizeWeightValue(item.weight)) }))
      .filter(item => item.date && Number.isFinite(item.value))
      .sort((a,b) => String(a.date).localeCompare(String(b.date)));

    if (points.length < 2) return "";
    const w = 320, h = 118, p = 12;
    const values = points.map(x => x.value);
    const min = Math.min(...values), max = Math.max(...values), span = Math.max(max - min, .2);
    const coords = points.map((pt, i) => ({
      x: p + (i / (points.length - 1)) * (w - p * 2),
      y: h - p - ((pt.value - min) / span) * (h - p * 2)
    }));
    const line = coords.map((c, i) => `${i ? "L" : "M"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
    const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${h-p} L${coords[0].x.toFixed(1)},${h-p} Z`;
    const dots = coords.map(c => `<circle class="weight-dot" cx="${c.x}" cy="${c.y}" r="3.5"/>`).join("");
    return `<div class="weight-chart"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2F5B47" stop-opacity=".18"/><stop offset="100%" stop-color="#2F5B47" stop-opacity="0"/></linearGradient></defs><line class="grid-line" x1="0" y1="${h-p}" x2="${w}" y2="${h-p}"/><path class="weight-area" d="${area}"/><path class="weight-path" d="${line}"/>${dots}</svg></div>`;
  };

  const enhanceProfile = () => {
    const section = document.querySelector("#content > section");
    if (!section || !section.querySelector("#profile-name")) return;

    if (section.dataset.v2Profile !== "1") {
      const profile = safeJSON("babyProfile", {});
      const allergenDiary = safeJSON("allergenDiary", {});
      const summary = document.createElement("div");
      summary.className = "v2-profile-summary";
      summary.innerHTML = `<div class="v2-profile-stat"><span>Bebé</span><strong>${profile.name || "Sin nombre"}</strong></div><div class="v2-profile-stat"><span>Peso</span><strong>${profile.currentWeight || "—"}</strong></div><div class="v2-profile-stat"><span>Alérgenos</span><strong>${Object.keys(allergenDiary).length}</strong></div>`;
      section.querySelector(".section-subtitle")?.insertAdjacentElement("afterend", summary);
      section.dataset.v2Profile = "1";
    }

    const weightCard = [...section.querySelectorAll(".form-card")].find(x => x.querySelector("h2")?.textContent.trim() === "Historial de peso");
    if (weightCard && !weightCard.querySelector(".weight-chart")) {
      const chart = buildWeightChart(safeJSON("weightHistory", []));
      if (chart) weightCard.querySelector("h2")?.insertAdjacentHTML("afterend", chart);
    }
  };

  const process = () => {
    if (processing) return;
    processing = true;
    try {
      const view = detectView();
      updateShell(view);
      if (view === "inicio") enhanceHome();
      if (view === "recetas") {
        const section = document.querySelector("#content > section");
        enhanceRecipeFilters(section);
        enhanceRecipeCards(section);
      }
      if (view === "favoritos") enhanceRecipeCards(document.querySelector("#content > section"));
      if (view === "detalle-receta") enhanceRecipeDetail();
      if (view === "perfil") enhanceProfile();
    } finally {
      processing = false;
    }
  };

  const scheduleProcess = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      process();
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById("splash-screen");
    const app = document.getElementById("app");
    setTimeout(() => {
      splash?.classList.add("fade-out");
      app?.classList.remove("hidden");
      setTimeout(() => { if (splash) splash.style.display = "none"; }, 320);
    }, 650);

    document.getElementById("header-profile-btn")?.addEventListener("click", () => {
      document.querySelector('.nav-btn[data-section="perfil"]')?.click();
    });

    const target = document.getElementById("content");
    if (target) {
      const observer = new MutationObserver(scheduleProcess);
      observer.observe(target, { childList: true, subtree: true });
    }
    process();
  });
})();