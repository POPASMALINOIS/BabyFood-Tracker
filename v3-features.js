(() => {
  const IMAGE_MAP = {
    1: "assets/recipes/001-pure-calabaza-patata-pollo.webp"
  };

  const FOOD_DB = {
    calabaza:{kcal:26,c:6.5,p:1,f:0.1}, patata:{kcal:77,c:17,p:2,f:0.1}, pollo:{kcal:165,c:0,p:31,f:3.6},
    calabacin:{kcal:17,c:3.1,p:1.2,f:0.3}, zanahoria:{kcal:41,c:9.6,p:0.9,f:0.2}, pavo:{kcal:135,c:0,p:29,f:1.6},
    manzana:{kcal:52,c:14,p:0.3,f:0.2}, pera:{kcal:57,c:15,p:0.4,f:0.1}, platano:{kcal:89,c:23,p:1.1,f:0.3}, aguacate:{kcal:160,c:8.5,p:2,f:14.7},
    avena:{kcal:389,c:66,p:17,f:7}, huevo:{kcal:143,c:0.7,p:13,f:9.5}, boniato:{kcal:86,c:20,p:1.6,f:0.1}, arroz:{kcal:360,c:79,p:7,f:0.6},
    merluza:{kcal:86,c:0,p:18,f:1.3}, fresa:{kcal:32,c:7.7,p:0.7,f:0.3}, maiz:{kcal:86,c:19,p:3.2,f:1.2}, guisantes:{kcal:81,c:14,p:5.4,f:0.4},
    lentejas:{kcal:116,c:20,p:9,f:0.4}, ciruela:{kcal:46,c:11,p:0.7,f:0.3}, mijo:{kcal:378,c:73,p:11,f:4.2}, mango:{kcal:60,c:15,p:0.8,f:0.4},
    brocoli:{kcal:34,c:6.6,p:2.8,f:0.4}, puerro:{kcal:61,c:14,p:1.5,f:0.3}, garbanzos:{kcal:164,c:27,p:8.9,f:2.6}, ternera:{kcal:170,c:0,p:26,f:7},
    cuscus:{kcal:376,c:77,p:13,f:0.6}, quinoa:{kcal:368,c:64,p:14,f:6.1}, conejo:{kcal:173,c:0,p:33,f:3.5}, papaya:{kcal:43,c:11,p:0.5,f:0.3},
    salmon:{kcal:208,c:0,p:20,f:13}, bacalao:{kcal:82,c:0,p:18,f:0.7}, tofu:{kcal:76,c:1.9,p:8,f:4.8}, yogur:{kcal:61,c:4.7,p:3.5,f:3.3}
  };

  const norm = s => String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  let recipeData = [];

  function ingredientWeight(line){
    const text = norm(line);
    const g = text.match(/(\d+(?:[.,]\d+)?)\s*g\b/);
    if(g) return parseFloat(g[1].replace(",","."));
    const ml = text.match(/(\d+(?:[.,]\d+)?)\s*ml\b/);
    if(ml) return parseFloat(ml[1].replace(",","."));
    if(/1\/2\s*platano/.test(text)) return 60;
    if(/1\/4\s*aguacate/.test(text)) return 40;
    if(/1\s*huevo/.test(text)) return 50;
    if(/1\s*(pieza|manzana|pera|platano|mango|papaya|boniato)/.test(text)) return 100;
    return 0;
  }

  function estimateNutrition(recipe){
    const total = {kcal:0,c:0,p:0,f:0};
    (recipe.ingredientes||[]).forEach(line => {
      const t = norm(line); const weight = ingredientWeight(line); if(!weight) return;
      const key = Object.keys(FOOD_DB).find(k => t.includes(k)); if(!key) return;
      const d = FOOD_DB[key];
      total.kcal += d.kcal*weight/100; total.c += d.c*weight/100; total.p += d.p*weight/100; total.f += d.f*weight/100;
    });
    const portions = Math.max(1, parseInt(String(recipe.raciones||"1").match(/\d+/)?.[0]||"1",10));
    return {kcal:Math.round(total.kcal/portions), carbs:Math.round(total.c/portions), protein:Math.round(total.p/portions), fat:Math.round(total.f/portions)};
  }

  function contribution(recipe){
    const text = norm(`${recipe.nombre} ${(recipe.ingredientes||[]).join(" ")}`);
    const bits=[];
    if(/pollo|pavo|ternera|conejo|merluza|salmon|bacalao|huevo|lentejas|garbanzos|tofu/.test(text)) bits.push("proteínas para crecimiento y desarrollo");
    if(/patata|boniato|arroz|avena|mijo|maiz|cuscus|quinoa/.test(text)) bits.push("hidratos de carbono como fuente de energía");
    if(/calabaza|zanahoria|brocoli|guisantes|calabacin|puerro|espinaca/.test(text)) bits.push("verduras con fibra, vitaminas y minerales");
    if(/manzana|pera|platano|mango|papaya|fresa|ciruela/.test(text)) bits.push("fruta con fibra y micronutrientes");
    if(/aguacate|aceite/.test(text)) bits.push("grasas saludables");
    if(!bits.length) return "Una combinación variada de alimentos adaptada a la etapa de alimentación complementaria.";
    return `Aporta ${bits.slice(0,3).join(", ")}.`;
  }

  function latestWeightStats(){
    const list = readJSON("weightHistory",[]).map(x=>({date:x.date,value:parseFloat(String(x.value??x.weight??"").replace(",","."))})).filter(x=>x.date&&Number.isFinite(x.value)).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    const last=list.at(-1), prev=list.at(-2); return {last, change:last&&prev ? +(last.value-prev.value).toFixed(2) : null};
  }

  function todaysPlan(){
    const plan=readJSON("weeklyPlan",{}); const days=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]; const day=days[new Date().getDay()];
    const slots=plan[day]||{}; const order=["Desayuno","Comida","Cena","Snack"];
    for(const slot of order){ const id=slots[slot]; if(id){ const recipe=recipeData.find(r=>String(r.id)===String(id)); if(recipe) return {slot,recipe}; } }
    return null;
  }

  function enhanceHome(){
    const section=document.querySelector("#content > section"); if(!section) return;
    const title=section.querySelector(".section-title"); if(!title || title.textContent.trim()!=="Inicio" || section.dataset.v3Home==="1") return;
    const profile=readJSON("babyProfile",{}), diary=readJSON("foodDiary",[]), ws=latestWeightStats(), next=todaysPlan();
    const hero=section.querySelector(".v2-home-hero");
    const anchor=hero || section.querySelector(".section-subtitle") || title;
    const block=document.createElement("div"); block.className="v3-dashboard";
    const delta = ws.change==null ? "—" : `${ws.change>0?"+":""}${ws.change.toFixed(2)} kg`;
    block.innerHTML=`
      <div class="v3-summary-card">
        <h3>Resumen rápido</h3>
        <div class="v3-stats-grid">
          <div><span>Edad</span><strong>${profile.birthDate ? calculateAgeFallback(profile.birthDate) : "—"}</strong></div>
          <div><span>Peso actual</span><strong>${profile.currentWeight || (ws.last?ws.last.value+" kg":"—")}</strong></div>
          <div><span>Altura</span><strong>${profile.currentHeight || "—"}</strong></div>
          <div><span>Evolución</span><strong>${delta}</strong><small>última medición</small></div>
        </div>
      </div>
      <div class="v3-next-card">
        <div><span>Próxima comida</span><strong>${next ? next.slot : "Plan sin completar"}</strong><p>${next ? next.recipe.nombre : "Añade recetas al plan semanal para verla aquí."}</p></div>
        ${next && (next.recipe.image||IMAGE_MAP[next.recipe.id]) ? `<img src="${next.recipe.image||IMAGE_MAP[next.recipe.id]}" alt="${next.recipe.nombre}">` : ""}
      </div>
      <div class="v3-quick-grid">
        <button data-v3="recipes">Recetas</button><button data-v3="plan">Plan semanal</button><button data-v3="profile">Evolución</button><button data-v3="shopping">Lista compra</button>
      </div>`;
    anchor.insertAdjacentElement("afterend",block);
    block.querySelector('[data-v3="recipes"]')?.addEventListener("click",()=>document.querySelector('.nav-btn[data-section="recetas"]')?.click());
    block.querySelector('[data-v3="plan"]')?.addEventListener("click",()=>document.querySelector('.nav-btn[data-section="plan"]')?.click());
    block.querySelector('[data-v3="profile"]')?.addEventListener("click",()=>document.querySelector('.nav-btn[data-section="perfil"]')?.click());
    block.querySelector('[data-v3="shopping"]')?.addEventListener("click",()=>document.getElementById("quick-shopping")?.click());
    section.dataset.v3Home="1";
  }

  function calculateAgeFallback(date){
    const b=new Date(date), n=new Date(); if(Number.isNaN(b.getTime())) return "—"; let m=(n.getFullYear()-b.getFullYear())*12+n.getMonth()-b.getMonth(); let d=n.getDate()-b.getDate(); if(d<0){m--; d+=new Date(n.getFullYear(),n.getMonth(),0).getDate();} return `${m}m ${d}d`;
  }

  function enhanceRecipeList(){
    const section=document.querySelector("#content > section"); if(!section || !section.querySelector("#recipe-search")) return;
    [...section.querySelectorAll(".recipe-detail-btn")].forEach(btn=>{
      const card=btn.closest(".card"); if(!card || card.dataset.v3Recipe==="1") return;
      const name=card.querySelector("h2")?.textContent.trim(); const recipe=recipeData.find(r=>r.nombre===name); if(!recipe) return;
      const src=recipe.image||IMAGE_MAP[recipe.id];
      if(src){ const media=document.createElement("div"); media.className="v3-recipe-media"; media.innerHTML=`<img src="${src}" alt="${recipe.nombre}" loading="lazy">`; card.insertBefore(media,card.firstChild); card.classList.add("v3-recipe-card"); }
      card.dataset.v3Recipe="1";
    });
  }

  function enhanceRecipeDetail(){
    const section=document.querySelector("#content > section"); if(!section || !section.querySelector("#back-recipes") || section.dataset.v3Detail==="1") return;
    const card=[...section.querySelectorAll(".card")].find(c=>c.querySelector("h2")); const name=card?.querySelector("h2")?.textContent.trim(); const recipe=recipeData.find(r=>r.nombre===name); if(!recipe) return;
    const src=recipe.image||IMAGE_MAP[recipe.id];
    if(src){ const hero=document.createElement("div"); hero.className="v3-detail-photo"; hero.innerHTML=`<img src="${src}" alt="${recipe.nombre}">`; section.querySelector("#back-recipes").insertAdjacentElement("afterend",hero); }
    const n=estimateNutrition(recipe); const info=document.createElement("div"); info.className="card v3-nutrition-card";
    info.innerHTML=`<h2>Qué aporta esta receta</h2><p>${contribution(recipe)}</p><div class="v3-macros"><div><strong>${n.kcal||"—"}</strong><span>kcal</span></div><div><strong>${n.carbs||"—"} g</strong><span>hidratos</span></div><div><strong>${n.protein||"—"} g</strong><span>proteínas</span></div><div><strong>${n.fat||"—"} g</strong><span>grasas</span></div></div><small class="v3-disclaimer">Valores estimados por ración a partir de los ingredientes indicados. Son orientativos y no sustituyen una valoración nutricional profesional.</small>`;
    card.insertAdjacentElement("afterend",info); section.dataset.v3Detail="1";
  }

  function process(){
    const section=document.querySelector("#content > section"); if(!section) return;
    if(section.querySelector("#recipe-search")) enhanceRecipeList();
    else if(section.querySelector("#back-recipes")) enhanceRecipeDetail();
    else if(section.querySelector(".section-title")?.textContent.trim()==="Inicio") enhanceHome();
  }

  document.addEventListener("DOMContentLoaded", async()=>{
    try{ recipeData=await fetch("data/recipes.json?v=27").then(r=>r.json()); }catch{ recipeData=[]; }
    const target=document.getElementById("content"); if(target) new MutationObserver(()=>requestAnimationFrame(process)).observe(target,{childList:true,subtree:false});
    requestAnimationFrame(process);
  });
})();