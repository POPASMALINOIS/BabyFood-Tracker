document.addEventListener("DOMContentLoaded", async () => {
  const splash = document.getElementById("splash-screen");
  const app = document.getElementById("app");
  const content = document.getElementById("content");

  let foods = [];
  let recipes = [];

  /* SPLASH */
  setTimeout(() => {
    splash.style.opacity = "0";
    splash.style.transition = "opacity 0.8s ease";

    setTimeout(() => {
      splash.style.display = "none";
      app.classList.remove("hidden");
    }, 800);
  }, 2200);

  /* PERFIL INICIAL */
  const defaultProfile = {
    name: "Mi bebé",
    birthDate: "2025-11-15",
    currentWeight: "7.8 kg",
    lastFood: "Aguacate"
  };

  if (!localStorage.getItem("babyProfile")) {
    localStorage.setItem("babyProfile", JSON.stringify(defaultProfile));
  }

  const babyProfile = JSON.parse(localStorage.getItem("babyProfile"));

  /* CALCULAR EDAD */
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

  /* CARGAR JSON */
  async function loadData() {
    try {
      const foodsResponse = await fetch("data/foods.json");
      foods = await foodsResponse.json();

      const recipesResponse = await fetch("data/recipes.json");
      recipes = await recipesResponse.json();
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }

  await loadData();

  /* DASHBOARD */
  function showDashboard() {
    content.innerHTML = `
      <section class="dashboard">
        <div class="card">
          <h2>Edad del bebé</h2>
          <p>${calculateAge(babyProfile.birthDate)}</p>
        </div>

        <div class="card">
          <h2>Último alimento</h2>
          <p>${babyProfile.lastFood}</p>
        </div>

        <div class="card">
          <h2>Peso actual</h2>
          <p>${babyProfile.currentWeight}</p>
        </div>

        <div class="quick-actions">
          <button id="quick-register">Registrar comida</button>
          <button id="quick-recipes">Ver recetas</button>
        </div>
      </section>
    `;

    document.getElementById("quick-register").addEventListener("click", showFoodForm);
    document.getElementById("quick-recipes").addEventListener("click", showRecipes);
  }

  /* ALIMENTOS */
  function showFoods() {
    let html = `
      <section>
        <h2 class="section-title">Base de alimentos</h2>
    `;

    foods.forEach(food => {
      html += `
        <div class="card">
          <h2>${food.nombre}</h2>
          <p><strong>Desde:</strong> ${food.edad_minima}</p>
          <p><strong>Categoría:</strong> ${food.categoria}</p>
          <p><strong>BLW:</strong> ${food.blw}</p>
          <p><strong>Riesgo:</strong> ${food.riesgo}</p>
          <p><strong>Alérgeno:</strong> ${food.alergenos ? "Sí" : "No"}</p>
          <p><strong>Observaciones:</strong> ${food.observaciones}</p>
        </div>
      `;
    });

    html += `</section>`;
    content.innerHTML = html;
  }

  /* RECETAS */
  function showRecipes() {
    let html = `
      <section>
        <h2 class="section-title">Recetas</h2>
    `;

    recipes.forEach(recipe => {
      html += `
        <div class="card">
          <h2>${recipe.nombre}</h2>
          <p><strong>Categoría:</strong> ${recipe.categoria}</p>
          <p><strong>Edad:</strong> ${recipe.edad_minima}</p>
          <p><strong>Tiempo:</strong> ${recipe.tiempo}</p>
          <p><strong>Textura:</strong> ${recipe.textura}</p>
          <p><strong>Alérgenos:</strong> ${recipe.alergenos.length ? recipe.alergenos.join(", ") : "No contiene"}</p>
        </div>
      `;
    });

    html += `</section>`;
    content.innerHTML = html;
  }

  /* DIARIO */
  function showDiary() {
    const diary = JSON.parse(localStorage.getItem("foodDiary")) || [];

    let html = `
      <section>
        <h2 class="section-title">Diario de comidas</h2>
    `;

    if (diary.length === 0) {
      html += `
        <div class="card">
          <h2>Aún no hay registros</h2>
          <p>Empieza registrando la primera comida del bebé con el botón central.</p>
        </div>
      `;
    } else {
      diary.slice().reverse().forEach(entry => {
        html += `
          <div class="card">
            <h2>${entry.food}</h2>
            <p><strong>Fecha:</strong> ${entry.date}</p>
            <p><strong>Cantidad:</strong> ${entry.amount}</p>
            <p><strong>Reacción:</strong> ${entry.reaction}</p>
            <p><strong>Notas:</strong> ${entry.notes}</p>
          </div>
        `;
      });
    }

    html += `</section>`;
    content.innerHTML = html;
  }

  /* FORMULARIO REGISTRO */
  function showFoodForm() {
    content.innerHTML = `
      <section>
        <h2 class="section-title">Registrar comida</h2>

        <div class="card">
          <label>Alimento o receta</label>
          <input id="food-input" type="text" placeholder="Ej. Plátano, aguacate, puré...">

          <label>Cantidad aproximada</label>
          <select id="amount-input">
            <option value="Probó un poco">Probó un poco</option>
            <option value="Comió bien">Comió bien</option>
            <option value="Comió bastante">Comió bastante</option>
            <option value="No quiso">No quiso</option>
          </select>

          <label>Reacción</label>
          <select id="reaction-input">
            <option value="Sin reacción">Sin reacción</option>
            <option value="Gases">Gases</option>
            <option value="Estreñimiento">Estreñimiento</option>
            <option value="Diarrea">Diarrea</option>
            <option value="Vómitos">Vómitos</option>
            <option value="Ronchas o piel roja">Ronchas o piel roja</option>
            <option value="Otra reacción">Otra reacción</option>
          </select>

          <label>Notas</label>
          <textarea id="notes-input" placeholder="Observaciones..."></textarea>

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
    const notes = document.getElementById("notes-input").value.trim();

    if (!food) {
      alert("Indica el alimento o receta.");
      return;
    }

    const diary = JSON.parse(localStorage.getItem("foodDiary")) || [];

    const entry = {
      food,
      amount,
      reaction,
      notes: notes || "Sin notas",
      date: new Date().toLocaleDateString("es-ES")
    };

    diary.push(entry);
    localStorage.setItem("foodDiary", JSON.stringify(diary));

    babyProfile.lastFood = food;
    localStorage.setItem("babyProfile", JSON.stringify(babyProfile));

    showDiary();
  }

  /* NAVEGACIÓN */
  const navButtons = document.querySelectorAll(".nav-btn");

  navButtons.forEach(button => {
    button.addEventListener("click", () => {
      navButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const section = button.dataset.section;

      if (section === "alimentos") {
        showFoods();
      } else if (section === "recetas") {
        showRecipes();
      } else if (section === "diario") {
        showDiary();
      } else {
        showDashboard();
      }
    });
  });

  /* BOTÓN CENTRAL */
  document.querySelector(".center-btn").addEventListener("click", () => {
    navButtons.forEach(btn => btn.classList.remove("active"));
    showFoodForm();
  });

  /* INICIO */
  showDashboard();

  /* PWA */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("Service Worker registrado"))
      .catch(error => console.log("Error Service Worker:", error));
  }
});
