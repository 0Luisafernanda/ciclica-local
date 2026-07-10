const STORAGE_KEY = "ciclica-local:v1";

const defaultState = {
  activeView: "now",
  profile: null,
  entries: {},
  checkIns: [],
  onboardingDismissed: true,
  aiConfig: {
    provider: "ollama",
    ollama: { url: "http://localhost:11434", model: "" },
    openai: { apiKey: "", model: "gpt-4o-mini" },
  },
  aiRecs: null,
};

export function normalizeState(stored = {}) {
  const viewAliases = { today: "now", patterns: "learning" };
  const requestedView = viewAliases[stored.activeView] || stored.activeView || defaultState.activeView;
  const activeView = ["now", "learning", "consult", "library"].includes(requestedView) ? requestedView : "now";
  const storedAi = stored.aiConfig || {};

  return {
    ...defaultState,
    ...stored,
    activeView,
    entries: stored.entries && typeof stored.entries === "object" ? stored.entries : {},
    checkIns: Array.isArray(stored.checkIns) ? stored.checkIns : [],
    aiConfig: {
      ...defaultState.aiConfig,
      ...storedAi,
      ollama: {
        ...defaultState.aiConfig.ollama,
        ...(storedAi.ollama || {}),
      },
      openai: {
        ...defaultState.aiConfig.openai,
        ...(storedAi.openai || {}),
      },
    },
  };
}

export function createStore() {
  let state = loadState();
  const listeners = new Set();
  const notify = () => listeners.forEach((listener) => listener(state));

  return {
    getState: () => state,
    setState: (updater) => {
      state = normalizeState(typeof updater === "function" ? updater(state) : { ...state, ...updater });
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
    return normalizeState(modern || legacy || {});
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
