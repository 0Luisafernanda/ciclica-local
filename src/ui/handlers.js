import { App } from "../components/App.js?v=ciclica-moment-2";
import { buildPlainReport } from "../domain/report.js?v=ciclica-value-1";
import { clamp, toISODate } from "../domain/date.js?v=ciclica-value-1";
import { getActionPlan } from "../domain/actions.js?v=ciclica-value-1";
import { listOllamaModels, generateWithOllama, generateWithOpenAI, generateWithAI, resolveAIProvider } from "../services/aiProvider.js?v=ciclica-value-1";
import { buildRecommendationMessages, parseRecommendations } from "../services/recommendations.js?v=ciclica-value-1";

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
    const provider = resolveAIProvider(current.aiConfig);
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
          ? "No encontre Ollama corriendo en esa direccion. Si prefieres nube, cambia a OpenAI en Configuración."
          : "No pude conectar con el proveedor de IA"
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
    const checkInLayer = root.querySelector("#checkInLayer");
    const checkInForm = root.querySelector("#checkInForm");
    const today = toISODate(new Date());

    root.querySelectorAll("[data-action='daily-state']").forEach((button) => {
      button.addEventListener("click", () => {
        const dailyState = button.dataset.value;
        store.setState((current) => {
          const existing = current.entries?.[today];
          const changes = dailyState === "normal"
            ? { dailyState, dailySignals: [], dailyIntensity: null }
            : { dailyState };
          return {
            ...current,
            entries: {
              ...current.entries,
              [today]: mergeDailyLogIntoEntry(existing, today, changes),
            },
          };
        });
      });
    });

    root.querySelectorAll("[data-action='daily-signal']").forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.dataset.value;
        store.setState((current) => {
          const existing = current.entries?.[today] || {};
          const dailySignals = toggleDailySignal(existing.dailySignals, value);
          return {
            ...current,
            entries: {
              ...current.entries,
              [today]: mergeDailyLogIntoEntry(existing, today, { dailySignals }),
            },
          };
        });
      });
    });

    root.querySelectorAll("[data-action='daily-intensity']").forEach((button) => {
      button.addEventListener("click", () => {
        const dailyIntensity = button.dataset.value;
        store.setState((current) => {
          const existing = current.entries?.[today] || {};
          return {
            ...current,
            entries: {
              ...current.entries,
              [today]: mergeDailyLogIntoEntry(existing, today, { dailyIntensity }),
            },
          };
        });
      });
    });

    root.querySelector("[data-action='period-start']")?.addEventListener("click", () => {
      store.setState((current) => {
        const existing = current.entries?.[today] || {};
        if (existing.periodStarted) return current;
        const profile = {
          cycleLength: 28,
          regularity: "unsure",
          contexts: [],
          ...(current.profile || {}),
          lastPeriod: today,
        };
        return {
          ...current,
          profile,
          entries: {
            ...current.entries,
            [today]: mergeDailyLogIntoEntry(existing, today, {
              periodStarted: true,
              bleeding: existing.bleeding === "none" ? "medium" : existing.bleeding || "medium",
              dailySignals: [...new Set([...(existing.dailySignals || []), "bleeding"])],
            }),
          },
        };
      });
    });

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

    const openCheckIn = (focus) => {
      if (!checkInLayer || !checkInForm) return;
      if (focus) {
        const selected = checkInForm.querySelector(`input[name='focus'][value='${focus}']`);
        if (selected) selected.checked = true;
      }
      checkInLayer.classList.add("is-open");
      checkInLayer.setAttribute("aria-hidden", "false");
      document.body.classList.add("drawer-open");
      window.setTimeout(() => checkInForm.querySelector("input[name='intensity']")?.focus(), 40);
    };

    const closeCheckIn = () => {
      checkInLayer?.classList.remove("is-open");
      checkInLayer?.setAttribute("aria-hidden", "true");
      document.body.classList.remove("drawer-open");
    };

    root.querySelectorAll("[data-action='open-checkin']").forEach((button) => {
      button.addEventListener("click", () => openCheckIn(button.dataset.focus));
    });
    root.querySelectorAll("[data-action='close-checkin']").forEach((button) => {
      button.addEventListener("click", closeCheckIn);
    });

    checkInForm?.querySelector("input[name='intensity']")?.addEventListener("input", (event) => {
      const output = checkInForm.querySelector("[data-checkin-intensity]");
      if (output) output.textContent = event.target.value;
    });

    checkInForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const now = new Date();
      const draft = {
        id: globalThis.crypto?.randomUUID?.() || `moment-${now.getTime()}`,
        createdAt: now.toISOString(),
        focus: String(form.get("focus") || "pain"),
        intensity: clamp(Number(form.get("intensity")) || 5, 1, 10),
        context: String(form.get("context") || "work"),
        availableTime: String(form.get("availableTime") || "2"),
        note: String(form.get("note") || "").trim(),
      };
      const checkIn = { ...draft, action: getActionPlan(draft), feedback: null };
      const date = toISODate(now);
      store.setState((current) => ({
        ...current,
        activeView: "now",
        checkIns: [...(current.checkIns || []), checkIn],
        entries: {
          ...current.entries,
          [date]: mergeMomentIntoEntry(current.entries?.[date], checkIn, date),
        },
      }));
      closeCheckIn();
      toast(root, "Momento guardado. Ciclica preparó una acción para ahora.");
    });

    root.querySelectorAll("[data-action='start-action']").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.checkinId;
        store.setState((current) => ({
          ...current,
          checkIns: (current.checkIns || []).map((item) => (item.id === id ? { ...item, actionStartedAt: new Date().toISOString() } : item)),
        }));
        toast(root, "Acción iniciada. Vuelve después para registrar si ayudó.");
      });
    });

    root.querySelectorAll("[data-action='action-feedback']").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.checkinId;
        const feedback = button.dataset.feedback;
        store.setState((current) => ({
          ...current,
          checkIns: (current.checkIns || []).map((item) => (item.id === id ? { ...item, feedback, feedbackAt: new Date().toISOString() } : item)),
        }));
        toast(root, "Respuesta guardada. Esto mejora tus próximos aprendizajes.");
      });
    });

    root.querySelectorAll("[data-action='profile']").forEach((button) => {
      button.addEventListener("click", () => {
        menuModal?.close();
        try {
          profileModal?.showModal();
        } catch {
          profileModal?.setAttribute("open", "");
        }
      });
    });

    root.querySelector("[data-action='close-modal']")?.addEventListener("click", () => {
      profileModal?.close();
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
      profileForm.dataset.step = String(Math.max(1, current - 1));
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
      const blob = new Blob([JSON.stringify(getExportState(state), null, 2)], { type: "application/json" });
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

export function getExportState(state) {
  return {
    ...state,
    aiConfig: {
      ...(state.aiConfig || {}),
      openai: {
        ...(state.aiConfig?.openai || {}),
        apiKey: "",
      },
    },
  };
}

export function toggleDailySignal(signals, value) {
  const current = Array.isArray(signals) ? signals : [];
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

export function mergeDailyLogIntoEntry(existing, date, changes) {
  const entry = { ...(existing || {}), date, ...changes };
  const signals = Array.isArray(entry.dailySignals) ? entry.dailySignals : [];
  const harder = entry.dailyState === "harder";
  const painValue = { mild: 3, notable: 6, strong: 8 }[entry.dailyIntensity] || 5;
  const lowEnergyValue = { mild: 5, notable: 3, strong: 1 }[entry.dailyIntensity] || 4;
  const lowSleepValue = { mild: 5, notable: 4, strong: 2 }[entry.dailyIntensity] || 4;

  if (signals.includes("pain")) entry.pain = harder ? painValue : 1;
  if (signals.includes("energy")) entry.energy = harder ? lowEnergyValue : 8;
  if (signals.includes("sleep")) entry.sleep = harder ? lowSleepValue : 8;
  if (signals.includes("mood")) entry.mood = harder ? "sensitive" : "calm";
  if (signals.includes("bleeding")) entry.bleeding = { mild: "light", notable: "medium", strong: "heavy" }[entry.dailyIntensity] || "light";

  return entry;
}

export function mergeMomentIntoEntry(existing, checkIn, date) {
  const entry = {
    date,
    bleeding: existing?.bleeding || "none",
    pain: Number(existing?.pain) || 0,
    energy: Number.isFinite(Number(existing?.energy)) ? Number(existing.energy) : 6,
    sleep: Number.isFinite(Number(existing?.sleep)) ? Number(existing.sleep) : 7,
    mood: existing?.mood || "calm",
    skin: existing?.skin || "none",
    note: checkIn.note || existing?.note || "",
    updatedAt: checkIn.createdAt || new Date().toISOString(),
  };

  if (checkIn.focus === "pain") entry.pain = clamp(Number(checkIn.intensity) || 0, 0, 10);
  if (checkIn.focus === "lowEnergy") entry.energy = clamp(10 - (Number(checkIn.intensity) || 0), 0, 10);
  if (checkIn.focus === "anxious") entry.mood = "anxious";
  if (checkIn.focus === "sensitive") entry.mood = "sensitive";
  return entry;
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
  const step = Number(form.dataset.step || 1);
  form.querySelectorAll("[data-step-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", Number(panel.dataset.stepPanel) === step);
  });
  form.querySelectorAll("[data-step-dot]").forEach((dot) => {
    const dotStep = Number(dot.dataset.stepDot);
    dot.classList.toggle("is-active", dotStep === step);
    dot.classList.toggle("is-complete", dotStep < step);
  });
  form.querySelector("[data-action='onboarding-back']")?.toggleAttribute("disabled", step <= 1);
  form.querySelector(".onboarding-actions [data-action='onboarding-next']")?.toggleAttribute("hidden", step >= 3);
  form.querySelector("[data-action='save-profile']")?.toggleAttribute("hidden", step < 3);
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
