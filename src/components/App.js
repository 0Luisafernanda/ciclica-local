import { views, moreView } from "../data/labels.js?v=confidence-dial-3";
import { Shell } from "./Shell.js?v=confidence-dial-3";
import { TodayView } from "./TodayView.js?v=confidence-dial-3";
import { MoreView } from "./MoreView.js?v=confidence-dial-3";
import { PatternsView } from "./PatternsView.js?v=confidence-dial-3";
import { ConsultView } from "./ConsultView.js?v=confidence-dial-3";
import { LibraryView } from "./LibraryView.js?v=confidence-dial-3";
import { ProfileModal } from "./ProfileModal.js?v=confidence-dial-3";
import { getCycleEstimate } from "../domain/cycle.js?v=confidence-dial-3";

export function App(state) {
  const active = state.activeView || "today";
  const activeLabel = [...views, moreView].find((view) => view.id === active)?.label || "Hoy";
  const estimate = getCycleEstimate(state);

  const viewRenderers = {
    today: TodayView,
    more: MoreView,
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
