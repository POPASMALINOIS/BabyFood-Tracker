(() => {
  const HD_IMAGES = {
    "Bocados BLW de guisantes y sémola de trigo":"assets/recipes/017-bocados-blw-guisantes-semola-trigo.png",
    "Cena suave de puerro, calabacín y pollo":"assets/recipes/018-cena-puerro-calabacin-pollo.png",
    "Potito de papaya y mango":"assets/recipes/019-potito-papaya-mango.png",
    "Comida completa de ternera, calabaza y cuscús":"assets/recipes/020-ternera-calabaza-cuscus.png",
    "Puré de calabacín, patata y merluza":"assets/recipes/021-pure-calabacin-patata-merluza.png",
    "Desayuno cremoso de mijo con plátano":"assets/recipes/022-desayuno-mijo-platano.png",
    "Snack blando de mango y arroz":"assets/recipes/023-snack-mango-arroz.png",
    "Bocados BLW de patata y avena":"assets/recipes/024-bocados-blw-patata-avena.png",
    "Cena suave de calabaza, zanahoria y pavo":"assets/recipes/025-cena-calabaza-zanahoria-pavo.png",
    "Potito de pera y arándanos":"assets/recipes/026-potito-pera-arandanos.png",
    "Comida completa de conejo, guisantes y quinoa":"assets/recipes/027-conejo-guisantes-quinoa.png",
    "Puré de puerro, calabacín y pollo":"assets/recipes/028-pure-puerro-calabacin-pollo.png",
    "Desayuno cremoso de maíz con papaya":"assets/recipes/029-desayuno-maiz-papaya.png",
    "Snack blando de manzana y mijo":"assets/recipes/030-snack-manzana-mijo.png"
  };
  const norm=s=>String(s||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const map=new Map(Object.entries(HD_IMAGES).map(([k,v])=>[norm(k),v]));
  function apply(){
    document.querySelectorAll("#content .card").forEach(card=>{
      const title=card.querySelector("h2")?.textContent;
      const src=map.get(norm(title));
      if(!src)return;
      const img=card.querySelector(".v3-recipe-media img,.v3-detail-photo img");
      if(img && !img.src.includes(src)) img.src=`${src}?v=34`;
    });
    const next=document.querySelector(".v31-next-inner");
    if(next){const title=next.querySelector("p")?.textContent,src=map.get(norm(title)),img=next.querySelector("img");if(src&&img&&!img.src.includes(src))img.src=`${src}?v=34`;}
  }
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener("DOMContentLoaded",apply);
  setTimeout(apply,0);
})();
