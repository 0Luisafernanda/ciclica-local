import { getInsight } from "../domain/cycle.js";
import { toISODate } from "../domain/date.js";
import { escapeHTML } from "../utils/html.js";
import { bleedingLabels, moodLabels } from "../data/labels.js";

export function TodayView(state) {
  const date = toISODate(new Date());
  const entry = state.entries[date] || {};
  const insight = getInsight(state, date);
  const hasEntry = Boolean(state.entries[date]);
  const dayLabel = formatDay(date);
  const profileReady = Boolean(state.profile?.lastPeriod);

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
  const insightActions = insight.actions.slice(0, 2).map((action) => `<li>${action}</li>`).join("");

  return `
    <section class="view is-visible" data-view-panel="today">
      <section class="panel today-focus-card">
        <p class="micro-label">${dayLabel}</p>
        <p class="hero-lead">Una sola vista principal para registrar hoy, entender lo importante y seguir sin ruido.</p>
        <h3>${hasEntry ? `Tu registro de hoy` : `Registra hoy`}</h3>
        <p>${insight.title}</p>
        <p>${insight.body}</p>

        <div class="focus-chips">
          <span class="chip chip-inline">Ánimo: ${moodValue}</span>
          <span class="chip chip-inline">Sangrado: ${bleedingValue}</span>
          <span class="chip chip-inline">Local ${profileReady ? "activo" : "básico"}</span>
        </div>
      </section>

      <section class="panel pocket-guidance" aria-label="Qué observar hoy">
        <div class="guidance-head">
          <p class="micro-label">Lectura local</p>
          <strong>${profileReady ? "Personal" : "Básica"}</strong>
        </div>
        <ul class="insight-list">
          ${insightActions}
        </ul>
        <p class="privacy-line">Tus datos permanecen en este dispositivo.</p>
      </section>

      ${profileReady
        ? ""
        : `
        <section class="panel callout-panel" role="note">
          <p><strong>Sin configuración completa.</strong> Puedes registrar hoy y ajustar tu perfil cuando quieras.</p>
          <button class="button ghost" data-action="profile" type="button">Completar</button>
        </section>
      `}

      <form class="panel daily-form" id="dailyForm">
        <input name="entryDate" type="hidden" value="${date}" />

        <div class="section-title">
          <h4>Registro rápido</h4>
          <p>Treinta segundos. Sin juzgar.</p>
        </div>

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
