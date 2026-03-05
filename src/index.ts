import * as tus from "tus-js-client";

const app = document.getElementById("app")!;

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

app.appendChild(fileInput);
app.appendChild(uploadButton);
app.appendChild(progressContainer);
app.appendChild(status);
app.appendChild(retryPanel);

let currentUpload: tus.Upload | null = null;

fileInput.addEventListener("change", () => {
  uploadButton.disabled = !fileInput.files?.length;
});

uploadButton.addEventListener("click", () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  // Reset retry state
  retryPanel.hidden = true;
  manualRetryButton.hidden = true;
  progressBar.classList.remove("retrying");

  progressContainer.classList.add("visible");
  progressBar.style.width = "0%";
  status.textContent = "Uploading...";
  uploadButton.disabled = true;

  currentUpload = new tus.Upload(file, {
    endpoint: "http://localhost:8080/files/",
    retryDelays: [0, 3000, 5000, 10000, 20000],
    metadata: {
      filename: file.name,
      filetype: file.type,
    },
    onShouldRetry(error, retryAttempt, options) {
      const maxRetries = options.retryDelays?.length ?? 0;
      const delay = options.retryDelays?.[retryAttempt] ?? 0;
      const statusCode = error.originalResponse?.getStatus() ?? 0;
      const reason = statusCode > 0 ? `HTTP ${String(statusCode)}` : "ネットワークエラー";

      retryPanel.hidden = false;
      retryMessage.textContent = `サーバーに接続できません (${reason})`;
      retryCountLabel.textContent =
        `リトライ ${String(retryAttempt + 1)}/${String(maxRetries)} — ${String(delay / 1000)}秒後に再試行`;
      progressBar.classList.add("retrying");

      return true;
    },
    onError(error) {
      retryPanel.hidden = false;
      retryMessage.textContent = `アップロード失敗: ${error.message}`;
      retryCountLabel.textContent = "全てのリトライが失敗しました";
      manualRetryButton.hidden = false;
      progressBar.classList.remove("retrying");
      uploadButton.disabled = false;
    },
    onProgress(bytesUploaded, bytesTotal) {
      const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(1);
      progressBar.style.width = `${percentage}%`;
      status.textContent = `Uploading: ${percentage}% (${bytesUploaded}/${bytesTotal} bytes)`;
    },
    onSuccess() {
      retryPanel.hidden = true;
      progressBar.classList.remove("retrying");
      status.textContent = `Upload complete! ${currentUpload?.url ?? ""}`;
      uploadButton.disabled = false;
    },
  });

  currentUpload.start();
});

manualRetryButton.addEventListener("click", () => {
  if (!currentUpload) return;
  retryPanel.hidden = true;
  manualRetryButton.hidden = true;
  progressBar.classList.remove("retrying");
  status.textContent = "Uploading...";
  uploadButton.disabled = true;
  currentUpload.start();
});
