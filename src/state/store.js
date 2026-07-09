const STORAGE_KEY = "ciclica-local:v1";

const defaultState = {
  activeView: "today",
  profile: null,
  entries: {},
  onboardingDismissed: false,
  aiConfig: {
    provider: null,
    ollama: { url: "http://localhost:11434", model: "" },
    openai: { apiKey: "", model: "gpt-4o-mini" },
  },
};

export function createStore() {
  let state = loadState();
  const listeners = new Set();
  const notify = () => listeners.forEach((listener) => listener(state));

  return {
    getState: () => state,
    setState: (updater) => {
      state = typeof updater === "function" ? updater(state) : { ...state, ...updater };
      saveState(state);
      notify();
    },
    reset: () => {
      state = structuredClone(defaultState);
      saveState(state);
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function loadState() {
  try {
    const modern = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const legacy = JSON.parse(localStorage.getItem("ciclica-local:v0"));
    return { ...defaultState, ...(modern || legacy || {}) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("No se pudo guardar el estado local de Ciclica.", error);
  }
}
