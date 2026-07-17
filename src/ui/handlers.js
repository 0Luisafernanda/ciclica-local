import { App } from "../components/App.js?v=feer-1";
import { buildPlainReport } from "../domain/report.js?v=feer-1";
import { clamp, toISODate } from "../domain/date.js?v=feer-1";
import { getActionPlan, pickPrimarySymptom, symptomCatalog } from "../domain/actions.js?v=feer-1";
import { getCycleEstimate, getCycleNumber } from "../domain/cycle.js?v=feer-1";
import { listOllamaModels, generateWithOllama, generateWithOpenAI } from "../services/aiProvider.js?v=feer-1";

export function bindApp(root, store) {
  let state = store.getState();

  store.subscribe((nextState) => {
    state = nextState;
    root.innerHTML = App(state);
    attach();
  });

  attach();

  function attach() {
    const profileModal = root.querySelector("#profileModal");
    const menuModal = root.querySelector("#menuModal");
    const checkInLayer = root.querySelector("#checkInLayer");
    const checkInForm = root.querySelector("#checkInForm");
    const aiModal = root.querySelector("#aiModal");
    const aiForm = root.querySelector("#aiForm");
    const today = toISODate(new Date());

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
      checkInForm.querySelectorAll("input[name^='symptom:']").forEach((input) => {
        if (input.value === "0") input.checked = true;
      });
      checkInForm.querySelectorAll("input[name='categories']").forEach((input) => {
        input.checked = false;
      });
      const preferred = focus === "pain" || !focus ? "cramps" : focus;
      const match =
        checkInForm.querySelector(`input[name='symptom:${preferred}'][value='5']`) ||
        checkInForm.querySelector(`input[name='symptom:cramps'][value='5']`);
      if (match) match.checked = true;
      const preferredFocus = symptomCatalog.find((item) => item.id === preferred)?.focus || "pain";
      const category = checkInForm.querySelector(`input[name='categories'][value='${preferredFocus}']`);
      if (category) category.checked = true;
      checkInLayer.classList.add("is-open");
      checkInLayer.setAttribute("aria-hidden", "false");
      document.body.classList.add("drawer-open");
      window.setTimeout(() => checkInForm.querySelector("input[name='bleeding']")?.focus(), 40);
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

    checkInForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const now = new Date();
      const symptoms = symptomCatalog
        .map(({ id }) => {
          const intensity = Number(form.get(`symptom:${id}`) || 0);
          return intensity > 0 ? { id, intensity } : null;
        })
        .filter(Boolean);
      const bleeding = String(form.get("bleeding") || "none");
      const bleedingColor = bleeding === "none" ? "" : String(form.get("bleedingColor") || "");
      const bleedingOdor = bleeding === "none" ? "" : String(form.get("bleedingOdor") || "");
      const otherNote = String(form.get("otherNote") || "").trim();
      const primary = pickPrimarySymptom(symptoms);
      const companions = [];
      if (symptoms.some((item) => item.id === "shortSleep")) companions.push("shortSleep");
      if (symptoms.some((item) => item.id === "stressed")) companions.push("stressed");
      if (bleeding !== "none") companions.push("bleeding");
      if (otherNote && !companions.includes("other")) companions.push("other");
      const estimate = getCycleEstimate(store.getState(), now);
      const draft = {
        id: globalThis.crypto?.randomUUID?.() || `moment-${now.getTime()}`,
        createdAt: now.toISOString(),
        date: toISODate(now),
        bleeding,
        bleedingColor,
        bleedingOdor,
        symptoms,
        signals: primary.signals.length ? primary.signals : bleeding !== "none" ? ["pain"] : ["other"],
        focus: primary.symptomId ? primary.focus : bleeding !== "none" ? "pain" : "other",
        intensity: primary.symptomId ? primary.intensity : 5,
        availableTime: "2",
        companions,
        note: otherNote,
        cycleDay: estimate.day != null && Number.isFinite(Number(estimate.day)) ? Number(estimate.day) : null,
        phase: estimate.phase && estimate.phase !== "unknown" ? estimate.phase : null,
        cyclePhase: estimate.phase && estimate.phase !== "unknown" ? estimate.phase : null,
        cycleNumber: getCycleNumber(store.getState(), toISODate(now)),
      };
      const checkIn = { ...draft, action: getActionPlan(draft), feedback: null };
      const date = toISODate(now);
      store.setState((current) => ({
        ...current,
        checkIns: [...(current.checkIns || []), checkIn],
        entries: {
          ...current.entries,
          [date]: mergeMomentIntoEntry(current.entries?.[date], checkIn, date),
        },
      }));
      closeCheckIn();
      toast(root, "Guardado. Hay una acción lista.");
    });

    root.querySelectorAll("[data-action='start-action']").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.checkinId;
        store.setState((current) => ({
          ...current,
          checkIns: (current.checkIns || []).map((item) =>
            item.id === id ? { ...item, actionStartedAt: new Date().toISOString() } : item,
          ),
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
          checkIns: (current.checkIns || []).map((item) =>
            item.id === id ? { ...item, feedback, feedbackAt: new Date().toISOString() } : item,
          ),
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

    root.querySelectorAll("[data-action='close-modal']").forEach((button) => {
      button.addEventListener("click", () => profileModal?.close());
    });

    root.querySelectorAll("input[name='contexts']").forEach((input) => {
      input.addEventListener("change", () => {
        const exclusive = ["none", "preferNoContext"];
        if (exclusive.includes(input.value) && input.checked) {
          root.querySelectorAll("input[name='contexts']").forEach((other) => {
            if (other !== input) other.checked = false;
          });
        } else if (input.checked) {
          root
            .querySelectorAll("input[name='contexts'][value='none'], input[name='contexts'][value='preferNoContext']")
            .forEach((other) => {
              other.checked = false;
            });
        }
      });
    });

    root.querySelector("#profileForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const contexts = form
        .getAll("contexts")
        .filter((context) => !["none", "preferNoContext"].includes(context));
      if (profileModal?.open) profileModal.close();
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

    root.querySelector("[data-action='copy-report']")?.addEventListener("click", async () => {
      menuModal?.close();
      try {
        await navigator.clipboard.writeText(buildPlainReport(state));
        toast(root, "Reporte copiado.");
      } catch {
        toast(root, "No pude copiar automáticamente.");
      }
    });

    root.querySelector("[data-action='export']")?.addEventListener("click", () => {
      menuModal?.close();
      const blob = new Blob([JSON.stringify(getExportState(state), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `feer-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast(root, "Exportación local creada.");
    });

    root.querySelector("[data-action='reset-data']")?.addEventListener("click", () => {
      menuModal?.close();
      const confirmed = window.confirm(
        "Esto borra tu perfil y registros de este dispositivo. Si quieres conservar una copia, exporta antes. ¿Borrar datos locales?",
      );
      if (!confirmed) return;
      store.reset();
      toast(root, "Datos locales borrados.");
    });

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
      if (resultEl) resultEl.textContent = "Buscando modelos…";
      try {
        const models = await listOllamaModels(urlInput?.value);
        if (datalist) datalist.innerHTML = models.map((name) => `<option value="${name}"></option>`).join("");
        if (resultEl) {
          resultEl.textContent = models.length
            ? `Encontrados: ${models.join(", ")}`
            : "Ollama respondió pero no tiene modelos instalados (ollama pull <modelo>).";
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
      if (resultEl) resultEl.textContent = "Probando…";
      try {
        const reply = await generateWithOllama(
          { url: urlInput?.value, model: modelInput?.value },
          [{ role: "user", content: "Responde con la palabra: ok" }],
        );
        if (resultEl) resultEl.textContent = `Conexión ok. Respuesta: "${reply.slice(0, 80)}"`;
      } catch (error) {
        if (resultEl) resultEl.textContent = `Falló la prueba: ${error.message}`;
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
      if (resultEl) resultEl.textContent = "Probando…";
      try {
        const reply = await generateWithOpenAI(
          { apiKey: keyInput?.value, model: modelSelect?.value },
          [{ role: "user", content: "Responde con la palabra: ok" }],
        );
        if (resultEl) resultEl.textContent = `Conexión ok. Respuesta: "${reply.slice(0, 80)}"`;
      } catch (error) {
        if (resultEl) resultEl.textContent = `Falló la prueba: ${error.message}`;
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

export function mergeDailyLogIntoEntry(existing, date, changes) {
  const entry = { ...(existing || {}), date, ...changes };
  const signals = Array.isArray(entry.dailySignals) ? entry.dailySignals : [];
  const harder = entry.dailyState === "harder";
  const better = entry.dailyState === "better";
  const normal = entry.dailyState === "normal";
  const painValue = { mild: 3, notable: 6, strong: 8 }[entry.dailyIntensity] || 5;
  const lowEnergyValue = { mild: 5, notable: 3, strong: 1 }[entry.dailyIntensity] || 4;
  const lowSleepValue = { mild: 5, notable: 4, strong: 2 }[entry.dailyIntensity] || 4;

  if (signals.length) {
    if (signals.includes("pain")) entry.pain = harder ? painValue : 1;
    if (signals.includes("energy")) entry.energy = harder ? lowEnergyValue : 8;
    if (signals.includes("sleep")) entry.sleep = harder ? lowSleepValue : 8;
    if (signals.includes("mood")) entry.mood = harder ? "sensitive" : "calm";
    if (signals.includes("bleeding")) {
      entry.bleeding = { mild: "light", notable: "medium", strong: "heavy" }[entry.dailyIntensity] || "light";
    }
    return entry;
  }

  if (harder) {
    entry.pain = 4;
    entry.energy = 3;
    entry.sleep = 4;
    entry.mood = "sensitive";
  } else if (better) {
    entry.pain = 1;
    entry.energy = 8;
    entry.sleep = 8;
    entry.mood = "calm";
  } else if (normal) {
    entry.pain = 1;
    entry.energy = 6;
    entry.sleep = 7;
    entry.mood = "calm";
  }

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

  if (checkIn.bleeding && checkIn.bleeding !== "none") {
    entry.bleeding = checkIn.bleeding;
  }
  if (checkIn.bleedingColor) entry.bleedingColor = checkIn.bleedingColor;
  if (checkIn.bleedingOdor) entry.bleedingOdor = checkIn.bleedingOdor;

  const symptoms = Array.isArray(checkIn.symptoms) ? checkIn.symptoms : [];
  const byId = Object.fromEntries(symptoms.map((item) => [item.id, Number(item.intensity) || 0]));
  const companions = Array.isArray(checkIn.companions) ? checkIn.companions : [];
  const signals =
    Array.isArray(checkIn.signals) && checkIn.signals.length
      ? checkIn.signals
      : checkIn.focus
        ? [checkIn.focus]
        : [];

  const crampIntensity = Math.max(byId.cramps || 0, byId.headache || 0, byId.backPain || 0, byId.legs || 0);
  if (crampIntensity > 0) entry.pain = clamp(crampIntensity, 0, 10);
  else if (signals.includes("pain")) entry.pain = clamp(Number(checkIn.intensity) || 0, 0, 10);

  if (byId.lowEnergy > 0) entry.energy = clamp(10 - byId.lowEnergy, 0, 10);
  else if (signals.includes("lowEnergy")) entry.energy = clamp(10 - (Number(checkIn.intensity) || 0), 0, 10);

  if (byId.anxious > 0 || byId.stressed > 0) entry.mood = "anxious";
  else if (byId.sensitive > 0 || byId.breast > 0) entry.mood = "sensitive";
  else if (signals.includes("anxious")) entry.mood = "anxious";
  else if (signals.includes("sensitive") && entry.mood === "calm") entry.mood = "sensitive";

  if (byId.shortSleep > 0) {
    entry.sleep = clamp(Math.round(8 - byId.shortSleep * 0.55), 1, 8);
  } else if (companions.includes("shortSleep")) {
    entry.sleep = Math.min(Number(entry.sleep) || 7, 4);
  }

  if (companions.includes("bleeding") && entry.bleeding === "none") entry.bleeding = "light";

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

function updateAiProviderPanels(form) {
  if (!form) return;
  const selected = form.querySelector("input[name='aiProvider']:checked")?.value || "";
  form.querySelectorAll("[data-provider-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.providerPanel === selected);
  });
}
