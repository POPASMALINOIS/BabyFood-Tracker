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
    "Mostaza",
    "Sulfitos"
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
    const lastEntries = diary.slice().reverse().slice(0, 3);

    content.innerHTML = `
      <section>
        <h2 class="section-title">Inicio</h2>
        <p class="section-subtitle">Resumen rápido de alimentación, perfil y últimos registros.</p>

        ${!babyProfile.name || !babyProfile.birthDate ? `
          <div class="card">
            <h2>Completa el perfil del bebé</h2>
            <p>Para calcular la edad y personalizar la app, rellena nombre, fecha de nacimiento, peso y talla.</p>
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
  }

  function showRecipes(filter = "Todas", ageFilter = "Todas") {
    const categories = [
      "Todas",
      "Puré",
      "Potito fruta",
      "BLW",
      "Desayuno",
      "Comida",
      "Cena",
      "Snack"
    ];

    const ages = [
      "Todas",
      "6 meses",
      "7 meses",
      "8 meses",
      "9 meses",
      "10 meses",
      "12 meses"
    ];

    const filtered = recipes.filter(recipe => {
      const categoryMatch =
        filter === "Todas" ||
        recipe.tipo === filter ||
        recipe.categoria === filter;

      const ageMatch =
        ageFilter === "Todas" ||
        recipe.edad_minima === ageFilter;

      return categoryMatch && ageMatch;
    });

    content.innerHTML = `
      <section>
        <h2 class="section-title">Recetas</h2>
        <p class="section-subtitle">${filtered.length} recetas encontradas.</p>

        <div class="card compact">
          <label for="age-filter">Filtrar por edad</label>
          <select id="age-filter">
            ${ages.map(age => `
              <option value="${age}" ${age === ageFilter ? "selected" : ""}>${age}</option>
            `).join("")}
          </select>

          <label for="category-filter">Filtrar por tipo</label>
          <select id="category-filter">
            ${categories.map(cat => `
              <option value="${cat}" ${cat === filter ? "selected" : ""}>${cat}</option>
            `).join("")}
          </select>
        </div>

        ${
          filtered.length
            ? filtered.map(recipe => `
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

                <button class="secondary-btn recipe-detail-btn" data-id="${recipe.id}">Ver receta completa</button>
              </div>
            `).join("")
            : `
              <div class="card">
                <h2>No hay recetas para este filtro</h2>
                <p>Prueba con otra edad o categoría.</p>
              </div>
            `
        }
      </section>
    `;

    document.getElementById("age-filter").addEventListener("change", (event) => {
      const selectedAge = event.target.value;
      const selectedCategory = document.getElementById("category-filter").value;
      showRecipes(selectedCategory, selectedAge);
    });

    document.getElementById("category-filter").addEventListener("change", (event) => {
      const selectedCategory = event.target.value;
      const selectedAge = document.getElementById("age-filter").value;
      showRecipes(selectedCategory, selectedAge);
    });

    document.querySelectorAll(".recipe-detail-btn").forEach(button => {
      button.addEventListener("click", () => {
        showRecipeDetail(Number(button.dataset.id));
      });
    });
  }

  function showRecipeDetail(id) {
    const recipe = recipes.find(r => Number(r.id) === Number(id));

    if (!recipe) {
      showRecipes();
      return;
    }

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

        <button id="register-recipe" class="primary-btn">Registrar que lo ha comido</button>
      </section>
    `;

    document.getElementById("back-recipes").addEventListener("click", () => {
      showRecipes();
    });

    document.getElementById("register-recipe").addEventListener("click", () => {
      showFoodForm(recipe.nombre);
    });
  }

  function showAllergens() {
    const allergenDiary = JSON.parse(localStorage.getItem("allergenDiary")) || {};

    content.innerHTML = `
      <section>
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
  }

  function showProfile() {
    babyProfile = JSON.parse(localStorage.getItem("babyProfile")) || defaultProfile;

    content.innerHTML = `
      <section>
        <h2 class="section-title">Perfil</h2>
        <p class="section-subtitle">Datos del bebé guardados solo en este dispositivo.</p>

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
      </section>
    `;

    document.getElementById("save-profile").addEventListener("click", saveProfile);
    document.getElementById("delete-profile").addEventListener("click", showDeleteProfileModal);
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

  function showDeleteProfileModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    modal.innerHTML = `
      <div class="modal-box">
        <h2>Borrar perfil</h2>
        <p>Vas a borrar el perfil del bebé, el diario de comidas y el control de alérgenos guardado en este dispositivo. Esta acción no se puede deshacer.</p>

        <div class="modal-actions">
          <button id="cancel-delete" class="secondary-btn">Cancelar</button>
          <button id="confirm-delete" class="danger-btn">Borrar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("cancel-delete").addEventListener("click", () => {
      modal.remove();
    });

    document.getElementById("confirm-delete").addEventListener("click", () => {
      localStorage.removeItem("babyProfile");
      localStorage.removeItem("foodDiary");
      localStorage.removeItem("allergenDiary");

      localStorage.setItem("babyProfile", JSON.stringify(defaultProfile));
      localStorage.setItem("foodDiary", JSON.stringify([]));
      localStorage.setItem("allergenDiary", JSON.stringify({}));

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
      if (section === "alergenos") showAllergens();
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
