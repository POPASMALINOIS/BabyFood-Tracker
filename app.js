document.addEventListener("DOMContentLoaded", async () => {
  const splash = document.getElementById("splash-screen");
  const app = document.getElementById("app");
  const content = document.getElementById("content");

  let recipes = [];

  const defaultProfile = {
    name: "",
    birthDate: "",
    currentWeight: "",
    currentHeight: "",
    notes: ""
  };

  const allergens = [
    "Huevo", "Leche", "Gluten", "Pescado", "Marisco", "Frutos secos",
    "Cacahuete", "Soja", "Sésamo", "Apio", "Mostaza", "Sulfitos"
  ];

  const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const mealSlots = ["Desayuno", "Comida", "Cena", "Snack"];

  function initStorage() {
    if (!localStorage.getItem("babyProfile")) localStorage.setItem("babyProfile", JSON.stringify(defaultProfile));
    if (!localStorage.getItem("foodDiary")) localStorage.setItem("foodDiary", JSON.stringify([]));
    if (!localStorage.getItem("allergenDiary")) localStorage.setItem("allergenDiary", JSON.stringify({}));
    if (!localStorage.getItem("favoriteRecipes")) localStorage.setItem("favoriteRecipes", JSON.stringify([]));
    if (!localStorage.getItem("shoppingList")) localStorage.setItem("shoppingList", JSON.stringify([]));
    if (!localStorage.getItem("weightHistory")) localStorage.setItem("weightHistory", JSON.stringify([]));
    if (!localStorage.getItem("weeklyPlan")) localStorage.setItem("weeklyPlan", JSON.stringify({}));
  }

  initStorage();

  let babyProfile = JSON.parse(localStorage.getItem("babyProfile"));

  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.style.display = "none";
      app.classList.remove("hidden");
    }, 1200);
  }, 3200);

  async function loadRecipes() {
    try {
      const response = await fetch("data/recipes.json");
      recipes = await response.json();
    } catch (error) {
      console.error("Error cargando recetas:", error);
      recipes = [];
    }
  }

  await loadRecipes();

  function calculateAge(birthDate) {
    if (!birthDate) return "Pendiente";
    const birth = new Date(birthDate);
    const today = new Date();
    if (Number.isNaN(birth.getTime())) return "Pendiente";

    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) return "Pendiente";
    return `${months} meses y ${days} días`;
  }

  function setActive(section) {
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.section === section);
    });
  }

  function getLastFood() {
    const diary = JSON.parse(localStorage.getItem("foodDiary")) || [];
    if (!diary.length) return "Sin registros";
    return diary[diary.length - 1].food;
  }

  function showDashboard() {
    babyProfile = JSON.parse(localStorage.getItem("babyProfile")) || defaultProfile;

    const diary = JSON.parse(localStorage.getItem("foodDiary")) || [];
    const favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
    const shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];
    const weightHistory = JSON.parse(localStorage.getItem("weightHistory")) || [];
    const lastEntries = diary.slice().reverse().slice(0, 3);

    content.innerHTML = `
      <section>
        <h2 class="section-title">Inicio</h2>
        <p class="section-subtitle">Resumen rápido de alimentación, perfil, favoritos y planificación.</p>

        ${!babyProfile.name || !babyProfile.birthDate ? `
          <div class="card">
            <h2>Completa el perfil del bebé</h2>
            <p>Rellena nombre, fecha de nacimiento, peso y talla para personalizar la app.</p>
            <button id="go-profile" class="primary-btn">Abrir perfil</button>
          </div>
        ` : ""}

        <div class="dashboard-grid">
          <div class="card">
            <h2>${babyProfile.name || "Mi bebé"}</h2>
            <p class="big-value">${calculateAge(babyProfile.birthDate)}</p>
          </div>

          <div class="card compact">
            <h2>Peso</h2>
            <p class="big-value">${babyProfile.currentWeight || "Pendiente"}</p>
          </div>

          <div class="card compact">
            <h2>Último</h2>
            <p class="big-value">${getLastFood()}</p>
          </div>
        </div>

        <div class="quick-actions">
          <button id="quick-register" class="primary-btn">Registrar comida</button>
          <button id="quick-recipes" class="secondary-btn">Ver recetas</button>
        </div>

        <div class="quick-actions">
          <button id="quick-plan" class="secondary-btn">Plan semanal</button>
          <button id="quick-shopping" class="secondary-btn">Compra (${shoppingList.length})</button>
        </div>

        <div class="card">
          <h2>Últimos registros</h2>
          ${
            lastEntries.length
              ? lastEntries.map(entry => `
                <p><strong>${entry.food}</strong> · ${entry.date}</p>
                <p>${entry.amount} · ${entry.reaction}${entry.allergen ? ` · ${entry.allergen}` : ""}</p>
              `).join("")
              : `<p>Todavía no hay comidas registradas.</p>`
          }
        </div>

        <div class="card">
          <h2>Favoritos y peso</h2>
          <p><strong>Recetas favoritas:</strong> ${favorites.length}</p>
          <p><strong>Últimos pesos:</strong> ${weightHistory.length}</p>
        </div>
      </section>
    `;

    const goProfile = document.getElementById("go-profile");
    if (goProfile) {
      goProfile.addEventListener("click", () => {
        setActive("perfil");
        showProfile();
      });
    }

    document.getElementById("quick-register").addEventListener("click", () => {
      setActive("");
      showFoodForm();
    });

    document.getElementById("quick-recipes").addEventListener("click", () => {
      setActive("recetas");
      showRecipes();
    });

    document.getElementById("quick-plan").addEventListener("click", () => {
      setActive("plan");
      showWeeklyPlan();
    });

    document.getElementById("quick-shopping").addEventListener("click", () => {
      setActive("recetas");
      showShoppingList();
    });
  }

  function showRecipes(filter = "Todas", ageFilter = "Todas", searchTerm = "") {
    const categories = ["Todas", "Puré", "Potito fruta", "BLW", "Desayuno", "Comida", "Cena", "Snack"];
    const ages = ["Todas", "6 meses", "7 meses", "8 meses", "9 meses", "10 meses", "12 meses"];
    const favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
    const normalizedSearch = searchTerm.toLowerCase().trim();

    const filtered = recipes.filter(recipe => {
      const ingredients = Array.isArray(recipe.ingredientes) ? recipe.ingredientes.join(" ") : "";
      const categoryMatch = filter === "Todas" || recipe.tipo === filter || recipe.categoria === filter;
      const ageMatch = ageFilter === "Todas" || recipe.edad_minima === ageFilter;
      const searchMatch =
        !normalizedSearch ||
        recipe.nombre.toLowerCase().includes(normalizedSearch) ||
        recipe.tipo.toLowerCase().includes(normalizedSearch) ||
        recipe.edad_minima.toLowerCase().includes(normalizedSearch) ||
        ingredients.toLowerCase().includes(normalizedSearch);

      return categoryMatch && ageMatch && searchMatch;
    });

    content.innerHTML = `
      <section>
        <h2 class="section-title">Recetas</h2>
        <p class="section-subtitle">${filtered.length} recetas encontradas.</p>

        <div class="card compact">
          <label for="recipe-search">Buscar receta o ingrediente</label>
          <input id="recipe-search" type="text" placeholder="Ej. pollo, avena, manzana..." value="${searchTerm}">

          <label for="age-filter">Filtrar por edad</label>
          <select id="age-filter">
            ${ages.map(age => `<option value="${age}" ${age === ageFilter ? "selected" : ""}>${age}</option>`).join("")}
          </select>

          <label for="category-filter">Filtrar por tipo</label>
          <select id="category-filter">
            ${categories.map(cat => `<option value="${cat}" ${cat === filter ? "selected" : ""}>${cat}</option>`).join("")}
          </select>

          <div class="quick-actions">
            <button id="show-favorites" class="secondary-btn">Favoritos</button>
            <button id="show-shopping" class="secondary-btn">Lista compra</button>
          </div>
        </div>

        ${
          filtered.length
            ? filtered.map(recipe => {
              const isFavorite = favorites.includes(Number(recipe.id));
              return `
                <div class="card">
                  <h2>${recipe.nombre}</h2>
                  <p><strong>Tipo:</strong> ${recipe.tipo}</p>
                  <p><strong>Edad:</strong> ${recipe.edad_minima}</p>
                  <p><strong>Tiempo:</strong> ${recipe.tiempo}</p>
                  <p><strong>Textura:</strong> ${recipe.textura}</p>

                  <div class="tag-row">
                    ${
                      recipe.alergenos && recipe.alergenos.length
                        ? recipe.alergenos.map(a => `<span class="tag warning-tag">${a}</span>`).join("")
                        : `<span class="tag">Sin alérgenos principales</span>`
                    }
                  </div>

                  <div class="quick-actions">
                    <button class="secondary-btn recipe-detail-btn" data-id="${recipe.id}">Ver receta</button>
                    <button class="secondary-btn favorite-btn" data-id="${recipe.id}">
                      ${isFavorite ? "★ Favorita" : "☆ Favorito"}
                    </button>
                  </div>
                </div>
              `;
            }).join("")
            : `
              <div class="card">
                <h2>No hay recetas para este filtro</h2>
                <p>Prueba con otra edad, categoría o ingrediente.</p>
              </div>
            `
        }
      </section>
    `;

    document.getElementById("recipe-search").addEventListener("input", event => {
      showRecipes(
        document.getElementById("category-filter").value,
        document.getElementById("age-filter").value,
        event.target.value
      );
    });

    document.getElementById("age-filter").addEventListener("change", event => {
      showRecipes(
        document.getElementById("category-filter").value,
        event.target.value,
        document.getElementById("recipe-search").value
      );
    });

    document.getElementById("category-filter").addEventListener("change", event => {
      showRecipes(
        event.target.value,
        document.getElementById("age-filter").value,
        document.getElementById("recipe-search").value
      );
    });

    document.getElementById("show-favorites").addEventListener("click", showFavorites);
    document.getElementById("show-shopping").addEventListener("click", showShoppingList);

    document.querySelectorAll(".recipe-detail-btn").forEach(button => {
      button.addEventListener("click", () => showRecipeDetail(Number(button.dataset.id)));
    });

    document.querySelectorAll(".favorite-btn").forEach(button => {
      button.addEventListener("click", () => {
        toggleFavorite(Number(button.dataset.id));
        showRecipes(filter, ageFilter, searchTerm);
      });
    });
  }

  function toggleFavorite(recipeId) {
    let favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];

    if (favorites.includes(recipeId)) {
      favorites = favorites.filter(id => id !== recipeId);
    } else {
      favorites.push(recipeId);
    }

    localStorage.setItem("favoriteRecipes", JSON.stringify(favorites));
  }

  function showFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
    const favoriteRecipes = recipes.filter(recipe => favorites.includes(Number(recipe.id)));

    content.innerHTML = `
      <section>
        <h2 class="section-title">Favoritos</h2>
        <p class="section-subtitle">Recetas guardadas para tenerlas siempre a mano.</p>

        <button id="back-recipes" class="secondary-btn">← Volver a recetas</button>

        ${
          favoriteRecipes.length
            ? favoriteRecipes.map(recipe => `
              <div class="card">
                <h2>${recipe.nombre}</h2>
                <p><strong>Edad:</strong> ${recipe.edad_minima}</p>
                <p><strong>Tipo:</strong> ${recipe.tipo}</p>
                <p><strong>Tiempo:</strong> ${recipe.tiempo}</p>

                <div class="quick-actions">
                  <button class="secondary-btn recipe-detail-btn" data-id="${recipe.id}">Ver receta</button>
                  <button class="danger-btn remove-favorite-btn" data-id="${recipe.id}">Quitar</button>
                </div>
              </div>
            `).join("")
            : `
              <div class="card">
                <h2>Aún no tienes favoritos</h2>
                <p>Marca recetas con ☆ Favorito para verlas aquí.</p>
              </div>
            `
        }
      </section>
    `;

    document.getElementById("back-recipes").addEventListener("click", () => showRecipes());

    document.querySelectorAll(".recipe-detail-btn").forEach(button => {
      button.addEventListener("click", () => showRecipeDetail(Number(button.dataset.id)));
    });

    document.querySelectorAll(".remove-favorite-btn").forEach(button => {
      button.addEventListener("click", () => {
        toggleFavorite(Number(button.dataset.id));
        showFavorites();
      });
    });
  }

  function showRecipeDetail(id) {
    const recipe = recipes.find(r => Number(r.id) === Number(id));

    if (!recipe) {
      showRecipes();
      return;
    }

    const favorites = JSON.parse(localStorage.getItem("favoriteRecipes")) || [];
    const isFavorite = favorites.includes(Number(recipe.id));

    content.innerHTML = `
      <section>
        <button id="back-recipes" class="secondary-btn">← Volver a recetas</button>

        <div class="card">
          <h2>${recipe.nombre}</h2>
          <p><strong>Tipo:</strong> ${recipe.tipo}</p>
          <p><strong>Edad:</strong> ${recipe.edad_minima}</p>
          <p><strong>Tiempo:</strong> ${recipe.tiempo}</p>
          <p><strong>Textura:</strong> ${recipe.textura}</p>
          <p><strong>Raciones:</strong> ${recipe.raciones}</p>

          <div class="tag-row">
            ${
              recipe.alergenos && recipe.alergenos.length
                ? recipe.alergenos.map(a => `<span class="tag warning-tag">${a}</span>`).join("")
                : `<span class="tag">Sin alérgenos principales</span>`
            }
          </div>
        </div>

        <div class="card">
          <h2>Ingredientes con cantidades</h2>
          ${recipe.ingredientes.map(item => `<p>• ${item}</p>`).join("")}
        </div>

        <div class="card">
          <h2>Preparación</h2>
          <ol class="recipe-steps">
            ${recipe.preparacion.map(step => `<li>${step}</li>`).join("")}
          </ol>
        </div>

        <div class="card">
          <h2>Conservación y seguridad</h2>
          <p><strong>Conservación:</strong> ${recipe.conservacion}</p>
          <p><strong>Consejo:</strong> ${recipe.notas}</p>
        </div>

        <div class="quick-actions">
          <button id="register-recipe" class="primary-btn">Registrar comida</button>
          <button id="favorite-recipe" class="secondary-btn">${isFavorite ? "★ Favorita" : "☆ Favorito"}</button>
        </div>

        <div class="quick-actions">
          <button id="add-plan" class="primary-btn">Añadir al plan</button>
          <button id="add-shopping" class="secondary-btn">Añadir a compra</button>
        </div>
      </section>
    `;

    document.getElementById("back-recipes").addEventListener("click", () => showRecipes());

    document.getElementById("register-recipe").addEventListener("click", () => {
      showFoodForm(recipe.nombre);
    });

    document.getElementById("favorite-recipe").addEventListener("click", () => {
      toggleFavorite(Number(recipe.id));
      showRecipeDetail(recipe.id);
    });

    document.getElementById("add-shopping").addEventListener("click", () => {
      addRecipeToShoppingList(recipe);
      showShoppingList();
    });

    document.getElementById("add-plan").addEventListener("click", () => {
      showAddRecipeToPlanModal(recipe);
    });
  }

  function showAddRecipeToPlanModal(recipe) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    modal.innerHTML = `
      <div class="modal-box">
        <h2>Añadir al plan</h2>
        <p><strong>${recipe.nombre}</strong></p>
        <p>Elige el día y el momento en el que quieres incluir esta receta.</p>

        <div class="form-group" style="text-align:left;">
          <label for="plan-day">Día</label>
          <select id="plan-day">
            ${weekDays.map(day => `<option value="${day}">${day}</option>`).join("")}
          </select>
        </div>

        <div class="form-group" style="text-align:left;">
          <label for="plan-slot">Momento</label>
          <select id="plan-slot">
            ${mealSlots.map(slot => `<option value="${slot}">${slot}</option>`).join("")}
          </select>
        </div>

        <div class="modal-actions">
          <button id="cancel-plan" class="secondary-btn">Cancelar</button>
          <button id="confirm-plan" class="primary-btn">Guardar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("cancel-plan").addEventListener("click", () => {
      modal.remove();
    });

    document.getElementById("confirm-plan").addEventListener("click", () => {
      const day = document.getElementById("plan-day").value;
      const slot = document.getElementById("plan-slot").value;
      const plan = getWeeklyPlan();

      plan[day][slot] = String(recipe.id);
      localStorage.setItem("weeklyPlan", JSON.stringify(plan));

      modal.remove();
      setActive("plan");
      showWeeklyPlan();
    });
  }

  function getProductDataFromIngredient(ingredient) {
    const lower = ingredient.toLowerCase();

    const ignoredItems = [
      "agua", "agua hasta cubrir", "agua o caldo casero sin sal",
      "caldo casero sin sal", "aceite", "aceite de oliva virgen extra",
      "canela opcional", "leche habitual del bebé"
    ];

    if (ignoredItems.some(item => lower.includes(item))) return null;

    const productMap = {
      "calabaza": { name: "Calabaza", category: "Verdura" },
      "patata": { name: "Patatas", category: "Verdura" },
      "boniato": { name: "Boniatos", category: "Verdura" },
      "calabacín": { name: "Calabacines", category: "Verdura" },
      "zanahoria": { name: "Zanahorias", category: "Verdura" },
      "brócoli": { name: "Brócoli", category: "Verdura" },
      "judía verde": { name: "Judías verdes", category: "Verdura" },
      "guisantes": { name: "Guisantes", category: "Verdura" },
      "puerro": { name: "Puerros", category: "Verdura" },
      "coliflor": { name: "Coliflor", category: "Verdura" },

      "manzana": { name: "Manzanas", category: "Fruta" },
      "pera": { name: "Peras", category: "Fruta" },
      "plátano": { name: "Plátanos", category: "Fruta" },
      "aguacate": { name: "Aguacates", category: "Fruta" },
      "mango": { name: "Mango", category: "Fruta" },
      "melocotón": { name: "Melocotones", category: "Fruta" },
      "ciruela": { name: "Ciruelas", category: "Fruta" },
      "fresa": { name: "Fresas", category: "Fruta" },
      "arándanos": { name: "Arándanos", category: "Fruta" },
      "kiwi": { name: "Kiwis", category: "Fruta" },
      "papaya": { name: "Papaya", category: "Fruta" },

      "pollo": { name: "Pollo", category: "Proteína" },
      "pavo": { name: "Pavo", category: "Proteína" },
      "ternera": { name: "Ternera", category: "Proteína" },
      "conejo": { name: "Conejo", category: "Proteína" },
      "huevo": { name: "Huevos", category: "Proteína" },
      "merluza": { name: "Merluza", category: "Pescado" },
      "salmón": { name: "Salmón", category: "Pescado" },
      "bacalao": { name: "Bacalao fresco", category: "Pescado" },

      "arroz": { name: "Arroz", category: "Cereales" },
      "avena": { name: "Avena", category: "Cereales" },
      "quinoa": { name: "Quinoa", category: "Cereales" },
      "cuscús": { name: "Cuscús", category: "Cereales" },
      "maíz": { name: "Maíz", category: "Cereales" },
      "mijo": { name: "Mijo", category: "Cereales" },
      "pasta": { name: "Pasta pequeña", category: "Cereales" },
      "sémola": { name: "Sémola de trigo", category: "Cereales" },

      "lentejas": { name: "Lentejas", category: "Legumbres" },
      "garbanzos": { name: "Garbanzos", category: "Legumbres" }
    };

    for (const key of Object.keys(productMap)) {
      if (lower.includes(key)) return productMap[key];
    }

    return null;
  }

  function addRecipeToShoppingList(recipe) {
    const shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];
    const productsToAdd = [];

    recipe.ingredientes.forEach(ingredient => {
      const product = getProductDataFromIngredient(ingredient);
      if (!product) return;

      const alreadyInBatch = productsToAdd.some(item => item.name === product.name);
      const alreadyInList = shoppingList.some(item => item.text === product.name);

      if (!alreadyInBatch && !alreadyInList) {
        productsToAdd.push(product);
      }
    });

    productsToAdd.forEach(product => {
      shoppingList.push({
        id: Date.now() + Math.random(),
        text: product.name,
        category: product.category,
        recipe: recipe.nombre,
        checked: false
      });
    });

    localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
  }

  function showShoppingList() {
    const shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];
    const categories = ["Fruta", "Verdura", "Proteína", "Pescado", "Cereales", "Legumbres", "Otros"];
    const totalItems = shoppingList.length;
    const checkedItems = shoppingList.filter(item => item.checked).length;

    content.innerHTML = `
      <section>
        <h2 class="section-title">Lista de compra</h2>
        <p class="section-subtitle">${totalItems} productos · ${checkedItems} comprados</p>

        <button id="back-recipes" class="secondary-btn">← Volver a recetas</button>

        ${
          totalItems
            ? categories.map(category => {
              const items = shoppingList.filter(item => (item.category || "Otros") === category);
              if (!items.length) return "";

              return `
                <div class="card">
                  <h2>${category}</h2>

                  ${items.map(item => `
                    <div class="shopping-item">
                      <label>
                        <input type="checkbox" class="shopping-check" data-id="${item.id}" ${item.checked ? "checked" : ""}>
                        <span style="${item.checked ? "text-decoration: line-through; opacity: .55;" : ""}">
                          ${item.text}
                        </span>
                      </label>
                      <p><small>Añadido desde: ${item.recipe}</small></p>
                    </div>
                  `).join("")}
                </div>
              `;
            }).join("")
            : `
              <div class="card">
                <h2>Lista vacía</h2>
                <p>Entra en una receta o en el plan semanal y añade ingredientes a la lista de compra.</p>
              </div>
            `
        }

        ${
          totalItems
            ? `
              <div class="quick-actions">
                <button id="clear-checked" class="secondary-btn">Borrar comprados</button>
                <button id="clear-shopping" class="danger-btn">Vaciar todo</button>
              </div>
            `
            : ""
        }
      </section>
    `;

    document.getElementById("back-recipes").addEventListener("click", () => showRecipes());

    document.querySelectorAll(".shopping-check").forEach(check => {
      check.addEventListener("change", () => {
        toggleShoppingItem(check.dataset.id);
        showShoppingList();
      });
    });

    const clearCheckedBtn = document.getElementById("clear-checked");
    if (clearCheckedBtn) {
      clearCheckedBtn.addEventListener("click", () => {
        const updatedList = shoppingList.filter(item => !item.checked);
        localStorage.setItem("shoppingList", JSON.stringify(updatedList));
        showShoppingList();
      });
    }

    const clearBtn = document.getElementById("clear-shopping");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        localStorage.setItem("shoppingList", JSON.stringify([]));
        showShoppingList();
      });
    }
  }

  function toggleShoppingItem(id) {
    const shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];
    const updated = shoppingList.map(item => {
      if (String(item.id) === String(id)) return { ...item, checked: !item.checked };
      return item;
    });

    localStorage.setItem("shoppingList", JSON.stringify(updated));
  }

  function getEmptyWeeklyPlan() {
    const plan = {};
    weekDays.forEach(day => {
      plan[day] = {};
      mealSlots.forEach(slot => {
        plan[day][slot] = "";
      });
    });
    return plan;
  }

  function getWeeklyPlan() {
    const saved = JSON.parse(localStorage.getItem("weeklyPlan")) || {};
    const base = getEmptyWeeklyPlan();

    weekDays.forEach(day => {
      mealSlots.forEach(slot => {
        if (saved[day] && saved[day][slot]) {
          base[day][slot] = saved[day][slot];
        }
      });
    });

    return base;
  }

  function getRecipeById(id) {
  return recipes.find(item => String(item.id) === String(id));
}

function getRecipeNameById(id) {
  const recipe = getRecipeById(id);
  return recipe ? recipe.nombre : "";
}

function showWeeklyPlan() {
  const plan = getWeeklyPlan();

  content.innerHTML = `
    <section>
      <h2 class="section-title">Plan semanal</h2>
      <p class="section-subtitle">Planifica la semana viendo cada comida de forma clara.</p>

      <div class="quick-actions">
        <button id="weekly-shopping" class="secondary-btn">Añadir compra semanal</button>
        <button id="clear-weekly-plan" class="danger-btn">Borrar plan</button>
      </div>

      ${weekDays.map(day => `
        <div class="card weekly-day-card">
          <h2>${day}</h2>

          ${mealSlots.map(slot => {
            const recipeId = plan[day][slot];
            const recipe = getRecipeById(recipeId);

            return `
              <div class="weekly-slot">
                <div class="weekly-slot-header">
                  <strong>${slot}</strong>
                  ${recipe ? `<span>${recipe.edad_minima}</span>` : `<span>Pendiente</span>`}
                </div>

                ${
                  recipe
                    ? `
                      <p class="weekly-recipe-name">${recipe.nombre}</p>
                      <p class="weekly-recipe-meta">${recipe.tipo} · ${recipe.tiempo} · ${recipe.textura}</p>

                      <div class="weekly-actions">
                        <button class="secondary-btn weekly-view" data-id="${recipe.id}">Ver</button>
                        <button class="secondary-btn weekly-change" data-day="${day}" data-slot="${slot}">Cambiar</button>
                        <button class="danger-btn weekly-remove" data-day="${day}" data-slot="${slot}">Eliminar</button>
                      </div>
                    `
                    : `
                      <p class="weekly-empty">Sin receta asignada</p>
                      <button class="secondary-btn weekly-change" data-day="${day}" data-slot="${slot}">Añadir receta</button>
                    `
                }
              </div>
            `;
          }).join("")}
        </div>
      `).join("")}
    </section>
  `;

  document.getElementById("weekly-shopping").addEventListener("click", addWeeklyPlanToShoppingList);

  document.getElementById("clear-weekly-plan").addEventListener("click", () => {
    localStorage.setItem("weeklyPlan", JSON.stringify(getEmptyWeeklyPlan()));
    showWeeklyPlan();
  });

  document.querySelectorAll(".weekly-view").forEach(button => {
    button.addEventListener("click", () => {
      showRecipeDetail(Number(button.dataset.id));
    });
  });

  document.querySelectorAll(".weekly-change").forEach(button => {
    button.addEventListener("click", () => {
      showChangePlanSlotModal(button.dataset.day, button.dataset.slot);
    });
  });

  document.querySelectorAll(".weekly-remove").forEach(button => {
    button.addEventListener("click", () => {
      const plan = getWeeklyPlan();
      plan[button.dataset.day][button.dataset.slot] = "";
      localStorage.setItem("weeklyPlan", JSON.stringify(plan));
      showWeeklyPlan();
    });
  });
}

function showChangePlanSlotModal(day, slot) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-box">
      <h2>${day} · ${slot}</h2>
      <p>Selecciona una receta para este momento del día.</p>

      <div class="form-group" style="text-align:left;">
        <label for="plan-recipe-select">Receta</label>
        <select id="plan-recipe-select">
          <option value="">Sin asignar</option>
          ${recipes.map(recipe => `
            <option value="${recipe.id}">${recipe.nombre} · ${recipe.edad_minima}</option>
          `).join("")}
        </select>
      </div>

      <div class="modal-actions">
        <button id="cancel-change-plan" class="secondary-btn">Cancelar</button>
        <button id="confirm-change-plan" class="primary-btn">Guardar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("cancel-change-plan").addEventListener("click", () => {
    modal.remove();
  });

  document.getElementById("confirm-change-plan").addEventListener("click", () => {
    const plan = getWeeklyPlan();
    plan[day][slot] = document.getElementById("plan-recipe-select").value;
    localStorage.setItem("weeklyPlan", JSON.stringify(plan));
    modal.remove();
    showWeeklyPlan();
  });
}

function saveWeeklyPlan() {
  localStorage.setItem("weeklyPlan", JSON.stringify(getWeeklyPlan()));
  showWeeklyPlan();
}

function addWeeklyPlanToShoppingList() {
  const plan = getWeeklyPlan();
  const selectedIds = [];

  weekDays.forEach(day => {
    mealSlots.forEach(slot => {
      const id = plan[day][slot];
      if (id && !selectedIds.includes(id)) selectedIds.push(id);
    });
  });

  selectedIds.forEach(id => {
    const recipe = getRecipeById(id);
    if (recipe) addRecipeToShoppingList(recipe);
  });

  showShoppingList();
}

  function showAllergens() {
  const allergenDiary = JSON.parse(localStorage.getItem("allergenDiary")) || {};

  content.innerHTML = `
    <section>
      <button id="back-profile" class="secondary-btn">← Volver al perfil</button>

      <h2 class="section-title">Alérgenos</h2>
      <p class="section-subtitle">Control de exposición: qué tomó, cuándo y reacción observada.</p>

      <div class="allergen-grid">
        ${allergens.map(allergen => {
          const info = allergenDiary[allergen];

          return `
            <div class="card compact allergen-card">
              <div>
                <h2>${allergen}</h2>
                <p>${info ? `Último: ${info.date}` : "Sin introducir"}</p>
                <p>${info ? `Comida: ${info.food}` : "Pendiente de registrar"}</p>
                <p>${info ? `Reacción: ${info.reaction}` : ""}</p>
              </div>
              <span class="allergen-status">${info ? "Probado" : "Pendiente"}</span>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;

  document.getElementById("back-profile").addEventListener("click", () => {
    setActive("perfil");
    showProfile();
  });
}
  
  function showProfile() {
  babyProfile = JSON.parse(localStorage.getItem("babyProfile")) || defaultProfile;
  const weightHistory = JSON.parse(localStorage.getItem("weightHistory")) || [];
  const allergenDiary = JSON.parse(localStorage.getItem("allergenDiary")) || {};
  const testedAllergens = Object.keys(allergenDiary).length;

  content.innerHTML = `
    <section>
      <h2 class="section-title">Perfil</h2>
      <p class="section-subtitle">Datos del bebé, peso, evolución y control de alérgenos.</p>

      <div class="card form-card">
        <div class="form-group">
          <label for="profile-name">Nombre del bebé</label>
          <input id="profile-name" type="text" placeholder="Ej. Lucas" value="${babyProfile.name || ""}">
        </div>

        <div class="form-group">
          <label for="profile-birth">Fecha de nacimiento</label>
          <input id="profile-birth" type="date" value="${babyProfile.birthDate || ""}">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="profile-weight">Peso actual</label>
            <input id="profile-weight" type="text" placeholder="Ej. 7,8 kg" value="${babyProfile.currentWeight || ""}">
          </div>

          <div class="form-group">
            <label for="profile-height">Talla actual</label>
            <input id="profile-height" type="text" placeholder="Ej. 68 cm" value="${babyProfile.currentHeight || ""}">
          </div>
        </div>

        <div class="form-group">
          <label for="profile-notes">Observaciones</label>
          <textarea id="profile-notes" placeholder="Ej. lactancia, preferencias, recomendaciones pediatra...">${babyProfile.notes || ""}</textarea>
        </div>

        <button id="save-profile" class="primary-btn">Guardar perfil</button>
        <button id="delete-profile" class="danger-btn" style="margin-top:12px;">Borrar perfil y datos</button>
      </div>

      <div class="card">
        <h2>Resumen</h2>
        <p><strong>Edad:</strong> ${calculateAge(babyProfile.birthDate)}</p>
        <p><strong>Peso:</strong> ${babyProfile.currentWeight || "Pendiente"}</p>
        <p><strong>Talla:</strong> ${babyProfile.currentHeight || "Pendiente"}</p>
      </div>

      <div class="card">
        <h2>Control de alérgenos</h2>
        <p><strong>Probados:</strong> ${testedAllergens} de ${allergens.length}</p>
        <p>Consulta qué alérgenos se han introducido, cuándo y con qué reacción.</p>
        <button id="open-allergens" class="secondary-btn">Ver alérgenos</button>
      </div>

      <div class="card form-card">
        <h2>Historial de peso</h2>

        <div class="form-row">
          <div class="form-group">
            <label for="weight-date">Fecha</label>
            <input id="weight-date" type="date" value="${new Date().toISOString().split("T")[0]}">
          </div>

          <div class="form-group">
            <label for="weight-value">Peso</label>
            <input id="weight-value" type="text" placeholder="Ej. 7,8 kg">
          </div>
        </div>

        <button id="save-weight" class="secondary-btn">Añadir peso</button>

        <div style="margin-top: 16px;">
          ${
            weightHistory.length
              ? weightHistory.slice().reverse().map(item => `<p><strong>${item.weight}</strong> · ${item.date}</p>`).join("")
              : `<p>No hay pesos registrados.</p>`
          }
        </div>
      </div>
    </section>
  `;

  document.getElementById("save-profile").addEventListener("click", saveProfile);
  document.getElementById("delete-profile").addEventListener("click", showDeleteProfileModal);
  document.getElementById("save-weight").addEventListener("click", saveWeight);
  document.getElementById("open-allergens").addEventListener("click", showAllergens);
}

  function saveProfile() {
    const updatedProfile = {
      name: document.getElementById("profile-name").value.trim(),
      birthDate: document.getElementById("profile-birth").value,
      currentWeight: document.getElementById("profile-weight").value.trim(),
      currentHeight: document.getElementById("profile-height").value.trim(),
      notes: document.getElementById("profile-notes").value.trim()
    };

    localStorage.setItem("babyProfile", JSON.stringify(updatedProfile));
    babyProfile = updatedProfile;

    showDashboard();
    setActive("inicio");
  }

  function saveWeight() {
    const date = document.getElementById("weight-date").value;
    const weight = document.getElementById("weight-value").value.trim();

    if (!date || !weight) {
      alert("Indica fecha y peso.");
      return;
    }

    const history = JSON.parse(localStorage.getItem("weightHistory")) || [];
    history.push({ date, weight });
    localStorage.setItem("weightHistory", JSON.stringify(history));

    babyProfile.currentWeight = weight;
    localStorage.setItem("babyProfile", JSON.stringify(babyProfile));

    showProfile();
  }

  function showDeleteProfileModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    modal.innerHTML = `
      <div class="modal-box">
        <h2>Borrar perfil</h2>
        <p>Vas a borrar el perfil del bebé, el diario de comidas, favoritos, lista de compra, pesos, plan semanal y alérgenos guardados en este dispositivo. Esta acción no se puede deshacer.</p>

        <div class="modal-actions">
          <button id="cancel-delete" class="secondary-btn">Cancelar</button>
          <button id="confirm-delete" class="danger-btn">Borrar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("cancel-delete").addEventListener("click", () => modal.remove());

    document.getElementById("confirm-delete").addEventListener("click", () => {
      localStorage.removeItem("babyProfile");
      localStorage.removeItem("foodDiary");
      localStorage.removeItem("allergenDiary");
      localStorage.removeItem("favoriteRecipes");
      localStorage.removeItem("shoppingList");
      localStorage.removeItem("weightHistory");
      localStorage.removeItem("weeklyPlan");

      initStorage();
      babyProfile = JSON.parse(localStorage.getItem("babyProfile"));
      modal.remove();

      setActive("perfil");
      showProfile();
    });
  }

  function showFoodForm(prefilledFood = "") {
    content.innerHTML = `
      <section>
        <h2 class="section-title">Registrar comida</h2>
        <p class="section-subtitle">Añade alimento, cantidad, reacción y posible alérgeno.</p>

        <div class="card form-card">
          <div class="form-group">
            <label for="food-input">Alimento o receta</label>
            <input id="food-input" type="text" placeholder="Ej. Puré de calabaza y pollo" value="${prefilledFood}">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="amount-input">Cantidad</label>
              <select id="amount-input">
                <option value="Probó un poco">Probó un poco</option>
                <option value="Comió bien">Comió bien</option>
                <option value="Comió bastante">Comió bastante</option>
                <option value="No quiso">No quiso</option>
              </select>
            </div>

            <div class="form-group">
              <label for="reaction-input">Reacción</label>
              <select id="reaction-input">
                <option value="Sin reacción">Sin reacción</option>
                <option value="Gases">Gases</option>
                <option value="Estreñimiento">Estreñimiento</option>
                <option value="Diarrea">Diarrea</option>
                <option value="Vómitos">Vómitos</option>
                <option value="Ronchas o piel roja">Ronchas o piel roja</option>
                <option value="Otra reacción">Otra reacción</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="allergen-input">Alérgeno relacionado</label>
            <select id="allergen-input">
              <option value="">Ninguno / no aplica</option>
              ${allergens.map(a => `<option value="${a}">${a}</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label for="notes-input">Notas</label>
            <textarea id="notes-input" placeholder="Textura, aceptación, preparación, reacción..."></textarea>
          </div>

          <button id="save-food-entry" class="primary-btn">Guardar registro</button>
        </div>
      </section>
    `;

    document.getElementById("save-food-entry").addEventListener("click", saveFoodEntry);
  }

  function saveFoodEntry() {
    const food = document.getElementById("food-input").value.trim();
    const amount = document.getElementById("amount-input").value;
    const reaction = document.getElementById("reaction-input").value;
    const allergen = document.getElementById("allergen-input").value;
    const notes = document.getElementById("notes-input").value.trim();

    if (!food) {
      alert("Indica el alimento o receta.");
      return;
    }

    const entry = {
      food,
      amount,
      reaction,
      allergen,
      notes: notes || "Sin notas",
      date: new Date().toLocaleDateString("es-ES")
    };

    const diary = JSON.parse(localStorage.getItem("foodDiary")) || [];
    diary.push(entry);
    localStorage.setItem("foodDiary", JSON.stringify(diary));

    if (allergen) {
      const allergenDiary = JSON.parse(localStorage.getItem("allergenDiary")) || {};
      allergenDiary[allergen] = {
        food,
        reaction,
        date: entry.date,
        notes: entry.notes
      };
      localStorage.setItem("allergenDiary", JSON.stringify(allergenDiary));
    }

    showDashboard();
    setActive("inicio");
  }

  document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
      const section = button.dataset.section;
      setActive(section);

      if (section === "inicio") showDashboard();
      if (section === "recetas") showRecipes();
      if (section === "plan") showWeeklyPlan();
      if (section === "perfil") showProfile();
    });
  });

  document.querySelector(".center-btn").addEventListener("click", () => {
    setActive("");
    showFoodForm();
  });

  showDashboard();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("Service Worker registrado"))
      .catch(error => console.log("Error Service Worker:", error));
  }
});
