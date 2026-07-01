import { views } from "../data/labels.js";
import { Shell } from "./Shell.js";
import { TodayView } from "./TodayView.js";
import { PatternsView } from "./PatternsView.js";
import { ConsultView } from "./ConsultView.js";
import { LibraryView } from "./LibraryView.js";
import { ProfileModal } from "./ProfileModal.js";
import { getCycleEstimate } from "../domain/cycle.js";

export function App(state) {
  const active = state.activeView || "today";
  const activeLabel = views.find((view) => view.id === active)?.label || "Hoy";
  const estimate = getCycleEstimate(state);

  const viewBodies = {
    today: TodayView(state),
    patterns: PatternsView(state),
    consult: ConsultView(state),
    library: LibraryView(state),
  };

  return Shell({
    state,
    active,
    activeLabel,
    estimate,
    content: viewBodies[active] || viewBodies.today,
    modal: ProfileModal(state),
  });
}
