import { views } from "../data/labels.js?v=pocket-ux-5";
import { Shell } from "./Shell.js?v=pocket-ux-5";
import { TodayView } from "./TodayView.js?v=pocket-ux-5";
import { PatternsView } from "./PatternsView.js?v=pocket-ux-5";
import { ConsultView } from "./ConsultView.js?v=pocket-ux-5";
import { LibraryView } from "./LibraryView.js?v=pocket-ux-5";
import { ProfileModal } from "./ProfileModal.js?v=pocket-ux-5";
import { getCycleEstimate } from "../domain/cycle.js?v=pocket-ux-5";

export function App(state) {
  const active = state.activeView || "today";
  const activeLabel = views.find((view) => view.id === active)?.label || "Hoy";
  const estimate = getCycleEstimate(state);

  const viewRenderers = {
    today: TodayView,
    patterns: PatternsView,
    consult: ConsultView,
    library: LibraryView,
  };
  const renderActiveView = viewRenderers[active] || TodayView;

  return Shell({
    state,
    active,
    activeLabel,
    estimate,
    content: renderActiveView(state),
    modal: ProfileModal(state),
  });
}
