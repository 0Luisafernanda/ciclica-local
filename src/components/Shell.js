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
      <aside class="app-shell__sidebar" aria-label="Navegación principal">
        <header class="brand-block">
          <p class="brand-mark">◐</p>
          <h1>Ciclica</h1>
          <p class="brand-sub">Local + privado</p>
        </header>

        <nav class="app-nav" aria-label="Secciones">
          ${views.map((view) => `
            <button class="nav-item ${active === view.id ? "is-active" : ""}" data-action="view" data-view="${view.id}" type="button">
              <span class="nav-icon" aria-hidden="true">${view.icon}</span>
              <span>${view.label}</span>
            </button>
          `).join("")}
        </nav>

        <div class="sidebar-tools">
          <button class="chip-action" data-action="profile" type="button">Ajustes</button>
          <button class="chip-action chip-outline" data-action="export" type="button">Exportar</button>
        </div>
      </aside>

      <main class="app-shell__workspace">
        <header class="screen-header">
          <div class="screen-copy">
            <p class="kicker">${cycleMeta} · ${estimate.confidence}</p>
            <h2>${activeLabel}</h2>
          </div>
          <div class="screen-pill">${getPhaseLabel(estimate)}</div>
        </header>

        <section class="app-content">${content}</section>
      </main>

      ${modal}
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
    </div>
  `;
}
