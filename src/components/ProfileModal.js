export function ProfileModal(state) {
  const profile = state.profile || {};
  const contexts = profile.contexts || [];

  return `
    <dialog class="profile-modal" id="profileModal" data-required="false">
      <form class="profile-form" id="profileForm" method="dialog">
        <div class="modal-head">
          <div>
            <p class="micro-label">Opcional</p>
            <h3>Perfil local</h3>
          </div>
          <button class="icon-button" data-action="close-modal" type="button" aria-label="Cerrar">×</button>
        </div>

        <p class="modal-copy">Solo completa esto si te ayuda a afinar las fases. Para registrar hoy, usa la pantalla principal.</p>

        <label class="field app-field"><span>Fecha aproximada del último periodo</span><input name="lastPeriod" type="date" value="${profile.lastPeriod || today()}" /></label>

        <label class="field app-field compact-number"><span>Duración aproximada del ciclo</span><input name="cycleLength" type="number" min="18" max="60" value="${profile.cycleLength || 28}" inputmode="numeric" /></label>

        <fieldset class="choice-cards stacked-choice">
          <legend>Cómo suelen ser tus ciclos</legend>
          ${radio("regularity", "regular", "Bastante regulares", "Llegan con una cadencia parecida.", profile.regularity || "unknown")}
          ${radio("regularity", "irregular", "Irregulares", "Cambian bastante de un ciclo a otro.", profile.regularity)}
          ${radio("regularity", "unknown", "No estoy segura", "Prefiero que Feer observe primero.", profile.regularity || "unknown")}
          ${radio("regularity", "skip", "Prefiero no responder", "No usar esto para estimar por ahora.", profile.regularity)}
        </fieldset>

        <fieldset class="context-grid context-cards">
          <legend>Contexto opcional</legend>
          ${check("none", "No aplica", "ninguna opcion me representa", contexts)}
          ${check("somp", "SOMP", "antes SOP", contexts)}
          ${check("pmdd", "TDPM", "PMDD", contexts)}
          ${check("endo", "Endometriosis", "dolor pelvico", contexts)}
          ${check("contraception", "Anticonceptivos", "hormonales o no", contexts)}
          ${check("perimenopause", "Perimenopausia", "transicion hormonal", contexts)}
          ${check("noFertility", "Sin foco fertilidad", "minimizar ovulacion", contexts)}
          ${check("preferNoContext", "Prefiero no responder", "por ahora", contexts)}
        </fieldset>

        <div class="modal-actions">
          <button class="button ghost" data-action="close-modal" type="button">Cerrar</button>
          <button class="button primary" data-action="save-profile" type="submit">Guardar</button>
        </div>
      </form>
    </dialog>
  `;
}

function radio(name, value, label, detail, selected) {
  return `
    <label>
      <input type="radio" name="${name}" value="${value}" ${selected === value ? "checked" : ""} />
      <span><strong>${label}</strong><small>${detail}</small></span>
    </label>
  `;
}

function check(value, label, detail, selected) {
  return `
    <label>
      <input type="checkbox" name="contexts" value="${value}" ${selected.includes(value) ? "checked" : ""} />
      <span><strong>${label}</strong><small>${detail}</small></span>
    </label>
  `;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
