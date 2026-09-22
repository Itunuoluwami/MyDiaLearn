import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  MessageSquareQuote,
  Search,
  Timer,
  UserRound,
} from "lucide-react";

import { ParentShell } from "@/components/parent/ParentShell";
import { ClassCard } from "@/components/parent/ClassCard";
import {
  CardSkeletonList,
  EmptyPanel,
  KpiCard,
  LoadError,
  SectionCard,
  BookingStatusBadge,
} from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  childName,
  formatDayInZone,
  formatHoursFromMinutes,
  formatTimeInZone,
  useBookings,
  useChildProgress,
  useChildren,
  useTutorCards,
  useViewerTimezone,
} from "@/lib/parent-data";

export const Route = createFileRoute("/_authenticated/children/$studentId")({
  head: () => ({
    meta: [
      { title: "Child profile — DiaLearn parent portal" },
      {
        name: "description",
        content:
          "Review one child's tutors, upcoming classes, learning progress, attendance, class history and tutor notes.",
      },
      { property: "og:title", content: "Child profile — DiaLearn parent portal" },
      {
        property: "og:description",
        content: "A focused view of one learner's education on DiaLearn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChildProfilePage,
});

function ChildProfilePage() {
  const { studentId } = Route.useParams();
  const timezone = useViewerTimezone();
  const children = useChildren();
  const bookings = useBookings({ studentId });
  const progress = useChildProgress(studentId);
  const tutorIds = useMemo(() => (bookings.data ?? []).map((row) => row.tutor_id), [bookings.data]);
  const tutors = useTutorCards(tutorIds);

  const child = (children.data ?? []).find((item) => item.id === studentId) ?? null;
  const rows = progress.data ?? [];

  const upcoming = (bookings.data ?? [])
    .filter(
      (row) =>
        new Date(row.ends_at).getTime() > Date.now() &&
        ["pending", "confirmed", "in_progress"].includes(row.status),
    )
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  const history = (bookings.data ?? []).filter(
    (row) => new Date(row.ends_at).getTime() <= Date.now() || row.status === "completed",
  );

  const notes = (bookings.data ?? []).flatMap((row) =>
    (row.class_sessions ?? [])
      .filter((session) => session.tutor_notes || session.homework)
      .map((session) => ({ booking: row, session })),
  );

  const totalMinutes = rows.reduce((sum, row) => sum + Number(row.learning_minutes ?? 0), 0);
  const totalCompleted = rows.reduce((sum, row) => sum + Number(row.completed_lessons ?? 0), 0);
  const attended = rows.reduce((sum, row) => sum + Number(row.attended_count ?? 0), 0);
  const missed = rows.reduce((sum, row) => sum + Number(row.missed_count ?? 0), 0);
  const cancelled = rows.reduce((sum, row) => sum + Number(row.cancelled_count ?? 0), 0);
  const maxLessons = Math.max(1, ...rows.map((row) => Number(row.completed_lessons ?? 0)));

  const childTutors = [...new Set((bookings.data ?? []).map((row) => row.tutor_id))]
    .map((id) => tutors.map.get(id))
    .filter(Boolean);

  if (children.isError) {
    return (
      <ParentShell title="Child profile">
        <LoadError
          message="We couldn't load this profile right now."
          onRetry={() => void children.refetch()}
        />
      </ParentShell>
    );
  }

  return (
    <ParentShell
      title={child ? childName(child) : "Child profile"}
      description={
        child
          ? `${child.education_levels?.name ?? "Level not set"} · ${child.curricula?.name ?? "Curriculum not set"}`
          : "Loading learner details…"
      }
      actions={
        <>
          <Button asChild variant="cta" className="min-h-11">
            <Link to="/find-tutor" search={{ child: studentId }}>
              <Search className="size-4" /> Find a tutor
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11">
            <Link to="/children">All children</Link>
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Completed lessons" value={totalCompleted} icon={GraduationCap} />
          <KpiCard
            label="Learning hours"
            value={formatHoursFromMinutes(totalMinutes)}
            icon={Timer}
          />
          <KpiCard label="Classes attended" value={attended} icon={CalendarDays} />
          <KpiCard label="Missed classes" value={missed} icon={ClipboardList} />
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="notes">Tutor notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-6">
            <SectionCard title="Education profile">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Curriculum" value={child?.curricula?.name ?? "Not set"} />
                <Detail label="Level / grade" value={child?.education_levels?.name ?? "Not set"} />
                <Detail label="School" value={child?.school_name ?? "Not provided"} />
                <Detail label="Timezone" value={child?.timezone ?? timezone} />
                <div className="sm:col-span-2">
                  <Detail
                    label="Learning goals"
                    value={child?.learning_goals ?? "No goals recorded yet."}
                  />
                </div>
              </dl>
            </SectionCard>

            <SectionCard title="Current tutors">
              {tutors.isLoading ? (
                <CardSkeletonList rows={2} height="h-20" />
              ) : childTutors.length === 0 ? (
                <EmptyPanel
                  icon={UserRound}
                  title="No tutors yet"
                  body="Once you book a lesson, the tutor will appear here."
                  action={
                    <Button asChild variant="cta" className="min-h-11">
                      <Link to="/find-tutor" search={{ child: studentId }}>
                        Find a tutor
                      </Link>
                    </Button>
                  }
                />
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {childTutors.map((tutor) => (
                    <li
                      key={tutor!.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-sm font-semibold text-primary-deep">
                        {(tutor!.full_name ?? "T").charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{tutor!.full_name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {(tutor!.subjects ?? []).slice(0, 3).join(" · ") || "Subjects on request"}
                        </p>
                      </div>
                      {tutor!.verification_status === "verified" ? (
                        <Badge variant="secondary" className="ml-auto shrink-0 text-[0.7rem]">
                          Verified
                        </Badge>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </TabsContent>

          <TabsContent value="classes" className="mt-4">
            <SectionCard title="Upcoming classes" description={`Your time · ${timezone}`}>
              {bookings.isLoading ? (
                <CardSkeletonList rows={2} height="h-36" />
              ) : upcoming.length === 0 ? (
                <EmptyPanel
                  icon={CalendarDays}
                  title="No upcoming classes"
                  body="Scheduled lessons for this learner will appear here."
                  action={
                    <Button asChild variant="cta" className="min-h-11">
                      <Link to="/find-tutor" search={{ child: studentId }}>
                        Find a tutor
                      </Link>
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-3 xl:grid-cols-2">
                  {upcoming.map((booking) => (
                    <ClassCard
                      key={booking.id}
                      booking={booking}
                      child={child ?? undefined}
                      tutor={tutors.map.get(booking.tutor_id)}
                      viewerTimezone={timezone}
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          </TabsContent>

          <TabsContent value="progress" className="mt-4 space-y-6">
            <SectionCard
              title="Subject progress"
              description="Based on lessons actually completed on DiaLearn."
            >
              {progress.isLoading ? (
                <CardSkeletonList rows={3} height="h-16" />
              ) : progress.isError ? (
                <LoadError
                  message="We couldn't load learning progress right now."
                  onRetry={() => void progress.refetch()}
                />
              ) : rows.length === 0 ? (
                <EmptyPanel
                  icon={BookOpen}
                  title="No learning data yet"
                  body="Progress appears after this learner's first completed lesson."
                />
              ) : (
                <ul className="space-y-4">
                  {rows.map((row) => (
                    <li key={row.subject_id ?? row.subject_name}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold">{row.subject_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {Number(row.completed_lessons)} completed ·{" "}
                          {formatHoursFromMinutes(Number(row.learning_minutes))} ·{" "}
                          {Number(row.scheduled_lessons)} scheduled
                        </p>
                      </div>
                      <Progress
                        className="mt-2 h-2"
                        value={(Number(row.completed_lessons) / maxLessons) * 100}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard title="Attendance" description="Recorded by the tutor after each class.">
              <div className="grid grid-cols-3 gap-3">
                <KpiCard label="Attended" value={attended} icon={CalendarDays} />
                <KpiCard label="Missed" value={missed} icon={ClipboardList} />
                <KpiCard label="Cancelled" value={cancelled} icon={Timer} />
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <SectionCard title="Class history">
              {bookings.isLoading ? (
                <CardSkeletonList rows={3} height="h-16" />
              ) : history.length === 0 ? (
                <EmptyPanel
                  icon={ClipboardList}
                  title="No past classes yet"
                  body="Completed and cancelled lessons will be listed here."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {history.map((booking) => (
                    <li key={booking.id} className="flex flex-wrap items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {booking.subjects?.name ?? "Lesson"} ·{" "}
                          {tutors.map.get(booking.tutor_id)?.full_name ?? "Tutor"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDayInZone(booking.starts_at, timezone)} ·{" "}
                          {formatTimeInZone(booking.starts_at, timezone)} ·{" "}
                          {booking.duration_minutes} min
                        </p>
                      </div>
                      <BookingStatusBadge status={booking.status} />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <SectionCard title="Tutor notes & homework">
              {notes.length === 0 ? (
                <EmptyPanel
                  icon={MessageSquareQuote}
                  title="No notes yet"
                  body="After a class, tutor notes and homework will appear here."
                />
              ) : (
                <ul className="space-y-3">
                  {notes.map(({ booking, session }) => (
                    <li
                      key={session.id}
                      className="rounded-xl border border-border bg-surface/50 p-3"
                    >
                      <p className="text-sm font-semibold">
                        {booking.subjects?.name ?? "Lesson"} ·{" "}
                        {formatDayInZone(booking.starts_at, timezone)}
                      </p>
                      {session.tutor_notes ? (
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {session.tutor_notes}
                        </p>
                      ) : null}
                      {session.homework ? (
                        <p className="mt-1.5 text-sm">
                          <span className="font-semibold">Homework: </span>
                          {session.homework}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>
    </ParentShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
