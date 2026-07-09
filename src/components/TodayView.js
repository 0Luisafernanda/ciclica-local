import { getInsight, getCycleEstimate, getCalendarDays } from "../domain/cycle.js?v=aqua-base-7";
import { toISODate } from "../domain/date.js?v=aqua-base-7";
import { escapeHTML } from "../utils/html.js?v=aqua-base-7";
import { bleedingLabels, moodLabels, skinLabels } from "../data/labels.js?v=aqua-base-7";

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
  const recsContent = recsSection(state, insight, date, hasEntry);
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

        ${estimate.phase === "unknown" ? "" : `
        <div class="hero-badges">
          <span class="hero-pill hero-pill-tone">Confianza ${estimate.confidence.toLowerCase()}</span>
        </div>
        `}

        <div class="hero-body-lines">
          ${insight.lines.map((line) => `<p class="hero-body-sm">${line}</p>`).join("")}
        </div>

        <div class="hero-actions">
          <button class="button ${profileReady ? "ghost" : "primary"} hero-action" data-action="profile" type="button">
            ${profileReady ? "Editar perfil local" : "Configurar lo mínimo"}
          </button>
          <button class="button ghost hero-action" data-action="open-log" type="button">
            ${hasEntry ? "Actualizar hoy" : "Registrar hoy"}
          </button>
        </div>
      </section>

      <section class="recs-block" aria-label="Recomendaciones">
        ${recsContent}
      </section>

      <details class="panel log-toggle" id="todayLog">
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

function recsSection(state, insight, dateISO, hasEntry) {
  const provider = state.aiConfig?.provider || null;
  const recs = state.aiRecs && state.aiRecs.date === dateISO ? state.aiRecs : null;

  if (recs?.status === "loading") {
    return `<p class="recs-status">Generando recomendaciones con tu registro…</p>`;
  }

  if (recs?.status === "done" && recs.lines.length) {
    return `
      <ul class="recs-list">${recs.lines.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}</ul>
      <div class="recs-foot">
        <span class="recs-note">Generado con tus datos, no es consejo médico</span>
        <button class="recs-action" data-action="generate-recs" type="button">Actualizar</button>
      </div>
    `;
  }

  if (recs?.status === "error") {
    return `
      <p class="recs-status">No pude generar recomendaciones: ${escapeHTML(recs.error || "error desconocido")}</p>
      <button class="recs-action" data-action="generate-recs" type="button">Reintentar</button>
    `;
  }

  const fallback = `<ul class="recs-list">${insight.actions.slice(0, 3).map((action) => `<li>${action}</li>`).join("")}</ul>`;

  if (provider && hasEntry) {
    return `${fallback}<button class="recs-action" data-action="generate-recs" type="button">Generar con mis datos</button>`;
  }
  if (!provider) {
    return `${fallback}<button class="recs-action" data-action="ai-config" type="button">Activa IA para recomendaciones a tu medida</button>`;
  }
  return fallback;
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
