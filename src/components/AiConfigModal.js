import { escapeHTML } from "../utils/html.js?v=feer-1";

const OPENAI_MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"];

export function AiConfigModal(state) {
  const ai = state.aiConfig || {};
  const ollama = ai.ollama || {};
  const openai = ai.openai || {};
  const provider = ai.provider === undefined ? "ollama" : ai.provider;

  return `
    <dialog class="profile-modal ai-modal" id="aiModal" data-required="false">
      <form class="profile-form" id="aiForm" method="dialog">
        <div class="modal-head">
          <div>
            <p class="micro-label">Motor de recomendaciones</p>
            <h3>Elige dónde corre la inferencia</h3>
          </div>
          <button class="icon-button" data-action="close-ai-modal" type="button" aria-label="Cerrar">×</button>
        </div>

        <p class="ai-modal-intro">Esto define si las lecturas opcionales de IA se procesan localmente o en la nube. Las acciones contextuales y los aprendizajes básicos siguen funcionando sin IA.</p>

        <fieldset class="choice-cards stacked-choice" aria-label="Proveedor de IA">
          <legend>Proveedor</legend>
          <label>
            <input type="radio" name="aiProvider" value="ollama" ${provider === "ollama" ? "checked" : ""} />
            <span>
              <strong>Ollama local <small class="choice-tag">Recomendado</small></strong>
              <small>Corre en tu máquina en <code>http://localhost:11434</code>. Nada sale de tu red local.</small>
            </span>
          </label>
          <label>
            <input type="radio" name="aiProvider" value="openai" ${provider === "openai" ? "checked" : ""} />
            <span>
              <strong>OpenAI <small class="choice-tag choice-tag-warning">Nube</small></strong>
              <small>Tus registros viajan a OpenAI para generar la respuesta. La API key queda solo en este dispositivo.</small>
            </span>
          </label>
          <label>
            <input type="radio" name="aiProvider" value="" ${provider == null ? "checked" : ""} />
            <span>
              <strong>Desactivar IA</strong>
              <small>La app sigue funcionando con reglas locales y sin llamadas externas.</small>
            </span>
          </label>
        </fieldset>

        <div class="ai-provider-panel" data-provider-panel="ollama">
          <label class="field app-field">
            <span>URL del servidor</span>
            <input name="ollamaUrl" type="text" value="${escapeHTML(ollama.url || "http://localhost:11434")}" placeholder="http://localhost:11434" />
          </label>
          <label class="field app-field">
            <span>Modelo</span>
            <input name="ollamaModel" type="text" value="${escapeHTML(ollama.model || "")}" placeholder="llama3.2" list="ollamaModelsList" />
            <datalist id="ollamaModelsList"></datalist>
          </label>
          <div class="ai-test-row">
            <button class="button ghost" data-action="ollama-list-models" type="button">Buscar modelos instalados</button>
            <button class="button ghost" data-action="test-ollama" type="button">Probar conexion</button>
          </div>
          <p class="ai-test-result" data-test-result="ollama"></p>
        </div>

        <div class="ai-provider-panel" data-provider-panel="openai">
          <label class="field app-field">
            <span>API key</span>
            <input name="openaiKey" type="password" value="${escapeHTML(openai.apiKey || "")}" placeholder="sk-..." autocomplete="off" />
          </label>
          <label class="field app-field">
            <span>Modelo</span>
            <select name="openaiModel">
              ${OPENAI_MODELS.map((model) => `<option value="${model}" ${openai.model === model ? "selected" : ""}>${model}</option>`).join("")}
            </select>
          </label>
          <p class="ai-warning">Con OpenAI, tus registros dejan de ser 100% locales: se envian a un tercero para generar la respuesta. La API key se guarda solo en este dispositivo, pero viaja en cada consulta.</p>
          <div class="ai-test-row">
            <button class="button ghost" data-action="test-openai" type="button">Probar conexion</button>
          </div>
          <p class="ai-test-result" data-test-result="openai"></p>
        </div>

        <div class="onboarding-actions">
          <button class="button primary" data-action="save-ai-config" type="submit">Guardar</button>
        </div>
      </form>
    </dialog>
  `;
}
