import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, CalendarCheck, Star, TrendingUp, Users } from "lucide-react";

import { TutorShell } from "@/components/tutor/TutorShell";
import { CardSkeletonList, KpiCard, KpiSkeletonGrid, SectionCard } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/parent-data";
import { useTutorBookings, useTutorSummary } from "@/lib/tutor-data";
import { useEarningsSummary, useRatingCategories, useRatingSummary } from "@/lib/tutor-workspace";

export const Route = createFileRoute("/_authenticated/tutor/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — DiaLearn tutor" },
      {
        name: "description",
        content:
          "How your teaching is going: lessons delivered, attendance, cancellations, earnings and what families rate you on.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

function AnalyticsPage() {
  const summary = useTutorSummary();
  const bookings = useTutorBookings();
  const earnings = useEarningsSummary();
  const ratings = useRatingSummary();
  const categories = useRatingCategories();

  /**
   * Counted from the tutor's own bookings rather than a separate report, so
   * these figures can never disagree with the classes list on the next page.
   */
  const stats = useMemo(() => {
    const rows = bookings.data ?? [];
    const settled = rows.filter((row) =>
      ["completed", "cancelled", "no_show"].includes(row.status),
    );
    const completed = rows.filter((row) => row.status === "completed").length;
    const cancelled = rows.filter((row) => row.status === "cancelled").length;
    const noShow = rows.filter((row) => row.status === "no_show").length;
    const minutes = rows
      .filter((row) => row.status === "completed")
      .reduce((sum, row) => sum + row.duration_minutes, 0);
    return {
      total: rows.length,
      completed,
      cancelled,
      noShow,
      settled: settled.length,
      hoursTaught: Math.round((minutes / 60) * 10) / 10,
      completionRate: percent(completed, settled.length),
      cancellationRate: percent(cancelled, settled.length),
    };
  }, [bookings.data]);

  const rating = ratings.data;
  const distribution = rating
    ? ([
        ["5", rating.five_star],
        ["4", rating.four_star],
        ["3", rating.three_star],
        ["2", rating.two_star],
        ["1", rating.one_star],
      ] as const)
    : [];
  const ratingTotal = rating?.rating_count ?? 0;

  const loading = summary.isLoading || bookings.isLoading;

  return (
    <TutorShell
      title="Analytics"
      description="How your teaching is going, from your own lessons and reviews."
      actions={
        <Button asChild variant="outline" className="min-h-11 sm:min-h-10">
          <Link to="/tutor/earnings">Open earnings</Link>
        </Button>
      }
    >
      {loading ? (
        <KpiSkeletonGrid count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Lessons delivered"
            value={String(stats.completed)}
            hint={`${stats.hoursTaught} hours taught`}
            icon={CalendarCheck}
          />
          <KpiCard
            label="Active students"
            value={String(summary.data?.active_students ?? 0)}
            icon={Users}
          />
          <KpiCard
            label="Net earned"
            value={formatMoney(
              earnings.data?.net_earnings ?? 0,
              earnings.data?.currency ?? summary.data?.currency ?? "USD",
            )}
            hint="After commission and fees"
            icon={TrendingUp}
          />
          <KpiCard
            label="Average rating"
            value={ratingTotal === 0 ? "—" : Number(rating?.rating_avg ?? 0).toFixed(1)}
            hint={
              ratingTotal === 0
                ? "No reviews yet"
                : ratingTotal === 1
                  ? "From 1 review"
                  : `From ${ratingTotal} reviews`
            }
            icon={Star}
          />
        </div>
      )}

      <SectionCard
        title="Reliability"
        description="Counted across every lesson that has reached an outcome — completed, cancelled or a no-show."
      >
        {loading ? (
          <CardSkeletonList rows={2} height="h-12" />
        ) : stats.settled === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing to measure yet. These fill in once your first lessons finish.
          </p>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-semibold">Completion rate</span>
                <span className="tabular-nums text-muted-foreground">
                  {stats.completionRate}% · {stats.completed} of {stats.settled}
                </span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-semibold">Cancellation rate</span>
                <span className="tabular-nums text-muted-foreground">
                  {stats.cancellationRate}% · {stats.cancelled} cancelled
                </span>
              </div>
              <Progress value={stats.cancellationRate} className="h-2" />
            </div>
            {stats.noShow > 0 ? (
              <p className="text-sm text-muted-foreground">
                {stats.noShow === 1 ? "1 no-show" : `${stats.noShow} no-shows`} recorded.
              </p>
            ) : null}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="What families rate you on"
        description="Scores families give per category after a lesson."
      >
        {categories.isLoading ? (
          <CardSkeletonList rows={3} height="h-10" />
        ) : (categories.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No category scores yet — they appear once families start reviewing your lessons.
          </p>
        ) : (
          <ul className="space-y-4">
            {(categories.data ?? []).map((category) => (
              <li key={category.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold">{category.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {Number(category.average_score).toFixed(1)} / 5
                  </span>
                </div>
                <Progress value={(Number(category.average_score) / 5) * 100} className="h-2" />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Rating spread" description="How your reviews are distributed.">
        {ratings.isLoading ? (
          <CardSkeletonList rows={3} height="h-8" />
        ) : ratingTotal === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
              <BarChart3 className="size-6" aria-hidden="true" />
            </span>
            <p className="text-sm text-muted-foreground">
              Reviews appear here once families have rated your completed lessons.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {distribution.map(([stars, count]) => (
              <li key={stars} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-sm font-semibold tabular-nums">{stars} ★</span>
                <Progress value={percent(count, ratingTotal)} className="h-2 flex-1" />
                <span className="w-8 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </TutorShell>
  );
}
