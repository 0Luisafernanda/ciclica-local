import { buildReportHTML } from "../domain/report.js";

export function ConsultView(state) {
  return `
    <section class="view ${state.activeView === "consult" ? "is-visible" : ""}" data-view-panel="consult">
      <div class="section-head">
        <div>
          <p class="micro-label">Para hablar con una profesional</p>
          <h3>Reporte de consulta</h3>
        </div>
        <button class="button ghost" data-action="copy-report" type="button">Copiar reporte</button>
      </div>
      <article class="surface report-paper">${buildReportHTML(state)}</article>
    </section>
  `;
}
