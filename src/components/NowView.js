import { focusOptions, getMomentInterpretation } from "../domain/actions.js?v=ciclica-one-1";
import { escapeHTML } from "../utils/html.js?v=ciclica-one-1";

const focusLabels = Object.fromEntries(focusOptions.map((item) => [item.id, item.label]));
const contextLabels = {
  work: "trabajando",
  home: "en casa",
  outside: "fuera",
  resting: "descansando",
};

export function NowView(state) {
  const checkIns = Array.isArray(state.checkIns) ? state.checkIns : [];
  const latest = checkIns.at(-1);

  return `
    <section class="now-view compact-now" data-view-panel="now">
      ${latest ? renderMoment(state, latest, checkIns.slice(0, -1)) : renderStart()}
    </section>
  `;
}

function renderStart() {
  return `
    <div class="single-start">
      <p class="eyebrow">${formatDay(new Date())}</p>
      <h1>¿Cómo estás ahora?</h1>
      <p>Cuéntale a Ciclica qué pesa más. Te devolverá una acción posible para este momento.</p>
      <button class="primary-cta" data-action="open-checkin" type="button">Contarle a Ciclica</button>
      <small>Todo queda en este dispositivo.</small>
    </div>
  `;
}

function renderMoment(state, latest, previous) {
  const interpretation = getMomentInterpretation(latest, previous);
  const action = latest.action;
  const focus = focusLabels[latest.focus] || "Señal registrada";

  return `
    <header class="compact-moment-head">
      <div>
        <p class="eyebrow">Ahora · ${formatTime(latest.createdAt)}</p>
        <h1>${escapeHTML(focus)} <span>${Number(latest.intensity) || 0}/10</span></h1>
        <p>${escapeHTML(contextLabels[latest.context] || "contexto personal")}</p>
      </div>
      <button class="text-action" data-action="open-checkin" type="button">Actualizar</button>
    </header>

    <div class="compact-flow">
      <section class="compact-line">
        <p class="section-label">Puede influir · ${escapeHTML(interpretation.confidence)}</p>
        <p>${escapeHTML(interpretation.body)}</p>
      </section>

      ${action ? renderAction(latest, action) : ""}
      ${action ? renderFeedback(latest) : ""}
    </div>
  `;
}

function renderAction(checkIn, action) {
  return `
    <section class="compact-line compact-action">
      <div class="compact-line-head">
        <p class="section-label">Prueba ahora</p>
        <span>${Number(action.durationMinutes) || 2} min</span>
      </div>
      <h2>${escapeHTML(action.title)}</h2>
      <p>${escapeHTML(action.steps.slice(0, 3).join(" · "))}</p>
      <div class="compact-controls">
        <button class="primary-cta compact" data-action="start-action" data-checkin-id="${escapeHTML(checkIn.id)}" type="button">Empezar</button>
        <button class="text-action" data-action="open-checkin" data-focus="${escapeHTML(checkIn.focus)}" type="button">Otra opción</button>
      </div>
    </section>
  `;
}

function renderFeedback(checkIn) {
  if (checkIn.feedback) {
    const labels = { much: "Ayudó bastante", some: "Ayudó un poco", no: "No ayudó" };
    return `
      <section class="compact-feedback is-recorded">
        <p><strong>${labels[checkIn.feedback] || "Respuesta guardada"}.</strong> Ciclica lo tendrá en cuenta la próxima vez.</p>
      </section>
    `;
  }

  return `
    <section class="compact-feedback">
      <p><strong>¿Te ayudó?</strong></p>
      <div class="feedback-options">
        <button data-action="action-feedback" data-checkin-id="${escapeHTML(checkIn.id)}" data-feedback="much" type="button">Bastante</button>
        <button data-action="action-feedback" data-checkin-id="${escapeHTML(checkIn.id)}" data-feedback="some" type="button">Un poco</button>
        <button data-action="action-feedback" data-checkin-id="${escapeHTML(checkIn.id)}" data-feedback="no" type="button">No</button>
      </div>
    </section>
  `;
}

function formatDay(date) {
  return new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "ahora" : new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit" }).format(date);
}
