import { App } from "../components/App.js?v=aqua-base-7";
import { buildPlainReport } from "../domain/report.js?v=aqua-base-7";
import { clamp, toISODate } from "../domain/date.js?v=aqua-base-7";
import { listOllamaModels, generateWithOllama, generateWithOpenAI, generateWithAI } from "../services/aiProvider.js?v=aqua-base-7";
import { buildRecommendationMessages, parseRecommendations } from "../services/recommendations.js?v=aqua-base-7";

export function bindApp(root, store) {
  let state = store.getState();

  store.subscribe((nextState) => {
    state = nextState;
    root.innerHTML = App(state);
    attach();
  });

  attach();

  async function generateRecs() {
    const current = store.getState();
    const provider = current.aiConfig?.provider;
    if (!provider) return;
    const dateISO = toISODate(new Date());
    store.setState((s) => ({ ...s, aiRecs: { date: dateISO, status: "loading", lines: [] } }));
    try {
      const messages = buildRecommendationMessages(current, dateISO);
      const text = await generateWithAI(current.aiConfig, messages);
      const lines = parseRecommendations(text);
      if (!lines.length) throw new Error("La respuesta llego vacia.");
      store.setState((s) => ({ ...s, aiRecs: { date: dateISO, status: "done", lines, provider } }));
    } catch (error) {
      const friendly = /failed to fetch|networkerror/i.test(error.message)
        ? provider === "ollama"
          ? "no encontre Ollama corriendo en esa direccion"
          : "no pude conectar con el proveedor"
        : error.message;
      store.setState((s) => ({ ...s, aiRecs: { date: dateISO, status: "error", error: friendly, lines: [] } }));
    }
  }

  function attach() {
    root.querySelectorAll("[data-action='view']").forEach((button) => {
      button.addEventListener("click", () => store.setState((current) => ({ ...current, activeView: button.dataset.view })));
    });

    const profileModal = root.querySelector("#profileModal");
    const profileForm = root.querySelector("#profileForm");
    const menuModal = root.querySelector("#menuModal");

    if (!state.profile && !state.onboardingDismissed && profileModal && !profileModal.open) {
      try {
        profileModal.showModal();
      } catch {
        profileModal.setAttribute("open", "");
      }
    }

    root.querySelector("[data-action='open-menu']")?.addEventListener("click", (event) => {
      if (!menuModal) return;
      try {
        menuModal.showModal();
      } catch {
        menuModal.setAttribute("open", "");
      }
      const anchor = event.currentTarget.getBoundingClientRect();
      menuModal.style.top = `${anchor.bottom + 8}px`;
      menuModal.style.left = `${Math.max(12, anchor.right - menuModal.offsetWidth)}px`;
    });

    menuModal?.addEventListener("click", (event) => {
      if (event.target === menuModal) menuModal.close();
    });

    root.querySelectorAll("[data-action='profile']").forEach((button) => {
      button.addEventListener("click", () => {
        menuModal?.close();
        profileForm?.setAttribute("data-step", "0");
        updateOnboardingStep(profileForm);
        profileModal?.showModal();
      });
    });

    root.querySelector("[data-action='close-modal']")?.addEventListener("click", () => {
      profileModal?.close();
      if (!state.profile) {
        store.setState((current) => ({ ...current, onboardingDismissed: true }));
      }
    });

    root.querySelector("[data-action='skip-onboarding']")?.addEventListener("click", () => {
      profileModal?.close();
      store.setState((current) => ({ ...current, onboardingDismissed: true }));
      toast(root, "Puedes configurar Ciclica despues desde Ajustes.");
    });

    root.querySelectorAll("input[name='contexts']").forEach((input) => {
      input.addEventListener("change", () => {
        const exclusive = ["none", "preferNoContext"];
        if (exclusive.includes(input.value) && input.checked) {
          root.querySelectorAll("input[name='contexts']").forEach((other) => {
            if (other !== input) other.checked = false;
          });
        } else if (input.checked) {
          root.querySelectorAll("input[name='contexts'][value='none'], input[name='contexts'][value='preferNoContext']").forEach((other) => {
            other.checked = false;
          });
        }
      });
    });

    updateOnboardingStep(profileForm);

    root.querySelectorAll("[data-action='onboarding-next']").forEach((button) => {
      button.addEventListener("click", () => {
        const current = Number(profileForm?.dataset.step || 0);
        if (!canAdvance(profileForm, current)) return;
        profileForm.dataset.step = String(Math.min(3, current + 1));
        updateOnboardingStep(profileForm);
      });
    });

    root.querySelector("[data-action='onboarding-back']")?.addEventListener("click", () => {
      const current = Number(profileForm?.dataset.step || 0);
      profileForm.dataset.step = String(Math.max(0, current - 1));
      updateOnboardingStep(profileForm);
    });

    root.querySelector("#profileForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const modal = root.querySelector("#profileModal");
      const contexts = form.getAll("contexts").filter((context) => !["none", "preferNoContext"].includes(context));
      if (modal?.open) modal.close();
      store.setState((current) => ({
        ...current,
        onboardingDismissed: true,
        profile: {
          lastPeriod: form.get("lastPeriod") || "",
          cycleLength: clamp(Number(form.get("cycleLength")) || 28, 18, 60),
          regularity: form.get("regularity") || "unknown",
          contexts,
          updatedAt: new Date().toISOString(),
        },
      }));
      toast(root, "Perfil local actualizado.");
    });

    root.querySelector("#dailyForm")?.addEventListener("input", (event) => {
      const output = root.querySelector(`[data-output='${event.target.name}']`);
      if (output) output.textContent = event.target.value;
      const dial = event.target.closest(".vital-dial, .vital-slider, .metric-row");
      if (dial) dial.style.setProperty("--metric", `${Number(event.target.value) * 10}%`);
    });

    root.querySelector("#dailyForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const date = form.get("entryDate");
      store.setState((current) => ({
        ...current,
        entries: {
          ...current.entries,
          [date]: {
            date,
            bleeding: form.get("bleeding"),
            pain: Number(form.get("pain")),
            energy: Number(form.get("energy")),
            sleep: Number(form.get("sleep")),
            mood: form.get("mood"),
            skin: form.get("skin"),
            note: String(form.get("note") || "").trim(),
            updatedAt: new Date().toISOString(),
          },
        },
      }));
      toast(root, "Entrada guardada en este dispositivo.");
      if (store.getState().aiConfig?.provider) generateRecs();
    });

    root.querySelectorAll("[data-action='generate-recs']").forEach((button) => {
      button.addEventListener("click", generateRecs);
    });

    root.querySelector("[data-action='copy-report']")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(buildPlainReport(state));
        toast(root, "Reporte copiado.");
      } catch {
        toast(root, "No pude copiar automaticamente.");
      }
    });

    root.querySelector("[data-action='export']")?.addEventListener("click", () => {
      menuModal?.close();
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ciclica-local-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast(root, "Exportacion local creada.");
    });

    root.querySelector("[data-action='reset-data']")?.addEventListener("click", () => {
      menuModal?.close();
      const confirmed = window.confirm("Esto borra tu perfil y registros de este dispositivo. Si quieres conservar una copia, exporta antes. ¿Borrar datos locales?");
      if (!confirmed) return;
      store.reset();
      toast(root, "Datos locales borrados.");
    });

    const aiModal = root.querySelector("#aiModal");
    const aiForm = root.querySelector("#aiForm");

    root.querySelectorAll("[data-action='ai-config']").forEach((button) => {
      button.addEventListener("click", () => {
        menuModal?.close();
        updateAiProviderPanels(aiForm);
        try {
          aiModal?.showModal();
        } catch {
          aiModal?.setAttribute("open", "");
        }
      });
    });

    root.querySelector("[data-action='close-ai-modal']")?.addEventListener("click", () => {
      aiModal?.close();
    });

    updateAiProviderPanels(aiForm);
    root.querySelectorAll("input[name='aiProvider']").forEach((input) => {
      input.addEventListener("change", () => updateAiProviderPanels(aiForm));
    });

    root.querySelector("[data-action='ollama-list-models']")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const resultEl = aiForm?.querySelector("[data-test-result='ollama']");
      const urlInput = aiForm?.querySelector("input[name='ollamaUrl']");
      const modelInput = aiForm?.querySelector("input[name='ollamaModel']");
      const datalist = aiForm?.querySelector("#ollamaModelsList");
      button.disabled = true;
      if (resultEl) resultEl.textContent = "Buscando modelos...";
      try {
        const models = await listOllamaModels(urlInput?.value);
        if (datalist) datalist.innerHTML = models.map((name) => `<option value="${name}"></option>`).join("");
        if (resultEl) {
          resultEl.textContent = models.length
            ? `Encontrados: ${models.join(", ")}`
            : "Ollama respondio pero no tiene modelos instalados (ollama pull <modelo>).";
        }
        if (models.length && modelInput && !modelInput.value) modelInput.value = models[0];
      } catch (error) {
        if (resultEl) resultEl.textContent = `No se pudo conectar: ${error.message}`;
      } finally {
        button.disabled = false;
      }
    });

    root.querySelector("[data-action='test-ollama']")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const resultEl = aiForm?.querySelector("[data-test-result='ollama']");
      const urlInput = aiForm?.querySelector("input[name='ollamaUrl']");
      const modelInput = aiForm?.querySelector("input[name='ollamaModel']");
      button.disabled = true;
      if (resultEl) resultEl.textContent = "Probando...";
      try {
        const reply = await generateWithOllama(
          { url: urlInput?.value, model: modelInput?.value },
          [{ role: "user", content: "Respondeme con la palabra: ok" }],
        );
        if (resultEl) resultEl.textContent = `Conexion ok. Respuesta: "${reply.slice(0, 80)}"`;
      } catch (error) {
        if (resultEl) resultEl.textContent = `Fallo la prueba: ${error.message}`;
      } finally {
        button.disabled = false;
      }
    });

    root.querySelector("[data-action='test-openai']")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const resultEl = aiForm?.querySelector("[data-test-result='openai']");
      const keyInput = aiForm?.querySelector("input[name='openaiKey']");
      const modelSelect = aiForm?.querySelector("select[name='openaiModel']");
      button.disabled = true;
      if (resultEl) resultEl.textContent = "Probando...";
      try {
        const reply = await generateWithOpenAI(
          { apiKey: keyInput?.value, model: modelSelect?.value },
          [{ role: "user", content: "Respondeme con la palabra: ok" }],
        );
        if (resultEl) resultEl.textContent = `Conexion ok. Respuesta: "${reply.slice(0, 80)}"`;
      } catch (error) {
        if (resultEl) resultEl.textContent = `Fallo la prueba: ${error.message}`;
      } finally {
        button.disabled = false;
      }
    });

    aiForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const provider = form.get("aiProvider") || null;
      if (aiModal?.open) aiModal.close();
      store.setState((current) => ({
        ...current,
        aiConfig: {
          provider,
          ollama: {
            url: form.get("ollamaUrl") || "http://localhost:11434",
            model: form.get("ollamaModel") || "",
          },
          openai: {
            apiKey: form.get("openaiKey") || "",
            model: form.get("openaiModel") || "gpt-4o-mini",
          },
        },
      }));
      toast(root, provider ? "Proveedor de IA guardado." : "IA desactivada.");
    });
  }
}

function toast(root, message) {
  const node = root.querySelector("#toast");
  if (!node) return;
  node.textContent = message;
  node.classList.add("is-visible");
  window.clearTimeout(toast.timeout);
  toast.timeout = window.setTimeout(() => node.classList.remove("is-visible"), 2400);
}


function updateOnboardingStep(form) {
  if (!form) return;
  const step = Number(form.dataset.step || 0);
  form.querySelectorAll("[data-step-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", Number(panel.dataset.stepPanel) === step);
  });
  form.querySelectorAll("[data-step-dot]").forEach((dot) => {
    const dotStep = Number(dot.dataset.stepDot);
    dot.classList.toggle("is-active", dotStep === step);
    dot.classList.toggle("is-complete", dotStep < step);
  });
  form.querySelector("[data-action='onboarding-back']")?.toggleAttribute("disabled", step === 0);
  form.querySelector(".onboarding-actions")?.classList.toggle("is-intro", step === 0);
  form.querySelector(".onboarding-actions [data-action='onboarding-next']")?.classList.toggle("is-hidden", step === 0 || step === 3);
  form.querySelector("[data-action='save-profile']")?.classList.toggle("is-visible", step === 3);
}

function canAdvance(form, step) {
  if (!form) return false;
  if (step === 2) return form.elements.cycleLength.reportValidity();
  return true;
}

function updateAiProviderPanels(form) {
  if (!form) return;
  const selected = form.querySelector("input[name='aiProvider']:checked")?.value || "";
  form.querySelectorAll("[data-provider-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.providerPanel === selected);
  });
}
