import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, Clock, Globe2, Loader2, ShieldCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ParentShell } from "@/components/parent/ParentShell";
import { CardSkeletonList, EmptyPanel, LoadError, SectionCard, VerifiedChip } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  childName,
  formatDayInZone,
  formatMoney,
  formatTimeInZone,
  useAvailableSlots,
  useBookingQuote,
  useChildren,
  useDurationOptions,
  useTutorCard,
  useTutorSubjects,
  useViewerTimezone,
} from "@/lib/parent-data";

type BookSearch = { child?: string };

export const Route = createFileRoute("/_authenticated/book/$tutorId")({
  validateSearch: (search: Record<string, unknown>): BookSearch => {
    const next: BookSearch = {};
    if (typeof search['child'] === "string") next.child = search['child'];
    return next;
  },
  head: () => ({
    meta: [
      { title: "Book a class — DiaLearn parent portal" },
      {
        name: "description",
        content:
          "Pick a child, lesson length and an available time slot in your own timezone, then confirm the price before booking.",
      },
      { property: "og:title", content: "Book a class — DiaLearn parent portal" },
      {
        property: "og:description",
        content: "Timezone-aware booking with transparent, platform-managed pricing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookClassPage,
});

function BookClassPage() {
  const { tutorId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const timezone = useViewerTimezone();

  const children = useChildren();
  const { tutor: tutorInfo } = useTutorCard(tutorId);
  const durations = useDurationOptions();
  const tutorSubjects = useTutorSubjects(tutorId);

  const [childId, setChildId] = useState<string | undefined>(search.child);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [slotStart, setSlotStart] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const durationOptions = durations.data ?? [];
  const effectiveDuration = duration ?? durationOptions[0];

  const slots = useAvailableSlots({
    tutorId,
    durationMinutes: effectiveDuration,
  });
  const quote = useBookingQuote(tutorId, effectiveDuration);

  const uniqueSubjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const row of tutorSubjects.data ?? []) {
      if (row.subject_id) map.set(row.subject_id, { id: row.subject_id, name: row.subjects?.name ?? "Subject" });
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
  const selectedChild = (children.data ?? []).find((child) => child.id === childId);

  const createBooking = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You need to be signed in.");
      if (!childId) throw new Error("Choose which child this class is for.");
      if (!selectedSlot) throw new Error("Choose an available time slot.");
      const priced = quote.data;
      if (!priced) throw new Error("We couldn't price this lesson. Please try again.");

      const { error } = await supabase.from("bookings").insert({
        student_id: childId,
        tutor_id: tutorId,
        booked_by: user.id,
        subject_id: subjectId ?? null,
        education_level_id: selectedChild?.education_level_id ?? null,
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
      await queryClient.invalidateQueries({ queryKey: ["parent-bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["parent-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["tutor-slots"] });
      toast.success("Class requested — the tutor will confirm shortly.");
      navigate({ to: "/bookings" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const canSubmit = Boolean(childId && selectedSlot && quote.data) && !createBooking.isPending;

  return (
    <ParentShell
      title={tutorInfo ? `Book ${tutor.data.full_name}` : "Book a class"}
      description="Times are shown in your local timezone, with the tutor's local time alongside."
      actions={
        <Button asChild variant="outline" className="min-h-11">
          <Link to="/tutors/$tutorId" params={{ tutorId }}>
            View full profile
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <SectionCard title="Who is this class for?">
            {children.isLoading ? (
              <CardSkeletonList rows={1} height="h-12" />
            ) : (children.data ?? []).length === 0 ? (
              <EmptyPanel
                icon={CalendarDays}
                title="No learners yet"
                body="Add a child profile before booking a class."
                action={
                  <Button asChild variant="cta" className="min-h-11">
                    <Link to="/children">Add a child</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="b-child">Child</Label>
                  <Select value={childId ?? ""} onValueChange={setChildId}>
                    <SelectTrigger id="b-child" className="min-h-11">
                      <SelectValue placeholder="Select a child" />
                    </SelectTrigger>
                    <SelectContent>
                      {(children.data ?? []).map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {childName(child)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-subject">Subject</Label>
                  <Select value={subjectId ?? ""} onValueChange={setSubjectId}>
                    <SelectTrigger id="b-subject" className="min-h-11">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSubjects.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Lesson length" description="Durations are configured by the platform.">
            {durations.isLoading ? (
              <CardSkeletonList rows={1} height="h-12" />
            ) : durationOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No lesson durations are configured yet.
              </p>
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
                      "focus-ring min-h-11 rounded-full border px-4 text-sm font-medium transition-all",
                      effectiveDuration === option
                        ? "border-primary bg-primary text-primary-foreground shadow-soft"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option} min
                  </button>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Choose a time"
            description={`Your timezone · ${timezone}${
              tutorInfo?.timezone ? ` · Tutor · ${tutor.data.timezone}` : ""
            }`}
          >
            {slots.isLoading ? (
              <CardSkeletonList rows={3} height="h-14" />
            ) : slots.isError ? (
              <LoadError
                message="We couldn't load availability right now."
                onRetry={() => void slots.refetch()}
              />
            ) : grouped.length === 0 ? (
              <EmptyPanel
                icon={Clock}
                title="No open slots"
                body="This tutor has no free times for the selected lesson length. Try another duration or check back soon."
              />
            ) : (
              <div className="space-y-5">
                {grouped.map(([day, daySlots]) => (
                  <div key={day}>
                    <p className="mb-2 text-sm font-semibold">{day}</p>
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
                              "focus-ring min-h-11 rounded-xl border px-3 text-sm font-medium transition-all",
                              active
                                ? "border-accent bg-accent text-accent-foreground shadow-soft"
                                : "border-border bg-card hover:bg-surface",
                            )}
                          >
                            <span className="block">{formatTimeInZone(slot.starts_at, timezone)}</span>
                            <span className="block text-[0.7rem] font-normal opacity-80">
                              {formatTimeInZone(slot.starts_at, slot.tutor_timezone)} tutor time
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Notes for the tutor" description="Optional — share goals or focus areas.">
            <Textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. She is preparing for end-of-term exams in algebra."
            />
          </SectionCard>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-elevated space-y-4 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-sm font-semibold text-primary-deep">
                {(tutorInfo?.full_name ?? "T").charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {tutorInfo?.full_name ?? "Tutor"}
                </p>
                <VerifiedChip status={tutorInfo?.verification_status} />
              </div>
            </div>

            <dl className="space-y-2 border-t border-border pt-3 text-sm">
              <Row label="Child" value={selectedChild ? childName(selectedChild) : "Not selected"} />
              <Row label="Lesson length" value={effectiveDuration ? `${effectiveDuration} min` : "—"} />
              <Row
                label="Start"
                value={
                  selectedSlot
                    ? `${formatDayInZone(selectedSlot.starts_at, timezone)}, ${formatTimeInZone(
                        selectedSlot.starts_at,
                        timezone,
                      )}`
                    : "Not selected"
                }
              />
              {quote.data ? (
                <>
                  <Row
                    label="Lesson"
                    value={formatMoney(quote.data.lesson_amount, quote.data.currency)}
                  />
                  {Number(quote.data.platform_fee) > 0 ? (
                    <Row
                      label="Platform fee"
                      value={formatMoney(quote.data.platform_fee, quote.data.currency)}
                    />
                  ) : null}
                  {Number(quote.data.processing_fee) > 0 ? (
                    <Row
                      label="Processing fee"
                      value={formatMoney(quote.data.processing_fee, quote.data.currency)}
                    />
                  ) : null}
                </>
              ) : null}
            </dl>

            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-xl font-semibold">
                {quote.data
                  ? formatMoney(quote.data.total_amount, quote.data.currency)
                  : quote.isLoading
                    ? "…"
                    : "—"}
              </span>
            </div>

            <Button
              variant="cta"
              className="min-h-12 w-full"
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
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              Pricing, fees and cancellation terms are set by DiaLearn and applied automatically.
            </p>
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Globe2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              Booked in {timezone}. The tutor sees the class in their own local time.
            </p>
            {selectedSlot ? (
              <Badge variant="secondary" className="w-full justify-center rounded-full">
                Slot held while you review
              </Badge>
            ) : null}
          </div>
        </aside>
      </div>
    </ParentShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
