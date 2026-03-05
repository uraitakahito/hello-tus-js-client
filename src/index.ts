import { createUI } from "./ui";
import { createUploader } from "./uploader";

const root = document.getElementById("app")!;
const ui = createUI(root);

const uploader = createUploader({
  onProgress: (bytesUploaded, bytesTotal) => {
    ui.showProgress(bytesUploaded, bytesTotal);
  },
  onSuccess: (url) => {
    ui.showSuccess(url);
  },
  onError: (message) => {
    ui.showError(message);
  },
  onRetrying: (attempt, maxRetries, delay, reason) => {
    ui.showRetrying(attempt, maxRetries, delay, reason);
  },
});

ui.fileInput.addEventListener("change", () => {
  ui.uploadButton.disabled = !ui.fileInput.files?.length;
});

ui.uploadButton.addEventListener("click", () => {
  const file = ui.fileInput.files?.[0];
  if (!file) return;

  ui.resetForUpload();
  uploader.startUpload({
    file,
    endpoint: ui.endpointInput.value,
    token: ui.tokenInput.value,
  });
});

ui.manualRetryButton.addEventListener("click", () => {
  ui.resetRetryState();
  uploader.retryUpload();
});
