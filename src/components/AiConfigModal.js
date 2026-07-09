import { escapeHTML } from "../utils/html.js?v=aqua-base-4";

export function AiConfigModal(state) {
  const ai = state.aiConfig || {};
  const ollama = ai.ollama || {};
  const openai = ai.openai || {};
  const provider = ai.provider || "";
  const openaiModels = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"];

  return `
    <dialog class="profile-modal ai-modal" id="aiModal" data-required="false">
      <form class="profile-form" id="aiForm" method="dialog">
        <div class="modal-head">
          <div>
            <p class="micro-label">Integracion opcional</p>
            <h3>IA para insights</h3>
          </div>
          <button class="icon-button" data-action="close-ai-modal" type="button" aria-label="Cerrar">×</button>
        </div>

        <p class="ai-modal-intro">Apagado por defecto. Ciclica funciona entera sin esto. Si querés una lectura mas rica sobre tus registros, elegi un proveedor.</p>

        <fieldset class="choice-cards stacked-choice" aria-label="Proveedor de IA">
          <legend>Proveedor</legend>
          <label>
            <input type="radio" name="aiProvider" value="" ${provider === "" ? "checked" : ""} />
            <span><strong>Ninguno</strong><small>Solo la lectura basada en reglas locales, sin llamadas externas.</small></span>
          </label>
          <label>
            <input type="radio" name="aiProvider" value="ollama" ${provider === "ollama" ? "checked" : ""} />
            <span><strong>Ollama (local)</strong><small>Corre en tu maquina. Nada sale de tu red local.</small></span>
          </label>
          <label>
            <input type="radio" name="aiProvider" value="openai" ${provider === "openai" ? "checked" : ""} />
            <span><strong>OpenAI (nube)</strong><small>Tus registros se envian a los servidores de OpenAI.</small></span>
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
              ${openaiModels.map((model) => `<option value="${model}" ${openai.model === model ? "selected" : ""}>${model}</option>`).join("")}
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
