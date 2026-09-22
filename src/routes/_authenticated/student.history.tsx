import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  CreditCard,
  PlayCircle,
  Star,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PayNowButton } from "@/components/shared/PayNowButton";
import { ReportIssueDialog } from "@/components/shared/ReportIssueDialog";
import {
  useStudentBookings,
  useStudentRecord,
  useSubmitReview,
  formatTimeInZone,
} from "@/lib/student-data";
import { isJoinable } from "@/lib/parent-data";
import { cn } from "@/lib/utils";

function isPaid(booking: { payments?: { status: string }[] | null }) {
  return (booking.payments ?? []).some((payment) => payment.status === "paid");
}

export const Route = createFileRoute("/_authenticated/student/history")({
  head: () => ({
    meta: [
      { title: "My Classes & Progress — DiaLearn Student Portal" },
      {
        name: "description",
        content: "View your class history, tutor notes and track your learning progress.",
      },
    ],
  }),
  component: StudentHistoryPage,
});

function StudentHistoryPage() {
  const { data: student } = useStudentRecord();
  const bookings = useStudentBookings();
  const submitReview = useSubmitReview();

  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");

  const tz = student?.timezone || "UTC";

  const upcoming = useMemo(
    () =>
      (bookings.data ?? []).filter(
        (b) => new Date(b.ends_at) > new Date() && ["confirmed", "in_progress"].includes(b.status),
      ),
    [bookings.data],
  );

  // Booked but not yet paid — invisible everywhere else, since it's neither
  // "confirmed" (that only happens once paid + the tutor has accepted) nor
  // "past". Every booking must be paid for before it can confirm, so this is
  // the one place a student sees "you still need to pay for this".
  const awaitingPayment = useMemo(
    () =>
      (bookings.data ?? []).filter(
        (b) => new Date(b.ends_at) > new Date() && b.status === "pending" && !isPaid(b),
      ),
    [bookings.data],
  );

  const past = useMemo(
    () =>
      (bookings.data ?? []).filter(
        (b) => b.status === "completed" || new Date(b.ends_at) < new Date(),
      ),
    [bookings.data],
  );

  const totalMinutes = past.reduce((acc, b) => acc + (b.duration_minutes ?? 0), 0);
  const completedCount = past.filter((b) => b.status === "completed").length;

  async function handleSubmitRating() {
    const booking = (bookings.data ?? []).find((b) => b.id === ratingBookingId);
    if (!booking) return;
    try {
      await submitReview.mutateAsync({
        bookingId: booking.id,
        tutorId: booking.tutor_id,
        score,
        comment: comment.trim() || undefined,
      });
      toast.success("Thanks for your review! ⭐");
      setRatingBookingId(null);
      setComment("");
      setScore(5);
    } catch {
      toast.error("Couldn't submit review. Try again.");
    }
  }

  return (
    <StudentShell
      title="📊 My Classes & Progress"
      description="See your upcoming and past lessons, tutor notes and how far you've come."
    >
      <div className="max-w-3xl space-y-6">
        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatPill icon="🎓" value={completedCount} label="Classes Done" />
          <StatPill icon="⏱️" value={`${Math.round(totalMinutes / 60)}h`} label="Hours Learned" />
          <StatPill icon="🔥" value={upcoming.length} label="Upcoming" />
        </div>

        {/* Awaiting payment */}
        {awaitingPayment.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-foreground">
              <CreditCard className="size-5 text-accent" /> Awaiting Payment
            </h2>
            <div className="space-y-3">
              {awaitingPayment.map((booking) => {
                const tutor = (
                  booking as typeof booking & {
                    tutors?: { profiles?: { full_name?: string } | null } | null;
                  }
                ).tutors;
                const tutorName = tutor?.profiles?.full_name ?? "Your Tutor";
                const subject =
                  (booking as typeof booking & { subjects?: { name: string } | null }).subjects
                    ?.name ?? "Lesson";

                return (
                  <div
                    key={booking.id}
                    className="flex flex-wrap items-center gap-4 rounded-2xl border border-accent/30 bg-accent/5 p-4"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-white text-xl">
                      💳
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-foreground">{subject}</p>
                      <p className="text-sm text-muted-foreground">with {tutorName}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3.5" />
                        {formatTimeInZone(booking.starts_at, tz)} · {booking.duration_minutes} min
                      </p>
                    </div>
                    <PayNowButton
                      bookingId={booking.id}
                      amount={booking.total_amount}
                      currency={booking.currency}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Upcoming Classes */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-foreground">
              <CalendarCheck2 className="size-5 text-primary" /> Upcoming Classes
            </h2>
            <div className="space-y-3">
              {upcoming.map((booking) => {
                const tutor = (
                  booking as typeof booking & {
                    tutors?: { profiles?: { full_name?: string } | null } | null;
                  }
                ).tutors;
                const tutorName = tutor?.profiles?.full_name ?? "Your Tutor";
                const subject =
                  (booking as typeof booking & { subjects?: { name: string } | null }).subjects
                    ?.name ?? "Lesson";
                const joinable = isJoinable(booking);

                return (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white text-xl">
                      📘
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-foreground">{subject}</p>
                      <p className="text-sm text-muted-foreground">with {tutorName}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3.5" />
                        {formatTimeInZone(booking.starts_at, tz)} · {booking.duration_minutes} min
                      </p>
                    </div>
                    {joinable && (
                      <Button
                        asChild
                        size="sm"
                        className="min-h-10 rounded-xl bg-accent font-bold text-white"
                      >
                        <Link to="/student/classroom/$bookingId" params={{ bookingId: booking.id }}>
                          <PlayCircle className="size-4 mr-1" /> Join
                        </Link>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Past Classes */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-foreground">
            <TrendingUp className="size-5 text-secondary-foreground" /> Class History
          </h2>
          {bookings.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : past.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
              <span className="text-5xl">📅</span>
              <p className="font-bold text-foreground">No classes yet</p>
              <p className="text-sm text-muted-foreground">
                Your completed classes will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {past.map((booking) => {
                const tutor = (
                  booking as typeof booking & {
                    tutors?: { profiles?: { full_name?: string } | null } | null;
                  }
                ).tutors;
                const tutorName = tutor?.profiles?.full_name ?? "Your Tutor";
                const subject =
                  (booking as typeof booking & { subjects?: { name: string } | null }).subjects
                    ?.name ?? "Lesson";
                const session = booking.class_sessions?.[0];
                const completed = booking.status === "completed";

                return (
                  <div
                    key={booking.id}
                    className={cn(
                      "rounded-2xl border p-5 transition-shadow hover:shadow-sm",
                      completed ? "border-border bg-card" : "border-muted bg-muted/30",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex size-11 shrink-0 items-center justify-center rounded-2xl text-xl",
                            completed ? "bg-success/10" : "bg-muted",
                          )}
                        >
                          {completed ? "✅" : "📅"}
                        </div>
                        <div>
                          <p className="font-extrabold text-foreground">{subject}</p>
                          <p className="text-sm text-muted-foreground">with {tutorName}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {new Date(booking.starts_at).toLocaleDateString(undefined, {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {" · "}
                            {booking.duration_minutes} min
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "shrink-0 rounded-full text-xs font-bold",
                          completed
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {completed ? "Completed" : booking.status}
                      </Badge>
                    </div>

                    {/* Tutor Notes */}
                    {session?.tutor_notes && (
                      <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 p-3">
                        <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-primary">
                          Tutor's Notes
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {session.tutor_notes}
                        </p>
                      </div>
                    )}

                    {session?.homework && (
                      <div className="mt-2 rounded-xl border border-secondary/20 bg-secondary/8 p-3">
                        <p className="text-xs font-extrabold text-secondary-foreground">
                          📌 Homework: {session.homework}
                        </p>
                      </div>
                    )}

                    {/* Rate Button + Report an issue */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {completed && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="min-h-9 rounded-xl border-secondary/40 font-bold text-secondary-foreground hover:bg-secondary/10"
                          onClick={() => setRatingBookingId(booking.id)}
                        >
                          <Star className="size-4 mr-1 fill-secondary text-secondary" /> Rate this
                          class
                        </Button>
                      )}
                      <ReportIssueDialog
                        bookingId={booking.id}
                        trigger={
                          <Button
                            size="sm"
                            variant="ghost"
                            className="min-h-9 rounded-xl text-muted-foreground"
                          >
                            Report an issue
                          </Button>
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Rating Dialog */}
      <Dialog
        open={Boolean(ratingBookingId)}
        onOpenChange={(open) => !open && setRatingBookingId(null)}
      >
        <DialogContent className="rounded-3xl p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Rate your class ⭐</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div>
              <p className="mb-3 text-sm font-bold text-foreground">How many stars?</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScore(s)}
                    className="focus-ring rounded-full p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "size-9 transition-colors",
                        s <= score ? "fill-secondary text-secondary" : "text-muted fill-muted",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-foreground">Leave a comment (optional)</p>
              <Textarea
                placeholder="Tell us what you liked or what could be better…"
                className="min-h-24 resize-none rounded-xl"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 min-h-12 rounded-xl bg-accent font-bold text-white hover:bg-accent/90"
                onClick={() => void handleSubmitRating()}
                disabled={submitReview.isPending}
              >
                <CheckCircle2 className="size-4 mr-1" />
                {submitReview.isPending ? "Submitting…" : "Submit Review"}
              </Button>
              <Button
                variant="outline"
                className="min-h-12 rounded-xl font-bold"
                onClick={() => setRatingBookingId(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </StudentShell>
  );
}

function StatPill({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-extrabold tabular-nums text-foreground">{value}</p>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
