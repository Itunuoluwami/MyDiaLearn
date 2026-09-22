import { useEffect, useRef, useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  User,
  MapPin,
  DollarSign,
  Upload,
  FileText,
  Trash2,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { TutorShell } from "@/components/tutor/TutorShell";
import { CardSkeletonList, LoadError } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLevelOptions, useSubjectOptions } from "@/lib/parent-data";
import {
  useAddAvailabilityWindow,
  useAddTutorSubject,
  useAvailabilityWindows,
  useMyTutorSubjects,
  useTutorRecord,
  useUpdateTutor,
  WEEKDAYS,
  useVerificationSteps,
  useVerificationProgress,
  useTutorDocuments,
  useUploadTutorDocument,
  useDeleteTutorDocument,
  useSubmitVerification,
  VERIFICATION_LABEL,
  VERIFICATION_TONE,
} from "@/lib/tutor-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/tutor/onboarding")({
  head: () => ({
    meta: [{ title: "Set up your teaching profile — DiaLearn tutor" }],
  }),
  component: TutorOnboardingPage,
});

const STEPS = [
  { id: 1, title: "Profile", icon: User },
  { id: 2, title: "Subjects", icon: GraduationCap },
  { id: 3, title: "Experience", icon: Sparkles },
  { id: 4, title: "Location", icon: MapPin },
  { id: 5, title: "Rate", icon: DollarSign },
  { id: 6, title: "Availability", icon: Clock3 },
  { id: 7, title: "Verification", icon: ShieldCheck },
] as const;

function TutorOnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tutor = useTutorRecord();
  const update = useUpdateTutor();
  const subjects = useSubjectOptions();
  const levels = useLevelOptions();
  const mySubjects = useMyTutorSubjects();
  const addSubject = useAddTutorSubject();
  const windows = useAvailabilityWindows();
  const addWindow = useAddAvailabilityWindow();

  const steps = useVerificationSteps();
  const documents = useTutorDocuments();
  const uploadDoc = useUploadTutorDocument();
  const removeDoc = useDeleteTutorDocument();
  const submitVerification = useSubmitVerification();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    headline: "",
    biography: "",
    methodology: "",
    teaching_context: "",
    years: "",
    timezone: "UTC",
    country: "",
  });

  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [slot, setSlot] = useState({ day: "1", start: "16:00", end: "19:00" });

  const record = tutor.data;

  const [docStepId, setDocStepId] = useState("");
  const [docLabel, setDocLabel] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!record) return;
    setForm({
      headline: record.headline ?? "",
      biography: record.biography ?? "",
      methodology: record.methodology ?? "",
      teaching_context: record.teaching_context ?? "",
      years: record.years_experience === null ? "" : String(record.years_experience),
      timezone: record.timezone ?? "UTC",
      country: "",
    });
    setStep(Math.min(Math.max(record.onboarding_step, 1), 7));
  }, [record?.id]);

  const timezones =
    typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["UTC"];

  async function persistStep(next: number) {
    try {
      await update.mutateAsync({ onboarding_step: next });
    } catch {
      // Best-effort. Recording which onboarding step the tutor reached is a
      // convenience on return, never a precondition for continuing, so a
      // failure here must not interrupt the flow or raise a toast.
    }
  }

  async function handleProfileNext() {
    if (form.headline.trim().length < 8) return toast.error("Headline is too short.");
    if (form.biography.trim().length < 40) return toast.error("Biography is too short.");
    try {
      await update.mutateAsync({
        headline: form.headline.trim(),
        biography: form.biography.trim(),
        onboarding_step: 2,
      });
      setStep(2);
    } catch {
      toast.error("Couldn't save step 1.");
    }
  }

  async function handleAddSubject() {
    if (!subjectId) return toast.error("Choose a subject.");
    try {
      await addSubject.mutateAsync({ subjectId, educationLevelId: levelId || null });
      setSubjectId("");
      setLevelId("");
    } catch {
      toast.error("Subject already added.");
    }
  }

  async function handleExperienceNext() {
    const years = form.years === "" ? null : Number(form.years);
    try {
      await update.mutateAsync({
        years_experience: years,
        methodology: form.methodology.trim(),
        teaching_context: form.teaching_context.trim(),
        onboarding_step: 4,
      });
      setStep(4);
    } catch {
      toast.error("Couldn't save step 3.");
    }
  }

  async function handleLocationNext() {
    try {
      await update.mutateAsync({ timezone: form.timezone, onboarding_step: 5 });
      if (user) {
        await supabase
          .from("profiles")
          .update({ timezone: form.timezone, country_code: form.country || null })
          .eq("id", user.id);
      }
      setStep(5);
    } catch {
      toast.error("Couldn't save step 4.");
    }
  }

  async function handleRateNext() {
    try {
      await update.mutateAsync({ onboarding_step: 6 });
      setStep(6);
    } catch {
      toast.error("Couldn't save step 5.");
    }
  }

  async function handleAddWindow() {
    try {
      await addWindow.mutateAsync({
        dayOfWeek: Number(slot.day),
        startTime: slot.start,
        endTime: slot.end,
      });
    } catch {
      toast.error("Couldn't save that window.");
    }
  }

  async function handleDocUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Choose a file to upload.");
    if (file.size > 10 * 1024 * 1024) return toast.error("File must be 10MB or smaller.");
    if (docLabel.trim().length < 3) return toast.error("Provide a document name.");
    try {
      await uploadDoc.mutateAsync({ file, label: docLabel.trim(), stepId: docStepId || null });
      setDocLabel("");
      setDocStepId("");
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Document uploaded");
    } catch {
      toast.error("Couldn't upload document.");
    }
  }

  async function handleSubmitVerification() {
    try {
      await submitVerification.mutateAsync();
      toast.success("Submitted for review!");
      navigate({ to: "/tutor/dashboard" });
    } catch {
      toast.error("Couldn't submit verification.");
    }
  }

  if (tutor.isLoading)
    return (
      <TutorShell title="Get set up">
        <CardSkeletonList rows={2} height="h-40" />
      </TutorShell>
    );
  if (tutor.isError || !record)
    return (
      <TutorShell title="Get set up">
        <LoadError message="Error loading." onRetry={() => tutor.refetch()} />
      </TutorShell>
    );

  const subjectCount = (mySubjects.data ?? []).length;
  const windowCount = (windows.data ?? []).length;

  const stepList = steps.data ?? [];
  const docs = documents.data ?? [];
  const requiredSteps = stepList.filter((s) => s.is_required);
  const coveredRequired = requiredSteps.filter((s) => docs.some((d) => d.step_id === s.id)).length;
  const canSubmit = coveredRequired === requiredSteps.length && requiredSteps.length > 0;

  return (
    <TutorShell
      title="Get set up to teach"
      description="Complete these 7 steps to get verified and listed."
    >
      <div className="max-w-3xl space-y-5">
        <div className="card-elevated p-4 md:p-5 overflow-hidden">
          <Progress value={(step / 7) * 100} className="h-2" />
          <ul className="mt-4 flex gap-2 text-sm overflow-x-auto pb-2 custom-scrollbar">
            {STEPS.map((item) => {
              const Icon = item.icon;
              const done = step > item.id;
              const active = step === item.id;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 whitespace-nowrap",
                    active
                      ? "bg-primary-soft text-primary-deep font-semibold"
                      : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px]",
                      done
                        ? "bg-success/15 text-success"
                        : active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                    )}
                  >
                    {done ? <Check className="size-3" /> : <Icon className="size-3" />}
                  </span>
                  <span>{item.title}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {step === 1 && (
          <section className="card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95">
            <h2 className="display-section text-xl">Introduce yourself</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-full bg-muted flex items-center justify-center border border-dashed border-border text-muted-foreground">
                    <User className="size-6" />
                  </div>
                  <Button variant="outline" size="sm">
                    Upload photo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Clear, well-lit photo of your face.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ob-headline">Headline</Label>
                <Input
                  id="ob-headline"
                  value={form.headline}
                  onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))}
                  placeholder="Physics teacher for IGCSE and A-Level"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ob-bio">Biography</Label>
                <Textarea
                  id="ob-bio"
                  rows={4}
                  value={form.biography}
                  onChange={(e) => setForm((p) => ({ ...p, biography: e.target.value }))}
                  placeholder="Your background and teaching style"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="cta" onClick={handleProfileNext}>
                Continue <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95">
            <h2 className="display-section text-xl">Choose your subjects</h2>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className="min-h-11">
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.data?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Level (optional)</Label>
                <Select value={levelId} onValueChange={setLevelId}>
                  <SelectTrigger className="min-h-11">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.data?.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="min-h-11" onClick={handleAddSubject}>
                Add
              </Button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {mySubjects.data?.map((row) => (
                <li
                  key={row.id}
                  className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-deep"
                >
                  {row.subjects?.name}{" "}
                  {row.education_levels?.name ? `· ${row.education_levels.name}` : ""}
                </li>
              ))}
            </ul>
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(1);
                  persistStep(1);
                }}
              >
                <ArrowLeft className="size-4 mr-2" /> Back
              </Button>
              <Button
                variant="cta"
                disabled={subjectCount === 0}
                onClick={() => {
                  setStep(3);
                  persistStep(3);
                }}
              >
                Continue <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95">
            <h2 className="display-section text-xl">Teaching Experience</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Years of experience</Label>
                <Input
                  className="min-h-11"
                  type="number"
                  value={form.years}
                  onChange={(e) => setForm((p) => ({ ...p, years: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Where you have taught</Label>
                <Textarea
                  className="min-h-11"
                  rows={2}
                  value={form.teaching_context}
                  onChange={(e) => setForm((p) => ({ ...p, teaching_context: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Teaching methodology</Label>
                <Textarea
                  className="min-h-11"
                  rows={3}
                  value={form.methodology}
                  onChange={(e) => setForm((p) => ({ ...p, methodology: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(2);
                  persistStep(2);
                }}
              >
                <ArrowLeft className="size-4 mr-2" /> Back
              </Button>
              <Button variant="cta" onClick={handleExperienceNext}>
                Continue <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95">
            <h2 className="display-section text-xl">Location & Timezone</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Country Code (e.g. GB, NG, US)</Label>
                <Input
                  className="min-h-11"
                  value={form.country}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, country: e.target.value.toUpperCase() }))
                  }
                  maxLength={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Select
                  value={form.timezone}
                  onValueChange={(v) => setForm((p) => ({ ...p, timezone: v }))}
                >
                  <SelectTrigger className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {timezones.map((z) => (
                      <SelectItem key={z} value={z}>
                        {z}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(3);
                  persistStep(3);
                }}
              >
                <ArrowLeft className="size-4 mr-2" /> Back
              </Button>
              <Button variant="cta" onClick={handleLocationNext}>
                Continue <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95">
            <h2 className="display-section text-xl">Your hourly rate</h2>
            <div className="space-y-1.5 rounded-xl border border-dashed border-border bg-surface/50 p-4">
              <p className="text-sm font-semibold">
                {record.hourly_rate === null
                  ? "Not yet set"
                  : `${record.hourly_rate} ${record.currency}/hour`}
              </p>
              <p className="text-xs text-muted-foreground">
                DiaLearn sets every tutor's hourly rate — you don't set your own. It's assigned as
                part of verification review, before you're listed and bookable. Lesson prices are
                calculated from that rate and the lesson length.
              </p>
            </div>
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(4);
                  persistStep(4);
                }}
              >
                <ArrowLeft className="size-4 mr-2" /> Back
              </Button>
              <Button variant="cta" onClick={handleRateNext}>
                Continue <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </section>
        )}

        {step === 6 && (
          <section className="card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95">
            <h2 className="display-section text-xl">Add your teaching hours</h2>
            <p className="text-sm text-muted-foreground">In your timezone ({record.timezone})</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label>Day</Label>
                <Select value={slot.day} onValueChange={(v) => setSlot((p) => ({ ...p, day: v }))}>
                  <SelectTrigger className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS.map((l, i) => (
                      <SelectItem key={l} value={String(i)}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>From</Label>
                <Input
                  className="min-h-11"
                  type="time"
                  value={slot.start}
                  onChange={(e) => setSlot((p) => ({ ...p, start: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>To</Label>
                <Input
                  className="min-h-11"
                  type="time"
                  value={slot.end}
                  onChange={(e) => setSlot((p) => ({ ...p, end: e.target.value }))}
                />
              </div>
              <Button variant="outline" className="min-h-11" onClick={handleAddWindow}>
                Add
              </Button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {windows.data?.map((row) => (
                <li
                  key={row.id}
                  className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium"
                >
                  {WEEKDAYS[row.day_of_week]} {row.start_time.slice(0, 5)}-
                  {row.end_time.slice(0, 5)}
                </li>
              ))}
            </ul>
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(5);
                  persistStep(5);
                }}
              >
                <ArrowLeft className="size-4 mr-2" /> Back
              </Button>
              <Button
                variant="cta"
                disabled={windowCount === 0}
                onClick={() => {
                  setStep(7);
                  persistStep(7);
                }}
              >
                Continue <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </section>
        )}

        {step === 7 && (
          <section className="card-elevated space-y-4 p-4 md:p-6 animate-in fade-in zoom-in-95">
            <h2 className="display-section text-xl">Verify your identity & qualifications</h2>
            <p className="text-sm text-muted-foreground">
              DiaLearn requires all tutors to be verified before they can be booked.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 mt-4 bg-surface/50 p-4 rounded-xl border border-border">
              <div className="space-y-1.5">
                <Label>Requirement</Label>
                <Select value={docStepId} onValueChange={setDocStepId}>
                  <SelectTrigger className="min-h-11">
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    {stepList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} {s.is_required ? "*" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Document Name</Label>
                <Input
                  className="min-h-11"
                  value={docLabel}
                  onChange={(e) => setDocLabel(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>File (PDF/Image, max 10MB)</Label>
                <Input className="min-h-11" type="file" ref={fileRef} />
              </div>
              <Button
                variant="outline"
                className="sm:col-span-2 min-h-11 mt-2"
                onClick={handleDocUpload}
              >
                <Upload className="size-4 mr-2" /> Upload Document
              </Button>
            </div>

            <ul className="space-y-2 mt-4">
              {docs.map((doc) => (
                <li
                  key={doc.id}
                  className="flex justify-between items-center bg-card p-3 rounded-xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">{doc.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {VERIFICATION_LABEL[doc.status]}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="min-h-11 sm:min-h-9"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      removeDoc.mutateAsync({ id: doc.id, storage_path: doc.storage_path })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>

            <div className="flex justify-between pt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(6);
                  persistStep(6);
                }}
              >
                <ArrowLeft className="size-4 mr-2" /> Back
              </Button>
              <Button
                variant="cta"
                disabled={!canSubmit || submitVerification.isPending}
                onClick={handleSubmitVerification}
              >
                <ShieldCheck className="size-4 mr-2" /> Submit for Approval
              </Button>
            </div>
          </section>
        )}
      </div>
    </TutorShell>
  );
}
