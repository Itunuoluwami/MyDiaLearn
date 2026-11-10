import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Clock, LineChart, Star } from "lucide-react";

import { ParentShell } from "@/components/parent/ParentShell";
import { ChildSwitcher } from "@/components/parent/ChildSwitcher";
import {
  CardSkeletonList,
  EmptyPanel,
  KpiCard,
  KpiSkeletonGrid,
  LoadError,
  SectionCard,
} from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useChildProgress, useChildren, type ChildProgressRow } from "@/lib/parent-data";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Learning progress — DiaLearn parent portal" },
      {
        name: "description",
        content:
          "How each child is doing by subject: lessons completed, attendance and the ratings their tutors gave.",
      },
      { property: "og:title", content: "Learning progress — DiaLearn parent portal" },
      {
        property: "og:description",
        content: "How each child is doing, subject by subject.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgressPage,
});

/** Attendance as a percentage, or null when there is nothing to divide by. */
function attendanceRate(row: ChildProgressRow): number | null {
  const seen = row.attended_count + row.missed_count;
  if (seen === 0) return null;
  return Math.round((row.attended_count / seen) * 100);
}

function hours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const whole = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${whole}h` : `${whole}h ${rest}m`;
}

function ProgressPage() {
  const children = useChildren();
  const kids = useMemo(() => children.data ?? [], [children.data]);
  const [childId, setChildId] = useState<string | null>(null);

  // One child at a time: the stored procedure reports per learner, and
  // averaging across children would say nothing useful about either.
  const selectedId = childId ?? kids[0]?.id;
  const progress = useChildProgress(selectedId);
  const rows = progress.data ?? [];

  const totals = useMemo(() => {
    const completed = rows.reduce((sum, row) => sum + row.completed_lessons, 0);
    const minutes = rows.reduce((sum, row) => sum + row.learning_minutes, 0);
    const attended = rows.reduce((sum, row) => sum + row.attended_count, 0);
    const missed = rows.reduce((sum, row) => sum + row.missed_count, 0);
    // Only subjects that actually carry a rating count towards the average.
    const rated = rows.map((row) => Number(row.avg_rating)).filter((value) => value > 0);
    return {
      completed,
      minutes,
      attendance:
        attended + missed === 0 ? null : Math.round((attended / (attended + missed)) * 100),
      rating: rated.length === 0 ? null : rated.reduce((a, b) => a + b, 0) / rated.length,
    };
  }, [rows]);

  const selectedChild = kids.find((child) => child.id === selectedId);

  return (
    <ParentShell
      title="Learning progress"
      description="Lessons, attendance and tutor ratings for each subject your child studies."
    >
      {kids.length === 0 && !children.isLoading ? (
        <SectionCard title="Progress">
          <EmptyPanel
            icon={LineChart}
            title="No children yet"
            body="Add a learner to your family account and their progress will build up here as they take lessons."
            action={
              <Button asChild variant="cta" className="min-h-11">
                <Link to="/children">Add a child</Link>
              </Button>
            }
          />
        </SectionCard>
      ) : (
        <>
          {kids.length > 1 ? (
            <ChildSwitcher
              children={kids}
              selectedId={selectedId ?? null}
              onSelect={setChildId}
              allowAll={false}
              className="mb-5"
            />
          ) : null}

          {progress.isLoading ? (
            <KpiSkeletonGrid count={4} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Lessons completed" value={String(totals.completed)} icon={BookOpen} />
              <KpiCard label="Time learning" value={hours(totals.minutes)} icon={Clock} />
              <KpiCard
                label="Attendance"
                value={totals.attendance === null ? "—" : `${totals.attendance}%`}
                icon={LineChart}
              />
              <KpiCard
                label="Average rating"
                value={totals.rating === null ? "—" : totals.rating.toFixed(1)}
                hint={totals.rating === null ? "No ratings yet" : "Given by tutors"}
                icon={Star}
              />
            </div>
          )}

          <SectionCard
            title="By subject"
            description={
              selectedChild
                ? `How ${selectedChild.first_name} is doing in each subject they study.`
                : "How your child is doing in each subject."
            }
          >
            {progress.isLoading ? (
              <CardSkeletonList rows={2} height="h-20" />
            ) : progress.isError ? (
              <LoadError
                message="We couldn't load this child's progress right now."
                onRetry={() => void progress.refetch()}
              />
            ) : rows.length === 0 ? (
              <EmptyPanel
                icon={BookOpen}
                title="Nothing to report yet"
                body="Progress appears here once your child has had their first lesson."
                action={
                  <Button asChild variant="cta" className="min-h-11">
                    <Link to="/find-tutor">Find a tutor</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-4">
                {rows.map((row) => {
                  const rate = attendanceRate(row);
                  const rating = Number(row.avg_rating);
                  return (
                    <li
                      key={row.subject_id}
                      className="rounded-2xl border border-border bg-card p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-extrabold text-foreground">{row.subject_name}</p>
                        {rating > 0 ? (
                          <span className="inline-flex items-center gap-1 text-sm font-semibold">
                            <Star className="size-4 text-warning" aria-hidden="true" />
                            {rating.toFixed(1)}
                          </span>
                        ) : null}
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                        <div>
                          <dt className="text-xs text-muted-foreground">Completed</dt>
                          <dd className="font-semibold tabular-nums">{row.completed_lessons}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Scheduled</dt>
                          <dd className="font-semibold tabular-nums">{row.scheduled_lessons}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Time learning</dt>
                          <dd className="font-semibold tabular-nums">
                            {hours(row.learning_minutes)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Missed</dt>
                          <dd className="font-semibold tabular-nums">{row.missed_count}</dd>
                        </div>
                      </dl>

                      {rate !== null ? (
                        <div className="mt-4">
                          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Attendance</span>
                            <span className="font-semibold tabular-nums">{rate}%</span>
                          </div>
                          <Progress value={rate} className="h-2" />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </>
      )}
    </ParentShell>
  );
}
