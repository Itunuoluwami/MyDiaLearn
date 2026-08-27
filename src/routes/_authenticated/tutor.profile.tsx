import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Eye, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { TutorShell } from "@/components/tutor/TutorShell";
import { CardSkeletonList, LoadError, SectionCard } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLevelOptions, useSubjectOptions } from "@/lib/parent-data";
import {
  useAddTutorSubject,
  useMyTutorSubjects,
  useRemoveTutorSubject,
  useTutorRecord,
  useUpdateTutor,
} from "@/lib/tutor-data";

export const Route = createFileRoute("/_authenticated/tutor/profile")({
  head: () => ({
    meta: [
      { title: "Teaching profile — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Tell families who you teach, how you teach and what you charge. Your profile goes live once you are verified.",
      },
      { property: "og:title", content: "Teaching profile — DiaLearn tutor" },
      {
        property: "og:description",
        content: "Craft the profile families read before they book a lesson with you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorProfilePage,
});

function TutorProfilePage() {
  const tutor = useTutorRecord();
  const update = useUpdateTutor();
  const subjects = useSubjectOptions();
  const levels = useLevelOptions();
  const mySubjects = useMyTutorSubjects();
  const addSubject = useAddTutorSubject();
  const removeSubject = useRemoveTutorSubject();

  const [form, setForm] = useState({
    headline: "",
    biography: "",
    methodology: "",
    teaching_context: "",
    years_experience: "",
    hourly_rate: "",
    intro_video_url: "",
  });
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");

  const record = tutor.data;

  useEffect(() => {
    if (!record) return;
    setForm({
      headline: record.headline ?? "",
      biography: record.biography ?? "",
      methodology: record.methodology ?? "",
      teaching_context: record.teaching_context ?? "",
      years_experience: record.years_experience === null ? "" : String(record.years_experience),
      hourly_rate: record.hourly_rate === null ? "" : String(record.hourly_rate),
      intro_video_url: record.intro_video_url ?? "",
    });
  }, [record?.id, record?.updated_at]);

  async function handleSave() {
    if (form.headline.trim().length > 0 && form.headline.trim().length < 8) {
      toast.error("Give your headline a little more detail.");
      return;
    }
    if (form.biography.trim().length > 0 && form.biography.trim().length < 40) {
      toast.error("Biographies need at least 40 characters so families can trust them.");
      return;
    }
    const rate = form.hourly_rate === "" ? null : Number(form.hourly_rate);
    if (rate !== null && (!Number.isFinite(rate) || rate <= 0)) {
      toast.error("Enter a valid hourly rate.");
      return;
    }
    const years = form.years_experience === "" ? null : Number(form.years_experience);
    if (years !== null && (!Number.isInteger(years) || years < 0 || years > 70)) {
      toast.error("Enter your years of experience as a whole number.");
      return;
    }

    try {
      await update.mutateAsync({
        headline: form.headline.trim() || null,
        biography: form.biography.trim() || null,
        methodology: form.methodology.trim() || null,
        teaching_context: form.teaching_context.trim() || null,
        years_experience: years,
        hourly_rate: rate,
        intro_video_url: form.intro_video_url.trim() || null,
      });
      toast.success("Profile saved");
    } catch {
      toast.error("We couldn't save your profile.");
    }
  }

  async function handleAddSubject() {
    if (!subjectId) {
      toast.error("Pick a subject first.");
      return;
    }
    try {
      await addSubject.mutateAsync({ subjectId, educationLevelId: levelId || null });
      setSubjectId("");
      setLevelId("");
      toast.success("Subject added");
    } catch {
      toast.error("That subject and level combination is already on your profile.");
    }
  }

  async function handleListing(next: boolean) {
    try {
      await update.mutateAsync({ is_listed: next });
      toast.success(next ? "Your profile is now listed" : "Your profile is hidden from search");
    } catch {
      toast.error("We couldn't change your listing.");
    }
  }

  if (tutor.isLoading) {
    return (
      <TutorShell title="Teaching profile">
        <CardSkeletonList rows={3} height="h-40" />
      </TutorShell>
    );
  }

  if (tutor.isError || !record) {
    return (
      <TutorShell title="Teaching profile">
        <LoadError
          message="We couldn't load your teaching profile right now."
          onRetry={() => void tutor.refetch()}
        />
      </TutorShell>
    );
  }

  const verified = record.verification_status === "verified";

  return (
    <TutorShell
      title="Teaching profile"
      description="This is what families read before they book you."
      actions={
        <Button variant="cta" className="min-h-11 sm:min-h-10" disabled={update.isPending} onClick={() => void handleSave()}>
          <Save className="size-4" /> Save changes
        </Button>
      }
    >
      <div className="max-w-4xl space-y-5">
        <SectionCard
          title="Visibility"
          description="Only the DiaLearn team can verify a tutor. Listing is yours to control once verified."
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface/70 p-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Eye className="size-4" /> Listed in tutor search
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {verified
                  ? "Turn this off any time you need a break from new bookings."
                  : "Available once your verification is approved."}
              </p>
            </div>
            <Switch
              checked={record.is_listed}
              disabled={!verified || update.isPending}
              aria-label="Listed in tutor search"
              onCheckedChange={(checked) => void handleListing(checked)}
            />
          </div>
        </SectionCard>

        <SectionCard title="About your teaching">
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                className="min-h-11"
                maxLength={120}
                placeholder="Cambridge-trained maths teacher for GCSE and WAEC"
                value={form.headline}
                onChange={(event) => setForm((prev) => ({ ...prev, headline: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="biography">Biography</Label>
              <Textarea
                id="biography"
                rows={6}
                maxLength={2000}
                placeholder="Share your background, the learners you work best with, and the results you help them reach."
                value={form.biography}
                onChange={(event) => setForm((prev) => ({ ...prev, biography: event.target.value }))}
              />
              <p className="text-xs text-muted-foreground">{form.biography.length}/2000</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="methodology">Teaching methodology</Label>
              <Textarea
                id="methodology"
                rows={4}
                maxLength={1200}
                placeholder="How you run a lesson: diagnostics, pacing, homework, feedback to parents."
                value={form.methodology}
                onChange={(event) => setForm((prev) => ({ ...prev, methodology: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="context">Where you have taught</Label>
              <Textarea
                id="context"
                rows={3}
                maxLength={800}
                placeholder="Schools, tutoring centres, exam boards or online platforms you have taught with."
                value={form.teaching_context}
                onChange={(event) => setForm((prev) => ({ ...prev, teaching_context: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="years">Years of experience</Label>
                <Input
                  id="years"
                  className="min-h-11"
                  inputMode="numeric"
                  value={form.years_experience}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, years_experience: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rate">Hourly rate ({record.currency})</Label>
                <Input
                  id="rate"
                  className="min-h-11"
                  inputMode="decimal"
                  value={form.hourly_rate}
                  onChange={(event) => setForm((prev) => ({ ...prev, hourly_rate: event.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Lesson prices are calculated from this rate and the lesson length.
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="video">Intro video URL</Label>
              <Input
                id="video"
                className="min-h-11"
                type="url"
                maxLength={500}
                placeholder="https://"
                value={form.intro_video_url}
                onChange={(event) => setForm((prev) => ({ ...prev, intro_video_url: event.target.value }))}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Subjects and levels you teach"
          description="Subjects, curricula and levels are managed by DiaLearn — pick from the approved list."
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger id="subject" className="min-h-11">
                  <SelectValue placeholder="Choose a subject" />
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
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="level">Level (optional)</Label>
              <Select value={levelId} onValueChange={setLevelId}>
                <SelectTrigger id="level" className="min-h-11">
                  <SelectValue placeholder="Any level" />
                </SelectTrigger>
                <SelectContent>
                  {(levels.data ?? []).map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="min-h-11"
              disabled={addSubject.isPending}
              onClick={() => void handleAddSubject()}
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(mySubjects.data ?? []).length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="size-4" /> No subjects added yet.
              </p>
            ) : (
              (mySubjects.data ?? []).map((row) => (
                <Badge key={row.id} variant="secondary" className="gap-1.5 py-1.5 pl-3 pr-1.5">
                  <span>
                    {row.subjects?.name ?? "Subject"}
                    {row.education_levels?.name ? ` · ${row.education_levels.name}` : ""}
                  </span>
                  <button
                    type="button"
                    aria-label="Remove subject"
                    className="focus-ring rounded-full p-1 hover:bg-background/60"
                    onClick={() => void removeSubject.mutateAsync(row.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </TutorShell>
  );
}
