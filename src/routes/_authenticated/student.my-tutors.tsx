import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MessageSquare, Search, Star, UserRound } from "lucide-react";

import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDayInZone, useViewerTimezone } from "@/lib/parent-data";
import { useStudentBookings, type StudentBooking } from "@/lib/student-data";

export const Route = createFileRoute("/_authenticated/student/my-tutors")({
  head: () => ({
    meta: [
      { title: "My Tutors — DiaLearn Student Portal" },
      {
        name: "description",
        content: "The tutors you learn with, your lessons together and when you next meet.",
      },
    ],
  }),
  component: MyTutorsPage,
});

interface TutorHistory {
  tutorId: string;
  name: string;
  avatar: string | null;
  subjects: Set<string>;
  completed: number;
  upcoming: StudentBooking | null;
  last: StudentBooking | null;
}

/** One entry per tutor, built from the learner's own bookings. */
function summarise(bookings: StudentBooking[]): TutorHistory[] {
  const now = Date.now();
  const byTutor = new Map<string, TutorHistory>();

  for (const booking of bookings) {
    const entry = byTutor.get(booking.tutor_id) ?? {
      tutorId: booking.tutor_id,
      name: booking.tutors?.profiles?.full_name ?? "Your tutor",
      avatar: booking.tutors?.profiles?.avatar_url ?? null,
      subjects: new Set<string>(),
      completed: 0,
      upcoming: null,
      last: null,
    };

    if (booking.subjects?.name) entry.subjects.add(booking.subjects.name);
    if (booking.status === "completed") entry.completed += 1;

    const starts = new Date(booking.starts_at).getTime();
    if (starts > now && ["confirmed", "in_progress", "pending"].includes(booking.status)) {
      if (!entry.upcoming || starts < new Date(entry.upcoming.starts_at).getTime()) {
        entry.upcoming = booking;
      }
    } else if (!entry.last || starts > new Date(entry.last.starts_at).getTime()) {
      entry.last = booking;
    }

    byTutor.set(booking.tutor_id, entry);
  }

  // Whoever you see next comes first; then whoever has taught you most.
  return [...byTutor.values()].sort((a, b) => {
    if (Boolean(a.upcoming) !== Boolean(b.upcoming)) return a.upcoming ? -1 : 1;
    return b.completed - a.completed;
  });
}

function MyTutorsPage() {
  const timezone = useViewerTimezone();
  const bookings = useStudentBookings();
  const tutors = useMemo(() => summarise(bookings.data ?? []), [bookings.data]);

  return (
    <StudentShell
      title="👩🏽‍🏫 My Tutors"
      description="Everyone who teaches you, and when you next meet."
    >
      {bookings.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : tutors.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center">
          <span className="text-6xl">🔍</span>
          <p className="text-xl font-extrabold text-foreground">No tutors yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Once you have a lesson booked, your tutor appears here with everything you have studied
            together.
          </p>
          <Button asChild variant="cta" className="min-h-11 rounded-xl">
            <Link to="/student/find-tutor">
              <Search className="size-4" /> Find a tutor
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {tutors.map((tutor) => (
            <li
              key={tutor.tutorId}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                {tutor.avatar ? (
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="size-12 rounded-2xl object-cover"
                  />
                ) : (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-extrabold text-primary">
                    {tutor.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-extrabold text-foreground">{tutor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {tutor.subjects.size > 0 ? [...tutor.subjects].join(", ") : "Lessons"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="size-3.5" aria-hidden="true" />
                      {tutor.completed === 1
                        ? "1 class together"
                        : `${tutor.completed} classes together`}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      {tutor.upcoming
                        ? `Next ${formatDayInZone(tutor.upcoming.starts_at, timezone)}`
                        : tutor.last
                          ? `Last ${formatDayInZone(tutor.last.starts_at, timezone)}`
                          : "Nothing scheduled"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="min-h-11 rounded-xl">
                  <Link to="/student/messages">
                    <MessageSquare className="size-4" /> Message
                  </Link>
                </Button>
                <Button asChild variant="cta" size="sm" className="min-h-11 rounded-xl">
                  <Link to="/student/book/$tutorId" params={{ tutorId: tutor.tutorId }}>
                    <UserRound className="size-4" /> Book again
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </StudentShell>
  );
}
