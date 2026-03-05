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
progressContainer.style.cssText = "width:100%;background:#eee;margin-top:8px;display:none;";
const progressBar = document.createElement("div");
progressBar.style.cssText = "width:0%;height:24px;background:#4caf50;transition:width 0.2s;";
progressContainer.appendChild(progressBar);

// Status
const status = document.createElement("p");

app.appendChild(fileInput);
app.appendChild(uploadButton);
app.appendChild(progressContainer);
app.appendChild(status);

fileInput.addEventListener("change", () => {
  uploadButton.disabled = !fileInput.files?.length;
});

uploadButton.addEventListener("click", () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  progressContainer.style.display = "block";
  progressBar.style.width = "0%";
  status.textContent = "Uploading...";
  uploadButton.disabled = true;

  const upload = new tus.Upload(file, {
    endpoint: "http://localhost:8080/files/",
    retryDelays: [0, 3000, 5000, 10000, 20000],
    metadata: {
      filename: file.name,
      filetype: file.type,
    },
    onError(error) {
      status.textContent = `Error: ${error.message}`;
      uploadButton.disabled = false;
    },
    onProgress(bytesUploaded, bytesTotal) {
      const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(1);
      progressBar.style.width = `${percentage}%`;
      status.textContent = `Uploading: ${percentage}% (${bytesUploaded}/${bytesTotal} bytes)`;
    },
    onSuccess() {
      status.textContent = `Upload complete! ${upload.url ?? ""}`;
      uploadButton.disabled = false;
    },
  });

  upload.start();
});
