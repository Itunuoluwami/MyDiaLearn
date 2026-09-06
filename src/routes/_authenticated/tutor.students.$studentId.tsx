import { useMemo, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarCheck,
  ClipboardList,
  MessageSquare,
  NotebookPen,
  Timer,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { TutorShell } from "@/components/tutor/TutorShell";
import {
  CardSkeletonList,
  EmptyPanel,
  KpiCard,
  KpiSkeletonGrid,
  LoadError,
  SectionCard,
} from "@/components/parent/ui";
import { TutorBookingCard } from "@/components/tutor/TutorBookingCard";
import { Button } from "@/components/ui/button";
import { formatHoursFromMinutes, formatRelative } from "@/lib/parent-data";
import { useTutorBookings, useTutorStudents, useTutorTimezone } from "@/lib/tutor-data";
import {
  ASSIGNMENT_LABEL,
  ASSIGNMENT_TONE,
  useAssignments,
  useConversations,
  useStartConversation,
} from "@/lib/tutor-workspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tutor/students/$studentId")({
  head: () => ({
    meta: [
      { title: "Learner progress — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Follow one learner's DiaLearn journey: hours taught, attendance, lesson history, assignments and your notes.",
      },
      { property: "og:title", content: "Learner progress — DiaLearn tutor" },
      {
        property: "og:description",
        content: "Hours, attendance and assignments for a single learner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentProgressPage,
});

function StudentProgressPage() {
  const { studentId } = useParams({ from: "/_authenticated/tutor/students/$studentId" });
  const timezone = useTutorTimezone();
  const students = useTutorStudents();
  const bookings = useTutorBookings();
  const assignments = useAssignments({ studentId });
  const conversations = useConversations();
  const startConversation = useStartConversation();
  const [tab, setTab] = useState<"lessons" | "assignments">("lessons");

  const student = (students.data ?? []).find((row) => row.student_id === studentId);
  const rows = useMemo(
    () => (bookings.data ?? []).filter((row) => row.student_id === studentId),
    [bookings.data, studentId],
  );

  const completed = rows.filter((row) => row.status === "completed");
  const minutes = completed.reduce((total, row) => total + (row.duration_minutes ?? 0), 0);
  const attendedKnown = rows.filter(
    (row) => row.status === "completed" || row.status === "no_show",
  );
  const attendance =
    attendedKnown.length === 0
      ? null
      : Math.round((completed.length / attendedKnown.length) * 100);
  const upcoming = rows.filter(
    (row) =>
      new Date(row.ends_at).getTime() > Date.now() &&
      (row.status === "confirmed" || row.status === "in_progress"),
  );
  const withNotes = completed.filter((row) => row.has_notes).length;

  async function openConversation() {
    const existing = (conversations.data ?? []).find((row) => row.student_id === studentId);
    if (!existing) {
      try {
        await startConversation.mutateAsync({ studentId });
      } catch {
        toast.error("We couldn't open a conversation.");
        return;
      }
    }
    window.location.assign("/tutor/messages");
  }

  return (
    <TutorShell
      title={student?.first_name ? `${student.first_name}'s progress` : "Learner progress"}
      description={
        student
          ? [student.education_level_name, student.curriculum_name, student.student_timezone]
              .filter(Boolean)
              .join(" · ")
          : "Hours, attendance and assignments"
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="min-h-11 sm:min-h-10"
            disabled={startConversation.isPending}
            onClick={() => void openConversation()}
          >
            <MessageSquare className="size-4" /> Message
          </Button>
          <Button asChild variant="ghost" className="min-h-11 sm:min-h-10">
            <Link to="/tutor/students">
              <ArrowLeft className="size-4" /> All learners
            </Link>
          </Button>
        </div>
      }
    >
      <div className="max-w-5xl space-y-5">
        {bookings.isLoading ? (
          <KpiSkeletonGrid />
        ) : bookings.isError ? (
          <LoadError
            message="We couldn't load this learner's lessons."
            onRetry={() => void bookings.refetch()}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              label="Learning hours"
              value={formatHoursFromMinutes(minutes)}
              hint={`${completed.length} completed ${completed.length === 1 ? "lesson" : "lessons"}`}
              icon={Timer}
              variant="primary"
            />
            <KpiCard
              label="Attendance"
              value={attendance === null ? "—" : `${attendance}%`}
              hint={attendance === null ? "No completed lessons yet" : "Lessons attended"}
              icon={TrendingUp}
            />
            <KpiCard
              label="Upcoming"
              value={upcoming.length}
              hint={
                student?.next_class_at ? `Next ${formatRelative(student.next_class_at)}` : "Nothing booked"
              }
              icon={CalendarCheck}
            />
            <KpiCard
              label="Lessons with notes"
              value={`${withNotes}/${completed.length || 0}`}
              hint="Shared with the family"
              icon={NotebookPen}
            />
          </div>
        )}

        {student?.subjects?.length ? (
          <SectionCard title="Subjects you teach together" description="Taken from your lessons">
            <div className="flex flex-wrap gap-2">
              {student.subjects.map((subject) => (
                <span key={subject} className="rounded-full bg-surface px-3 py-1.5 text-sm">
                  {subject}
                </span>
              ))}
            </div>
          </SectionCard>
        ) : null}

        <div className="flex gap-2">
          <Button
            variant={tab === "lessons" ? "cta" : "outline"}
            size="sm"
            className="min-h-11 sm:min-h-10"
            onClick={() => setTab("lessons")}
          >
            Lesson history
          </Button>
          <Button
            variant={tab === "assignments" ? "cta" : "outline"}
            size="sm"
            className="min-h-11 sm:min-h-10"
            onClick={() => setTab("assignments")}
          >
            Assignments
          </Button>
        </div>

        {tab === "lessons" ? (
          bookings.isLoading ? (
            <CardSkeletonList rows={3} height="h-32" />
          ) : rows.length === 0 ? (
            <EmptyPanel
              icon={CalendarCheck}
              title="No lessons yet"
              body="Lessons with this learner will be listed here with attendance and your notes."
            />
          ) : (
            <div className="space-y-3">
              {rows
                .slice()
                .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())
                .map((booking) => (
                  <TutorBookingCard
                    key={booking.id}
                    booking={booking}
                    timezone={timezone}
                    showLifecycle={false}
                  />
                ))}
            </div>
          )
        ) : assignments.isLoading ? (
          <CardSkeletonList rows={3} height="h-24" />
        ) : (assignments.data ?? []).length === 0 ? (
          <EmptyPanel
            icon={ClipboardList}
            title="No assignments yet"
            body="Set homework to keep this learner practising between lessons."
            action={
              <Button asChild variant="cta" className="min-h-11">
                <Link to="/tutor/assignments">New assignment</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {(assignments.data ?? []).map((row) => (
              <article
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{row.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {row.due_at ? `Due ${formatRelative(row.due_at)}` : "No due date"}
                    {row.submitted_at ? ` · submitted ${formatRelative(row.submitted_at)}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                    ASSIGNMENT_TONE[row.status],
                  )}
                >
                  {ASSIGNMENT_LABEL[row.status]}
                </span>
              </article>
            ))}
          </div>
        )}
      </div>
    </TutorShell>
  );
}
