import { bleedingLabels, moodLabels } from "../data/labels.js?v=aqua-base-7";
import { getCalendarDays, getFindings, getIntensity } from "../domain/cycle.js?v=aqua-base-7";

export function PatternsView(state) {
  const days = getCalendarDays(state);
  const findings = getFindings(state);
  const hasData = days.some((day) => day.entry);

  return `
    <section class="view is-visible" data-view-panel="patterns">
      <div class="panel patterns-header">
        <div>
          <p class="micro-label">Mapa de 28 días</p>
          <h3>Señales que sí valen la pena ver</h3>
          <p>Un mapa compacto para reconocer ritmos, repeticiones y cambios útiles.</p>
        </div>
        <span class="count-pill">${Object.keys(state.entries).length} registros</span>
      </div>

      <section class="patterns-layout">
        <div class="panel">
          <h4>Últimos 28 días</h4>
          <p>Visualiza intensidad y estado para detectar ritmos reales.</p>
          <div class="calendar-grid">
            ${days
              .map(({ date, entry }) => `
                <article class="day-cell intensity-${entry ? getIntensity(entry) : 0}">
                  <strong>${date.getDate()}</strong>
                  <span>${entry ? `${bleedingLabels[entry.bleeding]} · ${moodLabels[entry.mood]}` : "—"}</span>
                </article>
              `)
              .join("")}
          </div>
        </div>

        <aside class="panel insight-card">
          <h4>Lecturas útiles</h4>
          <div class="finding-stack">
            ${hasData
              ? findings
                  .map(
                    ([title, body]) => `
                <article>
                  <strong>${title}</strong>
                  <p>${body}</p>
                </article>
              `,
                  )
                  .join("")
              : `<p>Registra esta semana y empezamos a construir patrones útiles para ti.</p>`}
          </div>
        </aside>
      </section>
    </section>
  `;
}
