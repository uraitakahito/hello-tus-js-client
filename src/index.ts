import type { UploadState, UploadEvent } from "./state";
import { transition } from "./state";
import { createUI } from "./ui";
import { createUploader } from "./uploader";

const root = document.getElementById("app")!;
const ui = createUI(root);

let state: UploadState = { kind: "idle" };

function dispatch(event: UploadEvent): void {
  state = transition(state, event);
  ui.render(state);
}

const uploader = createUploader(dispatch);

ui.fileInput.addEventListener("change", () => {
  dispatch({ type: "RESET" });
});

ui.uploadButton.addEventListener("click", () => {
  const file = ui.fileInput.files?.[0];
  if (!file) return;

  const chunkSize = Number(ui.chunkSizeInput.value) || Infinity;

  dispatch({ type: "START" });
  uploader.startUpload({
    file,
    endpoint: ui.endpointInput.value,
    token: ui.tokenInput.value,
    chunkSize,
  });
});

ui.pauseButton.addEventListener("click", () => {
  if (state.kind === "uploading" || state.kind === "retrying") {
    uploader.abortUpload();
    dispatch({ type: "PAUSE" });
  } else if (state.kind === "paused") {
    dispatch({ type: "RESUME" });
    uploader.retryUpload();
  }
});

ui.manualRetryButton.addEventListener("click", () => {
  dispatch({ type: "MANUAL_RETRY" });
  uploader.retryUpload();
});
