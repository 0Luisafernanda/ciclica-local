import { getCycleEstimate, getPersonalInsight } from "../domain/cycle.js?v=ciclica-value-1";
import { toISODate } from "../domain/date.js?v=ciclica-value-1";
import { escapeHTML } from "../utils/html.js?v=ciclica-value-1";

export function NowView(state, currentDate = new Date()) {
  const dateISO = toISODate(currentDate);
  const personalInsight = getPersonalInsight(state, dateISO);

  return `
    <section class="now-view compact-now" data-view-panel="now">
      ${renderCycleContext(state, currentDate)}
      ${renderPersonalInsight(personalInsight)}
      ${renderDailyRegister(state, dateISO)}
    </section>
  `;
}

function renderCycleContext(state, currentDate) {
  const estimate = getCycleEstimate(state, currentDate);
  const profileReady = Boolean(state.profile?.lastPeriod);

  if (!profileReady) {
    return `
      <section class="cycle-context-band" aria-label="Contexto del ciclo">
        <div>
          <p class="section-label">Ciclo</p>
          <strong>Día del ciclo</strong>
          <span>Sin estimar</span>
        </div>
        <div>
          <p class="section-label">Próximo periodo</p>
          <strong>Sin estimar</strong>
          <button class="text-action" data-action="profile" type="button">Añadir última fecha</button>
        </div>
      </section>
    `;
  }

  const cycleLength = Number(state.profile.cycleLength) || 28;
  const nextDate = addLocalDays(currentDate, estimate.nextPeriodInDays || 0);
  const phaseLabels = {
    menstrual: "Fase menstrual probable",
    follicular: "Fase folicular probable",
    ovulatory: "Ventana ovulatoria posible",
    luteal: "Fase lútea probable",
  };

  return `
    <section class="cycle-context-band" aria-label="Contexto del ciclo">
      <div>
        <p class="section-label">Tu ciclo</p>
        <strong>Día ${estimate.day} de ${cycleLength}</strong>
        <span>${escapeHTML(phaseLabels[estimate.phase] || "Fase sin estimar")}</span>
        <span>Confianza ${escapeHTML(String(estimate.confidence).toLowerCase())}</span>
      </div>
      <div>
        <p class="section-label">Próximo periodo</p>
        <strong>${formatCalendarDate(nextDate)}</strong>
        <span>en ~${estimate.nextPeriodInDays} día${estimate.nextPeriodInDays === 1 ? "" : "s"}</span>
      </div>
    </section>
  `;
}

function renderPersonalInsight(insight) {
  return `
    <section class="personal-insight-hero ${insight.status === "pattern" ? "has-pattern" : "is-watching"}" aria-label="Insight personal">
      <p class="section-label">Lo que Ciclica está viendo</p>
      <h1>${escapeHTML(insight.headline)}</h1>
      <p>${escapeHTML(insight.body)}</p>
      <span>${escapeHTML(insight.evidence)}</span>
    </section>
  `;
}

function renderDailyRegister(state, dateISO) {
  const entry = state.entries?.[dateISO] || {};
  const dailyState = entry.dailyState || "";
  const signals = Array.isArray(entry.dailySignals) ? entry.dailySignals : [];
  const expanded = dailyState === "better" || dailyState === "harder";

  return `
    <section class="daily-register" aria-label="Registro de hoy">
      <div class="daily-register-head">
        <div>
          <p class="section-label">Hoy</p>
          <h2>¿Cómo estuvo hoy respecto a lo normal?</h2>
        </div>
        <button class="period-start-button ${entry.periodStarted ? "is-selected" : ""}" data-action="period-start" data-date="${dateISO}" type="button" aria-pressed="${entry.periodStarted ? "true" : "false"}">
          Empezó mi periodo
        </button>
      </div>

      <div class="daily-choice-row" aria-label="Estado general de hoy">
        ${dailyChoice("normal", "Como siempre", dailyState)}
        ${dailyChoice("better", "Mejor", dailyState)}
        ${dailyChoice("harder", "Más difícil", dailyState)}
      </div>

      ${expanded ? `
        <div class="daily-detail">
          <div>
            <p class="daily-question">¿Qué cambió?</p>
            <div class="daily-chip-row">
              ${signalChoice("bleeding", "Sangrado", signals)}
              ${signalChoice("pain", "Dolor", signals)}
              ${signalChoice("energy", "Energía", signals)}
              ${signalChoice("mood", "Ánimo", signals)}
              ${signalChoice("sleep", "Sueño", signals)}
              ${signalChoice("digestion", "Digestión", signals)}
            </div>
          </div>
          <div>
            <p class="daily-question">¿Qué tanto?</p>
            <div class="daily-chip-row">
              ${intensityChoice("mild", "Leve", entry.dailyIntensity)}
              ${intensityChoice("notable", "Notable", entry.dailyIntensity)}
              ${intensityChoice("strong", "Fuerte", entry.dailyIntensity)}
            </div>
          </div>
        </div>
      ` : ""}
    </section>
  `;
}

function dailyChoice(value, label, selected) {
  return `<button class="daily-choice ${selected === value ? "is-selected" : ""}" data-action="daily-state" data-value="${value}" type="button" aria-pressed="${selected === value ? "true" : "false"}">${label}</button>`;
}

function signalChoice(value, label, selected) {
  const active = selected.includes(value);
  return `<button class="daily-chip ${active ? "is-selected" : ""}" data-action="daily-signal" data-value="${value}" type="button" aria-pressed="${active ? "true" : "false"}">${label}</button>`;
}

function intensityChoice(value, label, selected) {
  return `<button class="daily-chip ${selected === value ? "is-selected" : ""}" data-action="daily-intensity" data-value="${value}" type="button" aria-pressed="${selected === value ? "true" : "false"}">${label}</button>`;
}

function formatCalendarDate(date) {
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "long" }).format(date);
}

function addLocalDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + Number(days || 0));
  return result;
}
