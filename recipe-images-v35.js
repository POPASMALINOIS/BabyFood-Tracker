(() => {
  const HD_IMAGES = {
    17: "assets/recipes/017-bocados-blw-guisantes-semola-trigo.png",
    18: "assets/recipes/018-cena-puerro-calabacin-pollo.png",
    19: "assets/recipes/019-potito-papaya-mango.png",
    20: "assets/recipes/020-ternera-calabaza-cuscus.png",
    21: "assets/recipes/021-pure-calabacin-patata-merluza.png",
    22: "assets/recipes/022-desayuno-mijo-platano.png",
    23: "assets/recipes/023-snack-mango-arroz.png",
    24: "assets/recipes/024-bocados-blw-patata-avena.png",
    25: "assets/recipes/025-cena-calabaza-zanahoria-pavo.png",
    26: "assets/recipes/026-potito-pera-arandanos.png",
    27: "assets/recipes/027-conejo-guisantes-quinoa.png",
    28: "assets/recipes/028-pure-puerro-calabacin-pollo.png",
    29: "assets/recipes/029-desayuno-maiz-papaya.png",
    30: "assets/recipes/030-snack-manzana-mijo.png"
  };

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const response = await nativeFetch(...args);
    const url = String(args[0] instanceof Request ? args[0].url : args[0] || "");
    if (!url.includes("data/recipes.json")) return response;

    try {
      const data = await response.clone().json();
      if (!Array.isArray(data)) return response;
      const patched = data.map(recipe => ({
        ...recipe,
        ...(HD_IMAGES[Number(recipe.id)] ? { image: HD_IMAGES[Number(recipe.id)] } : {})
      }));
      return new Response(JSON.stringify(patched), {
        status: response.status,
        statusText: response.statusText,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    } catch {
      return response;
    }
  };
})();