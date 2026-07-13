import { getCycleEstimate, getPersonalInsight } from "../domain/cycle.js?v=ciclica-moment-9";
import { getMomentInterpretation } from "../domain/actions.js?v=ciclica-value-1";
import { toISODate } from "../domain/date.js?v=ciclica-value-1";
import { escapeHTML } from "../utils/html.js?v=ciclica-value-1";

export function NowView(state, currentDate = new Date()) {
  const dateISO = toISODate(currentDate);
  const personalInsight = getPersonalInsight(state, dateISO);

  return `
    <section class="now-view compact-now" data-view-panel="now">
      ${renderCycleContext(state, currentDate)}
      ${renderPersonalInsight(personalInsight)}
      ${renderMomentBlock(state)}
      ${renderDailyRegister(state, dateISO)}
    </section>
  `;
}

function renderCycleContext(state, currentDate) {
  const estimate = getCycleEstimate(state, currentDate);
  const profileReady = Boolean(state.profile?.lastPeriod);

  if (!profileReady) {
    return `
      <section class="cycle-context-band is-empty" aria-label="Contexto del ciclo">
        ${renderCycleRing({ day: null, cycleLength: 28, phase: "unknown" })}
        <div class="cycle-context-copy">
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
        </div>
        ${renderPhaseTimeline({ day: null, cycleLength: 28, phase: "unknown" })}
      </section>
    `;
  }

  const cycleLength = Number(state.profile.cycleLength) || 28;
  const nextDate = addLocalDays(currentDate, estimate.nextPeriodInDays || 0);
  const phaseLabels = {
    menstrual: "Fase menstrual",
    follicular: "Fase folicular",
    ovulatory: "Ventana ovulatoria",
    luteal: "Fase lútea",
  };
  const phaseName = phaseLabels[estimate.phase] || "Fase sin estimar";
  const irregular =
    state.profile.regularity !== "regular" || (state.profile.contexts || []).includes("somp");
  const dayMeta = irregular
    ? `Día ${estimate.day} de ${cycleLength}, ciclo irregular`
    : `Día ${estimate.day} de ${cycleLength}`;

  return `
    <section class="cycle-context-band" data-phase="${escapeHTML(estimate.phase)}" aria-label="Contexto del ciclo">
      ${renderCycleRing({ day: estimate.day, cycleLength, phase: estimate.phase })}
      <div class="cycle-context-copy">
        <div class="cycle-phase-cell">
          <p class="section-label">Tu ciclo</p>
          <strong class="cycle-phase-name">${escapeHTML(phaseName)}</strong>
          <span class="cycle-phase-meta">${escapeHTML(dayMeta)}</span>
        </div>
        <div>
          <p class="section-label">Próximo periodo</p>
          <strong>${formatCalendarDate(nextDate)}</strong>
          <span>en ~${estimate.nextPeriodInDays} día${estimate.nextPeriodInDays === 1 ? "" : "s"}</span>
        </div>
      </div>
      ${renderPhaseTimeline({ day: estimate.day, cycleLength, phase: estimate.phase })}
    </section>
  `;
}

function renderCycleRing({ day, cycleLength, phase }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const length = Math.max(18, Number(cycleLength) || 28);
  const bounds = getPhaseBounds(length);
  const ranges = {
    menstrual: { start: 1, end: bounds.menstrualEnd },
    follicular: { start: bounds.menstrualEnd + 1, end: bounds.follicularEnd },
    ovulatory: { start: bounds.follicularEnd + 1, end: bounds.ovulatoryEnd },
    luteal: { start: bounds.ovulatoryEnd + 1, end: length },
  };
  const range = ranges[phase] || { start: 1, end: length };
  const phaseDays = Math.max(1, range.end - range.start + 1);
  const phaseArc = (phaseDays / length) * circumference;
  const phaseOffset = ((range.start - 1) / length) * circumference;
  const progressDay = day ? Math.min(range.end, Math.max(range.start, day)) : range.start;
  const progressDays = Math.max(0, progressDay - range.start + 1);
  const progressArc = (progressDays / length) * circumference;
  const label = day ? String(day) : "—";

  return `
    <div class="cycle-ring-wrap" data-phase="${escapeHTML(phase || "unknown")}" aria-hidden="true">
      <svg class="cycle-ring" viewBox="0 0 72 72" role="presentation">
        <circle class="cycle-ring-track" cx="36" cy="36" r="${radius}" />
        <circle
          class="cycle-ring-phase"
          cx="36" cy="36" r="${radius}"
          stroke-dasharray="${phaseArc.toFixed(2)} ${(circumference - phaseArc).toFixed(2)}"
          stroke-dashoffset="${(-phaseOffset).toFixed(2)}"
          transform="rotate(-90 36 36)"
        />
        <circle
          class="cycle-ring-progress"
          cx="36" cy="36" r="${radius}"
          stroke-dasharray="${progressArc.toFixed(2)} ${(circumference - progressArc).toFixed(2)}"
          stroke-dashoffset="${(-phaseOffset).toFixed(2)}"
          transform="rotate(-90 36 36)"
        />
      </svg>
      <div class="cycle-ring-label">
        <strong>${escapeHTML(label)}</strong>
        <span>${day ? "día" : "ciclo"}</span>
      </div>
    </div>
  `;
}

function renderPhaseTimeline({ day, cycleLength, phase }) {
  const bounds = getPhaseBounds(cycleLength);
  const segments = [
    { id: "menstrual", label: "Menstrual", days: bounds.menstrualEnd },
    { id: "follicular", label: "Folicular", days: bounds.follicularEnd - bounds.menstrualEnd },
    { id: "ovulatory", label: "Ovulatoria", days: bounds.ovulatoryEnd - bounds.follicularEnd },
    { id: "luteal", label: "Lútea", days: Math.max(1, cycleLength - bounds.ovulatoryEnd) },
  ];
  const markerLeft = day ? Math.min(100, Math.max(0, ((day - 0.5) / cycleLength) * 100)) : null;

  return `
    <div class="cycle-phase-timeline" aria-label="Fases del ciclo">
      <div class="cycle-phase-track-wrap">
        <div class="cycle-phase-track">
          ${segments
            .map(
              (segment) => `
            <span
              class="cycle-phase-segment is-${segment.id}${phase === segment.id ? " is-current" : ""}"
              style="flex: ${segment.days} 1 0%"
            ></span>
          `,
            )
            .join("")}
        </div>
        ${markerLeft == null ? "" : `<i class="cycle-phase-marker" style="left: ${markerLeft.toFixed(2)}%"></i>`}
      </div>
      <div class="cycle-phase-legend">
        ${segments
          .map(
            (segment) => `
          <span
            class="cycle-phase-legend-item${phase === segment.id ? " is-current" : ""}"
            style="flex: ${segment.days} 1 0%"
          >${segment.label}</span>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function getPhaseBounds(cycleLength) {
  const length = Math.max(18, Number(cycleLength) || 28);
  const menstrualEnd = 5;
  const follicularEnd = Math.max(10, Math.floor(length * 0.45));
  const ovulatoryEnd = Math.max(14, Math.floor(length * 0.58));
  return { menstrualEnd, follicularEnd, ovulatoryEnd };
}

function renderPersonalInsight(insight) {
  return `
    <section class="pattern-card ${insight.status === "pattern" ? "has-pattern" : "is-watching"}" aria-label="Patrones">
      <p class="section-label">Patrones</p>
      <h2 class="pattern-title">${escapeHTML(insight.headline)}</h2>
      <p class="pattern-body">${escapeHTML(insight.body)}</p>
      ${insight.evidence ? `<p class="pattern-evidence">${escapeHTML(insight.evidence)}</p>` : ""}
    </section>
  `;
}

function renderMomentBlock(state) {
  const checkIns = Array.isArray(state.checkIns) ? state.checkIns : [];
  const active = getActiveCheckIn(checkIns);

  if (!active) return "";

  const previous = checkIns.filter((item) => item.id !== active.id);
  const reading = getMomentInterpretation(active, previous);
  const action = active.action || {};
  const started = Boolean(active.actionStartedAt);
  const recorded = Boolean(active.feedback);

  return `
    <section class="now-flow moment-action-block" aria-label="Acción para ahora">
      <section class="moment-reading">
        <div class="section-heading-row">
          <p class="section-label">Este momento</p>
          <span class="confidence-text">${escapeHTML(reading.confidence)}</span>
        </div>
        <h3>${escapeHTML(reading.headline)}</h3>
        <p class="moment-context">${escapeHTML(describeMomentMeta(active))}</p>
        <p>${escapeHTML(reading.body)}</p>
        ${reading.caution ? `<p class="care-note">${escapeHTML(reading.caution)}</p>` : ""}
      </section>

      <section class="action-section">
        <div class="section-heading-row">
          <p class="section-label">Qué hacer ahora</p>
          <span class="action-duration">${Number(action.durationMinutes) || 2} min</span>
        </div>
        <h3>${escapeHTML(action.title || "Acción preparada")}</h3>
        <p class="action-why">${escapeHTML(action.why || "")}</p>
        <ol class="action-steps">
          ${(action.steps || []).map((step) => `<li>${escapeHTML(step)}</li>`).join("")}
        </ol>
        <div class="action-controls">
          ${started
            ? `<span class="confidence-text">Acción iniciada</span>`
            : `<button class="primary-cta compact" data-action="start-action" data-checkin-id="${escapeHTML(active.id)}" type="button">Prueba ahora</button>`}
          <button class="text-action" data-action="open-checkin" type="button">Necesito otra cosa</button>
        </div>
      </section>

      <section class="feedback-section ${recorded ? "is-recorded" : ""}">
        <p class="section-label">Después</p>
        <h3>${recorded ? "Quedó anotado" : "¿Te ayudó?"}</h3>
        ${recorded
          ? `<p class="confidence-text">${escapeHTML(feedbackLabel(active.feedback))}</p>`
          : `
            <div class="feedback-options">
              <button data-action="action-feedback" data-checkin-id="${escapeHTML(active.id)}" data-feedback="much" type="button">Bastante</button>
              <button data-action="action-feedback" data-checkin-id="${escapeHTML(active.id)}" data-feedback="some" type="button">Un poco</button>
              <button data-action="action-feedback" data-checkin-id="${escapeHTML(active.id)}" data-feedback="no" type="button">No</button>
            </div>
          `}
      </section>
    </section>
  `;
}

function renderDailyRegister(state, dateISO) {
  const entry = state.entries?.[dateISO] || {};

  return `
    <section class="daily-register" aria-label="Cómo me siento hoy">
      <div class="daily-register-head">
        <div>
          <p class="section-label">Hoy</p>
          <div class="daily-title-row">
            <button class="daily-title-button" data-action="open-checkin" type="button">
              Cómo me siento
            </button>
            <button class="quiet-plus" data-action="open-checkin" type="button" aria-label="Añadir detalle">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1.5v11M1.5 7h11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>
        <button class="text-action period-text-action ${entry.periodStarted ? "is-selected" : ""}" data-action="period-start" data-date="${dateISO}" type="button" aria-pressed="${entry.periodStarted ? "true" : "false"}">
          Empezó mi periodo
        </button>
      </div>
    </section>
  `;
}

function getActiveCheckIn(checkIns) {
  for (let index = checkIns.length - 1; index >= 0; index -= 1) {
    const item = checkIns[index];
    if (item?.action && !item.feedback) return item;
  }
  return null;
}

function describeMomentMeta(checkIn) {
  const focusLabels = {
    pain: "dolor",
    lowEnergy: "sin energía",
    anxious: "ansiedad",
    sensitive: "sensibilidad",
    bloated: "hinchazón",
    focus: "dificultad para concentrarte",
  };
  const contextLabels = {
    work: "trabajando",
    home: "en casa",
    outside: "fuera",
    resting: "descansando",
  };
  const focus = focusLabels[checkIn.focus] || "esta señal";
  const context = contextLabels[checkIn.context] || "en este contexto";
  return `Intensidad ${checkIn.intensity}/10, ${focus}, ${context}`;
}

function feedbackLabel(feedback) {
  return {
    much: "Ayudó bastante",
    some: "Ayudó un poco",
    no: "No ayudó esta vez",
  }[feedback] || "Respuesta guardada";
}

function formatCalendarDate(date) {
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "long" }).format(date);
}

function addLocalDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + Number(days || 0));
  return result;
}
