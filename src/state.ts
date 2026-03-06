export type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; bytesUploaded: number; bytesTotal: number }
  | {
      kind: "retrying";
      attempt: number;
      maxRetries: number;
      delay: number;
      reason: string;
    }
  | { kind: "paused"; bytesUploaded: number; bytesTotal: number }
  | { kind: "error"; message: string }
  | { kind: "success"; url: string };

export type UploadEvent =
  | { type: "START" }
  | { type: "PROGRESS"; bytesUploaded: number; bytesTotal: number }
  | {
      type: "RETRY";
      attempt: number;
      maxRetries: number;
      delay: number;
      reason: string;
    }
  | { type: "SUCCESS"; url: string }
  | { type: "ERROR"; message: string }
  | { type: "MANUAL_RETRY" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" };

export function transition(
  state: UploadState,
  event: UploadEvent,
): UploadState {
  switch (event.type) {
    case "START":
      return { kind: "uploading", bytesUploaded: 0, bytesTotal: 0 };
    case "PROGRESS":
      if (state.kind !== "uploading") return state;
      return {
        kind: "uploading",
        bytesUploaded: event.bytesUploaded,
        bytesTotal: event.bytesTotal,
      };
    case "RETRY":
      if (state.kind !== "uploading" && state.kind !== "retrying") return state;
      return {
        kind: "retrying",
        attempt: event.attempt,
        maxRetries: event.maxRetries,
        delay: event.delay,
        reason: event.reason,
      };
    case "SUCCESS":
      if (state.kind !== "uploading") return state;
      return { kind: "success", url: event.url };
    case "ERROR":
      if (state.kind !== "uploading" && state.kind !== "retrying") return state;
      return { kind: "error", message: event.message };
    case "MANUAL_RETRY":
      if (state.kind !== "error") return state;
      return { kind: "uploading", bytesUploaded: 0, bytesTotal: 0 };
    case "PAUSE":
      if (state.kind === "uploading")
        return { kind: "paused", bytesUploaded: state.bytesUploaded, bytesTotal: state.bytesTotal };
      if (state.kind === "retrying")
        return { kind: "paused", bytesUploaded: 0, bytesTotal: 0 };
      return state;
    case "RESUME":
      if (state.kind !== "paused") return state;
      return { kind: "uploading", bytesUploaded: state.bytesUploaded, bytesTotal: state.bytesTotal };
    case "RESET":
      return { kind: "idle" };
  }
}
