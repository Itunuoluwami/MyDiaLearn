import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Plus, Send } from "lucide-react";
import { toast } from "sonner";

import { TutorShell } from "@/components/tutor/TutorShell";
import { CardSkeletonList, EmptyPanel, LoadError } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelative, useSubjectOptions } from "@/lib/parent-data";
import { useTutorStudents } from "@/lib/tutor-data";
import {
  ASSIGNMENT_LABEL,
  ASSIGNMENT_TONE,
  useAssignments,
  useCreateAssignment,
  useLearningResources,
  useUpdateAssignment,
  type AssignmentRow,
  type AssignmentStatus,
} from "@/lib/tutor-workspace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tutor/assignments")({
  head: () => ({
    meta: [
      { title: "Assignments — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Set homework for your DiaLearn learners, follow submissions from draft to reviewed, and leave written feedback.",
      },
      { property: "og:title", content: "Assignments — DiaLearn tutor" },
      {
        property: "og:description",
        content: "Homework, submissions and feedback in one workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorAssignmentsPage,
});

const STATUSES: AssignmentStatus[] = ["draft", "assigned", "submitted", "reviewed"];

function TutorAssignmentsPage() {
  const assignments = useAssignments();
  const create = useCreateAssignment();
  const update = useUpdateAssignment();
  const students = useTutorStudents();
  const subjects = useSubjectOptions();
  const resources = useLearningResources();

  const [filter, setFilter] = useState<"all" | AssignmentStatus>("all");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<AssignmentRow | null>(null);
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({
    title: "",
    instructions: "",
    submissionRequirements: "",
    studentId: "",
    subjectId: "",
    resourceId: "",
    dueAt: "",
  });

  const rows = assignments.data ?? [];
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((row) => row.status === filter)),
    [rows, filter],
  );

  async function handleCreate(assignNow: boolean) {
    if (!form.title.trim() || !form.studentId) {
      toast.error("Add a title and choose a learner.");
      return;
    }
    try {
      await create.mutateAsync({
        title: form.title.trim(),
        instructions: form.instructions.trim() || null,
        submissionRequirements: form.submissionRequirements.trim() || null,
        studentId: form.studentId,
        subjectId: form.subjectId || null,
        resourceId: form.resourceId || null,
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
        assignNow,
      });
      toast.success(assignNow ? "Assignment sent to the learner" : "Draft saved");
      setOpen(false);
      setForm({
        title: "",
        instructions: "",
        submissionRequirements: "",
        studentId: "",
        subjectId: "",
        resourceId: "",
        dueAt: "",
      });
    } catch {
      toast.error("We couldn't save that assignment.");
    }
  }

  async function assignNow(row: AssignmentRow) {
    try {
      await update.mutateAsync({
        id: row.id,
        patch: { status: "assigned", assigned_at: new Date().toISOString() },
      });
      toast.success("Assignment sent");
    } catch {
      toast.error("We couldn't send that assignment.");
    }
  }

  async function saveFeedback() {
    if (!active) return;
    try {
      await update.mutateAsync({
        id: active.id,
        patch: {
          feedback: feedback.trim() || null,
          status: "reviewed",
          reviewed_at: new Date().toISOString(),
        },
      });
      toast.success("Feedback shared with the learner");
      setActive(null);
      setFeedback("");
    } catch {
      toast.error("We couldn't save that feedback.");
    }
  }

  return (
    <TutorShell
      title="Assignments"
      description="Set homework, follow submissions and give feedback."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="cta" className="min-h-11 sm:min-h-10">
              <Plus className="size-4" /> New assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New assignment</DialogTitle>
              <DialogDescription>
                Learners and their guardians are notified when you assign it.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="assignment-title">Title</Label>
                <Input
                  id="assignment-title"
                  className="min-h-11"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Quadratic equations — practice set"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="assignment-student">Learner</Label>
                <Select
                  value={form.studentId}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, studentId: value }))}
                >
                  <SelectTrigger id="assignment-student" className="min-h-11">
                    <SelectValue placeholder="Choose a learner" />
                  </SelectTrigger>
                  <SelectContent>
                    {(students.data ?? []).map((student) => (
                      <SelectItem key={student.student_id} value={student.student_id}>
                        {student.first_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="assignment-subject">Subject (optional)</Label>
                  <Select
                    value={form.subjectId}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, subjectId: value }))}
                  >
                    <SelectTrigger id="assignment-subject" className="min-h-11">
                      <SelectValue placeholder="Any subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {(subjects.data ?? []).map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="assignment-due">Due (optional)</Label>
                  <Input
                    id="assignment-due"
                    type="datetime-local"
                    className="min-h-11"
                    value={form.dueAt}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, dueAt: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="assignment-resource">Attach material (optional)</Label>
                <Select
                  value={form.resourceId}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, resourceId: value }))}
                >
                  <SelectTrigger id="assignment-resource" className="min-h-11">
                    <SelectValue placeholder="No attachment" />
                  </SelectTrigger>
                  <SelectContent>
                    {(resources.data ?? []).map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="assignment-instructions">Instructions</Label>
                <Textarea
                  id="assignment-instructions"
                  rows={3}
                  value={form.instructions}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, instructions: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="assignment-requirements">What to submit</Label>
                <Textarea
                  id="assignment-requirements"
                  rows={2}
                  value={form.submissionRequirements}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, submissionRequirements: event.target.value }))
                  }
                  placeholder="Photos of your working, or a typed answer."
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                className="min-h-11 sm:min-h-10"
                disabled={create.isPending}
                onClick={() => void handleCreate(false)}
              >
                Save draft
              </Button>
              <Button
                variant="cta"
                className="min-h-11 sm:min-h-10"
                disabled={create.isPending}
                onClick={() => void handleCreate(true)}
              >
                <Send className="size-4" /> Assign now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="max-w-5xl space-y-5">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="min-h-11">
              All
            </TabsTrigger>
            {STATUSES.map((status) => (
              <TabsTrigger key={status} value={status} className="min-h-11">
                {ASSIGNMENT_LABEL[status]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {assignments.isLoading ? (
          <CardSkeletonList rows={4} height="h-28" />
        ) : assignments.isError ? (
          <LoadError
            message="We couldn't load your assignments."
            onRetry={() => void assignments.refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyPanel
            icon={ClipboardList}
            title="No assignments here"
            body="Set homework after a lesson to keep learners practising between classes."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold md:text-base">{row.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {row.students?.first_name ?? "Learner"}
                      {row.subjects?.name ? ` · ${row.subjects.name}` : ""}
                      {row.due_at ? ` · due ${formatRelative(row.due_at)}` : ""}
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
                </div>

                {row.instructions ? (
                  <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                    {row.instructions}
                  </p>
                ) : null}

                {row.submission_text ? (
                  <p className="mt-3 rounded-xl bg-surface/70 p-3 text-xs">
                    <span className="font-semibold">Submitted:</span> {row.submission_text}
                  </p>
                ) : null}

                {row.feedback ? (
                  <p className="mt-2 rounded-xl bg-success/10 p-3 text-xs">
                    <span className="font-semibold">Your feedback:</span> {row.feedback}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {row.status === "draft" ? (
                    <Button
                      variant="cta"
                      size="sm"
                      className="min-h-11 sm:min-h-10"
                      disabled={update.isPending}
                      onClick={() => void assignNow(row)}
                    >
                      <Send className="size-4" /> Assign now
                    </Button>
                  ) : null}
                  {row.status === "submitted" || row.status === "reviewed" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11 sm:min-h-10"
                      onClick={() => {
                        setActive(row);
                        setFeedback(row.feedback ?? "");
                      }}
                    >
                      {row.status === "reviewed" ? "Edit feedback" : "Review & give feedback"}
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(value) => (value ? null : setActive(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback</DialogTitle>
            <DialogDescription>{active?.title}</DialogDescription>
          </DialogHeader>
          {active?.submission_text ? (
            <p className="rounded-xl bg-surface/70 p-3 text-sm">{active.submission_text}</p>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="assignment-feedback">Your notes for the learner</Label>
            <Textarea
              id="assignment-feedback"
              rows={4}
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="cta"
              className="min-h-11 sm:min-h-10"
              disabled={update.isPending}
              onClick={() => void saveFeedback()}
            >
              Mark reviewed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TutorShell>
  );
}
