import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, Video } from "lucide-react";

import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDayInZone, formatTimeInZone, useViewerTimezone } from "@/lib/parent-data";
import { useStudentBookings, type StudentBooking } from "@/lib/student-data";

export const Route = createFileRoute("/_authenticated/student/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule — DiaLearn Student Portal" },
      {
        name: "description",
        content: "Your upcoming lessons, grouped by day and shown in your own timezone.",
      },
    ],
  }),
  component: SchedulePage,
});

/** A lesson is joinable from fifteen minutes before it starts. */
const JOIN_WINDOW_MS = 15 * 60 * 1000;

function SchedulePage() {
  const timezone = useViewerTimezone();
  const bookings = useStudentBookings({ statuses: ["pending", "confirmed", "in_progress"] });
  const now = Date.now();

  // Grouped by day in the learner's own timezone — the whole point of the
  // page is that a tutor in Lagos and a learner in Toronto see their own
  // calendar, not the other's.
  const days = useMemo(() => {
    const upcoming = (bookings.data ?? [])
      .filter((booking) => new Date(booking.ends_at).getTime() > now)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

    const grouped = new Map<string, StudentBooking[]>();
    for (const booking of upcoming) {
      const label = formatDayInZone(booking.starts_at, timezone);
      grouped.set(label, [...(grouped.get(label) ?? []), booking]);
    }
    return [...grouped.entries()];
    // `now` deliberately omitted: regrouping every render would thrash the
    // list, and a lesson slipping out of view a minute late is harmless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings.data, timezone]);

  return (
    <StudentShell
      title="🗓️ Schedule"
      description={`Your upcoming lessons · times shown in ${timezone}`}
    >
      {bookings.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : days.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center">
          <span className="text-6xl">🗓️</span>
          <p className="text-xl font-extrabold text-foreground">Nothing scheduled</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When a lesson is booked it appears here, in your own timezone, with a join button when
            it is nearly time.
          </p>
          <Button asChild variant="cta" className="min-h-11 rounded-xl">
            <Link to="/student/find-tutor">Find a tutor</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {days.map(([day, lessons]) => (
            <div key={day}>
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-extrabold uppercase tracking-wide">{day}</h2>
              </div>
              <ul className="mt-3 space-y-2">
                {lessons.map((lesson) => {
                  const starts = new Date(lesson.starts_at).getTime();
                  const joinable = lesson.status !== "pending" && starts - now <= JOIN_WINDOW_MS;
                  return (
                    <li
                      key={lesson.id}
                      className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Clock className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-foreground">
                          {lesson.subjects?.name ?? "Lesson"}
                          {lesson.tutors?.profiles?.full_name
                            ? ` with ${lesson.tutors.profiles.full_name}`
                            : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeInZone(lesson.starts_at, timezone)} –{" "}
                          {formatTimeInZone(lesson.ends_at, timezone)} · {lesson.duration_minutes}{" "}
                          min
                          {lesson.status === "pending" ? " · awaiting payment" : ""}
                        </p>
                      </div>
                      {joinable ? (
                        <Button asChild variant="cta" size="sm" className="min-h-11 rounded-xl">
                          <Link
                            to="/student/classroom/$bookingId"
                            params={{ bookingId: lesson.id }}
                          >
                            <Video className="size-4" /> Join
                          </Link>
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </StudentShell>
  );
}
