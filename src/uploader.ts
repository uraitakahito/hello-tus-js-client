import * as tus from "tus-js-client";
import type { UploadCallbacks, UploadParams } from "./types";

export interface Uploader {
  startUpload(params: UploadParams): void;
  retryUpload(): void;
}

export function createUploader(callbacks: UploadCallbacks): Uploader {
  let currentUpload: tus.Upload | null = null;

  return {
    startUpload(params: UploadParams) {
      const headers: Record<string, string> = {};
      if (params.token) {
        headers["Authorization"] = `Bearer ${params.token}`;
      }

      currentUpload = new tus.Upload(params.file, {
        endpoint: params.endpoint,
        headers,
        retryDelays: [0, 3000, 5000],
        metadata: {
          filename: params.file.name,
          filetype: params.file.type,
        },
        onShouldRetry(error, retryAttempt, options) {
          const maxRetries = options.retryDelays?.length ?? 0;
          const delay = options.retryDelays?.[retryAttempt] ?? 0;
          const statusCode = error.originalResponse?.getStatus() ?? 0;
          const reason =
            statusCode > 0
              ? `HTTP ${String(statusCode)}`
              : "ネットワークエラー";

          callbacks.onRetrying(retryAttempt, maxRetries, delay, reason);
          return true;
        },
        onError(error) {
          callbacks.onError(error.message);
        },
        onProgress(bytesUploaded, bytesTotal) {
          callbacks.onProgress(bytesUploaded, bytesTotal);
        },
        onSuccess() {
          callbacks.onSuccess(currentUpload?.url ?? "");
        },
      });

      currentUpload.start();
    },

    retryUpload() {
      if (!currentUpload) return;
      currentUpload.start();
    },
  };
}
