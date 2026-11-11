import { Hand, Mic, MicOff, MonitorUp, PhoneOff, Video, VideoOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LocalMedia } from "./use-local-media";

/**
 * Mic, camera, screen share, hand and leave.
 *
 * Every one of these drives something real. The mic and camera buttons open
 * and mute actual devices, and screen share opens the browser's own picker —
 * none of that needs a provider. "Raise hand" is local state the person beside
 * them can see on a shared screen until the far end exists to send it to.
 */
export function DeviceControls({
  media,
  handRaised,
  onToggleHand,
  onLeave,
  leaveLabel = "Leave",
  children,
}: {
  media: LocalMedia;
  handRaised: boolean;
  onToggleHand: () => void;
  onLeave: () => void;
  leaveLabel?: string;
  children?: React.ReactNode;
}) {
  const disabled = media.permission === "unavailable";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-card/10 bg-ink p-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "min-h-11 min-w-11 text-card hover:bg-card/15 hover:text-card",
            media.micOn && "bg-card/15",
          )}
          aria-label={media.micOn ? "Mute microphone" : "Unmute microphone"}
          aria-pressed={media.micOn}
          disabled={disabled}
          onClick={() => void media.toggleMic()}
        >
          {media.micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "min-h-11 min-w-11 text-card hover:bg-card/15 hover:text-card",
            media.cameraOn && "bg-card/15",
          )}
          aria-label={media.cameraOn ? "Turn camera off" : "Turn camera on"}
          aria-pressed={media.cameraOn}
          disabled={disabled}
          onClick={() => void media.toggleCamera()}
        >
          {media.cameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "min-h-11 min-w-11 text-card hover:bg-card/15 hover:text-card",
            media.sharing && "bg-card/15",
          )}
          aria-label={media.sharing ? "Stop sharing your screen" : "Share your screen"}
          aria-pressed={media.sharing}
          disabled={disabled}
          onClick={() => void media.toggleShare()}
        >
          <MonitorUp className="size-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "min-h-11 min-w-11 text-card hover:bg-card/15 hover:text-card",
            handRaised && "bg-warning/25",
          )}
          aria-label={handRaised ? "Lower your hand" : "Raise your hand"}
          aria-pressed={handRaised}
          onClick={onToggleHand}
        >
          <Hand className="size-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {children}
        <Button variant="destructive" size="sm" className="min-h-11 sm:min-h-10" onClick={onLeave}>
          <PhoneOff className="size-4" /> {leaveLabel}
        </Button>
      </div>
    </div>
  );
}
