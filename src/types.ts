export interface UploadCallbacks {
  onProgress(bytesUploaded: number, bytesTotal: number): void;
  onSuccess(url: string): void;
  onError(message: string): void;
  onRetrying(
    attempt: number,
    maxRetries: number,
    delay: number,
    reason: string,
  ): void;
}

export interface UploadParams {
  file: File;
  endpoint: string;
  token: string;
}
