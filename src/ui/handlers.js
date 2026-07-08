import { App } from "../components/App.js?v=confidence-dial-3";
import { buildPlainReport } from "../domain/report.js";
import { clamp } from "../domain/date.js";

export function bindApp(root, store) {
  let state = store.getState();

  store.subscribe((nextState) => {
    state = nextState;
    root.innerHTML = App(state);
    attach();
  });

  attach();

  function attach() {
    root.querySelectorAll("[data-action='view']").forEach((button) => {
      button.addEventListener("click", () => store.setState((current) => ({ ...current, activeView: button.dataset.view })));
    });

    const profileModal = root.querySelector("#profileModal");
    const profileForm = root.querySelector("#profileForm");

    if (!state.profile && !state.onboardingDismissed && profileModal && !profileModal.open) {
      try {
        profileModal.showModal();
      } catch {
        profileModal.setAttribute("open", "");
      }
    }

    root.querySelectorAll("[data-action='profile']").forEach((button) => {
      button.addEventListener("click", () => {
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
            note: String(form.get("note") || "").trim(),
            updatedAt: new Date().toISOString(),
          },
        },
      }));
      toast(root, "Entrada guardada en este dispositivo.");
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
      const confirmed = window.confirm("Esto borra tu perfil y registros de este dispositivo. Si quieres conservar una copia, exporta antes. ¿Borrar datos locales?");
      if (!confirmed) return;
      store.reset();
      toast(root, "Datos locales borrados.");
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
