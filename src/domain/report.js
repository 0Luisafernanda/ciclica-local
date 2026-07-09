import { contextLabels } from "../data/labels.js?v=confidence-dial-11";
import { getEntries } from "./cycle.js?v=confidence-dial-11";
import { escapeHTML } from "../utils/html.js?v=confidence-dial-11";

export function buildReportHTML(state) {
  const entries = getEntries(state);
  const profile = state.profile;
  const avgPain = average(entries.map((entry) => entry.pain));
  const contexts = getContextLabels(profile?.contexts).join(", ");
  const notes = entries.filter((entry) => entry.note).slice(-5);

  return `
    <p class="micro-label">Generado localmente</p>
    <h3>Resumen para consulta</h3>
    <p>Este reporte resume datos registrados por la usuaria. No es diagnostico.</p>
    <div class="report-grid">
      <section>
        <h4>Perfil</h4>
        <ul>
          <li>Ultima menstruacion: ${escapeHTML(profile?.lastPeriod || "pendiente")}</li>
          <li>Duracion aproximada: ${escapeHTML(profile?.cycleLength || "pendiente")} dias</li>
          <li>Regularidad: ${escapeHTML(profile?.regularity || "pendiente")}</li>
          <li>Contexto: ${contexts || "sin contexto marcado"}</li>
        </ul>
      </section>
      <section>
        <h4>Registros</h4>
        <ul>
          <li>Total de entradas: ${entries.length}</li>
          <li>Dolor promedio: ${Number.isNaN(avgPain) ? "sin datos" : `${avgPain.toFixed(1)}/10`}</li>
          <li>Dias con dolor alto: ${entries.filter((entry) => entry.pain >= 7).length}</li>
          <li>Dias con sangrado abundante: ${entries.filter((entry) => entry.bleeding === "heavy").length}</li>
        </ul>
      </section>
    </div>
    <h4>Notas recientes</h4>
    <ul>${notes.map((entry) => `<li>${entry.date}: ${escapeHTML(entry.note)}</li>`).join("") || "<li>Sin notas recientes.</li>"}</ul>
  `;
}

export function buildPlainReport(state) {
  const entries = getEntries(state);
  const profile = state.profile;
  const contexts = getContextLabels(profile?.contexts).join(", ");
  return [
    "Ciclica Local - Resumen para consulta",
    "Este reporte fue generado localmente y no es diagnostico.",
    "",
    `Ultima menstruacion: ${profile?.lastPeriod || "pendiente"}`,
    `Duracion aproximada: ${profile?.cycleLength || "pendiente"} dias`,
    `Regularidad: ${profile?.regularity || "pendiente"}`,
    `Contexto: ${contexts || "sin contexto marcado"}`,
    "",
    `Total de entradas: ${entries.length}`,
    `Dias con dolor alto: ${entries.filter((entry) => entry.pain >= 7).length}`,
    `Dias con sangrado abundante: ${entries.filter((entry) => entry.bleeding === "heavy").length}`,
    "",
    "Notas recientes:",
    ...entries.filter((entry) => entry.note).slice(-5).map((entry) => `- ${entry.date}: ${entry.note}`),
  ].join("\n");
}

function getContextLabels(contexts = []) {
  return contexts.map((context) => contextLabels[context]).filter(Boolean);
}

function average(values) {
  if (!values.length) return Number.NaN;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
