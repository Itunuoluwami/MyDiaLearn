import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MessageSquare, Search, Star, UserRound } from "lucide-react";

import { ParentShell } from "@/components/parent/ParentShell";
import { ChildSwitcher } from "@/components/parent/ChildSwitcher";
import {
  CardSkeletonList,
  EmptyPanel,
  LoadError,
  MetaItem,
  SectionCard,
  VerifiedChip,
} from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import {
  formatDayInZone,
  formatMoney,
  useBookings,
  useChildren,
  useTutorCards,
  useViewerTimezone,
  type Booking,
} from "@/lib/parent-data";

export const Route = createFileRoute("/_authenticated/my-tutors")({
  head: () => ({
    meta: [
      { title: "Your tutors — DiaLearn parent portal" },
      {
        name: "description",
        content:
          "The tutors your children have lessons with, how much they have taught and when you next see them.",
      },
      { property: "og:title", content: "Your tutors — DiaLearn parent portal" },
      {
        property: "og:description",
        content: "The tutors your children have lessons with.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyTutorsPage,
});

/** What the family's bookings say about one tutor. */
interface TutorHistory {
  tutorId: string;
  lessonsCompleted: number;
  upcoming: Booking | null;
  lastLesson: Booking | null;
  childIds: Set<string>;
}

function summarise(bookings: Booking[]): TutorHistory[] {
  const now = Date.now();
  const byTutor = new Map<string, TutorHistory>();

  for (const booking of bookings) {
    const entry = byTutor.get(booking.tutor_id) ?? {
      tutorId: booking.tutor_id,
      lessonsCompleted: 0,
      upcoming: null,
      lastLesson: null,
      childIds: new Set<string>(),
    };

    entry.childIds.add(booking.student_id);
    if (booking.status === "completed") entry.lessonsCompleted += 1;

    const starts = new Date(booking.starts_at).getTime();
    if (starts > now && ["confirmed", "in_progress", "pending"].includes(booking.status)) {
      // The soonest one is the one a parent cares about.
      if (!entry.upcoming || starts < new Date(entry.upcoming.starts_at).getTime()) {
        entry.upcoming = booking;
      }
    }
    if (starts <= now) {
      if (!entry.lastLesson || starts > new Date(entry.lastLesson.starts_at).getTime()) {
        entry.lastLesson = booking;
      }
    }

    byTutor.set(booking.tutor_id, entry);
  }

  // Tutors with a lesson coming up first, then by how much they have taught.
  return [...byTutor.values()].sort((a, b) => {
    if (Boolean(a.upcoming) !== Boolean(b.upcoming)) return a.upcoming ? -1 : 1;
    return b.lessonsCompleted - a.lessonsCompleted;
  });
}

function MyTutorsPage() {
  const timezone = useViewerTimezone();
  const children = useChildren();
  const [childId, setChildId] = useState<string | null>(null);
  const bookings = useBookings(childId ? { studentId: childId } : undefined);

  const history = useMemo(() => summarise(bookings.data ?? []), [bookings.data]);
  const tutors = useTutorCards(history.map((entry) => entry.tutorId));

  const childName = useMemo(() => {
    const map = new Map((children.data ?? []).map((child) => [child.id, child.first_name]));
    return (id: string) => map.get(id) ?? "your child";
  }, [children.data]);

  return (
    <ParentShell
      title="Your tutors"
      description="Everyone currently teaching your family, and when you next see them."
      actions={
        <Button asChild variant="outline" className="min-h-11">
          <Link to="/find-tutor">
            <Search className="size-4" /> Find another tutor
          </Link>
        </Button>
      }
    >
      {(children.data ?? []).length > 1 ? (
        <ChildSwitcher
          children={children.data ?? []}
          selectedId={childId}
          onSelect={setChildId}
          className="mb-5"
        />
      ) : null}

      <SectionCard
        title="Tutors you have booked"
        description="Built from your family's bookings — a tutor appears here once you book them."
      >
        {bookings.isLoading ? (
          <CardSkeletonList rows={2} height="h-28" />
        ) : bookings.isError ? (
          <LoadError
            message="We couldn't load your tutors right now."
            onRetry={() => void bookings.refetch()}
          />
        ) : history.length === 0 ? (
          <EmptyPanel
            icon={UserRound}
            title="No tutors yet"
            body="Once you book a lesson, the tutor appears here with your lesson history together."
            action={
              <Button asChild variant="cta" className="min-h-11">
                <Link to="/find-tutor">Find a tutor</Link>
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {history.map((entry) => {
              const tutor = tutors.map.get(entry.tutorId);
              const names = [...entry.childIds].map(childName).join(", ");
              return (
                <li
                  key={entry.tutorId}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {tutor?.avatar_url ? (
                      <img
                        src={tutor.avatar_url}
                        alt={tutor.full_name ?? "Tutor"}
                        className="size-12 rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-lg font-bold text-primary-deep">
                        {(tutor?.full_name ?? "T").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-extrabold text-foreground">
                          {tutor?.full_name ?? "Tutor"}
                        </p>
                        <VerifiedChip status={tutor?.verification_status ?? null} />
                      </div>
                      {tutor?.headline ? (
                        <p className="truncate text-sm text-muted-foreground">{tutor.headline}</p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <MetaItem icon={UserRound}>Teaching {names}</MetaItem>
                        <MetaItem icon={Star}>
                          {entry.lessonsCompleted === 1
                            ? "1 lesson completed"
                            : `${entry.lessonsCompleted} lessons completed`}
                        </MetaItem>
                        {tutor?.hourly_rate != null ? (
                          <MetaItem icon={CalendarDays}>
                            {formatMoney(tutor.hourly_rate, tutor.currency)} / hour
                          </MetaItem>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {entry.upcoming
                          ? `Next lesson ${formatDayInZone(entry.upcoming.starts_at, timezone)}`
                          : entry.lastLesson
                            ? `Last lesson ${formatDayInZone(entry.lastLesson.starts_at, timezone)}`
                            : "No lessons scheduled"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm" className="min-h-11 sm:min-h-10">
                      <Link to="/messages">
                        <MessageSquare className="size-4" /> Message
                      </Link>
                    </Button>
                    <Button asChild variant="cta" size="sm" className="min-h-11 sm:min-h-10">
                      <Link to="/book/$tutorId" params={{ tutorId: entry.tutorId }}>
                        Book again
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </ParentShell>
  );
}
