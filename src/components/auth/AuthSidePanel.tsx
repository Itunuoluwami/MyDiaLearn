import { Quote, Star } from "lucide-react";

import fallbackImage from "@/assets/parent-child.jpg";
import { settingMap, usePublicSettings } from "@/lib/public-data";

/**
 * Imagery + reassuring copy shown beside the auth forms.
 * All copy comes from the admin-editable `content.auth_panel` setting.
 */
export function AuthSidePanel() {
  const { data: settings } = usePublicSettings();
  const panel = settingMap(settings, "content.auth_panel");

  const image = panel["image_url"]?.startsWith("http") ? panel["image_url"] : fallbackImage;
  const headline = panel["headline"] || "Learning starts with the right support.";
  const body =
    panel["body"] ||
    "Connect with trusted African educators and give every learner the support they need to thrive.";
  const quote = panel["quote"];
  const author = panel["author"];
  const authorRole = panel["author_role"];

  return (
    <aside className="relative hidden h-full overflow-hidden rounded-2xl lg:block">
      <img
        src={image}
        alt="A parent and child learning together with a DiaLearn tutor"
        className="absolute inset-0 size-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.24_0.04_215_/_0.92)] via-[oklch(0.24_0.04_215_/_0.55)] to-[oklch(0.24_0.04_215_/_0.2)]" />

      <div className="relative flex h-full min-h-[34rem] flex-col justify-end gap-6 p-8 xl:p-10">
        <div className="max-w-sm">
          <h2 className="font-display text-3xl leading-tight text-primary-foreground">{headline}</h2>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/85">{body}</p>
        </div>

        {quote ? (
          <figure className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            <Quote className="size-5 text-secondary" aria-hidden="true" />
            <blockquote className="mt-3 text-sm leading-relaxed text-primary-foreground">
              {quote}
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-primary-foreground">{author}</p>
                <p className="text-xs text-primary-foreground/75">{authorRole}</p>
              </div>
              <div className="flex gap-0.5" aria-label="Rated 5 out of 5">
                {[0, 1, 2, 3, 4].map((index) => (
                  <Star key={index} className="size-3.5 fill-secondary text-secondary" aria-hidden="true" />
                ))}
              </div>
            </figcaption>
          </figure>
        ) : null}
      </div>
    </aside>
  );
}
