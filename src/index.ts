import type { UploadState, UploadEvent } from "./state";
import { transition } from "./state";
import { createUI } from "./ui";
import { createUploader } from "./uploader";
import { setupIntl } from "./i18n";
// import enMessages from "./locales/en.json";
import jaMessages from "./locales/ja.json";

// const intl = setupIntl("en", enMessages as Record<string, string>);
const intl = setupIntl("ja", jaMessages as Record<string, string>);

const root = document.getElementById("app")!;
const ui = createUI(root, intl);

let state: UploadState = { kind: "idle" };

function dispatch(event: UploadEvent): void {
  state = transition(state, event);
  ui.render(state);
}

const uploader = createUploader(dispatch, (statusCode) =>
  statusCode > 0
    ? intl.formatMessage({ id: "error.httpStatus" }, { statusCode })
    : intl.formatMessage({ id: "error.networkError" }),
);

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
