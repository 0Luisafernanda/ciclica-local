import { focusOptions } from "../domain/actions.js?v=ciclica-value-1";

export function CheckInPanel() {
  return `
    <div class="checkin-layer" id="checkInLayer" aria-hidden="true">
      <button class="checkin-backdrop" data-action="close-checkin" type="button" aria-label="Cerrar registro"></button>
      <aside class="checkin-drawer" id="checkInPanel" role="dialog" aria-modal="true" aria-labelledby="checkin-title">
        <header class="checkin-head">
          <div>
            <h2 id="checkin-title">Cómo me siento</h2>
          </div>
          <button class="drawer-close" data-action="close-checkin" type="button" aria-label="Cerrar">×</button>
        </header>

        <form class="checkin-form" id="checkInForm">
          <fieldset class="checkin-group">
            <legend>Lo que más pesa</legend>
            <div class="choice-grid focus-choice-grid">
              ${focusOptions.map(({ id, label }) => choice("focus", id, label, id === "pain")).join("")}
            </div>
          </fieldset>

          <label class="intensity-field">
            <span><strong>Intensidad</strong><output data-checkin-intensity>5</output></span>
            <input name="intensity" type="range" min="1" max="10" value="5" />
            <small>1 · apenas presente <b>10 · ocupa todo</b></small>
          </label>

          <fieldset class="checkin-group">
            <legend>Dónde estás</legend>
            <div class="choice-row">
              ${choice("context", "work", "Trabajando", true)}
              ${choice("context", "home", "En casa")}
              ${choice("context", "outside", "Fuera")}
              ${choice("context", "resting", "Descansando")}
            </div>
          </fieldset>

          <fieldset class="checkin-group">
            <legend>Cuánto espacio tienes</legend>
            <div class="choice-row time-choice-row">
              ${choice("availableTime", "2", "2 min", true)}
              ${choice("availableTime", "10", "10 min")}
              ${choice("availableTime", "30", "Tengo tiempo")}
            </div>
          </fieldset>

          <label class="checkin-note">
            <span>Algo importante <small>opcional</small></span>
            <textarea name="note" rows="3" maxlength="280" placeholder="Una reunión, no comiste, ya probaste calor…"></textarea>
          </label>

          <footer class="checkin-submit-row">
            <p>Se guarda solo en este dispositivo.</p>
            <button class="primary-cta" type="submit">Ver qué puedo hacer</button>
          </footer>
        </form>
      </aside>
    </div>
  `;
}

function choice(name, value, label, checked = false) {
  return `
    <label class="checkin-choice">
      <input type="radio" name="${name}" value="${value}" ${checked ? "checked" : ""} />
      <span>${label}</span>
    </label>
  `;
}
