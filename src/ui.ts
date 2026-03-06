import type { IntlShape } from "@formatjs/intl";
import type { UploadState } from "./state";

export interface UI {
  endpointInput: HTMLInputElement;
  tokenInput: HTMLInputElement;
  chunkSizeInput: HTMLInputElement;
  fileInput: HTMLInputElement;
  uploadButton: HTMLButtonElement;
  pauseButton: HTMLButtonElement;
  cancelButton: HTMLButtonElement;
  manualRetryButton: HTMLButtonElement;
  render(state: UploadState): void;
}

export function createUI(root: HTMLElement, intl: IntlShape<string>): UI {
  // Endpoint input
  const endpointLabel = document.createElement("label");
  endpointLabel.textContent = intl.formatMessage({ id: "label.endpoint" });
  endpointLabel.className = "endpoint-label";
  const endpointInput = document.createElement("input");
  endpointInput.type = "text";
  endpointInput.value = "http://localhost:8080/files/";
  endpointInput.className = "endpoint-input";
  endpointLabel.appendChild(endpointInput);

  // Token input
  const tokenLabel = document.createElement("label");
  tokenLabel.textContent = intl.formatMessage({ id: "label.token" });
  tokenLabel.className = "token-label";
  const tokenInput = document.createElement("input");
  tokenInput.type = "text";
  tokenInput.value =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMDAxIn0.dummy-signature";
  tokenInput.className = "token-input";
  tokenLabel.appendChild(tokenInput);

  // Chunk size input
  const chunkSizeLabel = document.createElement("label");
  chunkSizeLabel.textContent = intl.formatMessage({ id: "label.chunkSize" });
  chunkSizeLabel.className = "chunk-size-label";
  const chunkSizeInput = document.createElement("input");
  chunkSizeInput.type = "number";
  chunkSizeInput.placeholder = intl.formatMessage({ id: "placeholder.chunkSize" });
  chunkSizeInput.className = "chunk-size-input";
  chunkSizeLabel.appendChild(chunkSizeInput);

  // File input
  const fileInput = document.createElement("input");
  fileInput.type = "file";

  // Upload button
  const uploadButton = document.createElement("button");
  uploadButton.textContent = intl.formatMessage({ id: "button.upload" });
  uploadButton.disabled = true;

  // Pause button
  const pauseButton = document.createElement("button");
  pauseButton.textContent = intl.formatMessage({ id: "button.pause" });
  pauseButton.hidden = true;

  // Cancel button
  const cancelButton = document.createElement("button");
  cancelButton.textContent = intl.formatMessage({ id: "button.cancel" });
  cancelButton.hidden = true;

  // Progress bar
  const progressContainer = document.createElement("div");
  progressContainer.className = "progress-container";
  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  progressContainer.appendChild(progressBar);

  // Status
  const status = document.createElement("p");

  // Retry panel
  const retryPanel = document.createElement("div");
  retryPanel.className = "retry-panel";
  retryPanel.hidden = true;

  const retryMessage = document.createElement("p");
  const retryCountLabel = document.createElement("span");
  retryCountLabel.className = "retry-count";
  const manualRetryButton = document.createElement("button");
  manualRetryButton.textContent = intl.formatMessage({ id: "button.manualRetry" });
  manualRetryButton.hidden = true;

  retryPanel.appendChild(retryMessage);
  retryPanel.appendChild(retryCountLabel);
  retryPanel.appendChild(manualRetryButton);

  root.appendChild(endpointLabel);
  root.appendChild(tokenLabel);
  root.appendChild(chunkSizeLabel);
  root.appendChild(fileInput);
  root.appendChild(uploadButton);
  root.appendChild(pauseButton);
  root.appendChild(cancelButton);
  root.appendChild(progressContainer);
  root.appendChild(status);
  root.appendChild(retryPanel);

  return {
    endpointInput,
    tokenInput,
    chunkSizeInput,
    fileInput,
    uploadButton,
    pauseButton,
    cancelButton,
    manualRetryButton,

    render(state: UploadState) {
      switch (state.kind) {
        case "idle":
          endpointInput.disabled = false;
          tokenInput.disabled = false;
          chunkSizeInput.disabled = false;
          fileInput.disabled = false;
          retryPanel.hidden = true;
          manualRetryButton.hidden = true;
          manualRetryButton.disabled = true;
          pauseButton.hidden = true;
          cancelButton.hidden = true;
          progressBar.classList.remove("retrying");
          progressBar.classList.remove("paused");
          progressContainer.classList.remove("visible");
          progressBar.style.width = "0%";
          status.textContent = "";
          uploadButton.disabled = !fileInput.files?.length;
          break;

        case "uploading": {
          endpointInput.disabled = true;
          tokenInput.disabled = true;
          chunkSizeInput.disabled = true;
          fileInput.disabled = true;
          retryPanel.hidden = true;
          manualRetryButton.hidden = true;
          manualRetryButton.disabled = true;
          pauseButton.hidden = false;
          pauseButton.textContent = intl.formatMessage({ id: "button.pause" });
          cancelButton.hidden = false;
          progressBar.classList.remove("retrying");
          progressBar.classList.remove("paused");
          progressContainer.classList.add("visible");
          uploadButton.disabled = true;
          if (state.bytesTotal > 0) {
            const percentage = (
              (state.bytesUploaded / state.bytesTotal) *
              100
            ).toFixed(1);
            progressBar.style.width = `${percentage}%`;
            status.textContent = intl.formatMessage(
              { id: "status.uploading" },
              { pct: percentage, uploaded: state.bytesUploaded, total: state.bytesTotal },
            );
          } else {
            progressBar.style.width = "0%";
            status.textContent = intl.formatMessage({ id: "status.uploadingNoProgress" });
          }
          break;
        }

        case "retrying":
          endpointInput.disabled = true;
          tokenInput.disabled = true;
          chunkSizeInput.disabled = true;
          fileInput.disabled = true;
          retryPanel.hidden = false;
          manualRetryButton.hidden = true;
          manualRetryButton.disabled = true;
          pauseButton.hidden = false;
          pauseButton.textContent = intl.formatMessage({ id: "button.pause" });
          cancelButton.hidden = false;
          retryMessage.textContent = intl.formatMessage(
            { id: "retry.reason" },
            { reason: state.reason },
          );
          retryCountLabel.textContent = intl.formatMessage(
            { id: "retry.count" },
            { attempt: state.attempt + 1, max: state.maxRetries, delaySec: state.delay / 1000 },
          );
          progressBar.classList.add("retrying");
          uploadButton.disabled = true;
          break;

        case "paused": {
          endpointInput.disabled = true;
          tokenInput.disabled = true;
          chunkSizeInput.disabled = true;
          fileInput.disabled = true;
          retryPanel.hidden = true;
          manualRetryButton.hidden = true;
          manualRetryButton.disabled = true;
          pauseButton.hidden = false;
          pauseButton.textContent = intl.formatMessage({ id: "button.resume" });
          cancelButton.hidden = false;
          progressBar.classList.remove("retrying");
          progressBar.classList.add("paused");
          progressContainer.classList.add("visible");
          uploadButton.disabled = true;
          if (state.bytesTotal > 0) {
            const percentage = (
              (state.bytesUploaded / state.bytesTotal) *
              100
            ).toFixed(1);
            progressBar.style.width = `${percentage}%`;
            status.textContent = intl.formatMessage(
              { id: "status.paused" },
              { pct: percentage, uploaded: state.bytesUploaded, total: state.bytesTotal },
            );
          } else {
            status.textContent = intl.formatMessage({ id: "status.pausedNoProgress" });
          }
          break;
        }

        case "error":
          endpointInput.disabled = false;
          tokenInput.disabled = false;
          chunkSizeInput.disabled = false;
          fileInput.disabled = false;
          cancelButton.hidden = true;
          retryPanel.hidden = false;
          retryMessage.textContent = intl.formatMessage(
            { id: "retry.failed" },
            { message: state.message },
          );
          retryCountLabel.textContent = intl.formatMessage({ id: "retry.allFailed" });
          manualRetryButton.hidden = false;
          manualRetryButton.disabled = false;
          pauseButton.hidden = true;
          progressBar.classList.remove("retrying");
          progressBar.classList.remove("paused");
          uploadButton.disabled = !fileInput.files?.length;
          break;

        case "success":
          endpointInput.disabled = false;
          tokenInput.disabled = false;
          chunkSizeInput.disabled = false;
          fileInput.disabled = false;
          retryPanel.hidden = true;
          manualRetryButton.hidden = true;
          manualRetryButton.disabled = true;
          pauseButton.hidden = true;
          cancelButton.hidden = true;
          progressBar.classList.remove("retrying");
          progressBar.classList.remove("paused");
          status.textContent = intl.formatMessage(
            { id: "status.complete" },
            { url: state.url },
          );
          uploadButton.disabled = !fileInput.files?.length;
          break;
      }
    },
  };
}
