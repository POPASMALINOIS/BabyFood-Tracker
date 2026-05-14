document.addEventListener("DOMContentLoaded", async () => {
  const splash = document.getElementById("splash-screen");
  const app = document.getElementById("app");

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

  /* BABY PROFILE */
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

  /* AGE */
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

  document.getElementById("baby-age").textContent = calculateAge(babyProfile.birthDate);

  /* LOAD DATABASE */
  async function loadData() {
    try {
      const foodsResponse = await fetch("data/foods.json");
      foods = await foodsResponse.json();

      const recipesResponse = await fetch("data/recipes.json");
      recipes = await recipesResponse.json();

      console.log("Alimentos cargados:", foods.length);
      console.log("Recetas cargadas:", recipes.length);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }

  await loadData();

  /* NAVIGATION */
  const navButtons = document.querySelectorAll(".nav-btn");

  navButtons.forEach(button => {
    button.addEventListener("click", () => {
      navButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const label = button.innerText.trim();

      if (label.includes("Alimentos")) {
        showFoods();
      } else if (label.includes("Recetas")) {
        showRecipes();
      } else if (label.includes("Perfil")) {
        showProfile();
      } else {
        showDashboard();
      }
    });
  });

  /* DASHBOARD */
  function showDashboard() {
    document.getElementById("content").innerHTML = `
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
      </section>
    `;
  }

  /* FOODS */
  function showFoods() {
    let html = `<section><h2>Base de alimentos</h2>`;

    foods.forEach(food => {
      html += `
        <div class="card">
          <h2>${food.nombre}</h2>
          <p>Desde: ${food.edad_minima}</p>
          <p>BLW: ${food.blw}</p>
          <p>Riesgo: ${food.riesgo}</p>
        </div>
      `;
    });

    html += `</section>`;
    document.getElementById("content").innerHTML = html;
  }

  /* RECIPES */
  function showRecipes() {
    let html = `<section><h2>Recetas</h2>`;

    recipes.forEach(recipe => {
      html += `
        <div class="card">
          <h2>${recipe.nombre}</h2>
          <p>Categoría: ${recipe.categoria}</p>
          <p>Edad: ${recipe.edad_minima}</p>
          <p>Tiempo: ${recipe.tiempo}</p>
        </div>
      `;
    });

    html += `</section>`;
    document.getElementById("content").innerHTML = html;
  }

  /* PROFILE */
  function showProfile() {
    document.getElementById("content").innerHTML = `
      <section>
        <div class="card">
          <h2>${babyProfile.name}</h2>
          <p>Fecha nacimiento: ${babyProfile.birthDate}</p>
          <p>Edad: ${calculateAge(babyProfile.birthDate)}</p>
          <p>Peso: ${babyProfile.currentWeight}</p>
        </div>
      </section>
    `;
  }

  /* CENTER BUTTON */
  document.querySelector(".center-btn").addEventListener("click", () => {
    alert("Registro de comidas premium próximamente.");
  });

  /* PWA */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("Service Worker registrado"))
      .catch(error => console.log("Error:", error));
  }
});
