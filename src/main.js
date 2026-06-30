import { App } from "./components/App.js";
import { createStore } from "./state/store.js";
import { bindApp } from "./ui/handlers.js";

const store = createStore();
const root = document.querySelector("#app");

root.innerHTML = App(store.getState());
bindApp(root, store);
