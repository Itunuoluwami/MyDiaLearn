import { useState } from "react";
import { Check, Play } from "lucide-react";

import defaultPoster from "@/assets/class-poster.jpg";
import { settingList, settingText, usePublicSettings } from "@/lib/public-data";

/**
 * "What a DiaLearn class looks like" module.
 * Video URL, poster, intro copy and bullets all come from admin-editable
 * platform settings — nothing about the video is hardcoded.
 */
export function ClassPreview({ heading = "What a DiaLearn class looks like" }: { heading?: string }) {
  const [playing, setPlaying] = useState(false);
  const { data: settings } = usePublicSettings();

  const videoUrl = settingText(settings, "content.class_preview_video_url");
  const poster = settingText(settings, "content.class_preview_poster_url") || defaultPoster;
  const intro = settingText(
    settings,
    "content.class_preview_intro",
    "See what a typical DiaLearn lesson feels like.",
  );
  const bullets = settingList<string>(settings, "content.class_preview_bullets");

  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="display-section">{heading}</h2>
      <p className="lead mx-auto mt-3 max-w-2xl">{intro}</p>

      <div className="card-warm mt-8 overflow-hidden p-0 text-left">
        <div className="relative aspect-video w-full bg-ink">
          {playing && videoUrl ? (
            <iframe
              src={videoUrl}
              title="DiaLearn sample lesson"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              disabled={!videoUrl}
              className="focus-ring group absolute inset-0 size-full"
              aria-label="Play the sample DiaLearn lesson"
            >
              <img
                src={poster}
                alt="A DiaLearn tutor teaching a live online lesson"
                className="size-full object-cover"
                loading="lazy"
                width={1600}
                height={912}
              />
              <span className="absolute inset-0 bg-ink/25 transition-colors group-hover:bg-ink/35" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lift transition-transform group-hover:scale-105 md:size-20">
                  <Play className="size-7 translate-x-0.5 fill-current md:size-8" />
                </span>
              </span>
              {!videoUrl ? (
                <span className="absolute inset-x-0 bottom-0 bg-ink/80 p-3 text-center text-xs text-ink-foreground">
                  A lesson preview video has not been published yet.
                </span>
              ) : null}
            </button>
          )}
        </div>

        {bullets.length > 0 ? (
          <ul className="grid gap-3 p-5 sm:grid-cols-3 md:p-6">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
