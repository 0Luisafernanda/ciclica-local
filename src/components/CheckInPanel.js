import {
  bleedingColorOptions,
  bleedingOdorOptions,
  bleedingOptions,
  focusOptions,
  intensityLevels,
  symptomCatalog,
} from "../domain/actions.js?v=ciclica-moment-31";
import { getCycleEstimate } from "../domain/cycle.js?v=ciclica-moment-31";

const phaseShort = {
  menstrual: "menstrual",
  follicular: "folicular",
  ovulatory: "ovulatoria",
  luteal: "lútea",
};

export function CheckInPanel(state = {}) {
  const estimate = getCycleEstimate(state);
  const day = Number(estimate.day);
  const hasCycle = estimate.day != null && Number.isFinite(day);
  const phase = phaseShort[estimate.phase];
  const cycleLine = hasCycle
    ? `Día ${day}${phase ? ` · ${phase}` : ""}`
    : "Sin día de ciclo";

  return `
    <div class="checkin-layer" id="checkInLayer" aria-hidden="true">
      <button class="checkin-backdrop" data-action="close-checkin" type="button" aria-label="Cerrar registro"></button>
      <aside class="checkin-drawer" id="checkInPanel" role="dialog" aria-modal="true" aria-labelledby="checkin-title">
        <div class="checkin-atmosphere" aria-hidden="true"></div>

        <header class="checkin-head">
          <button class="drawer-close" data-action="close-checkin" type="button" aria-label="Cerrar">
            <span aria-hidden="true">✕</span>
          </button>
          <p class="checkin-cycle">${cycleLine}</p>
          <h2 id="checkin-title">Registro</h2>
        </header>

        <form class="checkin-form" id="checkInForm">
          <div class="checkin-scroll">
            <section class="checkin-categories" aria-label="Qué sientes hoy">
              <p class="checkin-quiet-label">Qué sientes hoy</p>
              <div class="checkin-category-row">
                ${focusOptions.map((item) => categoryChip(item.id, item.label)).join("")}
              </div>
            </section>

            <section class="checkin-log" aria-label="Registro del momento">
              <div class="checkin-symptom" data-field="bleeding">
                <p class="checkin-symptom-name">Sangrado</p>
                <div class="checkin-symptom-levels checkin-levels-4" role="radiogroup" aria-label="Sangrado">
                  ${bleedingOptions.map((item, index) =>
                    levelChoice("bleeding", item.value, item.label, index === 0),
                  ).join("")}
                </div>
              </div>

              <div class="checkin-bleeding-detail">
                <div class="checkin-symptom" data-field="bleedingColor">
                  <p class="checkin-symptom-name">Color</p>
                  <div class="checkin-symptom-levels checkin-levels-5" role="radiogroup" aria-label="Color">
                    ${bleedingColorOptions.map((item, index) =>
                      levelChoice("bleedingColor", item.value, item.label, index === 0),
                    ).join("")}
                  </div>
                </div>
                <div class="checkin-symptom" data-field="bleedingOdor">
                  <p class="checkin-symptom-name">Olor</p>
                  <div class="checkin-symptom-levels checkin-levels-4" role="radiogroup" aria-label="Olor">
                    ${bleedingOdorOptions.map((item, index) =>
                      levelChoice("bleedingOdor", item.value, item.label, index === 0),
                    ).join("")}
                  </div>
                </div>
              </div>

              <div class="checkin-symptom-detail">
                ${symptomCatalog.map((item) => symptomRow(item)).join("")}

                <label class="checkin-line checkin-other-note">
                  <span class="sr-only">Describe qué sientes</span>
                  <input type="text" name="otherNote" maxlength="120" placeholder="Escribe qué sientes…" autocomplete="off" />
                </label>
              </div>

              <p class="checkin-empty-hint">Elige arriba qué sientes para ver el detalle.</p>
            </section>
          </div>

          <footer class="checkin-foot">
            <button class="checkin-go" type="submit">Continuar</button>
          </footer>
        </form>
      </aside>
    </div>
  `;
}

function symptomRow({ id, label, focus }) {
  return `
    <div class="checkin-symptom" data-symptom="${id}" data-focus="${focus}">
      <p class="checkin-symptom-name">${label}</p>
      <div class="checkin-symptom-levels" role="radiogroup" aria-label="${label}">
        ${intensityLevels.map((level, index) =>
          levelChoice(`symptom:${id}`, level.value, level.label, index === 0),
        ).join("")}
      </div>
    </div>
  `;
}

function categoryChip(value, label) {
  return `
    <label class="checkin-category-chip">
      <input type="checkbox" name="categories" value="${value}" />
      <span>${label}</span>
    </label>
  `;
}

function levelChoice(name, value, label, checked = false) {
  return `
    <label class="checkin-level">
      <input type="radio" name="${name}" value="${value}" ${checked ? "checked" : ""} />
      <span>${label}</span>
    </label>
  `;
}
