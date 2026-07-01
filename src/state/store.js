const STORAGE_KEY = "ciclica-local:v1";

const defaultState = {
  activeView: "today",
  profile: null,
  entries: {},
  onboardingDismissed: false,
};

export function createStore() {
  let state = loadState();
  const listeners = new Set();

  return {
    getState: () => state,
    setState: (updater) => {
      state = typeof updater === "function" ? updater(state) : { ...state, ...updater };
      saveState(state);
      listeners.forEach((listener) => listener(state));
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
