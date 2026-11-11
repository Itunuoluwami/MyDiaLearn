import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Loader2,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AgencyShell } from "@/components/agency/AgencyShell";
import { CardSkeletonList, EmptyPanel, LoadError, SectionCard } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddManagedTutorSubject,
  useAddManagedTutorWindow,
  useAgencyTutors,
  useDeleteManagedTutorDocument,
  useDeleteManagedTutorWindow,
  useManagedTutorAvailability,
  useManagedTutorDocuments,
  useManagedTutorProfile,
  useManagedTutorSubjects,
  useManagedTutorVerification,
  useRemoveManagedTutorSubject,
  useSetManagedTutorWindow,
  useSubmitManagedTutorVerification,
  useUpdateManagedTutorProfile,
  useUploadManagedTutorDocument,
} from "@/lib/agency-data";
import { formatMoney, useLevelOptions, useSubjectOptions } from "@/lib/parent-data";
import { VERIFICATION_LABEL, VERIFICATION_TONE, WEEKDAYS } from "@/lib/tutor-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/agency/tutors/$tutorId")({
  head: () => ({
    meta: [
      { title: "Manage tutor — DiaLearn agency" },
      {
        name: "description",
        content: "Complete a tutor's profile, subjects, availability and verification.",
      },
    ],
  }),
  component: ManageTutorPage,
});

const list = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function ProfileTab({ tutorId }: { tutorId: string }) {
  const profile = useManagedTutorProfile(tutorId);
  const update = useUpdateManagedTutorProfile(tutorId);
  const [form, setForm] = useState({
    headline: "",
    biography: "",
    yearsExperience: "",
    methodology: "",
    teachingContext: "",
    introVideoUrl: "",
    languages: "",
    qualifications: "",
    education: "",
    timezone: "",
  });

  useEffect(() => {
    const p = profile.data;
    if (!p) return;
    setForm({
      headline: p.headline ?? "",
      biography: p.biography ?? "",
      yearsExperience: p.yearsExperience === null ? "" : String(p.yearsExperience),
      methodology: p.methodology ?? "",
      teachingContext: p.teachingContext ?? "",
      introVideoUrl: p.introVideoUrl ?? "",
      languages: (p.languages ?? []).join(", "),
      qualifications: (p.qualifications ?? []).join(", "),
      education: (p.education ?? []).join(", "),
      timezone: p.timezone ?? "",
    });
  }, [profile.data]);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    const years = form.yearsExperience === "" ? null : Number(form.yearsExperience);
    if (years !== null && (!Number.isInteger(years) || years < 0 || years > 70)) {
      toast.error("Years of experience must be a whole number between 0 and 70.");
      return;
    }
    try {
      await update.mutateAsync({
        headline: form.headline.trim() || null,
        biography: form.biography.trim() || null,
        yearsExperience: years,
        methodology: form.methodology.trim() || null,
        teachingContext: form.teachingContext.trim() || null,
        introVideoUrl: form.introVideoUrl.trim() || null,
        languages: list(form.languages),
        qualifications: list(form.qualifications),
        education: list(form.education),
        ...(form.timezone.trim() ? { timezone: form.timezone.trim() } : {}),
      });
      toast.success("Profile saved");
    } catch (error) {
      toast.error((error as Error).message || "We couldn't save that profile.");
    }
  }

  if (profile.isLoading) return <CardSkeletonList rows={2} height="h-40" />;
  if (profile.isError)
    return (
      <LoadError
        message="We couldn't load this tutor's profile."
        onRetry={() => void profile.refetch()}
      />
    );

  return (
    <SectionCard
      title="Teaching profile"
      description="What families read on the tutor's public profile."
    >
      <form className="space-y-4" onSubmit={(event) => void handleSave(event)} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            className="min-h-11"
            maxLength={160}
            value={form.headline}
            onChange={(event) => set("headline", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="biography">About the tutor</Label>
          <Textarea
            id="biography"
            rows={5}
            value={form.biography}
            onChange={(event) => set("biography", event.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="years">Years of experience</Label>
            <Input
              id="years"
              inputMode="numeric"
              className="min-h-11"
              value={form.yearsExperience}
              onChange={(event) => set("yearsExperience", event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              placeholder="e.g. Africa/Lagos"
              className="min-h-11"
              value={form.timezone}
              onChange={(event) => set("timezone", event.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="languages">Languages (comma separated)</Label>
          <Input
            id="languages"
            className="min-h-11"
            value={form.languages}
            onChange={(event) => set("languages", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="qualifications">Qualifications (comma separated)</Label>
          <Input
            id="qualifications"
            className="min-h-11"
            value={form.qualifications}
            onChange={(event) => set("qualifications", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="education">Education (comma separated)</Label>
          <Input
            id="education"
            className="min-h-11"
            value={form.education}
            onChange={(event) => set("education", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="methodology">Teaching approach</Label>
          <Textarea
            id="methodology"
            rows={3}
            value={form.methodology}
            onChange={(event) => set("methodology", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="context">Who they teach best</Label>
          <Textarea
            id="context"
            rows={3}
            value={form.teachingContext}
            onChange={(event) => set("teachingContext", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="video">Intro video link</Label>
          <Input
            id="video"
            type="url"
            placeholder="https://"
            className="min-h-11"
            value={form.introVideoUrl}
            onChange={(event) => set("introVideoUrl", event.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Hourly rate:{" "}
          <span className="font-semibold text-foreground">
            {profile.data?.hourlyRate
              ? formatMoney(profile.data.hourlyRate, profile.data.currency)
              : "not set"}
          </span>{" "}
          — set by DiaLearn during verification.
        </p>
        <Button type="submit" variant="cta" className="min-h-11" disabled={update.isPending}>
          {update.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save profile
        </Button>
      </form>
    </SectionCard>
  );
}

function SubjectsTab({ tutorId }: { tutorId: string }) {
  const subjects = useManagedTutorSubjects(tutorId);
  const add = useAddManagedTutorSubject(tutorId);
  const remove = useRemoveManagedTutorSubject(tutorId);
  const options = useSubjectOptions();
  const levels = useLevelOptions();
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("any");

  async function handleAdd() {
    if (!subjectId) {
      toast.error("Choose a subject.");
      return;
    }
    try {
      await add.mutateAsync({ subjectId, educationLevelId: levelId === "any" ? null : levelId });
      toast.success("Subject added");
      setSubjectId("");
      setLevelId("any");
    } catch (error) {
      toast.error((error as Error).message || "We couldn't add that subject.");
    }
  }

  const rows = subjects.data ?? [];
  return (
    <div className="space-y-5">
      <SectionCard
        title="Add a subject"
        description="Subjects and levels come from DiaLearn's catalogue."
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger id="subject" className="min-h-11">
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {(options.data ?? []).map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="level">Level</Label>
            <Select value={levelId} onValueChange={setLevelId}>
              <SelectTrigger id="level" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any level</SelectItem>
                {(levels.data ?? []).map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="cta"
            className="min-h-11"
            disabled={add.isPending}
            onClick={() => void handleAdd()}
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>
      </SectionCard>

      {subjects.isLoading ? (
        <CardSkeletonList rows={2} height="h-14" />
      ) : subjects.isError ? (
        <LoadError message="We couldn't load subjects." onRetry={() => void subjects.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyPanel
          icon={BookOpen}
          title="No subjects yet"
          body="Add at least one subject so families can find this tutor."
        />
      ) : (
        <SectionCard title="Subjects taught">
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-sm">
                  <span className="font-medium">{row.subjectName}</span>
                  {row.levelName ? (
                    <span className="text-muted-foreground"> · {row.levelName}</span>
                  ) : null}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11 sm:size-9"
                  aria-label={`Remove ${row.subjectName ?? "subject"}`}
                  onClick={() => void remove.mutateAsync(row.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}

const toMinutes = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

function AvailabilityTab({ tutorId }: { tutorId: string }) {
  const windows = useManagedTutorAvailability(tutorId);
  const add = useAddManagedTutorWindow(tutorId);
  const toggle = useSetManagedTutorWindow(tutorId);
  const remove = useDeleteManagedTutorWindow(tutorId);
  const [day, setDay] = useState("1");
  const [start, setStart] = useState("16:00");
  const [end, setEnd] = useState("19:00");
  const rows = windows.data ?? [];

  const byDay = useMemo(
    () =>
      WEEKDAYS.map((label, index) => ({
        label,
        items: rows.filter((row) => row.dayOfWeek === index),
      })),
    [rows],
  );

  async function handleAdd() {
    if (toMinutes(end) <= toMinutes(start)) {
      toast.error("The end time must be after the start time.");
      return;
    }
    const overlapping = rows.some(
      (row) =>
        row.dayOfWeek === Number(day) &&
        toMinutes(row.startTime) < toMinutes(end) &&
        toMinutes(row.endTime) > toMinutes(start),
    );
    if (overlapping) {
      toast.error("That window overlaps one already set on this day.");
      return;
    }
    try {
      await add.mutateAsync({ dayOfWeek: Number(day), startTime: start, endTime: end });
      toast.success("Availability added");
    } catch (error) {
      toast.error((error as Error).message || "We couldn't save that window.");
    }
  }

  return (
    <div className="space-y-5">
      <SectionCard
        title="Add a weekly window"
        description={`Repeats every week, in the tutor's timezone${rows[0] ? ` · ${rows[0].timezone}` : ""}.`}
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="day">Day</Label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger id="day" className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map((label, index) => (
                  <SelectItem key={label} value={String(index)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="start">From</Label>
            <Input
              id="start"
              type="time"
              className="min-h-11"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end">To</Label>
            <Input
              id="end"
              type="time"
              className="min-h-11"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </div>
          <Button
            variant="cta"
            className="min-h-11"
            disabled={add.isPending}
            onClick={() => void handleAdd()}
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>
      </SectionCard>

      {windows.isLoading ? (
        <CardSkeletonList rows={3} height="h-20" />
      ) : windows.isError ? (
        <LoadError
          message="We couldn't load availability."
          onRetry={() => void windows.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyPanel
          icon={Clock3}
          title="No availability yet"
          body="Add the hours this tutor can teach each week. Bookings can only land inside an active window."
        />
      ) : (
        <SectionCard title="Weekly schedule">
          <div className="grid gap-3 sm:grid-cols-2">
            {byDay.map((group) => (
              <div key={group.label} className="rounded-xl border border-border bg-card p-3">
                <p className="text-sm font-semibold">{group.label}</p>
                {group.items.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">Not teaching</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {group.items.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-surface/70 px-3 py-2"
                      >
                        <span className="text-sm tabular-nums">
                          {row.startTime.slice(0, 5)} – {row.endTime.slice(0, 5)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Switch
                            checked={row.isActive}
                            aria-label={row.isActive ? "Pause this window" : "Activate this window"}
                            onCheckedChange={(checked) =>
                              void toggle.mutateAsync({ id: row.id, isActive: checked })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete window"
                            className="size-11 sm:size-9"
                            onClick={() => void remove.mutateAsync(row.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function VerificationTab({ tutorId, status }: { tutorId: string; status?: string | undefined }) {
  const steps = useManagedTutorVerification(tutorId);
  const submit = useSubmitManagedTutorVerification(tutorId);
  const documents = useManagedTutorDocuments(tutorId);
  const upload = useUploadManagedTutorDocument(tutorId);
  const removeDoc = useDeleteManagedTutorDocument(tutorId);
  const canSubmit = status === "unverified" || status === "rejected";

  const [docStepId, setDocStepId] = useState("");
  const [docLabel, setDocLabel] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file to upload.");
      return;
    }
    if (docLabel.trim().length < 3) {
      toast.error("Give the document a name.");
      return;
    }
    try {
      await upload.mutateAsync({
        file,
        label: docLabel.trim(),
        stepId: docStepId || null,
      });
      setDocLabel("");
      setDocStepId("");
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Document uploaded");
    } catch (error) {
      toast.error((error as Error).message || "We couldn't upload that document.");
    }
  }

  async function handleSubmit() {
    try {
      await submit.mutateAsync();
      toast.success("Submitted — DiaLearn will review this tutor.");
    } catch (error) {
      toast.error((error as Error).message || "We couldn't submit this tutor.");
    }
  }

  return (
    <SectionCard
      title="Verification"
      description="DiaLearn verifies every tutor, including those under an agency."
      action={
        canSubmit ? (
          <Button
            variant="cta"
            className="min-h-11"
            disabled={submit.isPending}
            onClick={() => void handleSubmit()}
          >
            {submit.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Submit for verification
          </Button>
        ) : null
      }
    >
      {steps.isLoading ? (
        <CardSkeletonList rows={3} height="h-16" />
      ) : steps.isError ? (
        <LoadError message="We couldn't load verification." onRetry={() => void steps.refetch()} />
      ) : (
        <ul className="space-y-3">
          {(steps.data ?? []).map((step) => (
            <li key={step.id} className="rounded-xl border border-border bg-surface/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">
                  {step.name}
                  {step.isRequired ? null : (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      (optional)
                    </span>
                  )}
                </p>
                {step.status ? (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold",
                      VERIFICATION_TONE[step.status],
                    )}
                  >
                    {VERIFICATION_LABEL[step.status]}
                  </span>
                ) : null}
              </div>
              {step.description ? (
                <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
              ) : null}
              {step.reviewerNotes ? (
                <p className="mt-2 text-xs">
                  <span className="font-semibold">Reviewer: </span>
                  {step.reviewerNotes}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {/* Supporting documents.
          This panel used to be a sentence saying upload would arrive "once
          file storage is enabled". Storage has been enabled for a while, and
          without this an agency could submit a tutor with nothing attached —
          a reviewer opened the queue to no identity document, no
          qualifications and no background check. */}
      <div className="mt-6 rounded-xl border border-border bg-surface/60 p-4">
        <p className="text-sm font-semibold">Supporting documents</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Stored privately. Only your agency and the DiaLearn review team can open them.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="agency-doc-step">Verification step</Label>
            <Select value={docStepId} onValueChange={setDocStepId}>
              <SelectTrigger id="agency-doc-step" className="mt-1.5 min-h-11">
                <SelectValue placeholder="Choose a step" />
              </SelectTrigger>
              <SelectContent>
                {(steps.data ?? []).map((step) => (
                  <SelectItem key={step.id} value={step.id}>
                    {step.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="agency-doc-label">Document name</Label>
            <Input
              id="agency-doc-label"
              className="mt-1.5 min-h-11"
              value={docLabel}
              onChange={(event) => setDocLabel(event.target.value)}
              placeholder="Degree certificate"
            />
          </div>
        </div>

        <div className="mt-3">
          <Label htmlFor="agency-doc-file">File (PDF or image, max 10MB)</Label>
          <Input
            id="agency-doc-file"
            ref={fileRef}
            type="file"
            accept="application/pdf,image/*"
            className="mt-1.5 min-h-11"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-11"
          disabled={upload.isPending}
          onClick={() => void handleUpload()}
        >
          {upload.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Upload document
        </Button>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Uploaded
          </p>
          {documents.isLoading ? (
            <CardSkeletonList rows={1} height="h-12" />
          ) : (documents.data ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Nothing uploaded yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {(documents.data ?? []).map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{doc.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {VERIFICATION_LABEL[doc.status as keyof typeof VERIFICATION_LABEL] ??
                        doc.status}
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    disabled={removeDoc.isPending}
                    onClick={() => void removeDoc.mutateAsync(doc.id)}
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Remove {doc.label}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        DiaLearn reviews every tutor, including those managed by an agency.
      </p>
    </SectionCard>
  );
}

function ManageTutorPage() {
  const { tutorId } = Route.useParams();
  const roster = useAgencyTutors();
  const tutor = (roster.data ?? []).find((row) => row.tutorId === tutorId);

  return (
    <AgencyShell
      title={tutor?.fullName ?? "Manage tutor"}
      description={tutor?.email ?? "Profile, subjects, availability and verification."}
      actions={
        <Button asChild variant="outline" className="min-h-11">
          <Link to="/agency/tutors">
            <ArrowLeft className="size-4" /> All tutors
          </Link>
        </Button>
      }
    >
      {roster.isSuccess && !tutor ? (
        <EmptyPanel
          icon={ShieldCheck}
          title="Tutor not found"
          body="This tutor isn't part of your agency, or has been removed."
        />
      ) : (
        <div className="max-w-4xl">
          {tutor ? (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                  VERIFICATION_TONE[tutor.verificationStatus],
                )}
              >
                {VERIFICATION_LABEL[tutor.verificationStatus]}
              </span>
              <span className="text-xs text-muted-foreground">
                {tutor.isListed ? "Visible to families" : "Not visible to families yet"}
              </span>
            </div>
          ) : null}
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <ProfileTab tutorId={tutorId} />
            </TabsContent>
            <TabsContent value="subjects">
              <SubjectsTab tutorId={tutorId} />
            </TabsContent>
            <TabsContent value="availability">
              <AvailabilityTab tutorId={tutorId} />
            </TabsContent>
            <TabsContent value="verification">
              <VerificationTab tutorId={tutorId} status={tutor?.verificationStatus} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AgencyShell>
  );
}
