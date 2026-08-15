(() => {
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
    const labels = { inicio:"Inicio", recetas:"Recetas", "detalle-receta":"Receta", favoritos:"Favoritos", plan:"Plan semanal", perfil:"Perfil", alergenos:"Alérgenos", registro:"Nuevo registro" };
    const label = document.getElementById("view-label");
    if (label) label.textContent = labels[view] || "BabyFood";
  };

  const cleanLegacyRecipeVisuals = () => {
    const section = document.querySelector("#content > section");
    if (!section) return;
    section.querySelectorAll(".recipe-photo-stable,.recipe-photo,.recipe-detail-hero,.recipe-specific-photo,.recipe-specific-detail-photo").forEach(el => el.remove());
    const filter = section.querySelector("#recipe-search")?.closest(".card.compact");
    if (filter) { filter.style.position="static"; filter.style.top="auto"; }
  };

  const enhanceHome = () => {
    const section = document.querySelector("#content > section");
    if (!section || section.dataset.v2Home === "1") return;
    const title = section.querySelector(".section-title");
    if (!title || title.textContent.trim() !== "Inicio") return;
    const profile = safeJSON("babyProfile", {});
    const firstName = (profile.name || "tu bebé").split(" ")[0];
    const subtitle = section.querySelector(".section-subtitle");
    title.style.display = "none";
    if (subtitle) subtitle.style.display = "none";
    const hero = document.createElement("article");
    hero.className = "v2-home-hero";
    hero.innerHTML = `<span class="hero-kicker">${new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"long"}).format(new Date())}</span><h2>Todo listo para ${firstName}</h2><p>Recetas, evolución y planificación en un solo lugar.</p>`;
    section.insertBefore(hero, title.nextSibling);
    section.dataset.v2Home = "1";
  };

  const enhanceProfile = () => {
    const section = document.querySelector("#content > section");
    if (!section || !section.querySelector("#profile-name") || section.dataset.v2Profile === "1") return;
    const profile=safeJSON("babyProfile",{}), allergenDiary=safeJSON("allergenDiary",{});
    const summary=document.createElement("div"); summary.className="v2-profile-summary";
    summary.innerHTML=`<div class="v2-profile-stat"><span>Bebé</span><strong>${profile.name||"Sin nombre"}</strong></div><div class="v2-profile-stat"><span>Peso</span><strong>${profile.currentWeight||"—"}</strong></div><div class="v2-profile-stat"><span>Alérgenos</span><strong>${Object.keys(allergenDiary).length}</strong></div>`;
    section.querySelector(".section-subtitle")?.insertAdjacentElement("afterend",summary); section.dataset.v2Profile="1";
  };

  const process=()=>{ const view=detectView(); updateShell(view); if(view==="recetas"||view==="detalle-receta") cleanLegacyRecipeVisuals(); if(view==="inicio") enhanceHome(); if(view==="perfil") enhanceProfile(); };
  document.addEventListener("DOMContentLoaded",()=>{
    document.getElementById("header-profile-btn")?.addEventListener("click",()=>document.querySelector('.nav-btn[data-section="perfil"]')?.click());
    const target=document.getElementById("content"); if(target) new MutationObserver(()=>requestAnimationFrame(process)).observe(target,{childList:true,subtree:false});
    process();
  });
})();