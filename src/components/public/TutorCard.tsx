import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  BookOpen,
  CalendarClock,
  GraduationCap,
  MapPin,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/lazy-image";
import { Skeleton } from "@/components/ui/skeleton";
import { countryLabel, formatMoney, type PublicTutor } from "@/lib/public-data";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function initials(name: string | null) {
  if (!name) return "DL";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Availability copy is derived from the tutor's admin/tutor-managed windows. */
function availabilityLabel(days: number[] | null | undefined) {
  const list = (days ?? []).filter((day) => Number.isInteger(day));
  if (list.length === 0) return null;
  const today = new Date().getDay();
  if (list.includes(today)) return "Available today";
  for (let step = 1; step <= 7; step += 1) {
    const day = (today + step) % 7;
    if (list.includes(day)) {
      return step === 1 ? "Available tomorrow" : `Available ${DAY_NAMES[day]}`;
    }
  }
  return null;
}

export function TutorCard({
  tutor,
  countryLabels,
  className = "",
}: {
  tutor: PublicTutor;
  countryLabels: Record<string, string>;
  className?: string;
}) {
  const rating = Number(tutor.rating_avg ?? 0);
  const lessons = Number(tutor.lessons_completed ?? 0);
  const availability = availabilityLabel(tutor.available_days as number[] | null);
  const primarySubject = tutor.subjects?.[0];
  const tags = [...(tutor.curricula ?? []), ...(tutor.levels ?? [])].slice(0, 3);

  return (
    <Link
      to="/tutors/$tutorId"
      params={{ tutorId: tutor.id }}
      aria-label={`View profile for ${tutor.full_name ?? "DiaLearn tutor"}`}
      className={`card-interactive focus-ring group relative flex flex-col overflow-hidden ${className}`}
    >
      {/* Media header: photo with a gentle zoom on hover */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary-soft to-secondary-soft">
        {tutor.avatar_url ? (
          <LazyImage
            src={tutor.avatar_url}
            alt={tutor.full_name ?? "DiaLearn tutor"}
            wrapperClassName="absolute inset-0 h-full w-full bg-transparent"
            className="transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 92vw"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold text-primary-deep/70">
            {initials(tutor.full_name)}
          </span>
        )}
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-16 media-overlay" />

        <span className="chip-float absolute left-3 top-3 gap-1.5 text-primary-deep">
          <BadgeCheck className="size-4 text-primary" strokeWidth={2} />
          Verified
        </span>

        {availability ? (
          <span className="chip-float absolute right-3 top-3 gap-1.5">
            <CalendarClock className="size-3.5 text-success" strokeWidth={1.75} />
            {availability}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
        <h3 className="truncate text-base font-semibold">{tutor.full_name ?? "DiaLearn tutor"}</h3>

        {primarySubject ? (
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-primary">
            <BookOpen className="size-3.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{primarySubject} tutor</span>
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {rating > 0 ? (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Star className="size-3.5 fill-secondary text-secondary" />
              {rating.toFixed(1)}
              <span className="font-normal text-muted-foreground">({tutor.rating_count})</span>
            </span>
          ) : (
            <span>New to DiaLearn</span>
          )}
          {lessons > 0 ? (
            <span className="flex items-center gap-1">
              <GraduationCap className="size-3.5" strokeWidth={1.75} />
              {lessons} {lessons === 1 ? "lesson" : "lessons"}
            </span>
          ) : null}
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{countryLabel(tutor.country_code, countryLabels)}</span>
          </span>
        </div>

        {tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} className="bg-primary-soft text-primary-deep">
                {tag}
              </Badge>
            ))}
            {primarySubject ? (
              <Badge className="bg-secondary-soft text-secondary-foreground">{primarySubject}</Badge>
            ) : null}
          </div>
        ) : null}

        {tutor.headline ? (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{tutor.headline}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <span className="text-sm font-semibold">
            {formatMoney(tutor.hourly_rate, tutor.currency)}
            <span className="text-xs font-normal text-muted-foreground"> / hour</span>
          </span>
          <span className="inline-flex min-h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-soft transition-colors duration-200 group-hover:bg-primary-deep">
            View profile
          </span>
        </div>
        {tutor.years_experience ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {tutor.years_experience} yrs teaching experience
          </p>
        ) : null}
      </div>
    </Link>
  );
}

/** Skeleton that mirrors the tutor card shape while results load. */
export function TutorCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`card-warm overflow-hidden ${className}`}>
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-2 p-4 md:p-5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex items-center justify-between pt-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}
