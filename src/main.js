import { App } from "./components/App.js?v=ciclica-value-2";
import { createStore } from "./state/store.js?v=ciclica-value-1";
import { bindApp } from "./ui/handlers.js?v=ciclica-value-2";

const store = createStore();
const root = document.querySelector("#app");

root.innerHTML = App(store.getState());
bindApp(root, store);
