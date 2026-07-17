import { contextLabels } from "../data/labels.js?v=feer-1";
import { getEntries } from "./cycle.js?v=feer-1";
import { escapeHTML } from "../utils/html.js?v=feer-1";

const focusLabels = {
  pain: "dolor",
  lowEnergy: "energía baja",
  anxious: "ansiedad",
  sensitive: "sensibilidad",
  bloated: "hinchazón",
  focus: "dificultad para concentrarse",
};

const feedbackLabels = {
  much: "ayudó bastante",
  some: "ayudó un poco",
  no: "no ayudó",
};

export function buildReportHTML(state) {
  const entries = getEntries(state);
  const checkIns = Array.isArray(state.checkIns) ? state.checkIns : [];
  const profile = state.profile;
  const avgPain = average(entries.map((entry) => entry.pain));
  const contexts = getContextLabels(profile?.contexts).join(", ");
  const notes = entries.filter((entry) => entry.note).slice(-5);
  const highPain = checkIns.filter((item) => item.focus === "pain" && Number(item.intensity) >= 7).length;
  const triedActions = checkIns.filter((item) => item.action?.title);

  return `
    <p class="section-label">Generado localmente</p>
    <h3>Resumen para consulta</h3>
    <p class="report-intro">Este documento organiza observaciones registradas por la usuaria. No diagnostica ni sustituye una evaluación profesional.</p>

    <section class="report-section">
      <h4>Cambios y señales relevantes</h4>
      <ul>
        <li>${checkIns.length} momento${checkIns.length === 1 ? "" : "s"} registrado${checkIns.length === 1 ? "" : "s"} durante el día.</li>
        <li>${highPain} momento${highPain === 1 ? "" : "s"} con dolor de 7/10 o más.</li>
        <li>${entries.filter((entry) => entry.bleeding === "heavy").length} día(s) con sangrado abundante.</li>
        <li>Dolor diario promedio: ${Number.isNaN(avgPain) ? "sin datos" : `${avgPain.toFixed(1)}/10`}.</li>
      </ul>
    </section>

    <section class="report-section">
      <h4>Acciones probadas</h4>
      <ul>
        ${triedActions.length
          ? triedActions
              .slice(-8)
              .map(
                (item) => `<li><strong>${escapeHTML(item.action.title)}</strong> · ${escapeHTML(feedbackLabels[item.feedback] || "resultado pendiente")}</li>`,
              )
              .join("")
          : "<li>Aún no hay acciones con resultado registrado.</li>"}
      </ul>
    </section>

    <section class="report-section report-columns">
      <div>
        <h4>Perfil del ciclo</h4>
        <ul>
          <li>Última menstruación: ${escapeHTML(profile?.lastPeriod || "pendiente")}</li>
          <li>Duración aproximada: ${escapeHTML(profile?.cycleLength || "pendiente")} días</li>
          <li>Regularidad: ${escapeHTML(profile?.regularity || "pendiente")}</li>
          <li>Contexto: ${contexts || "sin contexto marcado"}</li>
        </ul>
      </div>
      <div>
        <h4>Preguntas para conversar</h4>
        <ul>
          <li>¿Qué señales deberían hacerme consultar antes?</li>
          <li>¿Conviene investigar los momentos de dolor que limitan mi día?</li>
          <li>¿Cómo evaluar si las acciones de alivio que pruebo son adecuadas para mí?</li>
        </ul>
      </div>
    </section>

    <section class="report-section">
      <h4>Notas recientes</h4>
      <ul>${notes.map((entry) => `<li>${escapeHTML(entry.date)}: ${escapeHTML(entry.note)}</li>`).join("") || "<li>Sin notas recientes.</li>"}</ul>
    </section>
  `;
}

export function buildPlainReport(state) {
  const entries = getEntries(state);
  const checkIns = Array.isArray(state.checkIns) ? state.checkIns : [];
  const profile = state.profile;
  const contexts = getContextLabels(profile?.contexts).join(", ");
  const highPain = checkIns.filter((item) => item.focus === "pain" && Number(item.intensity) >= 7).length;
  const actionLines = checkIns
    .filter((item) => item.action?.title)
    .slice(-8)
    .map((item) => `- ${item.action.title}: ${feedbackLabels[item.feedback] || "resultado pendiente"}`);

  return [
    "Feer - Resumen para consulta",
    "Generado localmente. Organiza observaciones y no es diagnóstico.",
    "",
    "CAMBIOS Y SEÑALES",
    `Momentos registrados: ${checkIns.length}`,
    `Momentos con dolor 7/10 o más: ${highPain}`,
    `Días con sangrado abundante: ${entries.filter((entry) => entry.bleeding === "heavy").length}`,
    "",
    "ACCIONES PROBADAS",
    ...(actionLines.length ? actionLines : ["- Sin acciones con resultado registrado"]),
    "",
    "PERFIL DEL CICLO",
    `Última menstruación: ${profile?.lastPeriod || "pendiente"}`,
    `Duración aproximada: ${profile?.cycleLength || "pendiente"} días`,
    `Regularidad: ${profile?.regularity || "pendiente"}`,
    `Contexto: ${contexts || "sin contexto marcado"}`,
    "",
    "NOTAS RECIENTES",
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
