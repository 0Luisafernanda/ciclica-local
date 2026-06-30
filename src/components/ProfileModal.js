export function ProfileModal(state) {
  const profile = state.profile || {};
  const contexts = profile.contexts || [];
  return `
    <dialog class="profile-modal" id="profileModal" ${!state.profile ? "open" : ""}>
      <form class="profile-form" id="profileForm" method="dialog">
        <div class="modal-head">
          <div>
            <p class="micro-label">Primeros datos</p>
            <h3>Configura Ciclica</h3>
          </div>
          <button class="icon-button" data-action="close-modal" type="button" aria-label="Cerrar">×</button>
        </div>

        <label class="field"><span>Inicio de tu ultima menstruacion</span><input name="lastPeriod" type="date" value="${profile.lastPeriod || today()}" required /></label>
        <label class="field"><span>Duracion aproximada del ciclo</span><input name="cycleLength" type="number" min="18" max="60" value="${profile.cycleLength || 28}" /></label>

        <fieldset class="stacked-choice">
          <legend>Como son tus ciclos</legend>
          ${radio("regularity", "regular", "Bastante regulares", profile.regularity || "regular")}
          ${radio("regularity", "irregular", "Irregulares", profile.regularity)}
          ${radio("regularity", "unknown", "No estoy segura", profile.regularity)}
        </fieldset>

        <fieldset class="context-grid">
          <legend>Contexto que quieres considerar</legend>
          ${check("somp", "SOMP/SOP", contexts)}
          ${check("pmdd", "TDPM/PMDD", contexts)}
          ${check("endo", "Endometriosis", contexts)}
          ${check("contraception", "Anticonceptivos", contexts)}
          ${check("perimenopause", "Perimenopausia", contexts)}
          ${check("noFertility", "No quiero foco en fertilidad", contexts)}
        </fieldset>

        <button class="button primary" type="submit">Guardar perfil local</button>
      </form>
    </dialog>
  `;
}

function radio(name, value, label, selected) {
  return `<label><input type="radio" name="${name}" value="${value}" ${selected === value ? "checked" : ""} /> <span>${label}</span></label>`;
}

function check(value, label, selected) {
  return `<label><input type="checkbox" name="contexts" value="${value}" ${selected.includes(value) ? "checked" : ""} /> <span>${label}</span></label>`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
