import { views, moreView } from "../data/labels.js?v=aqua-base-4";
import { Shell } from "./Shell.js?v=aqua-base-4";
import { TodayView } from "./TodayView.js?v=aqua-base-4";
import { MoreView } from "./MoreView.js?v=aqua-base-4";
import { PatternsView } from "./PatternsView.js?v=aqua-base-4";
import { ConsultView } from "./ConsultView.js?v=aqua-base-4";
import { LibraryView } from "./LibraryView.js?v=aqua-base-4";
import { ProfileModal } from "./ProfileModal.js?v=aqua-base-4";
import { AiConfigModal } from "./AiConfigModal.js?v=aqua-base-4";
import { getCycleEstimate } from "../domain/cycle.js?v=aqua-base-4";

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
    aiModal: AiConfigModal(state),
  });
}
