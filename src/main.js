import { App } from "./components/App.js?v=confidence-dial-11";
import { createStore } from "./state/store.js?v=confidence-dial-11";
import { bindApp } from "./ui/handlers.js?v=confidence-dial-11";

const store = createStore();
const root = document.querySelector("#app");

root.innerHTML = App(store.getState());
bindApp(root, store);
