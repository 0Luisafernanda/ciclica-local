import { views } from "../data/labels.js";

export function Shell({ state, active, activeLabel, estimate, content, modal }) {
  const entryCount = Object.keys(state.entries).length;
  return `
    <div class="app-frame">
      <aside class="rail" aria-label="Navegacion principal">
        <div class="wordmark">
          <span class="wordmark-mark" aria-hidden="true"></span>
          <div>
            <h1>Ciclica</h1>
            <p>Private cycle intelligence</p>
          </div>
        </div>

        <nav class="nav-list">
          ${views.map((view) => `
            <button class="nav-item ${active === view.id ? "is-active" : ""}" data-action="view" data-view="${view.id}" type="button">
              <span aria-hidden="true">${view.icon}</span>
              ${view.label}
            </button>
          `).join("")}
        </nav>

        <section class="vault-panel" aria-label="Privacidad local">
          <div class="vault-row"><span>Storage</span><strong>Local</strong></div>
          <div class="vault-row"><span>Account</span><strong>None</strong></div>
          <div class="vault-row"><span>Network</span><strong>Off by default</strong></div>
          <button class="text-action" data-action="export" type="button">Export dataset</button>
        </section>
      </aside>

      <main class="workspace">
        <header class="topbar">
          <div>
            <p class="eyebrow">${activeLabel}</p>
            <h2>Today, interpreted locally.</h2>
          </div>
          <div class="topbar-stats" aria-label="Estado de Ciclica">
            <div><span>Confidence</span><strong>${estimate.confidence}</strong></div>
            <div><span>Entries</span><strong>${entryCount}</strong></div>
          </div>
        </header>

        <section class="signal-strip" aria-label="Senal del ciclo">
          <div class="signal-primary">
            <span class="signal-index">01</span>
            <div>
              <p class="eyebrow">Cycle signal</p>
              <h3>${estimate.headline}</h3>
            </div>
          </div>
          <p>${estimate.summary}</p>
          <div class="signal-state"><span>Private model layer</span><strong>Not connected yet</strong></div>
        </section>

        ${content}
      </main>

      ${modal}
      <div class="toast" id="toast" role="status" aria-live="polite"></div>
    </div>
  `;
}
