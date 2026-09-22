import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Globe2,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useStudentRecord } from "@/lib/student-data";
import {
  formatDayInZone,
  formatMoney,
  formatTimeInZone,
  useAvailableSlots,
  useBookingQuote,
  useDurationOptions,
  useTutorCard,
  useTutorSubjects,
  useViewerTimezone,
} from "@/lib/parent-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/student/book/$tutorId")({
  head: () => ({
    meta: [
      { title: "Book a class — DiaLearn Student Portal" },
      {
        name: "description",
        content: "Pick a subject, lesson length and time to book a class with your tutor.",
      },
    ],
  }),
  component: StudentBookPage,
});

function StudentBookPage() {
  const { tutorId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const timezone = useViewerTimezone();

  const { data: student, isLoading: studentLoading } = useStudentRecord();
  const { tutor: tutorInfo } = useTutorCard(tutorId);
  const durations = useDurationOptions();
  const tutorSubjects = useTutorSubjects(tutorId);

  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [slotStart, setSlotStart] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const durationOptions = durations.data ?? [];
  const effectiveDuration = duration ?? durationOptions[0];

  const slots = useAvailableSlots({ tutorId, durationMinutes: effectiveDuration });
  const quote = useBookingQuote(tutorId, effectiveDuration);

  const uniqueSubjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const row of tutorSubjects.data ?? []) {
      if (row.subject_id)
        map.set(row.subject_id, { id: row.subject_id, name: row.subjects?.name ?? "Subject" });
    }
    return [...map.values()];
  }, [tutorSubjects.data]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof slots.data>();
    for (const slot of slots.data ?? []) {
      const day = formatDayInZone(slot.starts_at, timezone);
      const list = map.get(day) ?? [];
      list.push(slot);
      map.set(day, list);
    }
    return [...map.entries()];
  }, [slots.data, timezone]);

  const selectedSlot = (slots.data ?? []).find((slot) => slot.starts_at === slotStart);

  const createBooking = useMutation({
    mutationFn: async () => {
      if (!user || !student) throw new Error("You need to be signed in.");
      if (!selectedSlot) throw new Error("Choose an available time slot.");
      const priced = quote.data;
      if (!priced) throw new Error("We couldn't price this lesson. Please try again.");

      const { error } = await supabase.from("bookings").insert({
        student_id: student.id,
        tutor_id: tutorId,
        booked_by: user.id,
        subject_id: subjectId ?? null,
        education_level_id: student.education_level_id ?? null,
        starts_at: selectedSlot.starts_at,
        ends_at: selectedSlot.ends_at,
        duration_minutes: priced.duration_minutes,
        booking_timezone: timezone,
        hourly_rate: priced.hourly_rate,
        currency: priced.currency,
        total_amount: priced.total_amount,
        commission_rule_id: priced.commission_rule_id ?? null,
        cancellation_policy_id: priced.cancellation_policy_id ?? null,
        student_notes: notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["tutor-slots"] });
      toast.success("Class requested! 🎉 Pay now to confirm it — find it under Awaiting Payment.");
      navigate({ to: "/student/history" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const canSubmit = Boolean(student?.id && selectedSlot && quote.data) && !createBooking.isPending;

  // Defense in depth: a student without booking rights shouldn't reach this
  // screen (the find-tutor page only links here when can_book_lessons is
  // true), but guard the route itself in case of a direct link or a
  // permission change that hasn't refetched yet.
  if (!studentLoading && student && !student.can_book_lessons) {
    return (
      <StudentShell title="🔒 Booking not available">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card py-16 text-center">
          <Lock className="size-12 text-muted-foreground" />
          <p className="text-xl font-extrabold text-foreground">
            Ask your parent to book this class
          </p>
          <p className="text-sm text-muted-foreground">
            Your account isn't set up to book lessons directly yet. A parent can turn this on for
            you, or book {tutorInfo?.full_name ?? "this tutor"} for you.
          </p>
          <Button asChild className="min-h-11 rounded-xl font-bold">
            <Link to="/student/find-tutor">Back to Find a Tutor</Link>
          </Button>
        </div>
      </StudentShell>
    );
  }

  return (
    <StudentShell
      title={tutorInfo ? `🎓 Book ${tutorInfo.full_name}` : "🎓 Book a class"}
      description="Times are shown in your timezone. Pick a time that works for you!"
      actions={
        <Button asChild variant="outline" className="min-h-10 rounded-xl font-bold">
          <Link to="/tutors/$tutorId" params={{ tutorId }}>
            View full profile
          </Link>
        </Button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          {uniqueSubjects.length > 0 && (
            <BookSection icon="📖" title="What subject?">
              <div className="flex flex-wrap gap-2">
                {uniqueSubjects.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSubjectId(item.id)}
                    className={cn(
                      "focus-ring min-h-11 rounded-full border-2 px-4 text-sm font-bold transition-all",
                      subjectId === item.id
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </BookSection>
          )}

          <BookSection icon="⏱️" title="How long?">
            {durations.isLoading ? (
              <div className="h-11 w-40 animate-pulse rounded-xl bg-muted" />
            ) : durationOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lesson lengths configured yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {durationOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setDuration(option);
                      setSlotStart(undefined);
                    }}
                    className={cn(
                      "focus-ring min-h-11 rounded-full border-2 px-4 text-sm font-bold transition-all",
                      effectiveDuration === option
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {option} min
                  </button>
                ))}
              </div>
            )}
          </BookSection>

          <BookSection icon="📅" title="Pick a time" subtitle={`Your timezone · ${timezone}`}>
            {slots.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : slots.isError ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <p className="text-sm font-semibold text-muted-foreground">
                  Couldn't load availability.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-9 rounded-xl"
                  onClick={() => void slots.refetch()}
                >
                  Try again
                </Button>
              </div>
            ) : grouped.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Clock className="size-8 text-muted-foreground" />
                <p className="text-sm font-semibold text-muted-foreground">
                  No open times for this lesson length. Try a different duration.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {grouped.map(([day, daySlots]) => (
                  <div key={day}>
                    <p className="mb-2 text-sm font-bold text-foreground">{day}</p>
                    <div className="flex flex-wrap gap-2">
                      {(daySlots ?? []).map((slot) => {
                        const active = slot.starts_at === slotStart;
                        return (
                          <button
                            key={slot.starts_at}
                            type="button"
                            onClick={() => setSlotStart(slot.starts_at)}
                            aria-pressed={active}
                            className={cn(
                              "focus-ring min-h-11 rounded-xl border-2 px-3 text-sm font-bold transition-all",
                              active
                                ? "border-accent bg-accent text-white shadow-sm"
                                : "border-border bg-card hover:border-accent/40",
                            )}
                          >
                            {formatTimeInZone(slot.starts_at, timezone)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BookSection>

          <BookSection icon="✏️" title="Anything to share?" subtitle="Optional">
            <Textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. I want extra help with fractions."
              className="rounded-xl resize-none"
            />
          </BookSection>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              {tutorInfo?.avatar_url ? (
                <img
                  src={tutorInfo.avatar_url}
                  alt={tutorInfo.full_name ?? "Tutor"}
                  className="size-12 rounded-2xl object-cover"
                />
              ) : (
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-extrabold text-primary">
                  {(tutorInfo?.full_name ?? "T").charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-foreground">
                  {tutorInfo?.full_name ?? "Tutor"}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="size-3 text-secondary" /> Verified tutor
                </p>
              </div>
            </div>

            <dl className="space-y-2 border-t border-border pt-3 text-sm">
              <Row
                label="Lesson length"
                value={effectiveDuration ? `${effectiveDuration} min` : "—"}
              />
              <Row
                label="Start"
                value={
                  selectedSlot
                    ? `${formatDayInZone(selectedSlot.starts_at, timezone)}, ${formatTimeInZone(selectedSlot.starts_at, timezone)}`
                    : "Not selected"
                }
              />
              {quote.data ? (
                <Row
                  label="Lesson price"
                  value={formatMoney(quote.data.lesson_amount, quote.data.currency)}
                />
              ) : null}
            </dl>

            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <span className="text-sm font-bold">Total</span>
              <span className="text-xl font-extrabold text-primary-deep">
                {quote.data
                  ? formatMoney(quote.data.total_amount, quote.data.currency)
                  : quote.isLoading
                    ? "…"
                    : "—"}
              </span>
            </div>

            <Button
              className="min-h-12 w-full rounded-xl bg-accent font-bold text-white hover:bg-accent/90"
              disabled={!canSubmit}
              onClick={() => createBooking.mutate()}
            >
              {createBooking.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Request this class
            </Button>

            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" /> Pricing is set by DiaLearn and
              applied automatically.
            </p>
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0" /> You'll pay on the next screen — the
              class is confirmed once payment clears and your tutor accepts.
            </p>
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Globe2 className="mt-0.5 size-3.5 shrink-0" /> Booked in {timezone}.
            </p>
            {selectedSlot ? (
              <Badge
                variant="secondary"
                className="w-full justify-center rounded-full text-xs font-bold"
              >
                <CalendarDays className="size-3.5" /> Slot held while you review
              </Badge>
            ) : null}
          </div>
        </aside>
      </div>
    </StudentShell>
  );
}

function BookSection({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-foreground">
          <span aria-hidden>{icon}</span> {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-bold text-foreground">{value}</dd>
    </div>
  );
}
