import { views } from "../data/labels.js?v=visual-system-4";
import { Shell } from "./Shell.js?v=visual-system-4";
import { TodayView } from "./TodayView.js?v=visual-system-4";
import { PatternsView } from "./PatternsView.js?v=visual-system-4";
import { ConsultView } from "./ConsultView.js?v=visual-system-4";
import { LibraryView } from "./LibraryView.js?v=visual-system-4";
import { ProfileModal } from "./ProfileModal.js?v=visual-system-4";
import { getCycleEstimate } from "../domain/cycle.js?v=visual-system-4";

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
