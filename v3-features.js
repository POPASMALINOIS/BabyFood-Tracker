(() => {
  const IMAGE_MAP = {
    1: "assets/recipes/001-pure-calabaza-patata-pollo.webp"
  };

  // Valores medios orientativos por 100 g de parte comestible.
  // La UI identifica expresamente estos datos como estimaciones nutricionales.
  const FOOD_DB = {
    calabaza:{kcal:26,c:6.5,p:1,f:0.1}, patata:{kcal:77,c:17,p:2,f:0.1}, pollo:{kcal:165,c:0,p:31,f:3.6},
    calabacin:{kcal:17,c:3.1,p:1.2,f:0.3}, zanahoria:{kcal:41,c:9.6,p:0.9,f:0.2}, pavo:{kcal:135,c:0,p:29,f:1.6},
    manzana:{kcal:52,c:14,p:0.3,f:0.2}, pera:{kcal:57,c:15,p:0.4,f:0.1}, platano:{kcal:89,c:23,p:1.1,f:0.3}, aguacate:{kcal:160,c:8.5,p:2,f:14.7},
    avena:{kcal:389,c:66,p:17,f:7}, huevo:{kcal:143,c:0.7,p:13,f:9.5}, boniato:{kcal:86,c:20,p:1.6,f:0.1}, arroz:{kcal:360,c:79,p:7,f:0.6},
    merluza:{kcal:86,c:0,p:18,f:1.3}, fresa:{kcal:32,c:7.7,p:0.7,f:0.3}, maiz:{kcal:86,c:19,p:3.2,f:1.2}, guisantes:{kcal:81,c:14,p:5.4,f:0.4},
    lentejas:{kcal:116,c:20,p:9,f:0.4}, ciruela:{kcal:46,c:11,p:0.7,f:0.3}, mijo:{kcal:378,c:73,p:11,f:4.2}, mango:{kcal:60,c:15,p:0.8,f:0.4},
    brocoli:{kcal:34,c:6.6,p:2.8,f:0.4}, puerro:{kcal:61,c:14,p:1.5,f:0.3}, garbanzos:{kcal:164,c:27,p:8.9,f:2.6}, ternera:{kcal:170,c:0,p:26,f:7},
    cuscus:{kcal:376,c:77,p:13,f:0.6}, quinoa:{kcal:368,c:64,p:14,f:6.1}, conejo:{kcal:173,c:0,p:33,f:3.5}, papaya:{kcal:43,c:11,p:0.5,f:0.3},
    salmon:{kcal:208,c:0,p:20,f:13}, bacalao:{kcal:82,c:0,p:18,f:0.7}, tofu:{kcal:76,c:1.9,p:8,f:4.8}, yogur:{kcal:61,c:4.7,p:3.5,f:3.3},
    aceite:{kcal:884,c:0,p:0,f:100}
  };

  const norm = s => String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  let recipeData = [];

  function ingredientWeight(line){
    const text = norm(line);
    const g = text.match(/(\d+(?:[.,]\d+)?)\s*g\b/);
    if(g) return parseFloat(g[1].replace(",","."));
    if(/cucharadita.*aceite|aceite.*cucharadita/.test(text)) return 5;
    if(/cucharada.*aceite|aceite.*cucharada/.test(text)) return 14;
    const ml = text.match(/(\d+(?:[.,]\d+)?)\s*ml\b/);
    if(ml && !/agua|caldo/.test(text)) return parseFloat(ml[1].replace(",","."));
    if(/1\/2\s*platano/.test(text)) return 60;
    if(/1\/4\s*aguacate/.test(text)) return 40;
    if(/1\s*huevo/.test(text)) return 50;
    if(/1\s*(pieza|manzana|pera|platano|mango|papaya|boniato|melocoton|nectarina)/.test(text)) return 100;
    return 0;
  }

  function portionCount(label){
    const text=String(label||"1");
    const range=text.match(/(\d+)\s*-\s*(\d+)/);
    if(range) return (Number(range[1])+Number(range[2]))/2;
    const one=text.match(/\d+/);
    return Math.max(1, Number(one?.[0]||1));
  }

  function estimateNutrition(recipe){
    const total = {kcal:0,c:0,p:0,f:0};
    (recipe.ingredientes||[]).forEach(line => {
      const text = norm(line);
      const weight = ingredientWeight(line);
      if(!weight) return;
      const key = Object.keys(FOOD_DB).find(k => text.includes(k));
      if(!key) return;
      const d = FOOD_DB[key];
      total.kcal += d.kcal*weight/100;
      total.c += d.c*weight/100;
      total.p += d.p*weight/100;
      total.f += d.f*weight/100;
    });
    const portions = portionCount(recipe.raciones);
    return {
      totalKcal: Math.round(total.kcal),
      portions,
      kcal: Math.round(total.kcal/portions),
      carbs: Math.round(total.c/portions),
      protein: Math.round(total.p/portions),
      fat: Math.round(total.f/portions)
    };
  }

  function contribution(recipe){
    const text = norm(`${recipe.nombre} ${(recipe.ingredientes||[]).join(" ")}`);
    const bits=[];
    if(/pollo|pavo|ternera|conejo|merluza|salmon|bacalao|huevo|lentejas|garbanzos|tofu/.test(text)) bits.push("proteínas que contribuyen al crecimiento y mantenimiento de tejidos");
    if(/patata|boniato|arroz|avena|mijo|maiz|cuscus|quinoa/.test(text)) bits.push("hidratos de carbono como fuente principal de energía");
    if(/calabaza|zanahoria/.test(text)) bits.push("carotenoides precursores de vitamina A");
    if(/brocoli|guisantes|calabacin|puerro|espinaca/.test(text)) bits.push("verduras con fibra y micronutrientes");
    if(/manzana|pera|platano|mango|papaya|fresa|ciruela/.test(text)) bits.push("fruta con fibra y micronutrientes");
    if(/aguacate|aceite/.test(text)) bits.push("grasas que aumentan la densidad energética del plato");
    if(!bits.length) return "Combina alimentos adecuados para una alimentación variada, adaptando siempre textura y cantidad a la etapa del bebé.";
    return `Combina ${bits.slice(0,4).join(", ")}.`;
  }

  function latestWeightStats(){
    const list = readJSON("weightHistory",[])
      .map(x=>({date:x.date,value:parseFloat(String(x.value??x.weight??"").replace(",","."))}))
      .filter(x=>x.date&&Number.isFinite(x.value))
      .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    const last=list.at(-1), prev=list.at(-2);
    return {last, prev, change:last&&prev ? +(last.value-prev.value).toFixed(3) : null};
  }

  function formatShortDate(value){
    if(!value) return "";
    const d=new Date(`${value}T12:00:00`);
    if(Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"short",year:"numeric"}).format(d);
  }

  function todaysPlan(){
    const plan=readJSON("weeklyPlan",{});
    const days=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    const day=days[new Date().getDay()];
    const slots=plan[day]||{};
    const order=["Desayuno","Comida","Cena","Snack"];
    for(const slot of order){
      const id=slots[slot];
      if(id){
        const recipe=recipeData.find(r=>String(r.id)===String(id));
        if(recipe) return {slot,recipe};
      }
    }
    return null;
  }

  function calculateAgeFallback(date){
    const b=new Date(date), n=new Date();
    if(Number.isNaN(b.getTime())) return "—";
    let m=(n.getFullYear()-b.getFullYear())*12+n.getMonth()-b.getMonth();
    let d=n.getDate()-b.getDate();
    if(d<0){m--; d+=new Date(n.getFullYear(),n.getMonth(),0).getDate();}
    return `${m} meses y ${d} días`;
  }

  function enhanceHome(){
    const section=document.querySelector("#content > section");
    if(!section) return;
    const title=section.querySelector(".section-title");
    if(!title || title.textContent.trim()!=="Inicio" || section.dataset.v3Home==="1") return;

    // Bloquear reentradas ANTES de modificar el DOM.
    section.dataset.v3Home="1";

    const profile=readJSON("babyProfile",{});
    const diary=readJSON("foodDiary",[]);
    const ws=latestWeightStats();
    const next=todaysPlan();
    const hero=section.querySelector(".v2-home-hero");

    // El nuevo dashboard sustituye las tarjetas antiguas, no se añade debajo de ellas.
    [...section.children].forEach(el=>{
      if(el===title || el.classList.contains("section-subtitle") || el===hero) return;
      el.classList.add("v3-hide-original");
    });

    const heroMeta=hero?.querySelector(".v2-home-meta");
    if(heroMeta) heroMeta.style.display="none";

    const weeklyPlan=readJSON("weeklyPlan",{});
    const days=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    const todaySlots=weeklyPlan[days[new Date().getDay()]]||{};
    const plannedToday=Object.values(todaySlots).filter(Boolean).length;

    const topMetrics=document.createElement("div");
    topMetrics.className="v3-top-metrics";
    topMetrics.innerHTML=`
      <div><span class="v3-round-icon">🍴</span><strong>${plannedToday}</strong><small>comidas hoy</small></div>
      <div><span class="v3-round-icon warm">▣</span><strong>${diary.length}</strong><small>registros</small></div>`;

    const delta = ws.change==null ? "" : `${ws.change>=0?"+":""}${Math.round(ws.change*1000)} g`;
    const lastDiary=diary.at(-1);
    const block=document.createElement("div");
    block.className="v3-dashboard";
    block.innerHTML=`
      <div class="v3-summary-card">
        <h3>Resumen rápido</h3>
        <div class="v3-stats-grid">
          <div class="v3-stat"><span class="v3-stat-icon">▣</span><span>Edad</span><strong>${profile.birthDate ? calculateAgeFallback(profile.birthDate) : "—"}</strong></div>
          <div class="v3-stat"><span class="v3-stat-icon">◉</span><span>Peso actual</span><strong>${profile.currentWeight || (ws.last?ws.last.value+" kg":"—")}</strong><small>${delta ? `${delta} · ` : ""}${ws.last?`Último: ${formatShortDate(ws.last.date)}`:""}</small></div>
          <div class="v3-stat"><span class="v3-stat-icon">⌁</span><span>Último registro</span><strong>${lastDiary ? lastDiary.food : "Sin registros"}</strong><small>${lastDiary?.date ? formatShortDate(lastDiary.date) : ""}</small></div>
        </div>
      </div>
      <div class="v3-next-card">
        <div><span>Próxima comida</span><strong>${next ? next.slot : "Plan sin completar"}</strong><p>${next ? next.recipe.nombre : "Añade recetas al plan semanal para verla aquí."}</p></div>
        ${next && (next.recipe.image||IMAGE_MAP[next.recipe.id]) ? `<img src="${next.recipe.image||IMAGE_MAP[next.recipe.id]}" alt="${next.recipe.nombre}">` : ""}
      </div>
      <h3 class="v3-shortcuts-title">Atajos rápidos</h3>
      <div class="v3-quick-grid">
        <button data-v3="recipes"><span>▤</span>Recetas</button>
        <button data-v3="plan"><span>▣</span>Plan semanal</button>
        <button data-v3="profile"><span>⌁</span>Evolución</button>
        <button data-v3="shopping"><span>⌑</span>Lista compra</button>
      </div>`;

    const anchor=hero || section.querySelector(".section-subtitle") || title;
    anchor.insertAdjacentElement("afterend",topMetrics);
    topMetrics.insertAdjacentElement("afterend",block);

    block.querySelector('[data-v3="recipes"]')?.addEventListener("click",()=>document.querySelector('.nav-btn[data-section="recetas"]')?.click());
    block.querySelector('[data-v3="plan"]')?.addEventListener("click",()=>document.querySelector('.nav-btn[data-section="plan"]')?.click());
    block.querySelector('[data-v3="profile"]')?.addEventListener("click",()=>document.querySelector('.nav-btn[data-section="perfil"]')?.click());
    block.querySelector('[data-v3="shopping"]')?.addEventListener("click",()=>document.getElementById("quick-shopping")?.click());
  }

  function enhanceRecipeList(){
    const section=document.querySelector("#content > section");
    if(!section || !section.querySelector("#recipe-search")) return;
    [...section.querySelectorAll(".recipe-detail-btn")].forEach(btn=>{
      const card=btn.closest(".card");
      if(!card || card.dataset.v3Recipe==="1") return;
      card.dataset.v3Recipe="1";
      const name=card.querySelector("h2")?.textContent.trim();
      const recipe=recipeData.find(r=>r.nombre===name);
      if(!recipe) return;
      const src=recipe.image||IMAGE_MAP[recipe.id];
      if(src){
        card.querySelectorAll(".v3-recipe-media").forEach(el=>el.remove());
        const media=document.createElement("div");
        media.className="v3-recipe-media";
        media.innerHTML=`<img src="${src}" alt="${recipe.nombre}" loading="lazy">`;
        card.insertBefore(media,card.firstChild);
        card.classList.add("v3-recipe-card");
      }
    });
  }

  function enhanceRecipeDetail(){
    const section=document.querySelector("#content > section");
    if(!section || !section.querySelector("#back-recipes") || section.dataset.v3Detail==="1") return;
    section.dataset.v3Detail="1";

    const card=[...section.querySelectorAll(".card")].find(c=>c.querySelector("h2"));
    const name=card?.querySelector("h2")?.textContent.trim();
    const recipe=recipeData.find(r=>r.nombre===name);
    if(!recipe) return;

    // Garantiza exactamente UNA foto en el detalle, incluso al venir de una versión cacheada anterior.
    section.querySelectorAll(".v3-detail-photo").forEach(el=>el.remove());
    const src=recipe.image||IMAGE_MAP[recipe.id];
    if(src){
      const hero=document.createElement("div");
      hero.className="v3-detail-photo";
      hero.innerHTML=`<img src="${src}" alt="${recipe.nombre}">`;
      card.insertBefore(hero,card.firstChild);
      card.classList.add("v3-detail-card");
    }

    section.querySelectorAll(".v3-nutrition-card").forEach(el=>el.remove());
    const n=estimateNutrition(recipe);
    const info=document.createElement("div");
    info.className="card v3-nutrition-card";
    info.innerHTML=`
      <h2>Qué aporta esta receta</h2>
      <p>${contribution(recipe)}</p>
      <div class="v3-macros">
        <div><strong>${n.kcal||"—"}</strong><span>kcal / ración</span></div>
        <div><strong>${n.carbs||"—"} g</strong><span>hidratos</span></div>
        <div><strong>${n.protein||"—"} g</strong><span>proteínas</span></div>
        <div><strong>${n.fat||"—"} g</strong><span>grasas</span></div>
      </div>
      <div class="v3-total-energy"><strong>Receta completa: ~${n.totalKcal||"—"} kcal</strong><span>${recipe.raciones || `${n.portions} raciones`}</span></div>
      <small class="v3-disclaimer">Estimación orientativa calculada a partir de las cantidades indicadas y valores medios de composición por 100 g. Las necesidades y raciones de cada bebé varían.</small>`;
    card.insertAdjacentElement("afterend",info);
  }

  function process(){
    const section=document.querySelector("#content > section");
    if(!section) return;
    if(section.querySelector("#recipe-search")) enhanceRecipeList();
    else if(section.querySelector("#back-recipes")) enhanceRecipeDetail();
    else if(section.querySelector(".section-title")?.textContent.trim()==="Inicio") enhanceHome();
  }

  document.addEventListener("DOMContentLoaded", async()=>{
    try{ recipeData=await fetch("data/recipes.json?v=28").then(r=>r.json()); }catch{ recipeData=[]; }
    const target=document.getElementById("content");
    if(target) new MutationObserver(()=>requestAnimationFrame(process)).observe(target,{childList:true,subtree:false});
    requestAnimationFrame(process);
  });
})();