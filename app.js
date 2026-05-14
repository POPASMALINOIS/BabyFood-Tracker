{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const screens = document.querySelectorAll(".screen");\
const navButtons = document.querySelectorAll(".bottom-nav button");\
\
window.addEventListener("load", () => \{\
  setTimeout(() => \{\
    document.getElementById("splashScreen").classList.add("hide");\
  \}, 1600);\
\});\
\
const defaultRecipes = [\
  \{\
    name: "Pur\'e9 de calabac\'edn y patata",\
    age: "6+ meses",\
    type: "Pur\'e9",\
    ingredients: "Calabac\'edn, patata, aceite de oliva virgen extra.",\
    warning: "Sin sal a\'f1adida."\
  \},\
  \{\
    name: "Bastones de boniato al vapor",\
    age: "6+ meses",\
    type: "BLW",\
    ingredients: "Boniato cocido en bastones blandos.",\
    warning: "Debe aplastarse f\'e1cilmente entre los dedos."\
  \},\
  \{\
    name: "Pl\'e1tano machacado",\
    age: "6+ meses",\
    type: "Mixto",\
    ingredients: "Pl\'e1tano maduro.",\
    warning: "Ofrecer textura segura."\
  \},\
  \{\
    name: "Tortilla francesa bien cuajada",\
    age: "6+ meses",\
    type: "BLW",\
    ingredients: "Huevo bien cocinado.",\
    warning: "Introducir huevo de forma controlada por ser al\'e9rgeno."\
  \},\
  \{\
    name: "Crema de lenteja roja",\
    age: "6+ meses",\
    type: "Pur\'e9",\
    ingredients: "Lenteja roja, zanahoria, puerro, aceite de oliva.",\
    warning: "Sin sal y textura adecuada."\
  \}\
];\
\
const store = \{\
  get(key, fallback) \{\
    try \{\
      return JSON.parse(localStorage.getItem(key)) || fallback;\
    \} catch \{\
      return fallback;\
    \}\
  \},\
  set(key, value) \{\
    localStorage.setItem(key, JSON.stringify(value));\
  \}\
\};\
\
let settings = store.get("settings", \{\});\
let meals = store.get("meals", []);\
let foods = store.get("foods", []);\
let weights = store.get("weights", []);\
let recipes = store.get("recipes", defaultRecipes);\
\
navButtons.forEach(button => \{\
  button.addEventListener("click", () => \{\
    const target = button.dataset.screen;\
\
    screens.forEach(screen => \{\
      screen.classList.toggle("active", screen.id === target);\
    \});\
\
    navButtons.forEach(btn => btn.classList.remove("active"));\
    button.classList.add("active");\
  \});\
\});\
\
document.getElementById("settingsForm").addEventListener("submit", event => \{\
  event.preventDefault();\
\
  settings = \{\
    babyName: document.getElementById("babyName").value,\
    babyBirth: document.getElementById("babyBirth").value\
  \};\
\
  store.set("settings", settings);\
  renderDashboard();\
  alert("Ajustes guardados");\
\});\
\
document.getElementById("mealForm").addEventListener("submit", event => \{\
  event.preventDefault();\
\
  const food = document.getElementById("mealFood").value.trim();\
  if (!food) return;\
\
  meals.unshift(\{\
    date: new Date().toLocaleDateString("es-ES"),\
    type: document.getElementById("mealType").value,\
    food,\
    reaction: document.getElementById("mealReaction").value\
  \});\
\
  store.set("meals", meals);\
  document.getElementById("mealForm").reset();\
  renderMeals();\
\});\
\
document.getElementById("foodForm").addEventListener("submit", event => \{\
  event.preventDefault();\
\
  const name = document.getElementById("foodName").value.trim();\
  if (!name) return;\
\
  foods.unshift(\{\
    name,\
    category: document.getElementById("foodCategory").value,\
    allergen: document.getElementById("foodAllergen").checked,\
    date: new Date().toLocaleDateString("es-ES")\
  \});\
\
  store.set("foods", foods);\
  document.getElementById("foodForm").reset();\
  renderFoods();\
  renderDashboard();\
\});\
\
document.getElementById("weightForm").addEventListener("submit", event => \{\
  event.preventDefault();\
\
  const value = document.getElementById("weightValue").value;\
  if (!value) return;\
\
  weights.unshift(\{\
    value,\
    date: new Date().toLocaleDateString("es-ES")\
  \});\
\
  store.set("weights", weights);\
  document.getElementById("weightForm").reset();\
  renderWeights();\
  renderDashboard();\
\});\
\
document.getElementById("recipeSearch").addEventListener("input", renderRecipes);\
\
function calculateAge(dateString) \{\
  if (!dateString) return "Configurar";\
\
  const birth = new Date(dateString);\
  const today = new Date();\
\
  let months =\
    (today.getFullYear() - birth.getFullYear()) * 12 +\
    today.getMonth() -\
    birth.getMonth();\
\
  if (today.getDate() < birth.getDate()) months--;\
\
  if (months < 1) return "Menos de 1 mes";\
  if (months === 1) return "1 mes";\
  return `$\{months\} meses`;\
\}\
\
function renderDashboard() \{\
  document.getElementById("babyAge").textContent = calculateAge(settings.babyBirth);\
  document.getElementById("lastWeight").textContent = weights.length ? `$\{weights[0].value\} kg` : "Sin datos";\
  document.getElementById("testedFoods").textContent = foods.length;\
  document.getElementById("favoriteRecipes").textContent = "0";\
\
  document.getElementById("babyName").value = settings.babyName || "";\
  document.getElementById("babyBirth").value = settings.babyBirth || "";\
\}\
\
function renderMeals() \{\
  const list = document.getElementById("mealList");\
  list.innerHTML = "";\
\
  meals.forEach(meal => \{\
    list.innerHTML += `\
      <div class="list-item">\
        <strong>$\{meal.type\}: $\{meal.food\}</strong>\
        <small>$\{meal.date\} \'b7 $\{meal.reaction\}</small>\
      </div>\
    `;\
  \});\
\}\
\
function renderFoods() \{\
  const list = document.getElementById("foodList");\
  list.innerHTML = "";\
\
  foods.forEach(food => \{\
    list.innerHTML += `\
      <div class="list-item">\
        <strong>$\{food.name\}</strong>\
        <small>$\{food.category\} \'b7 Introducido el $\{food.date\}$\{food.allergen ? " \'b7 Al\'e9rgeno" : ""\}</small>\
      </div>\
    `;\
  \});\
\}\
\
function renderWeights() \{\
  const list = document.getElementById("weightList");\
  list.innerHTML = "";\
\
  weights.forEach(weight => \{\
    list.innerHTML += `\
      <div class="list-item">\
        <strong>$\{weight.value\} kg</strong>\
        <small>$\{weight.date\}</small>\
      </div>\
    `;\
  \});\
\}\
\
function renderRecipes() \{\
  const query = document.getElementById("recipeSearch").value.toLowerCase();\
  const list = document.getElementById("recipeList");\
\
  list.innerHTML = "";\
\
  recipes\
    .filter(recipe => recipe.name.toLowerCase().includes(query))\
    .forEach(recipe => \{\
      list.innerHTML += `\
        <div class="recipe-card">\
          <strong>$\{recipe.name\}</strong>\
          <small>$\{recipe.age\} \'b7 $\{recipe.type\}</small>\
          <p><b>Ingredientes:</b> $\{recipe.ingredients\}</p>\
          <p><b>Nota:</b> $\{recipe.warning\}</p>\
        </div>\
      `;\
    \});\
\}\
\
if ("serviceWorker" in navigator) \{\
  navigator.serviceWorker.register("service-worker.js");\
\}\
\
renderDashboard();\
renderMeals();\
renderFoods();\
renderWeights();\
renderRecipes();}