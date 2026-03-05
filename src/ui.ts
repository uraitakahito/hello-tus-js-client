import type { UploadState } from "./state";

export interface UI {
  endpointInput: HTMLInputElement;
  tokenInput: HTMLInputElement;
  fileInput: HTMLInputElement;
  uploadButton: HTMLButtonElement;
  manualRetryButton: HTMLButtonElement;
  render(state: UploadState): void;
}

export function createUI(root: HTMLElement): UI {
  // Endpoint input
  const endpointLabel = document.createElement("label");
  endpointLabel.textContent = "Endpoint: ";
  endpointLabel.className = "endpoint-label";
  const endpointInput = document.createElement("input");
  endpointInput.type = "text";
  endpointInput.value = "http://localhost:8080/files/";
  endpointInput.className = "endpoint-input";
  endpointLabel.appendChild(endpointInput);

  // Token input
  const tokenLabel = document.createElement("label");
  tokenLabel.textContent = "Token: ";
  tokenLabel.className = "token-label";
  const tokenInput = document.createElement("input");
  tokenInput.type = "text";
  tokenInput.value =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMDAxIn0.dummy-signature";
  tokenInput.className = "token-input";
  tokenLabel.appendChild(tokenInput);

  // File input
  const fileInput = document.createElement("input");
  fileInput.type = "file";

  // Upload button
  const uploadButton = document.createElement("button");
  uploadButton.textContent = "Upload";
  uploadButton.disabled = true;

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
  manualRetryButton.textContent = "今すぐ再試行";
  manualRetryButton.hidden = true;

  retryPanel.appendChild(retryMessage);
  retryPanel.appendChild(retryCountLabel);
  retryPanel.appendChild(manualRetryButton);

  root.appendChild(endpointLabel);
  root.appendChild(tokenLabel);
  root.appendChild(fileInput);
  root.appendChild(uploadButton);
  root.appendChild(progressContainer);
  root.appendChild(status);
  root.appendChild(retryPanel);

  return {
    endpointInput,
    tokenInput,
    fileInput,
    uploadButton,
    manualRetryButton,

    render(state: UploadState) {
      switch (state.kind) {
        case "idle":
          retryPanel.hidden = true;
          manualRetryButton.hidden = true;
          progressBar.classList.remove("retrying");
          progressContainer.classList.remove("visible");
          progressBar.style.width = "0%";
          status.textContent = "";
          uploadButton.disabled = !fileInput.files?.length;
          break;

        case "uploading": {
          retryPanel.hidden = true;
          manualRetryButton.hidden = true;
          progressBar.classList.remove("retrying");
          progressContainer.classList.add("visible");
          uploadButton.disabled = true;
          if (state.bytesTotal > 0) {
            const percentage = (
              (state.bytesUploaded / state.bytesTotal) *
              100
            ).toFixed(1);
            progressBar.style.width = `${percentage}%`;
            status.textContent = `Uploading: ${percentage}% (${String(state.bytesUploaded)}/${String(state.bytesTotal)} bytes)`;
          } else {
            progressBar.style.width = "0%";
            status.textContent = "Uploading...";
          }
          break;
        }

        case "retrying":
          retryPanel.hidden = false;
          manualRetryButton.hidden = true;
          retryMessage.textContent =
            `サーバーに接続できません (${state.reason})`;
          retryCountLabel.textContent =
            `リトライ ${String(state.attempt + 1)}/${String(state.maxRetries)} — ${String(state.delay / 1000)}秒後に再試行`;
          progressBar.classList.add("retrying");
          uploadButton.disabled = true;
          break;

        case "error":
          retryPanel.hidden = false;
          retryMessage.textContent = `アップロード失敗: ${state.message}`;
          retryCountLabel.textContent = "全てのリトライが失敗しました";
          manualRetryButton.hidden = false;
          progressBar.classList.remove("retrying");
          uploadButton.disabled = false;
          break;

        case "success":
          retryPanel.hidden = true;
          manualRetryButton.hidden = true;
          progressBar.classList.remove("retrying");
          status.textContent = `Upload complete! ${state.url}`;
          uploadButton.disabled = false;
          break;
      }
    },
  };
}
