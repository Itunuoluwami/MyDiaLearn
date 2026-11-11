import { useEffect, useRef } from "react";
import { Circle, ExternalLink, MonitorUp, Video, VideoOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LocalMedia } from "./use-local-media";

/**
 * The video area of a classroom.
 *
 * Three states, in the order they become true as the platform grows:
 *
 *  1. **A provider room exists** (`meetingUrl`) — it is embedded here, and the
 *     controls below belong to it.
 *  2. **No provider, camera on** — the person's own camera fills the stage, so
 *     they can frame themselves and check lighting before teaching. This is
 *     real today: capturing local media is a browser capability, not a
 *     third-party one.
 *  3. **No provider, camera off** — a plain standby panel that says what it is
 *     waiting for, rather than pretending to be a call.
 *
 * The reason for the embed rather than our own peer connection is that
 * carrying tracks between continents is the part worth buying: a provider
 * brings the routing, the reconnection and the bandwidth adaptation that the
 * PRD's "low-bandwidth environments, video reconnection" requirements need.
 */
export function ClassStage({
  meetingUrl,
  live,
  elapsed,
  media,
  selfLabel,
}: {
  meetingUrl: string | null;
  live: boolean;
  elapsed: string;
  media: LocalMedia;
  selfLabel: string;
}) {
  const selfView = useRef<HTMLVideoElement>(null);
  const shareView = useRef<HTMLVideoElement>(null);

  // srcObject cannot be set from JSX, so the streams are attached here.
  useEffect(() => {
    if (selfView.current) selfView.current.srcObject = media.stream;
  }, [media.stream]);
  useEffect(() => {
    if (shareView.current) shareView.current.srcObject = media.screenStream;
  }, [media.screenStream]);

  const showSelfFull = !meetingUrl && media.cameraOn && media.stream;
  const showShare = Boolean(media.screenStream);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-ink shadow-soft">
      <div className="relative aspect-video w-full">
        {meetingUrl ? (
          <iframe
            src={meetingUrl}
            title="Live classroom"
            allow="camera; microphone; display-capture; autoplay; clipboard-write"
            className="absolute inset-0 size-full border-0"
          />
        ) : showShare ? (
          <video
            ref={shareView}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 size-full bg-ink object-contain"
          />
        ) : showSelfFull ? (
          <video
            ref={selfView}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 size-full scale-x-[-1] bg-ink object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(30,95,116,0.55),transparent_60%),radial-gradient(circle_at_75%_80%,rgba(242,166,90,0.35),transparent_55%)]">
            <div className="px-6 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-card/15 text-card">
                {media.permission === "denied" ? (
                  <VideoOff className="size-7" aria-hidden="true" />
                ) : (
                  <Video className="size-7" aria-hidden="true" />
                )}
              </span>
              <p className="mt-4 text-sm font-semibold text-card">
                {live ? "Class in progress" : "Ready when you are"}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-card/70">
                {media.error ??
                  "Turn your camera on to check how you look. Live video between you and the other side is not connected yet."}
              </p>
            </div>
          </div>
        )}

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
              live ? "bg-destructive text-destructive-foreground" : "bg-card/20 text-card",
            )}
          >
            <Circle
              className={cn("size-2 fill-current", live && "animate-pulse")}
              aria-hidden="true"
            />
            {live ? "Live" : "Standby"}
          </span>
          <span className="rounded-full bg-card/20 px-2.5 py-1 text-xs font-semibold tabular-nums text-card">
            {elapsed}
          </span>
          {showShare ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card/20 px-2.5 py-1 text-xs font-semibold text-card">
              <MonitorUp className="size-3.5" aria-hidden="true" /> Sharing
            </span>
          ) : null}
        </div>

        {/* Picture-in-picture self view, once the stage itself is something else. */}
        {(meetingUrl || showShare) && media.cameraOn && media.stream ? (
          <div className="absolute bottom-3 right-3 hidden w-40 overflow-hidden rounded-xl border border-card/20 bg-ink sm:block">
            <video
              ref={selfView}
              autoPlay
              playsInline
              muted
              className="aspect-video w-full scale-x-[-1] object-cover"
            />
          </div>
        ) : !meetingUrl && !showShare ? (
          <div className="absolute bottom-3 right-3 hidden w-40 overflow-hidden rounded-xl border border-card/20 bg-card/10 sm:block">
            <div className="grid aspect-video place-items-center text-xs font-medium text-card/70">
              {selfLabel}
            </div>
          </div>
        ) : null}

        {meetingUrl ? (
          <div className="absolute bottom-3 left-3">
            <Button asChild variant="secondary" size="sm" className="min-h-9">
              <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" /> Open in a new tab
              </a>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
