import { focusOptions, getActionLearning } from "../domain/actions.js?v=feer-1";
import { escapeHTML } from "../utils/html.js?v=feer-1";

const focusLabels = Object.fromEntries(focusOptions.map((item) => [item.id, item.label]));

export function LearningView(state) {
  const checkIns = Array.isArray(state.checkIns) ? state.checkIns : [];
  const learning = getActionLearning(checkIns);
  const repeated = getRepeatedFocus(checkIns);

  return `
    <section class="learning-view" data-view-panel="learning">
      <header class="editorial-header">
        <p class="eyebrow">Aprendizajes</p>
        <h2>Lo que Feer está aprendiendo sobre ti</h2>
        <p>No son verdades cerradas. Cada lectura muestra qué se repite, qué parece ayudarte y qué todavía no sabemos.</p>
      </header>

      ${checkIns.length ? renderLearningSections(repeated, learning, checkIns.length) : renderLearningEmpty()}
    </section>
  `;
}

function renderLearningEmpty() {
  return `
    <section class="learning-empty">
      <p class="section-label">Todavía no hay evidencia personal</p>
      <h3>Los aprendizajes nacen de momentos reales</h3>
      <p>Cuando registres cómo estás, qué probaste y si ayudó, Feer empezará a separar coincidencias de patrones útiles.</p>
      <button class="primary-cta compact" data-action="open-checkin" type="button">Registrar un momento</button>
    </section>
  `;
}

function renderLearningSections(repeated, learning, total) {
  return `
    <div class="learning-sections">
      <section class="learning-section">
        <div class="section-heading-row">
          <p class="section-label">Lo que se repite</p>
          <span>${total} momento${total === 1 ? "" : "s"}</span>
        </div>
        ${repeated.length
          ? repeated
              .map(
                (item) => `
            <article class="learning-line">
              <h3>${escapeHTML(item.label)}</h3>
              <p>Apareció en ${item.count} momentos. ${item.count >= 3 ? "Ya es una conexión posible; falta observar el contexto." : "Aún es una observación inicial."}</p>
              <span class="evidence-level">${item.count >= 3 ? "Conexión posible" : "Evidencia inicial"}</span>
            </article>
          `,
              )
              .join("")
          : `<p class="learning-placeholder">Por ahora las señales son distintas entre sí. Eso también es información.</p>`}
      </section>

      <section class="learning-section">
        <p class="section-label">Lo que parece ayudarte</p>
        ${learning.helpful.length
          ? learning.helpful
              .map(
                (item) => `
            <article class="learning-line">
              <h3>${escapeHTML(item.title)}</h3>
              <p>Ayudó bastante o un poco en ${item.much + item.some} de ${item.tried} respuestas.</p>
              <span class="evidence-level">Aprendizaje personal</span>
            </article>
          `,
              )
              .join("")
          : `<p class="learning-placeholder">Después de probar una acción, responde si ayudó. Así las sugerencias dejan de ser genéricas.</p>`}
      </section>

      <section class="learning-section">
        <p class="section-label">Lo que aún no sabemos</p>
        ${learning.uncertain.length
          ? learning.uncertain
              .map(
                (item) => `
            <article class="learning-line quiet">
              <h3>${escapeHTML(item.title)}</h3>
              <p>Hay ${item.pending} comprobación${item.pending === 1 ? "" : "es"} pendiente${item.pending === 1 ? "" : "s"}. Sin respuesta, Feer no asume que funcionó.</p>
            </article>
          `,
              )
              .join("")
          : `<article class="learning-line quiet"><h3>Relación con el ciclo</h3><p>Necesitamos más momentos y una fecha aproximada del periodo antes de asociar señales con una fase.</p></article>`}
      </section>
    </div>
  `;
}

function getRepeatedFocus(checkIns) {
  const counts = checkIns.reduce((acc, item) => {
    if (focusLabels[item.focus]) acc[item.focus] = (acc[item.focus] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .filter(([, count]) => count >= 2)
    .map(([focus, count]) => ({ focus, count, label: focusLabels[focus] }))
    .sort((a, b) => b.count - a.count);
}
