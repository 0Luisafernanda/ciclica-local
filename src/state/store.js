const STORAGE_KEY = "feer:v1";
const LEGACY_KEYS = ["ciclica-local:v1", "ciclica-local:v0"];

const defaultState = {
  profile: null,
  entries: {},
  checkIns: [],
  onboardingDismissed: true,
  aiConfig: {
    provider: "ollama",
    ollama: { url: "http://localhost:11434", model: "" },
    openai: { apiKey: "", model: "gpt-4o-mini" },
  },
};

export function normalizeState(stored = {}) {
  const storedAi = stored.aiConfig || {};

  return {
    ...defaultState,
    profile: stored.profile ?? defaultState.profile,
    entries: stored.entries && typeof stored.entries === "object" ? stored.entries : {},
    checkIns: Array.isArray(stored.checkIns) ? stored.checkIns : [],
    onboardingDismissed: stored.onboardingDismissed ?? defaultState.onboardingDismissed,
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
    if (modern) return normalizeState(modern);

    for (const key of LEGACY_KEYS) {
      const legacy = JSON.parse(localStorage.getItem(key));
      if (legacy) return normalizeState(legacy);
    }

    return structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("No se pudo guardar el estado local de Feer.", error);
  }
}
