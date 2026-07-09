import { getInsight, getCycleEstimate, getCalendarDays } from "../domain/cycle.js?v=aqua-base-4";
import { toISODate } from "../domain/date.js?v=aqua-base-4";
import { escapeHTML } from "../utils/html.js?v=aqua-base-4";
import { bleedingLabels, moodLabels, skinLabels } from "../data/labels.js?v=aqua-base-4";

export function TodayView(state) {
  const date = toISODate(new Date());
  const entry = state.entries[date] || {};
  const insight = getInsight(state, date);
  const estimate = getCycleEstimate(state);
  const hasEntry = Boolean(state.entries[date]);
  const dayLabel = formatDay(date);
  const profileReady = Boolean(state.profile?.lastPeriod);
  const cycleLength = state.profile?.cycleLength || 28;
  const dialModifier = getDialModifier(estimate);
  const dialProgress = getDialProgress(estimate, cycleLength);
  const phaseLabel = getPhaseLabel(estimate.phase, estimate, cycleLength);

  const todaySignals = [
    {
      key: "pain",
      title: "Dolor",
      value: entry.pain ?? 0,
      low: "Ninguno",
      high: "Alto",
    },
    {
      key: "energy",
      title: "Energía",
      value: entry.energy ?? 6,
      low: "Bajo",
      high: "Alto",
    },
    {
      key: "sleep",
      title: "Sueño",
      value: entry.sleep ?? 7,
      low: "Pobre",
      high: "Bueno",
    },
  ];

  const moodValue = moodLabels[entry.mood] ? moodLabels[entry.mood] : "Sin dato";
  const bleedingValue = bleedingLabels[entry.bleeding] ? bleedingLabels[entry.bleeding] : "Sin dato";
  const skinValue = skinLabels[entry.skin] ? skinLabels[entry.skin] : "Sin dato";
  const insightActions = insight.actions.slice(0, 3);
  const guidanceCards = getGuidanceCards(estimate.phase, insightActions);
  const logSummary = hasEntry ? getLogSummary(entry, moodValue, bleedingValue, skinValue) : "Toca para registrar";
  const nextPeriodLine = estimate.nextPeriodInDays
    ? `Próximo periodo · ~${estimate.nextPeriodInDays} día${estimate.nextPeriodInDays === 1 ? "" : "s"}`
    : "Empieza con lo mínimo y Ciclica aprenderá contigo";
  const weekDays = getCalendarDays(state, 14);
  const weekdayLetters = ["D", "L", "M", "M", "J", "V", "S"];

  return `
    <section class="view is-visible today-view" data-view-panel="today">
      <section class="today-hero-compact panel hero-card">
        <div class="hero-top-row">
          <div class="confidence-dial dial-sm ${dialModifier}" style="--dial-progress:${dialProgress};--tone:var(--phase-${estimate.phase})" role="img" aria-label="Día ${estimate.day ?? "sin estimar"} de ${cycleLength}, confianza ${estimate.confidence}">
            <div class="dial-center">
              <strong>${estimate.day ?? "–"}</strong>
              <span>${estimate.day ? `de ${cycleLength}` : "sin datos"}</span>
            </div>
          </div>
          <div class="hero-copy-main">
            <p class="micro-label">Hoy · ${dayLabel}</p>
            <h2 class="hero-headline-sm">${phaseLabel}</h2>
            <p class="hero-kicker">${nextPeriodLine}</p>
          </div>
        </div>

        <div class="hero-badges">
          <span class="hero-pill hero-pill-tone">Privado · local</span>
          <span class="hero-pill">${estimate.confidence}</span>
          ${profileReady ? `<span class="hero-pill">Perfil listo</span>` : `<span class="hero-pill">Empieza sin explicar nada</span>`}
        </div>

        <div class="hero-body-lines">
          ${insight.lines.map((line) => `<p class="hero-body-sm">${line}</p>`).join("")}
        </div>
      </section>

      <section class="pocket-guidance panel" aria-label="Qué observar hoy">
        <div class="guidance-head">
          <div>
            <p class="micro-label">Para hoy</p>
            <h3 class="guidance-title">Lectura local</h3>
          </div>
          <span class="guidance-tag">${profileReady ? "Personal" : "Básico"}</span>
        </div>
        <ul class="insight-cards">
          ${guidanceCards}
        </ul>
        <p class="guidance-footnote">No es consejo médico · todo queda en este dispositivo</p>
      </section>

      <details class="panel log-toggle">
        <summary class="log-summary">
          <span class="log-summary-icon" aria-hidden="true">+</span>
          <span class="log-summary-text">${hasEntry ? "Registro de hoy" : "Registrar hoy"}</span>
          <span class="log-summary-meta">${logSummary}</span>
        </summary>

        <form class="daily-form" id="dailyForm">
          <input name="entryDate" type="hidden" value="${date}" />

          <div class="signal-wrap">
            ${todaySignals.map((signal) => signalRow(signal)).join("")}
          </div>

          <fieldset class="choice-wrap" aria-label="Opciones de sangrado y estado emocional">
            <legend>Opciones rápidas</legend>
            <label class="option-field">
              <p class="option-label">Sangrado</p>
              <div class="option-row">
                ${choice("bleeding", "none", "No", entry.bleeding || "none")}
                ${choice("bleeding", "light", "Leve", entry.bleeding)}
                ${choice("bleeding", "medium", "Medio", entry.bleeding)}
                ${choice("bleeding", "heavy", "Abundante", entry.bleeding)}
              </div>
            </label>

            <label class="option-field">
              <p class="option-label">Ánimo</p>
              <div class="option-row mood-row">
                ${choice("mood", "calm", "Tranquila", entry.mood)}
                ${choice("mood", "sensitive", "Sensible", entry.mood)}
                ${choice("mood", "irritable", "Irritable", entry.mood)}
                ${choice("mood", "anxious", "Ansiosa", entry.mood)}
                ${choice("mood", "sad", "Triste", entry.mood)}
              </div>
            </label>

            <label class="option-field">
              <p class="option-label">Piel</p>
              <div class="option-row">
                ${choice("skin", "none", "Sin cambios", entry.skin || "none")}
                ${choice("skin", "breakout", "Brotes", entry.skin)}
                ${choice("skin", "sensitive", "Sensible", entry.skin)}
              </div>
            </label>
          </fieldset>

          <label class="note-field">
            <span>Nota privada</span>
            <textarea name="note" rows="3" placeholder="¿Algo importante? Solo para ti.">${escapeHTML(entry.note || "")}</textarea>
          </label>

          <div class="save-strip">
            <p>${hasEntry ? "Guardado localmente para hoy." : "Se guarda solo en este dispositivo."}</p>
            <button class="button primary" type="submit">${hasEntry ? "Actualizar" : "Guardar"}</button>
          </div>
        </form>
      </details>

      <section class="week-strip" aria-label="Últimos 14 días">
        <div class="week-strip-head">
          <p class="micro-label">Últimos 14 días</p>
          <span class="week-strip-hint">${Object.keys(state.entries).length} registro(s)</span>
        </div>
        <div class="week-strip-grid">
          ${weekDays
            .map(
              ({ date, entry: dayEntry }) => `
            <div class="week-cell ${dayEntry ? "is-logged" : ""}">
              <span class="week-cell-dow">${weekdayLetters[date.getDay()]}</span>
              <span class="week-cell-num">${date.getDate()}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      </section>

      <footer class="privacy-footer">
        <span class="privacy-left"><span aria-hidden="true">🔒</span> On-device · private</span>
        <span class="privacy-right">Open source</span>
      </footer>
    </section>
  `;
}

function choice(name, value, label, selected) {
  return `<label class="pill-option"><input name="${name}" type="radio" value="${value}" ${selected === value ? "checked" : ""} /><span>${label}</span></label>`;
}

function signalRow({ key, title, value, low, high }) {
  const pct = Math.max(0, Math.min(100, Number(value) * 10));
  return `
    <label class="signal-row" style="--signal:${pct}%">
      <span>${title}</span>
      <strong data-output="${key}">${value}</strong>
      <input name="${key}" type="range" min="0" max="10" value="${value}" />
      <small>${low} · ${high}</small>
    </label>
  `;
}

function formatDay(dateISO) {
  const date = new Date(`${dateISO}T12:00:00`);
  return new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function getDialModifier(estimate) {
  if (estimate.phase === "unknown") return "is-unknown";
  if (estimate.confidence === "Oculta") return "is-hidden-focus";
  if (estimate.confidence === "Media-baja") return "is-soft";
  return "is-solid";
}

function getDialProgress(estimate, cycleLength) {
  if (!estimate.day) return 6;
  return Math.min(100, Math.round((estimate.day / cycleLength) * 100));
}

function getPhaseLabel(phase, estimate, cycleLength) {
  const labels = {
    unknown: "Empieza con tu último periodo",
    menstrual: `Fase menstrual · día ${estimate.day ?? 1}/${cycleLength}`,
    follicular: `Fase folicular · día ${estimate.day ?? 1}/${cycleLength}`,
    ovulatory: `Ventana ovulatoria · día ${estimate.day ?? 1}/${cycleLength}`,
    luteal: `Fase lútea · día ${estimate.day ?? 1}/${cycleLength}`,
  };
  return labels[phase] || labels.unknown;
}

function getGuidanceCards(phase, actions) {
  const cardMap = {
    unknown: [
      ["Empieza sin explicar tu cuerpo", actions[0] || "Configura lo mínimo y deja que Ciclica aprenda contigo."],
      ["Registra hoy", actions[1] || "Dolor, energía y ánimo bastan para empezar."],
      ["Hazlo privado", actions[2] || "Tus datos quedan en este dispositivo."],
    ],
    menstrual: [
      ["Baja la exigencia", actions[0] || "Si el dolor o el cansancio suben, recorta un poco la agenda."],
      ["Prioriza cuerpo", actions[1] || "Come, hidrátate y mantén movimiento suave si te ayuda."],
      ["Anota lo fuerte", actions[2] || "Si hay dolor alto o sangrado abundante, vale la pena llevarlo a consulta."],
    ],
    follicular: [
      ["Usa la energía", actions[0] || "Puede ser una ventana buena para tareas de foco."],
      ["Retoma fuerza", actions[1] || "Prueba movimientos más intensos si te sienta bien."],
      ["Observa claridad", actions[2] || "Nota si el ánimo o la piel cambian de forma consistente."],
    ],
    ovulatory: [
      ["Ventana estimada", actions[0] || "Tómalo como una lectura, no como anticoncepción."],
      ["Registra cambios", actions[1] || "Si notas flujo, dolor o energía distinta, déjalo escrito."],
      ["Interprétalo con cautela", actions[2] || "Con ciclos irregulares o SOMP/SOP, la lectura se vuelve más flexible."],
    ],
    luteal: [
      ["Protege tu energía", actions[0] || "Menos fricción ayuda cuando aparecen sensibilidad o cansancio."],
      ["Reduce ruido", actions[1] || "Sueño estable y comidas más regulares suelen ayudar a sentirte mejor."],
      ["Mira los repetidos", actions[2] || "Si algo vuelve cada ciclo, anótalo para reconocer el patrón."],
    ],
  };

  return (cardMap[phase] || cardMap.unknown)
    .map(
      ([title, body], index) => `
        <li class="insight-card">
          <span class="insight-card-icon" aria-hidden="true">${index + 1}</span>
          <div>
            <strong>${title}</strong>
            <p>${body}</p>
          </div>
        </li>
      `,
    )
    .join("");
}

function getLogSummary(entry, moodValue, bleedingValue, skinValue) {
  const bits = [];
  if (entry.pain >= 7) bits.push(`dolor alto (${entry.pain}/10)`);
  if (entry.mood) bits.push(moodValue);
  if (entry.skin && entry.skin !== "none") bits.push(`piel ${skinValue}`);
  if (entry.bleeding && entry.bleeding !== "none") bits.push(bleedingValue);
  if (entry.note) bits.push("nota guardada");
  return bits.length ? bits.slice(0, 2).join(" · ") : "Registrado, sin detalle";
}
