import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Clock,
  Globe2,
  GraduationCap,
  MessageSquare,
  NotebookPen,
  Timer,
  Video,
} from "lucide-react";

import { BookingStatusBadge, MetaItem, PaymentStatusBadge } from "@/components/parent/ui";
import { BookingLifecycle } from "@/components/tutor/BookingLifecycle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDayInZone, formatMoney, formatTimeInZone } from "@/lib/parent-data";
import type { TutorBooking } from "@/lib/tutor-data";
import { cn } from "@/lib/utils";

/** A class is joinable only when the backend says it is confirmed or running. */
export function isJoinableForTutor(booking: TutorBooking) {
  if (booking.status === "in_progress") return true;
  if (booking.status !== "confirmed") return false;
  const start = new Date(booking.starts_at).getTime();
  const end = new Date(booking.ends_at).getTime();
  const now = Date.now();
  return now >= start - 15 * 60 * 1000 && now <= end + 30 * 60 * 1000;
}

export function TutorBookingCard({
  booking,
  timezone,
  onAccept,
  onDecline,
  busy,
  showLifecycle = true,
  className,
}: {
  booking: TutorBooking;
  timezone: string;
  onAccept?: () => void;
  onDecline?: () => void;
  busy?: boolean;
  showLifecycle?: boolean;
  className?: string;
}) {
  const startsSoon =
    booking.status === "confirmed" &&
    new Date(booking.starts_at).getTime() - Date.now() < 60 * 60 * 1000 &&
    new Date(booking.starts_at).getTime() > Date.now();

  const joinable = isJoinableForTutor(booking);
  const notesReady = booking.status === "completed" || booking.status === "in_progress";
  const initial = (booking.student_first_name ?? "?").charAt(0).toUpperCase();

  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift",
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
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {booking.education_level_name}
                  </span>
                ) : null}
              </h3>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                with {booking.student_first_name ?? "Student"}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              <BookingStatusBadge status={booking.status} startingSoon={startsSoon} />
              {booking.payment_status ? <PaymentStatusBadge status={booking.payment_status} /> : null}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <MetaItem icon={CalendarDays}>{formatDayInZone(booking.starts_at, timezone)}</MetaItem>
            <MetaItem icon={Clock}>
              {formatTimeInZone(booking.starts_at, timezone)} –{" "}
              {formatTimeInZone(booking.ends_at, timezone)}
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

          {booking.cancellation_reason ? (
            <p className="mt-3 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
              Cancelled: {booking.cancellation_reason}
            </p>
          ) : null}

          {showLifecycle && booking.status !== "cancelled" && booking.status !== "rejected" ? (
            <BookingLifecycle
              className="mt-4"
              status={booking.status}
              paymentStatus={booking.payment_status}
              acceptedAt={booking.tutor_accepted_at}
            />
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {onAccept ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="cta" size="sm" className="min-h-11 flex-1 sm:min-h-10 sm:flex-none" disabled={busy}>
                    Accept
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Accept this lesson?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {formatDayInZone(booking.starts_at, timezone)} at{" "}
                      {formatTimeInZone(booking.starts_at, timezone)} ({timezone}) with{" "}
                      {booking.student_first_name ?? "this learner"}. The lesson is confirmed once the
                      family's payment clears.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="min-h-11 sm:min-h-10">Not now</AlertDialogCancel>
                    <AlertDialogAction className="min-h-11 sm:min-h-10" onClick={onAccept}>
                      Accept lesson
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}

            {onDecline ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11 flex-1 sm:min-h-10 sm:flex-none"
                    disabled={busy}
                  >
                    Decline
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Decline this request?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The family will be able to book another time with you. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="min-h-11 sm:min-h-10">Keep request</AlertDialogCancel>
                    <AlertDialogAction className="min-h-11 sm:min-h-10" onClick={onDecline}>
                      Decline
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}

            {joinable ? (
              <Button asChild variant="cta" size="sm" className="min-h-11 sm:min-h-10">
                <Link to="/tutor/classroom/$bookingId" params={{ bookingId: booking.id }}>
                  <Video className="size-4" /> Join class
                </Link>
              </Button>
            ) : null}

            {notesReady ? (
              <Button asChild variant="outline" size="sm" className="min-h-11 sm:min-h-10">
                <Link to="/tutor/notes/$bookingId" params={{ bookingId: booking.id }}>
                  <NotebookPen className="size-4" /> {booking.has_notes ? "Lesson notes" : "Add notes"}
                </Link>
              </Button>
            ) : null}

            {booking.student_id ? (
              <Button asChild variant="ghost" size="sm" className="min-h-11 sm:min-h-10">
                <Link to="/tutor/students/$studentId" params={{ studentId: booking.student_id }}>
                  <MessageSquare className="size-4" /> Learner
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
