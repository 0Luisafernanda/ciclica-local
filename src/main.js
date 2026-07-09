import { App } from "./components/App.js?v=aqua-base-4";
import { createStore } from "./state/store.js?v=aqua-base-4";
import { bindApp } from "./ui/handlers.js?v=aqua-base-4";

const store = createStore();
const root = document.querySelector("#app");

root.innerHTML = App(store.getState());
bindApp(root, store);
