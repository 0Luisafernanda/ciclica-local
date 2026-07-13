import { getCycleEstimate, getPersonalInsight } from "../domain/cycle.js?v=ciclica-value-1";
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
    menstrual: "Fase menstrual probable",
    follicular: "Fase folicular probable",
    ovulatory: "Ventana ovulatoria posible",
    luteal: "Fase lútea probable",
  };

  return `
    <section class="cycle-context-band" aria-label="Contexto del ciclo">
      ${renderCycleRing({ day: estimate.day, cycleLength, phase: estimate.phase })}
      <div class="cycle-context-copy">
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
      </div>
      ${renderPhaseTimeline({ day: estimate.day, cycleLength, phase: estimate.phase })}
    </section>
  `;
}

function renderCycleRing({ day, cycleLength, phase }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = day ? Math.min(1, Math.max(0, day / cycleLength)) : 0;
  const dash = (circumference * progress).toFixed(2);
  const gap = (circumference - Number(dash)).toFixed(2);
  const label = day ? String(day) : "—";

  return `
    <div class="cycle-ring-wrap" data-phase="${escapeHTML(phase || "unknown")}" aria-hidden="true">
      <svg class="cycle-ring" viewBox="0 0 72 72" role="presentation">
        <circle class="cycle-ring-track" cx="36" cy="36" r="${radius}" />
        <circle
          class="cycle-ring-progress"
          cx="36" cy="36" r="${radius}"
          stroke-dasharray="${dash} ${gap}"
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
    <div class="cycle-phase-timeline" aria-hidden="true">
      <div class="cycle-phase-track">
        ${segments
          .map(
            (segment) => `
          <span
            class="cycle-phase-segment is-${segment.id}${phase === segment.id ? " is-current" : ""}"
            style="flex: ${segment.days} 1 0"
            title="${segment.label}"
          ></span>
        `,
          )
          .join("")}
        ${markerLeft == null ? "" : `<i class="cycle-phase-marker" style="left: ${markerLeft.toFixed(2)}%"></i>`}
      </div>
      <div class="cycle-phase-legend">
        ${segments.map((segment) => `<span class="${phase === segment.id ? "is-current" : ""}">${segment.label}</span>`).join("")}
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
    <section class="personal-insight-hero ${insight.status === "pattern" ? "has-pattern" : "is-watching"}" aria-label="Insight personal">
      <p class="section-label">Lo que Ciclica está viendo</p>
      <h1>${escapeHTML(insight.headline)}</h1>
      <p>${escapeHTML(insight.body)}</p>
      <span>${escapeHTML(insight.evidence)}</span>
    </section>
  `;
}

function renderMomentBlock(state) {
  const checkIns = Array.isArray(state.checkIns) ? state.checkIns : [];
  const active = getActiveCheckIn(checkIns);

  if (!active) {
    return `
      <section class="moment-cta-band" aria-label="Registrar un momento">
        <div>
          <p class="section-label">Ahora</p>
          <h2>¿Qué necesitas ahora?</h2>
          <p>Un momento, no un formulario. Ciclica propone una acción concreta y aprende si ayudó.</p>
        </div>
        <button class="primary-cta" data-action="open-checkin" type="button">Necesito algo ahora</button>
      </section>
    `;
  }

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
        <p class="section-label">Después de probar</p>
        <h3>${recorded ? "Respuesta guardada" : "¿Te ayudó?"}</h3>
        <p>${recorded
          ? "Esto alimenta tus próximos aprendizajes personales."
          : "Sin esta respuesta Ciclica no asume que la acción funcionó."}</p>
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
  return `Intensidad ${checkIn.intensity}/10 · ${focus} · ${context}`;
}

function feedbackLabel(feedback) {
  return {
    much: "Ayudó bastante",
    some: "Ayudó un poco",
    no: "No ayudó esta vez",
  }[feedback] || "Respuesta guardada";
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
