import { Shell } from "./Shell.js?v=ciclica-value-1";
import { NowView } from "./NowView.js?v=ciclica-value-2";
import { ProfileModal } from "./ProfileModal.js?v=ciclica-value-1";
import { AiConfigModal } from "./AiConfigModal.js?v=ciclica-value-1";

export function App(state) {
  return Shell({
    content: NowView(state),
    modal: ProfileModal(state),
    aiModal: AiConfigModal(state),
  });
}
