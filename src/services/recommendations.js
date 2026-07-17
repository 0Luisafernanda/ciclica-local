import { getCycleEstimate } from "../domain/cycle.js?v=feer-1";
import { moodLabels, bleedingLabels, skinLabels, contextLabels } from "../data/labels.js?v=feer-1";

const phaseNames = {
  menstrual: "menstrual",
  follicular: "folicular",
  ovulatory: "ovulatoria",
  luteal: "lutea",
  unknown: "sin estimar",
};

export function buildRecommendationMessages(state, dateISO) {
  const estimate = getCycleEstimate(state);
  const entry = state.entries?.[dateISO];
  const profile = state.profile;

  const cycleLine = profile
    ? `Fase estimada: ${phaseNames[estimate.phase] || "sin estimar"}${estimate.day ? ` (dia ${estimate.day} de ${profile.cycleLength || 28})` : ""}. Confianza: ${estimate.confidence}. Regularidad del ciclo: ${profile.regularity || "sin dato"}.`
    : "Sin perfil de ciclo configurado: fase desconocida.";

  const contexts = (profile?.contexts || []).map((key) => contextLabels[key]).filter(Boolean).join(", ") || "ninguno";

  const entryLine = entry
    ? `Registro de hoy: dolor ${entry.pain}/10, energia ${entry.energy}/10, sueno ${entry.sleep}/10, animo ${moodLabels[entry.mood] || "sin dato"}, piel ${skinLabels[entry.skin] || "sin dato"}, sangrado ${bleedingLabels[entry.bleeding] || "sin dato"}.`
    : "Sin registro hoy.";

  const noteLine = entry?.note ? `Nota de la usuaria: "${entry.note}"` : "";

  return [
    {
      role: "system",
      content:
        "Eres el motor de recomendaciones de Feer, una app privada de seguimiento del ciclo menstrual. Con el contexto del ciclo y el registro del dia devuelves entre 3 y 4 recomendaciones practicas para hoy: movimiento o deporte, comida, hidratacion, descanso o cuidado del cuerpo, segun lo que ayude con lo registrado. Una recomendacion por linea, sin numerar y sin viñetas, maximo 18 palabras por linea, en espanol, tono calido y directo. No diagnostiques, no recomiendes medicamentos y no prometas certezas. Si el ciclo es irregular o la confianza es baja, trata la fase como estimacion y dilo con naturalidad.",
    },
    {
      role: "user",
      content: [cycleLine, `Contextos: ${contexts}.`, entryLine, noteLine].filter(Boolean).join("\n"),
    },
  ];
}

export function parseRecommendations(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.replace(/^[\s•\-\*\d.)]+/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}
