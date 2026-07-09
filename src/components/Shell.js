function getSectionHint(active) {
  const hints = {
    patterns: "Mapa de 28 días para reconocer ritmos y repeticiones útiles.",
    consult: "Resumen limpio para conversar con una profesional de salud.",
    library: "Transparencia del producto, reglas y decisiones en curso.",
  };
  return hints[active] || "";
}

const SECONDARY_VIEWS = ["patterns", "consult", "library"];

export function Shell({ state, active, activeLabel, estimate, content, modal, aiModal }) {
  const phaseClass = estimate.phase || "unknown";
  const isSecondary = SECONDARY_VIEWS.includes(active);
  const moreActive = active === "more" || isSecondary;

  return `
    <div class="app-shell phase-${phaseClass}" aria-label="Ciclica local">
      <div class="web-container">
        <main class="pocket-app" aria-label="Ciclica">
          <header class="pocket-header">
          <div class="brand-block">
            <p class="brand-mark" aria-hidden="true">◐</p>
            <div>
              <h1>Ciclica</h1>
              <p class="brand-sub">On-device · privado</p>
            </div>
          </div>

          <div class="top-actions" aria-label="Acciones">
            <button class="icon-action" data-action="open-menu" type="button" aria-label="Menú">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="4" cy="10" r="1.7" fill="currentColor"/><circle cx="10" cy="10" r="1.7" fill="currentColor"/><circle cx="16" cy="10" r="1.7" fill="currentColor"/></svg>
            </button>
          </div>
        </header>

        ${isSecondary ? `
        <section class="screen-header">
          <div class="screen-copy">
            <button class="back-pill" data-action="view" data-view="more" type="button">‹ Más</button>
            <h2>${activeLabel}</h2>
            <p class="screen-hint">${getSectionHint(active)}</p>
          </div>
        </section>
        ` : ""}

        <section class="app-content">${content}</section>

        <nav class="bottom-tabs" aria-label="Secciones">
          <button class="tab-item ${active === "today" ? "is-active" : ""}" data-action="view" data-view="today" type="button" aria-label="Hoy">
            <span class="tab-icon" aria-hidden="true">◐</span>
            <span>Hoy</span>
          </button>
          <button class="tab-item ${moreActive ? "is-active" : ""}" data-action="view" data-view="more" type="button" aria-label="Más">
            <span class="tab-icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="4" cy="10" r="1.7" fill="currentColor"/><circle cx="10" cy="10" r="1.7" fill="currentColor"/><circle cx="16" cy="10" r="1.7" fill="currentColor"/></svg>
            </span>
            <span>Más</span>
          </button>
        </nav>
        </main>
      </div>

      <dialog class="menu-sheet" id="menuModal">
        <button class="menu-row" data-action="profile" type="button">Perfil y ciclo</button>
        <button class="menu-row" data-action="ai-config" type="button">Configurar IA</button>
        <button class="menu-row" data-action="export" type="button">Exportar datos</button>
        <button class="menu-row menu-row-danger" data-action="reset-data" type="button">Borrar datos</button>
      </dialog>

      ${modal}
      ${aiModal}
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
    </div>
  `;
}
