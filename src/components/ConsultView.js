import { buildReportHTML } from "../domain/report.js";

export function ConsultView(state) {
  return `
    <section class="view is-visible" data-view-panel="consult">
      <div class="panel consult-header">
        <div>
          <p class="micro-label">Para consulta médica</p>
          <h3>Resumen para conversación profesional</h3>
          <p>Genera un resumen limpio, local y sin etiquetas automáticas.</p>
        </div>
        <button class="button ghost" data-action="copy-report" type="button">Copiar resumen</button>
      </div>

      <article class="panel report-panel">${buildReportHTML(state)}</article>
    </section>
  `;
}
