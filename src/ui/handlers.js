import { App } from "../components/App.js";
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

    root.querySelector("[data-action='profile']")?.addEventListener("click", () => {
      root.querySelector("#profileModal")?.showModal();
    });

    root.querySelector("[data-action='close-modal']")?.addEventListener("click", () => {
      root.querySelector("#profileModal")?.close();
    });

    root.querySelector("#profileForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      store.setState((current) => ({
        ...current,
        profile: {
          lastPeriod: form.get("lastPeriod"),
          cycleLength: clamp(Number(form.get("cycleLength")) || 28, 18, 60),
          regularity: form.get("regularity"),
          contexts: form.getAll("contexts"),
          updatedAt: new Date().toISOString(),
        },
      }));
      toast(root, "Perfil local actualizado.");
    });

    root.querySelector("#dailyForm")?.addEventListener("input", (event) => {
      const output = root.querySelector(`[data-output='${event.target.name}']`);
      if (output) output.textContent = event.target.value;
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
