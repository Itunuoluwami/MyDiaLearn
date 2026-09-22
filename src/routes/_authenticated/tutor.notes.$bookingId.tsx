import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, NotebookPen } from "lucide-react";
import { toast } from "sonner";

import { TutorShell } from "@/components/tutor/TutorShell";
import { CardSkeletonList, LoadError, SectionCard } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDayInZone, formatTimeInZone } from "@/lib/parent-data";
import { useTutorBookings, useTutorTimezone } from "@/lib/tutor-data";
import { useLessonNote, useSaveLessonNote } from "@/lib/tutor-workspace";

export const Route = createFileRoute("/_authenticated/tutor/notes/$bookingId")({
  head: () => ({
    meta: [
      { title: "Lesson notes — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Capture what was covered, how the learner is doing, what to improve and the next steps, straight after a DiaLearn lesson.",
      },
      { property: "og:title", content: "Lesson notes — DiaLearn tutor" },
      {
        property: "og:description",
        content: "A fast post-class record shared with the learner's family.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LessonNotesPage,
});

const FIELDS = [
  {
    key: "covered" as const,
    label: "What we covered",
    placeholder: "Topics, examples and exercises you worked through together.",
  },
  {
    key: "understanding" as const,
    label: "Understanding",
    placeholder: "What the learner grasped confidently today.",
  },
  {
    key: "improvements" as const,
    label: "Areas to improve",
    placeholder: "Where they need more practice or support.",
  },
  {
    key: "next_steps" as const,
    label: "Next steps",
    placeholder: "Homework, revision and the plan for the next lesson.",
  },
];

function LessonNotesPage() {
  const { bookingId } = useParams({ from: "/_authenticated/tutor/notes/$bookingId" });
  const timezone = useTutorTimezone();
  const note = useLessonNote(bookingId);
  const save = useSaveLessonNote(bookingId);
  const bookings = useTutorBookings();
  const booking = (bookings.data ?? []).find((row) => row.id === bookingId);

  const [form, setForm] = useState({
    covered: "",
    understanding: "",
    improvements: "",
    next_steps: "",
  });

  useEffect(() => {
    if (!note.data) return;
    setForm({
      covered: note.data.covered ?? "",
      understanding: note.data.understanding ?? "",
      improvements: note.data.improvements ?? "",
      next_steps: note.data.next_steps ?? "",
    });
  }, [note.data]);

  async function handleSubmit() {
    try {
      await save.mutateAsync(form);
      toast.success("Lesson notes saved");
    } catch {
      toast.error("We couldn't save these notes.");
    }
  }

  return (
    <TutorShell
      title="Lesson notes"
      description={
        booking
          ? `${booking.subject_name ?? "Lesson"} with ${booking.student_first_name ?? "your learner"} · ${formatDayInZone(booking.starts_at, timezone)}, ${formatTimeInZone(booking.starts_at, timezone)}`
          : "A quick record while the lesson is still fresh"
      }
      actions={
        <Button asChild variant="outline" className="min-h-11 sm:min-h-10">
          <Link to="/tutor/classes">
            <ArrowLeft className="size-4" /> Back to classes
          </Link>
        </Button>
      }
    >
      <div className="max-w-3xl space-y-5">
        {note.isLoading ? (
          <CardSkeletonList rows={2} height="h-40" />
        ) : note.isError ? (
          <LoadError
            message="We couldn't load the notes for this lesson."
            onRetry={() => void note.refetch()}
          />
        ) : (
          <SectionCard
            title="After the class"
            description="Families see these notes in their portal, so keep them warm and specific."
            action={
              note.data ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" /> Saved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-soft px-2.5 py-1 text-xs font-semibold">
                  <NotebookPen className="size-3.5" aria-hidden="true" /> Not written yet
                </span>
              )
            }
          >
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit();
              }}
            >
              {FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`note-${field.key}`}>{field.label}</Label>
                  <Textarea
                    id={`note-${field.key}`}
                    rows={3}
                    value={form[field.key]}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, [field.key]: event.target.value }))
                    }
                  />
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="submit"
                  variant="cta"
                  className="min-h-11 sm:min-h-10"
                  disabled={save.isPending}
                >
                  {save.isPending ? "Saving…" : "Save notes"}
                </Button>
                <Button asChild variant="outline" className="min-h-11 sm:min-h-10">
                  <Link to="/tutor/assignments">Set an assignment</Link>
                </Button>
              </div>
            </form>
          </SectionCard>
        )}
      </div>
    </TutorShell>
  );
}
