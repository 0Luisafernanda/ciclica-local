import { Shell } from "./Shell.js?v=feer-1";
import { NowView } from "./NowView.js?v=feer-1";
import { ProfileModal } from "./ProfileModal.js?v=feer-1";
import { AiConfigModal } from "./AiConfigModal.js?v=feer-1";
import { CheckInPanel } from "./CheckInPanel.js?v=feer-1";

export function App(state) {
  return Shell({
    content: NowView(state),
    modal: ProfileModal(state),
    aiModal: AiConfigModal(state),
    checkInPanel: CheckInPanel(state),
  });
}
