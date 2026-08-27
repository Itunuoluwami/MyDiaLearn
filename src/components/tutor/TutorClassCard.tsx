import { CalendarDays, Clock, GraduationCap, Globe2, Timer } from "lucide-react";

import { BookingStatusBadge, MetaItem } from "@/components/parent/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDayInZone, formatMoney, formatTimeInZone } from "@/lib/parent-data";
import type { TutorBooking } from "@/lib/tutor-data";
import { cn } from "@/lib/utils";

/**
 * One class as the tutor sees it: learner, subject, level, when, duration and
 * earnings-relevant amount. All values come from the backend booking record.
 */
export function TutorClassCard({
  booking,
  timezone,
  onAccept,
  onDecline,
  busy,
  className,
}: {
  booking: TutorBooking;
  timezone: string;
  onAccept?: () => void;
  onDecline?: () => void;
  busy?: boolean;
  className?: string;
}) {
  const startsSoon =
    booking.status === "confirmed" &&
    new Date(booking.starts_at).getTime() - Date.now() < 60 * 60 * 1000 &&
    new Date(booking.starts_at).getTime() > Date.now();

  const initial = (booking.student_first_name ?? "?").charAt(0).toUpperCase();

  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:shadow-lift",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-11 shrink-0">
          {booking.student_avatar_url ? (
            <AvatarImage src={booking.student_avatar_url} alt="" loading="lazy" />
          ) : null}
          <AvatarFallback className="bg-primary-soft text-sm font-semibold text-primary-deep">
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold md:text-base">
                {booking.subject_name ?? "Lesson"}
                {booking.education_level_name ? (
                  <span className="font-normal text-muted-foreground"> · {booking.education_level_name}</span>
                ) : null}
              </h3>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                with {booking.student_first_name ?? "Student"}
              </p>
            </div>
            <BookingStatusBadge status={booking.status} startingSoon={startsSoon} />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <MetaItem icon={CalendarDays}>{formatDayInZone(booking.starts_at, timezone)}</MetaItem>
            <MetaItem icon={Clock}>
              {formatTimeInZone(booking.starts_at, timezone)} – {formatTimeInZone(booking.ends_at, timezone)}
            </MetaItem>
            <MetaItem icon={Timer}>{booking.duration_minutes} min</MetaItem>
            <MetaItem icon={Globe2}>{timezone}</MetaItem>
            <MetaItem icon={GraduationCap}>
              {formatMoney(booking.total_amount, booking.currency)} lesson value
            </MetaItem>
          </div>

          {booking.student_notes ? (
            <p className="mt-3 rounded-xl bg-surface/70 p-3 text-xs text-muted-foreground">
              “{booking.student_notes}”
            </p>
          ) : null}

          {onAccept || onDecline ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {onAccept ? (
                <Button variant="cta" size="sm" className="min-h-11 sm:min-h-10" disabled={busy} onClick={onAccept}>
                  Accept lesson
                </Button>
              ) : null}
              {onDecline ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-11 sm:min-h-10"
                  disabled={busy}
                  onClick={onDecline}
                >
                  Decline
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
