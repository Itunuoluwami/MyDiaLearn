import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, Globe2, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { BookingStatusBadge, MetaItem } from "@/components/parent/ui";
import {
  childName,
  formatDayInZone,
  formatMoney,
  formatTimeInZone,
  isJoinable,
  minutesUntil,
  type Booking,
  type Child,
  type TutorCard,
} from "@/lib/parent-data";

/**
 * A single class/booking card. Every value shown comes from the booking row,
 * the linked class session, and the tutor lookup function.
 */
export function ClassCard({
  booking,
  child,
  tutor,
  viewerTimezone,
  compact = false,
}: {
  booking: Booking;
  child: Child | undefined;
  tutor: TutorCard | undefined;
  viewerTimezone: string;
  compact?: boolean;
}) {
  const session = booking.class_sessions?.[0];
  const joinable = isJoinable(booking);
  const until = minutesUntil(booking.starts_at);
  const startingSoon = booking.status === "confirmed" && until <= 60 && until >= 0;

  return (
    <article className="group rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-primary-soft">
          {tutor?.avatar_url ? (
            <LazyImage
              src={tutor.avatar_url}
              alt={tutor.full_name ?? "Tutor"}
              className="size-12 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="flex size-12 items-center justify-center text-sm font-semibold text-primary-deep">
              {(tutor?.full_name ?? "T").charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold">
              {booking.subjects?.name ?? "Lesson"}
            </h3>
            <BookingStatusBadge status={booking.status} startingSoon={startingSoon} />
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {tutor?.full_name ?? "Tutor"}
            {tutor?.verification_status === "verified" ? (
              <span className="ml-1.5 text-xs font-semibold text-success">· Verified</span>
            ) : null}
          </p>
          {child ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">For {childName(child)}</p>
          ) : null}
        </div>
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3">
        <MetaItem icon={CalendarDays}>
          {formatDayInZone(booking.starts_at, viewerTimezone)}
        </MetaItem>
        <MetaItem icon={Clock}>
          {formatTimeInZone(booking.starts_at, viewerTimezone)}–
          {formatTimeInZone(booking.ends_at, viewerTimezone)} · {booking.duration_minutes} min
        </MetaItem>
        <MetaItem icon={Globe2}>Your time · {viewerTimezone}</MetaItem>
      </dl>

      {!compact ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">
            {formatMoney(booking.total_amount, booking.currency)}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="min-h-11 sm:min-h-9">
              <Link to="/bookings" search={{ booking: booking.id }}>
                View details
              </Link>
            </Button>
            {joinable ? (
              session?.meeting_url ? (
                <Button asChild variant="cta" size="sm" className="min-h-11 sm:min-h-9">
                  <a href={session.meeting_url} target="_blank" rel="noreferrer">
                    <Video className="size-4" /> Join class
                  </a>
                </Button>
              ) : (
                <Button variant="cta" size="sm" className="min-h-11 sm:min-h-9" disabled>
                  <Video className="size-4" /> Join link pending
                </Button>
              )
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
