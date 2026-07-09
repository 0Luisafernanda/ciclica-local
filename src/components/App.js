import { views } from "../data/labels.js?v=aqua-base-7";
import { Shell } from "./Shell.js?v=aqua-base-7";
import { TodayView } from "./TodayView.js?v=aqua-base-7";
import { PatternsView } from "./PatternsView.js?v=aqua-base-7";
import { ConsultView } from "./ConsultView.js?v=aqua-base-7";
import { LibraryView } from "./LibraryView.js?v=aqua-base-7";
import { ProfileModal } from "./ProfileModal.js?v=aqua-base-7";
import { AiConfigModal } from "./AiConfigModal.js?v=aqua-base-7";
import { getCycleEstimate } from "../domain/cycle.js?v=aqua-base-7";

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
    aiModal: AiConfigModal(state),
  });
}
