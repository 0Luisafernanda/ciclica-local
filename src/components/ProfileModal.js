export function ProfileModal(state) {
  const profile = state.profile || {};
  const contexts = profile.contexts || [];
  const isFirstRun = !state.profile;

  return `
    <dialog class="profile-modal onboarding-sheet" id="profileModal" data-required="false">
      <form class="profile-form onboarding-form" id="profileForm" method="dialog" data-step="0">
        <div class="modal-head onboarding-head">
          <div>
            <p class="micro-label">${isFirstRun ? "Bienvenida" : "Ajustes"}</p>
            <h3>${isFirstRun ? "Tu espacio local" : "Perfil local"}</h3>
          </div>
          <button class="icon-button" data-action="close-modal" type="button" aria-label="Cerrar">×</button>
        </div>

        <div class="step-progress" aria-label="Progreso de configuracion">
          ${[0, 1, 2, 3].map((step) => `<span data-step-dot="${step}"></span>`).join("")}
        </div>

        <section class="onboarding-step intro-step is-active" data-step-panel="0">
          <p class="step-count">Opcional</p>
          <h4>Empieza sin explicar tu cuerpo.</h4>
          <p>Puedes registrar tu dia sin contestar nada ahora. Si despues quieres estimaciones de fase, agregas lo basico.</p>
          <div class="entry-options">
            <button class="entry-option primary-option" data-action="onboarding-next" type="button">
              <strong>Configurar lo minimo</strong>
              <span>Fecha aproximada y ritmo del ciclo.</span>
            </button>
            <button class="entry-option" data-action="skip-onboarding" type="button">
              <strong>Entrar sin responder</strong>
              <span>Solo registrar hoy. Sin preguntas iniciales.</span>
            </button>
          </div>
        </section>

        <section class="onboarding-step" data-step-panel="1">
          <p class="step-count">1 de 3</p>
          <h4>Un punto de partida</h4>
          <p>Si no recuerdas la fecha exacta, usa una aproximada. Tambien puedes volver atras y entrar sin responder.</p>
          <label class="field app-field"><span>Inicio de tu ultima menstruacion</span><input name="lastPeriod" type="date" value="${profile.lastPeriod || today()}" /></label>
        </section>

        <section class="onboarding-step" data-step-panel="2">
          <p class="step-count">2 de 3</p>
          <h4>Ritmo, si lo sabes</h4>
          <p>No hay respuesta correcta. Esto solo ayuda a que Ciclica no asuma un calendario perfecto.</p>
          <label class="field app-field compact-number"><span>Duracion aproximada</span><input name="cycleLength" type="number" min="18" max="60" value="${profile.cycleLength || 28}" inputmode="numeric" /></label>
          <fieldset class="choice-cards stacked-choice">
            <legend>Como suelen ser tus ciclos</legend>
            ${radio("regularity", "regular", "Bastante regulares", "Llegan con una cadencia parecida.", profile.regularity || "unknown")}
            ${radio("regularity", "irregular", "Irregulares", "Cambian bastante de un ciclo a otro.", profile.regularity)}
            ${radio("regularity", "unknown", "No estoy segura", "Prefiero que Ciclica observe primero.", profile.regularity || "unknown")}
            ${radio("regularity", "skip", "Prefiero no responder", "No usar esto para estimar por ahora.", profile.regularity)}
          </fieldset>
        </section>

        <section class="onboarding-step" data-step-panel="3">
          <p class="step-count">3 de 3</p>
          <h4>Contexto opcional</h4>
          <p>Marca solo lo que te sirva. Si nada encaja, puedes dejarlo vacio o elegir no aplica.</p>
          <fieldset class="context-grid context-cards">
            <legend>Considerar en las lecturas</legend>
            ${check("none", "No aplica", "ninguna opcion me representa", contexts)}
            ${check("somp", "SOMP", "antes SOP", contexts)}
            ${check("pmdd", "TDPM", "PMDD", contexts)}
            ${check("endo", "Endometriosis", "dolor pelvico", contexts)}
            ${check("contraception", "Anticonceptivos", "hormonales o no", contexts)}
            ${check("perimenopause", "Perimenopausia", "transicion hormonal", contexts)}
            ${check("noFertility", "Sin foco fertilidad", "minimizar ovulacion", contexts)}
            ${check("preferNoContext", "Prefiero no responder", "por ahora", contexts)}
          </fieldset>
        </section>

        <div class="onboarding-actions">
          <button class="button ghost" data-action="onboarding-back" type="button">Atras</button>
          <button class="button primary" data-action="onboarding-next" type="button">Continuar</button>
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
