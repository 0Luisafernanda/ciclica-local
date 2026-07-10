import { buildReportHTML } from "../domain/report.js?v=ciclica-now-1";

export function ConsultView(state) {
  return `
    <section class="consult-view" data-view-panel="consult">
      <header class="editorial-header consult-title-row">
        <div>
          <p class="eyebrow">Consulta</p>
          <h2>Una historia útil, no una descarga de datos</h2>
          <p>Resume qué cambió, qué acciones probaste y qué merece una conversación profesional.</p>
        </div>
        <button class="secondary-cta" data-action="copy-report" type="button">Copiar resumen</button>
      </header>

      <article class="consult-document">${buildReportHTML(state)}</article>
    </section>
  `;
}
