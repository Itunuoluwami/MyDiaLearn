import { Link } from "@tanstack/react-router";
import { CalendarPlus, GraduationCap, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { MetaItem } from "@/components/parent/ui";
import { formatMoney, type PublicTutor } from "@/lib/public-data";

/**
 * Tutor result card used inside the parent portal. Rates, ratings, subjects and
 * currency all come from the search function — nothing is hardcoded.
 */
export function ParentTutorCard({
  tutor,
  childId,
}: {
  tutor: PublicTutor;
  childId?: string | undefined;
}) {
  const rating = tutor.rating_avg ? Number(tutor.rating_avg) : null;

  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-primary-soft ring-2 ring-primary/10">
          {tutor.avatar_url ? (
            <LazyImage
              src={tutor.avatar_url}
              alt={tutor.full_name ?? "Tutor"}
              className="size-14 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="flex size-14 items-center justify-center text-base font-semibold text-primary-deep">
              {(tutor.full_name ?? "T").charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{tutor.full_name}</h3>
          {tutor.headline ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{tutor.headline}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {rating ? (
              <MetaItem icon={Star}>{`${rating.toFixed(1)} (${Number(tutor.rating_count)})`}</MetaItem>
            ) : (
              <span className="text-xs text-muted-foreground">New on DiaLearn</span>
            )}
            {tutor.country_code ? <MetaItem icon={MapPin}>{tutor.country_code}</MetaItem> : null}
            {tutor.years_experience ? (
              <MetaItem icon={GraduationCap}>{`${tutor.years_experience} yrs`}</MetaItem>
            ) : null}
          </div>
        </div>
      </div>

      {(tutor.subjects ?? []).length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(tutor.subjects ?? []).slice(0, 4).map((subject) => (
            <Badge key={subject} variant="secondary" className="rounded-full text-[0.7rem]">
              {subject}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-sm">
          <span className="text-lg font-semibold">
            {formatMoney(tutor.hourly_rate, tutor.currency)}
          </span>
          <span className="text-muted-foreground"> / hour</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="min-h-11 sm:min-h-9">
            <Link to="/tutors/$tutorId" params={{ tutorId: tutor.id }}>
              View profile
            </Link>
          </Button>
          <Button asChild variant="cta" size="sm" className="min-h-11 sm:min-h-9">
            <Link
              to="/book/$tutorId"
              params={{ tutorId: tutor.id }}
              search={childId ? { child: childId } : {}}
            >
              <CalendarPlus className="size-4" /> Book
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
