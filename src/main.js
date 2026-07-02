import { App } from "./components/App.js?v=pocket-ux-5";
import { createStore } from "./state/store.js?v=pocket-ux-5";
import { bindApp } from "./ui/handlers.js?v=pocket-ux-5";

const store = createStore();
const root = document.querySelector("#app");

root.innerHTML = App(store.getState());
bindApp(root, store);
