document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash-screen");
  const app = document.getElementById("app");

  /* SPLASH SCREEN */
  setTimeout(() => {
    splash.style.opacity = "0";
    splash.style.transition = "opacity 0.8s ease";

    setTimeout(() => {
      splash.style.display = "none";
      app.classList.remove("hidden");
    }, 800);
  }, 2200);

  /* BABY PROFILE */
  const babyProfile = {
    name: "Mi bebé",
    birthDate: "2025-11-15",
    currentWeight: "7.8 kg",
    lastFood: "Aguacate"
  };

  /* AGE CALCULATION */
  function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();

    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();

    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += previousMonth.getDate();
    }

    return `${months} meses y ${days} días`;
  }

  document.getElementById("baby-age").textContent = calculateAge(babyProfile.birthDate);

  /* LOCAL STORAGE INIT */
  if (!localStorage.getItem("babyProfile")) {
    localStorage.setItem("babyProfile", JSON.stringify(babyProfile));
  }

  /* NAVIGATION */
  const navButtons = document.querySelectorAll(".nav-btn");

  navButtons.forEach(button => {
    button.addEventListener("click", () => {
      navButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const sectionName = button.innerText.trim();

      // Aquí más adelante conectaremos pantallas reales
      console.log(`Sección seleccionada: ${sectionName}`);
    });
  });

  /* CENTER BUTTON ACTION */
  const centerBtn = document.querySelector(".center-btn");

  centerBtn.addEventListener("click", () => {
    alert("Aquí se abrirá el registro rápido de comidas.");
  });

  /* QUICK ACTIONS */
  const quickButtons = document.querySelectorAll(".quick-actions button");

  quickButtons.forEach(button => {
    button.addEventListener("click", () => {
      const action = button.innerText;

      if (action.includes("Registrar")) {
        alert("Función de registro en desarrollo.");
      }

      if (action.includes("recetas")) {
        alert("Base de recetas próximamente.");
      }
    });
  });

  /* PWA SERVICE WORKER */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("Service Worker registrado"))
      .catch(error => console.log("Error Service Worker:", error));
  }
});
