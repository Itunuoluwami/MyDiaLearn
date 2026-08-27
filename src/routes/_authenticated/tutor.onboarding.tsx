import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Clock3, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

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
} from "@/lib/tutor-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tutor/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your teaching profile — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Three guided steps to get ready to teach on DiaLearn: your story, the subjects you teach, and the hours you are available.",
      },
      { property: "og:title", content: "Set up your teaching profile — DiaLearn tutor" },
      {
        property: "og:description",
        content: "A short, guided setup before your profile goes to the DiaLearn verification team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorOnboardingPage,
});

const STEPS = [
  { id: 1, title: "Your story", icon: Sparkles },
  { id: 2, title: "What you teach", icon: GraduationCap },
  { id: 3, title: "When you teach", icon: Clock3 },
] as const;

function TutorOnboardingPage() {
  const navigate = useNavigate();
  const tutor = useTutorRecord();
  const update = useUpdateTutor();
  const subjects = useSubjectOptions();
  const levels = useLevelOptions();
  const mySubjects = useMyTutorSubjects();
  const addSubject = useAddTutorSubject();
  const windows = useAvailabilityWindows();
  const addWindow = useAddAvailabilityWindow();

  const [step, setStep] = useState(1);
  const [story, setStory] = useState({ headline: "", biography: "", rate: "", years: "" });
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [slot, setSlot] = useState({ day: "1", start: "16:00", end: "19:00" });

  const record = tutor.data;

  useEffect(() => {
    if (!record) return;
    setStory({
      headline: record.headline ?? "",
      biography: record.biography ?? "",
      rate: record.hourly_rate === null ? "" : String(record.hourly_rate),
      years: record.years_experience === null ? "" : String(record.years_experience),
    });
    setStep(Math.min(Math.max(record.onboarding_step, 1), 3));
  }, [record?.id]);

  async function persistStep(next: number) {
    try {
      await update.mutateAsync({ onboarding_step: next });
    } catch {
      /* step tracking is a convenience; never block the tutor on it */
    }
  }

  async function handleStoryNext() {
    if (story.headline.trim().length < 8) {
      toast.error("Add a headline of at least 8 characters.");
      return;
    }
    if (story.biography.trim().length < 40) {
      toast.error("Write at least 40 characters so families can get to know you.");
      return;
    }
    const rate = Number(story.rate);
    if (!Number.isFinite(rate) || rate <= 0) {
      toast.error("Enter your hourly rate.");
      return;
    }
    const years = story.years === "" ? null : Number(story.years);
    if (years !== null && (!Number.isInteger(years) || years < 0 || years > 70)) {
      toast.error("Enter your years of experience as a whole number.");
      return;
    }
    try {
      await update.mutateAsync({
        headline: story.headline.trim(),
        biography: story.biography.trim(),
        hourly_rate: rate,
        years_experience: years,
        onboarding_step: 2,
      });
      setStep(2);
    } catch {
      toast.error("We couldn't save that just yet.");
    }
  }

  async function handleAddSubject() {
    if (!subjectId) {
      toast.error("Choose a subject.");
      return;
    }
    try {
      await addSubject.mutateAsync({ subjectId, educationLevelId: levelId || null });
      setSubjectId("");
      setLevelId("");
    } catch {
      toast.error("That subject is already on your profile.");
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
      toast.error("We couldn't save that window.");
    }
  }

  if (tutor.isLoading) {
    return (
      <TutorShell title="Get set up">
        <CardSkeletonList rows={2} height="h-40" />
      </TutorShell>
    );
  }

  if (tutor.isError || !record) {
    return (
      <TutorShell title="Get set up">
        <LoadError message="We couldn't start your setup right now." onRetry={() => void tutor.refetch()} />
      </TutorShell>
    );
  }

  const subjectCount = (mySubjects.data ?? []).length;
  const windowCount = (windows.data ?? []).length;

  return (
    <TutorShell
      title="Get set up to teach"
      description="Three short steps. You can refine everything later from your teaching profile."
    >
      <div className="max-w-3xl space-y-5">
        <div className="card-elevated p-4 md:p-5">
          <Progress value={(step / 3) * 100} className="h-2" />
          <ol className="mt-4 grid gap-2 sm:grid-cols-3">
            {STEPS.map((item) => {
              const Icon = item.icon;
              const done = step > item.id;
              const active = step === item.id;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-sm",
                    active ? "bg-primary-soft text-primary-deep" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      done
                        ? "bg-success/15 text-success"
                        : active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                    )}
                  >
                    {done ? <Check className="size-4" /> : <Icon className="size-4" />}
                  </span>
                  <span className="truncate font-medium">{item.title}</span>
                </li>
              );
            })}
          </ol>
        </div>

        {step === 1 ? (
          <section className="card-elevated space-y-4 p-4 md:p-6">
            <h2 className="display-section text-xl">Introduce yourself</h2>
            <div className="space-y-1.5">
              <Label htmlFor="ob-headline">Headline</Label>
              <Input
                id="ob-headline"
                className="min-h-11"
                maxLength={120}
                placeholder="Physics teacher for IGCSE and A-Level learners"
                value={story.headline}
                onChange={(event) => setStory((prev) => ({ ...prev, headline: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ob-bio">Biography</Label>
              <Textarea
                id="ob-bio"
                rows={6}
                maxLength={2000}
                placeholder="Your background, the learners you work best with, and how you help them progress."
                value={story.biography}
                onChange={(event) => setStory((prev) => ({ ...prev, biography: event.target.value }))}
              />
              <p className="text-xs text-muted-foreground">{story.biography.length}/2000</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ob-rate">Hourly rate ({record.currency})</Label>
                <Input
                  id="ob-rate"
                  className="min-h-11"
                  inputMode="decimal"
                  value={story.rate}
                  onChange={(event) => setStory((prev) => ({ ...prev, rate: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ob-years">Years of experience</Label>
                <Input
                  id="ob-years"
                  className="min-h-11"
                  inputMode="numeric"
                  value={story.years}
                  onChange={(event) => setStory((prev) => ({ ...prev, years: event.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="cta"
                className="min-h-11"
                disabled={update.isPending}
                onClick={() => void handleStoryNext()}
              >
                Continue <ArrowRight className="size-4" />
              </Button>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="card-elevated space-y-4 p-4 md:p-6">
            <h2 className="display-section text-xl">Choose your subjects</h2>
            <p className="text-sm text-muted-foreground">
              Subjects and levels are managed by DiaLearn so families can filter reliably.
            </p>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div className="min-w-0 space-y-1.5">
                <Label htmlFor="ob-subject">Subject</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger id="ob-subject" className="min-h-11">
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
                <Label htmlFor="ob-level">Level (optional)</Label>
                <Select value={levelId} onValueChange={setLevelId}>
                  <SelectTrigger id="ob-level" className="min-h-11">
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
                Add
              </Button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {(mySubjects.data ?? []).map((row) => (
                <li
                  key={row.id}
                  className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-deep"
                >
                  {row.subjects?.name}
                  {row.education_levels?.name ? ` · ${row.education_levels.name}` : ""}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap justify-between gap-2">
              <Button
                variant="ghost"
                className="min-h-11"
                onClick={() => {
                  setStep(1);
                  void persistStep(1);
                }}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button
                variant="cta"
                className="min-h-11"
                disabled={subjectCount === 0}
                onClick={() => {
                  setStep(3);
                  void persistStep(3);
                }}
              >
                Continue <ArrowRight className="size-4" />
              </Button>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="card-elevated space-y-4 p-4 md:p-6">
            <h2 className="display-section text-xl">Add your teaching hours</h2>
            <p className="text-sm text-muted-foreground">
              Weekly windows in your timezone ({record.timezone}). Bookings can only land inside them.
            </p>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
              <div className="min-w-0 space-y-1.5">
                <Label htmlFor="ob-day">Day</Label>
                <Select value={slot.day} onValueChange={(value) => setSlot((prev) => ({ ...prev, day: value }))}>
                  <SelectTrigger id="ob-day" className="min-h-11">
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
                <Label htmlFor="ob-start">From</Label>
                <Input
                  id="ob-start"
                  type="time"
                  className="min-h-11"
                  value={slot.start}
                  onChange={(event) => setSlot((prev) => ({ ...prev, start: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ob-end">To</Label>
                <Input
                  id="ob-end"
                  type="time"
                  className="min-h-11"
                  value={slot.end}
                  onChange={(event) => setSlot((prev) => ({ ...prev, end: event.target.value }))}
                />
              </div>
              <Button
                variant="outline"
                className="min-h-11"
                disabled={addWindow.isPending}
                onClick={() => void handleAddWindow()}
              >
                Add
              </Button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {(windows.data ?? []).map((row) => (
                <li
                  key={row.id}
                  className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium tabular-nums"
                >
                  {WEEKDAYS[row.day_of_week]} {row.start_time.slice(0, 5)}–{row.end_time.slice(0, 5)}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap justify-between gap-2">
              <Button
                variant="ghost"
                className="min-h-11"
                onClick={() => {
                  setStep(2);
                  void persistStep(2);
                }}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button
                variant="cta"
                className="min-h-11"
                disabled={windowCount === 0}
                onClick={async () => {
                  await persistStep(4);
                  toast.success("Setup saved — next stop, verification.");
                  void navigate({ to: "/tutor/verification" });
                }}
              >
                <ShieldCheck className="size-4" /> Go to verification
              </Button>
            </div>
          </section>
        ) : null}

        <p className="text-center text-xs text-muted-foreground">
          Prefer to do this later?{" "}
          <Link to="/tutor/dashboard" className="font-semibold text-primary-deep underline">
            Skip to your dashboard
          </Link>
        </p>
      </div>
    </TutorShell>
  );
}
