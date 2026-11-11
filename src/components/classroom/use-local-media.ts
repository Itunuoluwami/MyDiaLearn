import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The tutor's and learner's own camera, microphone and screen.
 *
 * This is deliberately not part of the video-provider seam. Capturing local
 * media is a browser capability — `getUserMedia` and `getDisplayMedia` — and
 * needs no third party at all; what a provider adds is carrying those tracks
 * to the other person. So the controls in the classroom do something real
 * today: the camera button turns the camera on, and you can see yourself and
 * check your framing before a lesson, whether or not a provider is wired up.
 *
 * Everything is released on unmount. A classroom tab left open with a live
 * camera is both a privacy problem and the reason the camera light stays on
 * after someone thinks they have left.
 */

export type MediaPermission = "idle" | "granted" | "denied" | "unavailable";

export interface LocalMedia {
  stream: MediaStream | null;
  screenStream: MediaStream | null;
  micOn: boolean;
  cameraOn: boolean;
  sharing: boolean;
  permission: MediaPermission;
  /** Why the browser refused, in words worth showing someone. */
  error: string | null;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleShare: () => Promise<void>;
  stopAll: () => void;
}

function supported(): boolean {
  return (
    typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function"
  );
}

/** A refusal the person can act on, rather than the browser's own wording. */
function describe(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError") {
    return "Your browser blocked access. Allow the camera and microphone for this site, then try again.";
  }
  if (name === "NotFoundError") return "No camera or microphone was found on this device.";
  if (name === "NotReadableError") {
    return "Another app is using your camera or microphone. Close it and try again.";
  }
  return "We couldn't start your camera or microphone.";
}

export function useLocalMedia(): LocalMedia {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [permission, setPermission] = useState<MediaPermission>("idle");
  const [error, setError] = useState<string | null>(null);

  // Kept in refs as well so the unmount cleanup sees the latest stream without
  // re-running — re-running it would tear the camera down mid-lesson.
  const streamRef = useRef<MediaStream | null>(null);
  const screenRef = useRef<MediaStream | null>(null);
  streamRef.current = stream;
  screenRef.current = screenStream;

  const stopAll = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    screenRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    screenRef.current = null;
    setStream(null);
    setScreenStream(null);
    setMicOn(false);
    setCameraOn(false);
  }, []);

  useEffect(() => {
    if (!supported()) setPermission("unavailable");
    return () => {
      // Leaving the page releases the devices; the indicator light goes out.
      streamRef.current?.getTracks().forEach((track) => track.stop());
      screenRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  /**
   * Opens one stream for both devices and enables tracks as asked.
   *
   * Asking for audio and video separately means two permission prompts and two
   * device activations; one stream with tracks toggled is what a video app
   * does, and is why muting is instant rather than a fresh prompt.
   */
  const ensure = useCallback(
    async (want: { audio: boolean; video: boolean }): Promise<MediaStream | null> => {
      if (!supported()) {
        setPermission("unavailable");
        setError("This browser cannot open a camera or microphone.");
        return null;
      }
      if (streamRef.current) return streamRef.current;
      try {
        const next = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        next.getAudioTracks().forEach((t) => (t.enabled = want.audio));
        next.getVideoTracks().forEach((t) => (t.enabled = want.video));
        streamRef.current = next;
        setStream(next);
        setPermission("granted");
        setError(null);
        return next;
      } catch (cause) {
        setPermission("denied");
        setError(describe(cause));
        return null;
      }
    },
    [],
  );

  const toggleMic = useCallback(async () => {
    const next = !micOn;
    const live = await ensure({ audio: next, video: cameraOn });
    if (!live) return;
    live.getAudioTracks().forEach((track) => (track.enabled = next));
    setMicOn(next);
  }, [micOn, cameraOn, ensure]);

  const toggleCamera = useCallback(async () => {
    const next = !cameraOn;
    const live = await ensure({ audio: micOn, video: next });
    if (!live) return;
    live.getVideoTracks().forEach((track) => (track.enabled = next));
    setCameraOn(next);
  }, [cameraOn, micOn, ensure]);

  const toggleShare = useCallback(async () => {
    if (screenRef.current) {
      screenRef.current.getTracks().forEach((track) => track.stop());
      screenRef.current = null;
      setScreenStream(null);
      return;
    }
    const display = navigator.mediaDevices?.getDisplayMedia;
    if (typeof display !== "function") {
      setError("This browser cannot share a screen.");
      return;
    }
    try {
      const next = await navigator.mediaDevices.getDisplayMedia({ video: true });
      // Browsers put their own "Stop sharing" control on screen; honour it.
      next.getVideoTracks()[0]?.addEventListener("ended", () => {
        screenRef.current = null;
        setScreenStream(null);
      });
      screenRef.current = next;
      setScreenStream(next);
      setError(null);
    } catch (cause) {
      // Cancelling the picker is a choice, not a failure worth reporting.
      if (cause instanceof DOMException && cause.name === "NotAllowedError") return;
      setError(describe(cause));
    }
  }, []);

  return {
    stream,
    screenStream,
    micOn,
    cameraOn,
    sharing: screenStream !== null,
    permission,
    error,
    toggleMic,
    toggleCamera,
    toggleShare,
    stopAll,
  };
}
