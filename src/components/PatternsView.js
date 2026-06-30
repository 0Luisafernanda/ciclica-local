import { bleedingLabels, moodLabels } from "../data/labels.js";
import { getCalendarDays, getFindings, getIntensity } from "../domain/cycle.js";

export function PatternsView(state) {
  const days = getCalendarDays(state);
  const findings = getFindings(state);
  return `
    <section class="view ${state.activeView === "patterns" ? "is-visible" : ""}" data-view-panel="patterns">
      <div class="section-head">
        <div>
          <p class="micro-label">Mapa personal</p>
          <h3>Patrones del ciclo</h3>
        </div>
        <span class="count-pill">${Object.keys(state.entries).length} registros</span>
      </div>

      <div class="patterns-grid">
        <section class="surface calendar-surface">
          <div class="surface-head">
            <h4>Ultimos 28 dias</h4>
            <p>Intensidad combinada de sangrado, dolor, energia y sueno.</p>
          </div>
          <div class="day-grid">
            ${days.map(({ date, entry }) => `
              <div class="day-cell intensity-${entry ? getIntensity(entry) : 0}">
                <strong>${date.getDate()}</strong>
                <span>${entry ? `${bleedingLabels[entry.bleeding]} · ${moodLabels[entry.mood]}` : "sin dato"}</span>
              </div>
            `).join("")}
          </div>
        </section>

        <aside class="surface findings-surface">
          <h4>Lo que Ciclica observa</h4>
          <div class="finding-stack">
            ${findings.map(([title, body]) => `<article class="finding"><h5>${title}</h5><p>${body}</p></article>`).join("")}
          </div>
        </aside>
      </div>
    </section>
  `;
}
