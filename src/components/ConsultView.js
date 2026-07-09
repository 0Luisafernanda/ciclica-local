import { buildReportHTML } from "../domain/report.js?v=confidence-dial-11";

export function ConsultView(state) {
  return `
    <section class="view is-visible" data-view-panel="consult">
      <div class="panel consult-header">
        <div>
          <p class="micro-label">Resumen para consulta</p>
          <h3>Llévalo a una conversación profesional</h3>
          <p>Genera un resumen limpio, local y sin etiquetas automáticas.</p>
        </div>
        <button class="button ghost" data-action="copy-report" type="button">Copiar resumen</button>
      </div>

      <article class="panel report-panel">${buildReportHTML(state)}</article>
    </section>
  `;
}
