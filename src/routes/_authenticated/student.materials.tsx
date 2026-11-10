import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Link as LinkIcon,
  Paperclip,
  Send,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useStudentAssignments,
  useStudentMaterials,
  useSubmitAssignment,
} from "@/lib/student-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/student/materials")({
  head: () => ({
    meta: [
      { title: "Assignments & Materials — DiaLearn Student Portal" },
      { name: "description", content: "View learning materials and submit your assignments." },
    ],
  }),
  component: StudentMaterialsPage,
});

const STATUS_LABEL: Record<string, string> = {
  assigned: "To Do",
  pending: "Pending",
  submitted: "Submitted",
  under_review: "Under Review",
  completed: "Done",
  overdue: "Overdue",
};

const STATUS_COLOR: Record<string, string> = {
  assigned: "bg-secondary/15 text-secondary-foreground",
  pending: "bg-warning/15 text-warning",
  submitted: "bg-primary/10 text-primary",
  under_review: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
};

function StudentMaterialsPage() {
  const allAssignments = useStudentAssignments();
  const materials = useStudentMaterials();
  const submitAssignment = useSubmitAssignment();

  const [activeTab, setActiveTab] = useState("assignments");
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [text, setText] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleSubmit(id: string) {
    const submissionText = text[id]?.trim() || undefined;
    try {
      await submitAssignment.mutateAsync({
        id,
        ...(submissionText ? { text: submissionText } : {}),
      });
      toast.success("Assignment submitted! 🎉");
      setSubmitting(null);
      setText((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {
      toast.error("Couldn't submit. Please try again.");
    }
  }

  // `assignment_status` is draft | assigned | submitted | reviewed. The three
  // tabs below are the learner's view of the last three: work to do, work
  // waiting on the tutor, and work the tutor has given feedback on. Drafts are
  // the tutor's own and never reach the learner.
  const pending = (allAssignments.data ?? []).filter((a) => a.status === "assigned");
  const submitted = (allAssignments.data ?? []).filter((a) => a.status === "submitted");
  const completed = (allAssignments.data ?? []).filter((a) => a.status === "reviewed");

  return (
    <StudentShell
      title="📚 Assignments & Materials"
      description="View what your tutor shared and submit your work here."
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5 h-12 rounded-2xl bg-muted p-1">
          <TabsTrigger
            value="assignments"
            className="min-w-28 rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Assignments
            {pending.length > 0 && (
              <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="materials"
            className="min-w-28 rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Materials
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="min-w-28 rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          {allAssignments.isLoading ? (
            <SkeletonList rows={3} />
          ) : pending.length === 0 ? (
            <EmptyState emoji="✅" message="No pending assignments — great work!" />
          ) : (
            pending.map((a) => {
              const isSubmitting = submitting === a.id;
              const overdue =
                a.due_at && new Date(a.due_at) < new Date() && a.status !== "submitted";
              return (
                <div
                  key={a.id}
                  className={cn(
                    "rounded-2xl border p-5 transition-shadow",
                    overdue
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border bg-card hover:shadow-sm",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-2xl">
                        📋
                      </div>
                      <div>
                        <p className="font-extrabold text-foreground">{a.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {(a as typeof a & { subjects?: { name: string } | null }).subjects?.name}
                          {" · "}
                          by{" "}
                          {(
                            a as typeof a & {
                              tutors?: { profiles?: { full_name?: string } | null } | null;
                            }
                          ).tutors?.profiles?.full_name ?? "Your Tutor"}
                        </p>
                        {a.due_at && (
                          <p
                            className={cn(
                              "mt-1 flex items-center gap-1 text-xs font-bold",
                              overdue ? "text-destructive" : "text-muted-foreground",
                            )}
                          >
                            <Clock className="size-3.5" />
                            {overdue ? "⚠️ Overdue · " : "Due: "}
                            {new Date(a.due_at).toLocaleDateString(undefined, {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={cn("rounded-full text-xs font-bold", STATUS_COLOR[a.status])}>
                      {STATUS_LABEL[a.status] ?? a.status}
                    </Badge>
                  </div>

                  {a.instructions && (
                    <div className="mt-4 rounded-xl border border-border/60 bg-muted/50 p-3 text-sm text-foreground leading-relaxed">
                      <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                        Instructions
                      </p>
                      {a.instructions}
                    </div>
                  )}

                  {/* Submit panel */}
                  {isSubmitting ? (
                    <div className="mt-4 space-y-3">
                      <Textarea
                        placeholder="Write your answer here, or explain your work…"
                        className="min-h-28 rounded-xl resize-none text-sm"
                        value={text[a.id] ?? ""}
                        onChange={(e) => setText((prev) => ({ ...prev, [a.id]: e.target.value }))}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          className="min-h-10 rounded-xl bg-accent font-bold text-white hover:bg-accent/90"
                          onClick={() => void handleSubmit(a.id)}
                          disabled={submitAssignment.isPending}
                        >
                          <Send className="size-4 mr-1" />
                          Submit Assignment
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="min-h-10 rounded-xl font-bold"
                          onClick={() => {
                            setSubmitting(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="mt-4 min-h-10 rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                      onClick={() => setSubmitting(a.id)}
                    >
                      <Upload className="size-4 mr-1" /> Submit Work
                    </Button>
                  )}
                </div>
              );
            })
          )}

          {/* Work that is with the tutor.
              `submitted` was computed and then never rendered, so a learner who
              pressed Submit watched their assignment disappear: gone from
              Assignments because it is no longer `assigned`, and not yet in
              Completed because that is `reviewed`. It sat in a hole until the
              tutor got round to it, with nothing to confirm it had even been
              sent. It belongs here, where they just left it. */}
          {submitted.length > 0 ? (
            <div className="space-y-4 pt-2">
              <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                With your tutor
              </p>
              {submitted.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Clock className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-foreground">{a.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {(a as typeof a & { subjects?: { name: string } | null }).subjects?.name}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Submitted — waiting on feedback from your tutor.
                    </p>
                  </div>
                  <Badge className="rounded-full bg-primary/10 text-xs font-bold text-primary">
                    Submitted
                  </Badge>
                </div>
              ))}
            </div>
          ) : null}
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          {materials.isLoading ? (
            <SkeletonList rows={3} />
          ) : (materials.data ?? []).length === 0 ? (
            <EmptyState
              emoji="📂"
              message="No materials yet. Your tutor will share resources here."
            />
          ) : (
            (materials.data ?? []).map((material) => {
              const icon =
                material.resource_type === "document"
                  ? FileText
                  : material.resource_type === "link"
                    ? LinkIcon
                    : BookOpen;
              const Icon = icon;
              return (
                <div
                  key={material.id}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-foreground truncate">{material.title}</p>
                    {material.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{material.description}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Shared by{" "}
                      {(
                        material as typeof material & {
                          tutors?: { profiles?: { full_name?: string } | null } | null;
                        }
                      ).tutors?.profiles?.full_name ?? "Tutor"}
                      {" · "}
                      {new Date(material.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {material.external_url && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="min-h-10 shrink-0 rounded-xl font-bold"
                    >
                      <a href={material.external_url} target="_blank" rel="noopener noreferrer">
                        Open
                      </a>
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-4">
          {allAssignments.isLoading ? (
            <SkeletonList rows={2} />
          ) : completed.length === 0 ? (
            <EmptyState emoji="🏆" message="Submit assignments to see them here once graded." />
          ) : (
            completed.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-4 rounded-2xl border border-success/20 bg-success/5 p-5"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success">
                  <CheckCircle2 className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-foreground">{a.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {(a as typeof a & { subjects?: { name: string } | null }).subjects?.name}
                  </p>
                  {a.feedback && (
                    <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
                      <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-primary">
                        Tutor Feedback
                      </p>
                      <p className="text-foreground leading-relaxed">{a.feedback}</p>
                    </div>
                  )}
                </div>
                <Badge className="rounded-full bg-success/10 text-xs font-bold text-success">
                  Done ✓
                </Badge>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </StudentShell>
  );
}

function EmptyState({ emoji, message }: { emoji: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
      <span className="text-5xl">{emoji}</span>
      <p className="font-bold text-foreground">{message}</p>
    </div>
  );
}

function SkeletonList({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}
