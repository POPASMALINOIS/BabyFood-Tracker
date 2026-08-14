(() => {
  const parseJSON = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };

  const normalizeWeight = value => {
    const raw = String(value || "").trim().replace(",", ".");
    const number = parseFloat(raw.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(number) || number <= 0) return null;
    return number;
  };

  const displayWeight = value => `${Number(value).toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} kg`;

  const getLatestWeight = history => {
    if (!history.length) return "";
    const latest = [...history].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
    return latest ? displayWeight(latest.value) : "";
  };

  const normalizeHistory = () => {
    const source = parseJSON("weightHistory", []);
    const normalized = source
      .map((item, index) => {
        const value = item.value ?? normalizeWeight(item.weight);
        if (!item.date || !Number.isFinite(Number(value))) return null;
        return {
          id: item.id || `${item.date}-${index}`,
          date: item.date,
          value: Number(value)
        };
      })
      .filter(Boolean);

    localStorage.setItem("weightHistory", JSON.stringify(normalized));
    return normalized;
  };

  const refreshCurrentWeight = history => {
    const profile = parseJSON("babyProfile", {});
    profile.currentWeight = getLatestWeight(history);
    localStorage.setItem("babyProfile", JSON.stringify(profile));
  };

  const buildWeightMarkup = history => history.length
    ? history.map((item, index) => {
        const previous = history[index + 1];
        const delta = previous ? item.value - previous.value : null;
        const deltaText = delta === null
          ? "Primer registro"
          : `${delta >= 0 ? "+" : ""}${delta.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} kg`;

        return `
          <article class="weight-history-item">
            <div class="weight-history-main">
              <strong>${displayWeight(item.value)}</strong>
              <span>${new Date(`${item.date}T12:00:00`).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            <div class="weight-history-side">
              <span class="weight-delta">${deltaText}</span>
              <button class="weight-delete-btn" type="button" data-weight-id="${item.id}" aria-label="Eliminar peso">×</button>
            </div>
          </article>`;
      }).join("")
    : `<p class="empty-state">Todavía no hay pesos registrados.</p>`;

  const renderWeightHistory = () => {
    const card = [...document.querySelectorAll(".form-card")]
      .find(el => el.querySelector("h2")?.textContent.trim() === "Historial de peso");
    if (!card) return;

    const history = normalizeHistory().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const list = card.querySelector(".weight-history-list") ||
      [...card.children].find(el => el.tagName === "DIV" && el.getAttribute("style")?.includes("margin-top"));
    if (!list) return;

    const signature = JSON.stringify(history.map(item => [item.id, item.date, item.value]));
    if (list.dataset.signature === signature) return;

    list.className = "weight-history-list";
    list.removeAttribute("style");
    list.dataset.signature = signature;
    list.innerHTML = buildWeightMarkup(history);
  };

  const refreshProfileView = () => {
    const profileButton = document.querySelector('.nav-btn[data-section="perfil"]');
    if (profileButton) profileButton.click();
  };

  document.addEventListener("click", event => {
    const saveWeightButton = event.target.closest("#save-weight");
    if (saveWeightButton) {
      event.preventDefault();
      event.stopImmediatePropagation();

      const date = document.getElementById("weight-date")?.value;
      const value = normalizeWeight(document.getElementById("weight-value")?.value);
      if (!date || value === null) {
        window.alert("Indica una fecha y un peso válido.");
        return;
      }

      const history = normalizeHistory();
      const sameDate = history.find(item => item.date === date);
      if (sameDate) {
        sameDate.value = value;
      } else {
        history.push({ id: `${Date.now()}`, date, value });
      }

      localStorage.setItem("weightHistory", JSON.stringify(history));
      refreshCurrentWeight(history);
      refreshProfileView();
      return;
    }

    const deleteWeightButton = event.target.closest(".weight-delete-btn");
    if (deleteWeightButton) {
      event.preventDefault();
      const id = deleteWeightButton.dataset.weightId;
      const history = normalizeHistory().filter(item => item.id !== id);
      localStorage.setItem("weightHistory", JSON.stringify(history));
      refreshCurrentWeight(history);
      refreshProfileView();
    }
  }, true);

  let renderQueued = false;
  const queueWeightRender = () => {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      if (document.querySelector("#weight-date")) renderWeightHistory();
    });
  };

  const observer = new MutationObserver(queueWeightRender);

  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
    queueWeightRender();
  });
})();
