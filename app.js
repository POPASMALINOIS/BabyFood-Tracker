document.addEventListener("DOMContentLoaded", async () => {
  const splash = document.getElementById("splash-screen");
  const app = document.getElementById("app");
  const content = document.getElementById("content");

  let foods = [];
  let recipes = [];

  const defaultProfile = {
    name: "Mi bebé",
    birthDate: "2025-11-15",
    currentWeight: "7.8 kg",
    lastFood: "Aguacate"
  };

  const allergens = [
    "Huevo",
    "Leche",
    "Gluten",
    "Pescado",
    "Marisco",
    "Frutos secos",
    "Cacahuete",
    "Soja",
    "Sésamo",
    "Apio",
    "Mostaza"
  ];

  if (!localStorage.getItem("babyProfile")) {
    localStorage.setItem("babyProfile", JSON.stringify(defaultProfile));
  }

  if (!localStorage.getItem("foodDiary")) {
    localStorage.setItem("foodDiary", JSON.stringify([]));
  }

  if (!localStorage.getItem("allergenDiary")) {
    localStorage.setItem("allergenDiary", JSON.stringify({}));
  }

  let babyProfile = JSON.parse(localStorage.getItem("babyProfile"));

  setTimeout(() => {
    splash.classList.add("fade-out");

    setTimeout(() => {
      splash.style.display = "none";
      app.classList.remove("hidden");
    }, 800);
  }, 1600);

  async function loadData() {
    try {
      const foodsResponse = await fetch("data/foods.json");
      foods = await foodsResponse.json();

      const recipesResponse = await fetch("data/recipes.json");
      recipes = await recipesResponse.json();
    } catch (error) {
      console.error("Error cargando JSON:", error);

      foods = [
        {
          nombre: "Aguacate",
          edad_minima: "6 meses",
          categoria: "Fruta",
          blw: "Tiras gruesas o machacado",
          alergenos: false,
          riesgo: "Bajo",
          observaciones: "Textura blanda, fácil de ofrecer al inicio."
        }
      ];

      recipes = [
        {
          nombre: "Tortitas blandas de plátano y avena",
          edad_minima: "6 meses",
          categoria: "Desayuno",
          tiempo: "12 min",
          textura: "Blanda",
          alergenos: ["Huevo", "Gluten"],
          ingredientes: ["1 plátano maduro", "1 huevo", "3 cucharadas de avena molida"],
          preparacion: [
            "Machacar el plátano hasta formar una crema.",
            "Mezclar con el huevo y la avena.",
            "Cocinar pequeñas tortitas a fuego bajo.",
            "Dejar enfriar y ofrecer en tiras grandes."
          ],
          notas: "No añadir azúcar ni sal."
        }
      ];
    }
  }

  await loadData();

  function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();

    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();

    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    return `${months} meses y ${days} días`;
  }

  function setActive(section) {
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.section === section);
    });
  }

  function showDashboard() {
    babyProfile = JSON.parse(localStorage.getItem("babyProfile"));
    const diary = JSON.parse(localStorage.getItem("foodDiary")) || [];
    const lastEntries = diary.slice().reverse().slice(0, 2);

    content.innerHTML = `
      <section>
        <h2 class="section-title">Inicio</h2>
        <p class="section-subtitle">Resumen rápido de la alimentación del bebé.</p>

        <div class="dashboard-grid">
          <div class="card">
            <h2>Edad actual</h2>
            <p class="big-value">${calculateAge(babyProfile.birthDate)}</p>
          </div>

          <div class="card compact">
            <h2>Peso</h2>
            <p class="big-value">${babyProfile.currentWeight}</p>
          </div>

          <div class="card compact">
            <h2>Último</h2>
            <p class="big-value">${babyProfile.lastFood}</p>
          </div>
        </div>

        <div class="quick-actions">
          <button id="quick-register" class="primary-btn">Registrar comida</button>
          <button id="quick-allergens" class="secondary-btn">Ver alérgenos</button>
        </div>

        <div class="card">
          <h2>Últimos registros</h2>
          ${
            lastEntries.length
              ? lastEntries.map(entry => `
                <p><strong>${entry.food}</strong> · ${entry.date}</p>
                <p>${entry.amount} · ${entry.reaction}</p>
              `).join("")
              : `<p>Todavía no hay comidas registradas.</p>`
          }
        </div>
      </section>
    `;

    document.getElementById("quick-register").addEventListener("click", () => {
      setActive("");
      showFoodForm();
    });

    document.getElementById("quick-allergens").addEventListener("click", () => {
      setActive("alergenos");
      showAllergens();
    });
  }

  function showFoods() {
    content.innerHTML = `
      <section>
        <h2 class="section-title">Alimentos</h2>
        <p class="section-subtitle">Base rápida para consultar cómo ofrecer cada alimento.</p>

        ${foods.map(food => `
          <div class="card">
            <h2>${food.nombre}</h2>
            <p><strong>Desde:</strong> ${food.edad_minima}</p>
            <p><strong>Categoría:</strong> ${food.categoria || "General"}</p>
            <p><strong>BLW:</strong> ${food.blw || "Consultar preparación segura."}</p>
            <p><strong>Riesgo:</strong> ${food.riesgo || "No indicado"}</p>
            <p><strong>Observaciones:</strong> ${food.observaciones || "Sin observaciones."}</p>

            <div class="tag-row">
              <span class="tag">${food.alergenos ? "Alérgeno" : "No alérgeno común"}</span>
              ${food.congelable ? `<span class="tag">Congelable</span>` : ""}
            </div>
          </div>
        `).join("")}
      </section>
    `;
  }

  function showRecipes() {
    content.innerHTML = `
      <section>
        <h2 class="section-title">Recetas</h2>
        <p class="section-subtitle">Ideas completas para preparar comidas reales.</p>

        ${recipes.map((recipe, index) => `
          <div class="card">
            <h2>${recipe.nombre}</h2>
            <p><strong>Categoría:</strong> ${recipe.categoria}</p>
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

            <button class="secondary-btn recipe-detail-btn" data-index="${index}">Ver receta completa</button>
          </div>
        `).join("")}
      </section>
    `;

    document.querySelectorAll(".recipe-detail-btn").forEach(button => {
      button.addEventListener("click", () => {
        showRecipeDetail(Number(button.dataset.index));
      });
    });
  }

  function showRecipeDetail(index) {
    const recipe = recipes[index];

    content.innerHTML = `
      <section>
        <button id="back-recipes" class="secondary-btn">← Volver a recetas</button>

        <div class="card">
          <h2>${recipe.nombre}</h2>
          <p><strong>Edad:</strong> ${recipe.edad_minima}</p>
          <p><strong>Categoría:</strong> ${recipe.categoria}</p>
          <p><strong>Tiempo:</strong> ${recipe.tiempo}</p>
          <p><strong>Textura:</strong> ${recipe.textura}</p>

          <div class="tag-row">
            ${
              recipe.alergenos && recipe.alergenos.length
                ? recipe.alergenos.map(a => `<span class="tag warning-tag">${a}</span>`).join("")
                : `<span class="tag">Sin alérgenos principales</span>`
            }
          </div>
        </div>

        <div class="card">
          <h2>Ingredientes</h2>
          ${recipe.ingredientes.map(item => `<p>• ${item}</p>`).join("")}
        </div>

        <div class="card">
          <h2>Preparación</h2>
          <ol class="recipe-steps">
            ${recipe.preparacion.map(step => `<li>${step}</li>`).join("")}
          </ol>
        </div>

        <div class="card">
          <h2>Consejo</h2>
          <p>${recipe.notas || "Ofrecer siempre con supervisión y textura adecuada a la edad."}</p>
        </div>
      </section>
    `;

    document.getElementById("back-recipes").addEventListener("click", showRecipes);
  }

  function showDiary() {
    const diary = JSON.parse(localStorage.getItem("foodDiary")) || [];

    content.innerHTML = `
      <section>
        <h2 class="section-title">Diario</h2>
        <p class="section-subtitle">Registro de comidas, cantidades y reacciones.</p>

        ${
          diary.length
            ? diary.slice().reverse().map(entry => `
              <div class="card">
                <h2>${entry.food}</h2>
                <p><strong>Fecha:</strong> ${entry.date}</p>
                <p><strong>Cantidad:</strong> ${entry.amount}</p>
                <p><strong>Reacción:</strong> ${entry.reaction}</p>
                <p><strong>Alérgeno:</strong> ${entry.allergen || "No indicado"}</p>
                <p><strong>Notas:</strong> ${entry.notes}</p>
              </div>
            `).join("")
            : `
              <div class="card">
                <h2>Aún no hay registros</h2>
                <p>Pulsa el botón central para registrar la primera comida.</p>
              </div>
            `
        }
      </section>
    `;
  }

  function showAllergens() {
    const allergenDiary = JSON.parse(localStorage.getItem("allergenDiary")) || {};

    content.innerHTML = `
      <section>
        <h2 class="section-title">Alérgenos</h2>
        <p class="section-subtitle">Control por días de exposición y reacción observada.</p>

        <div class="allergen-grid">
          ${allergens.map(allergen => {
            const info = allergenDiary[allergen];
            return `
              <div class="card compact allergen-card">
                <div>
                  <h2>${allergen}</h2>
                  <p>${info ? `Último: ${info.date}` : "Sin introducir"}</p>
                  <p>${info ? `Reacción: ${info.reaction}` : "Pendiente de registrar"}</p>
                </div>
                <span class="allergen-status">${info ? "Probado" : "Pendiente"}</span>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function showFoodForm() {
    content.innerHTML = `
      <section>
        <h2 class="section-title">Registrar comida</h2>
        <p class="section-subtitle">Añade qué ha comido, cantidad, reacción y posible alérgeno.</p>

        <div class="card form-card">
          <div class="form-group">
            <label for="food-input">Alimento o receta</label>
            <input id="food-input" type="text" placeholder="Ej. Aguacate, huevo, tortitas...">
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
            <textarea id="notes-input" placeholder="Ej. lo aceptó bien, textura, preparación, dudas..."></textarea>
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

    babyProfile.lastFood = food;
    localStorage.setItem("babyProfile", JSON.stringify(babyProfile));

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

    setActive("alergenos");
    showAllergens();
  }

  document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
      const section = button.dataset.section;
      setActive(section);

      if (section === "inicio") showDashboard();
      if (section === "alimentos") showFoods();
      if (section === "recetas") showRecipes();
      if (section === "alergenos") showAllergens();
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
