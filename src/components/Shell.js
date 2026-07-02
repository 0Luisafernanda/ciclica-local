import { views } from "../data/labels.js";

function getPhaseLabel(estimate) {
  const phaseLabel = {
    menstrual: "Menstrual",
    follicular: "Folicular",
    ovulatory: "Ovulatoria",
    luteal: "Lútea",
    unknown: "Sin datos",
  };
  return phaseLabel[estimate.phase] || "Sin datos";
}

export function Shell({ state, active, activeLabel, estimate, content, modal }) {
  const cycleLength = state.profile?.cycleLength || 28;
  const cycleMeta = estimate.day ? `Día ${estimate.day} / ${cycleLength}` : "Configura tu ciclo";
  const phaseClass = estimate.phase || "unknown";

  return `
    <div class="app-shell phase-${phaseClass}" aria-label="Ciclica local">
      <main class="pocket-app" aria-label="Ciclica">
        <header class="pocket-header">
          <div class="brand-block">
            <p class="brand-mark" aria-hidden="true">◐</p>
            <div>
              <h1>Ciclica</h1>
              <p class="brand-sub">Local + privado</p>
            </div>
          </div>

          <div class="top-actions" aria-label="Acciones">
            <button class="icon-action" data-action="export" type="button" aria-label="Exportar datos">⇩</button>
            <button class="icon-action" data-action="profile" type="button" aria-label="Ajustes">⚙︎</button>
            <button class="icon-action danger-action" data-action="reset-data" type="button" aria-label="Borrar datos locales">⌫</button>
          </div>
        </header>

        <section class="screen-header">
          <div class="screen-copy">
            <p class="kicker">${cycleMeta} · ${estimate.confidence}</p>
            <h2>${activeLabel}</h2>
          </div>
          <div class="screen-pill">${getPhaseLabel(estimate)}</div>
        </section>

        <section class="app-content">${content}</section>

        <nav class="bottom-tabs" aria-label="Secciones">
          ${views.map((view) => `
            <button class="tab-item ${active === view.id ? "is-active" : ""}" data-action="view" data-view="${view.id}" type="button" aria-label="${view.label}">
              <span class="tab-icon" aria-hidden="true">${view.icon}</span>
              <span>${view.label}</span>
            </button>
          `).join("")}
        </nav>
      </main>

      ${modal}
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
    </div>
  `;
}
