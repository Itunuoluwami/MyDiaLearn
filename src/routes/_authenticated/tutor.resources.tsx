import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ExternalLink,
  FileText,
  FolderOpen,
  ImageIcon,
  Link2,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
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
  RESOURCE_LABEL,
  openStoredFile,
  useCreateResource,
  useDeleteResource,
  useLearningResources,
  type ResourceType,
} from "@/lib/tutor-workspace";

export const Route = createFileRoute("/_authenticated/tutor/resources")({
  head: () => ({
    meta: [
      { title: "Learning materials — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Build a library of PDFs, videos and links for your DiaLearn learners, stored privately and shared only with the families you choose.",
      },
      { property: "og:title", content: "Learning materials — DiaLearn tutor" },
      {
        property: "og:description",
        content: "Your teaching library: worksheets, recordings and reading links.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorResourcesPage,
});

const TYPE_ICON: Record<ResourceType, typeof FileText> = {
  pdf: FileText,
  video: Video,
  link: Link2,
  document: FileText,
  image: ImageIcon,
  other: FolderOpen,
};

const LINK_TYPES: ResourceType[] = ["link", "video"];

function TutorResourcesPage() {
  const resources = useLearningResources();
  const create = useCreateResource();
  const remove = useDeleteResource();
  const subjects = useSubjectOptions();
  const students = useTutorStudents();

  const [filter, setFilter] = useState<"all" | ResourceType>("all");
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    resourceType: "pdf" as ResourceType,
    subjectId: "",
    studentId: "",
    externalUrl: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const rows = resources.data ?? [];
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((row) => row.resource_type === filter)),
    [rows, filter],
  );
  const needsLink = LINK_TYPES.includes(form.resourceType);

  function reset() {
    setForm({
      title: "",
      description: "",
      resourceType: "pdf",
      subjectId: "",
      studentId: "",
      externalUrl: "",
    });
    setFile(null);
    setProgress(0);
  }

  async function handleCreate() {
    if (!form.title.trim()) {
      toast.error("Give this material a title.");
      return;
    }
    if (needsLink && !form.externalUrl.trim()) {
      toast.error("Add the link you want to share.");
      return;
    }
    if (!needsLink && !file) {
      toast.error("Choose a file to upload.");
      return;
    }
    try {
      await create.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim() || null,
        resourceType: form.resourceType,
        subjectId: form.subjectId || null,
        studentId: form.studentId || null,
        externalUrl: needsLink ? form.externalUrl.trim() : null,
        file: needsLink ? null : file,
        onProgress: setProgress,
      });
      toast.success("Material added");
      setOpen(false);
      reset();
    } catch {
      toast.error("We couldn't save that material.");
      setProgress(0);
    }
  }

  async function handleOpen(row: (typeof rows)[number]) {
    try {
      if (row.storage_path) {
        await openStoredFile(row.storage_path);
      } else if (row.external_url) {
        window.open(row.external_url, "_blank", "noopener,noreferrer");
      }
    } catch {
      toast.error("That file couldn't be opened.");
    }
  }

  return (
    <TutorShell
      title="Learning materials"
      description="Private by default — share a file with one learner or keep it for all your classes."
      actions={
        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value);
            if (!value) reset();
          }}
        >
          <DialogTrigger asChild>
            <Button variant="cta" className="min-h-11 sm:min-h-10">
              <Plus className="size-4" /> Add material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add learning material</DialogTitle>
              <DialogDescription>
                Uploaded files are stored privately and opened through short-lived secure links.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="resource-title">Title</Label>
                <Input
                  id="resource-title"
                  className="min-h-11"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Algebra practice set 3"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="resource-type">Type</Label>
                <Select
                  value={form.resourceType}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, resourceType: value as ResourceType }))
                  }
                >
                  <SelectTrigger id="resource-type" className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(RESOURCE_LABEL) as ResourceType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {RESOURCE_LABEL[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {needsLink ? (
                <div className="space-y-1.5">
                  <Label htmlFor="resource-url">Link</Label>
                  <Input
                    id="resource-url"
                    className="min-h-11"
                    inputMode="url"
                    value={form.externalUrl}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, externalUrl: event.target.value }))
                    }
                    placeholder="https://…"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="resource-file">File</Label>
                  <Input
                    id="resource-file"
                    type="file"
                    className="min-h-11"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="resource-subject">Subject (optional)</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, subjectId: value }))}
                >
                  <SelectTrigger id="resource-subject" className="min-h-11">
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
                <Label htmlFor="resource-student">Share with (optional)</Label>
                <Select
                  value={form.studentId}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, studentId: value }))}
                >
                  <SelectTrigger id="resource-student" className="min-h-11">
                    <SelectValue placeholder="Keep in my library" />
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

              <div className="space-y-1.5">
                <Label htmlFor="resource-description">Description (optional)</Label>
                <Textarea
                  id="resource-description"
                  rows={2}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </div>

              {create.isPending ? <Progress value={progress} className="h-2" /> : null}
            </div>

            <DialogFooter>
              <Button
                variant="cta"
                className="min-h-11 sm:min-h-10"
                disabled={create.isPending}
                onClick={() => void handleCreate()}
              >
                {create.isPending ? "Saving…" : "Add material"}
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
            {(Object.keys(RESOURCE_LABEL) as ResourceType[]).map((type) => (
              <TabsTrigger key={type} value={type} className="min-h-11">
                {RESOURCE_LABEL[type]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {resources.isLoading ? (
          <CardSkeletonList rows={4} height="h-24" />
        ) : resources.isError ? (
          <LoadError
            message="We couldn't load your materials."
            onRetry={() => void resources.refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyPanel
            icon={Upload}
            title="Your library is empty"
            body="Add worksheets, recordings and reading links once, then reuse them across every learner you teach."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((row) => {
              const Icon = TYPE_ICON[row.resource_type];
              return (
                <article
                  key={row.id}
                  className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">{row.title}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {RESOURCE_LABEL[row.resource_type]} · added {formatRelative(row.created_at)}
                      </p>
                    </div>
                  </div>

                  {row.description ? (
                    <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{row.description}</p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {row.subjects?.name ? (
                      <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted-foreground">
                        {row.subjects.name}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted-foreground">
                      {row.students?.first_name ? `Shared with ${row.students.first_name}` : "My library"}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11 flex-1 sm:min-h-10"
                      onClick={() => void handleOpen(row)}
                    >
                      <ExternalLink className="size-4" /> Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="min-h-11 min-w-11 text-muted-foreground hover:text-destructive"
                      aria-label={`Delete ${row.title}`}
                      disabled={remove.isPending}
                      onClick={() => {
                        void remove
                          .mutateAsync({ id: row.id, storage_path: row.storage_path })
                          .then(() => toast.success("Material removed"))
                          .catch(() => toast.error("We couldn't remove that material."));
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </TutorShell>
  );
}
