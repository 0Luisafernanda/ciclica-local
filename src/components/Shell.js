export function Shell({ content, modal, aiModal }) {
  return `
    <div class="desktop-shell" aria-label="Ciclica local">
      <main class="desktop-app single-surface" aria-label="Ciclica">
        <header class="desktop-titlebar single-titlebar">
          <div class="desktop-brand" aria-label="Ciclica">
            <span class="ciclica-mark" aria-hidden="true"><i></i></span>
            <span><strong>Ciclica</strong><small>privada y local</small></span>
          </div>

          <div class="desktop-tools">
            <span class="local-status"><i></i> Local</span>
            <button class="menu-trigger" data-action="open-menu" type="button" aria-label="Menú">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="4" cy="10" r="1.7" fill="currentColor"/><circle cx="10" cy="10" r="1.7" fill="currentColor"/><circle cx="16" cy="10" r="1.7" fill="currentColor"/></svg>
            </button>
          </div>
        </header>

        <section class="desktop-content">${content}</section>
      </main>

      <dialog class="menu-sheet" id="menuModal">
        <button class="menu-row" data-action="profile" type="button">Perfil y ciclo</button>
        <button class="menu-row" data-action="ai-config" type="button">IA: Ollama / OpenAI</button>
        <button class="menu-row" data-action="copy-report" type="button">Copiar resumen para consulta</button>
        <button class="menu-row" data-action="export" type="button">Exportar datos</button>
        <hr class="menu-divider" />
        <button class="menu-row menu-row-danger" data-action="reset-data" type="button">Borrar datos</button>
      </dialog>

      ${modal || ""}
      ${aiModal || ""}
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
    </div>
  `;
}
