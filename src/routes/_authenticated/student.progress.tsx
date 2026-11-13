import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Clock, LineChart, Star } from "lucide-react";

import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyProgress, type StudentProgressRow } from "@/lib/student-data";

export const Route = createFileRoute("/_authenticated/student/progress")({
  head: () => ({
    meta: [
      { title: "My Progress — DiaLearn Student Portal" },
      {
        name: "description",
        content: "Lessons completed, time spent learning and how you are doing in each subject.",
      },
    ],
  }),
  component: ProgressPage,
});

/** Attendance as a percentage, or null when nothing has happened yet. */
function attendance(row: StudentProgressRow): number | null {
  const seen = row.attended_count + row.missed_count;
  return seen === 0 ? null : Math.round((row.attended_count / seen) * 100);
}

function hours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const whole = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${whole}h` : `${whole}h ${rest}m`;
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function ProgressPage() {
  const progress = useMyProgress();
  const rows = progress.data ?? [];

  const totals = useMemo(() => {
    const completed = rows.reduce((sum, row) => sum + row.completed_lessons, 0);
    const minutes = rows.reduce((sum, row) => sum + row.learning_minutes, 0);
    const attended = rows.reduce((sum, row) => sum + row.attended_count, 0);
    const missed = rows.reduce((sum, row) => sum + row.missed_count, 0);
    // Only subjects a tutor has actually rated count towards the average.
    const rated = rows.map((row) => Number(row.avg_rating)).filter((value) => value > 0);
    return {
      completed,
      minutes,
      attendance:
        attended + missed === 0 ? null : Math.round((attended / (attended + missed)) * 100),
      rating: rated.length === 0 ? null : rated.reduce((a, b) => a + b, 0) / rated.length,
    };
  }, [rows]);

  return (
    <StudentShell title="📈 My Progress" description="How you are doing, subject by subject.">
      {progress.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={BookOpen} label="Classes done" value={String(totals.completed)} />
            <Stat icon={Clock} label="Time learning" value={hours(totals.minutes)} />
            <Stat
              icon={LineChart}
              label="Attendance"
              value={totals.attendance === null ? "—" : `${totals.attendance}%`}
            />
            <Stat
              icon={Star}
              label="Average rating"
              value={totals.rating === null ? "—" : totals.rating.toFixed(1)}
            />
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
              By subject
            </h2>
            {rows.length === 0 ? (
              <div className="mt-3 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-16 text-center">
                <span className="text-5xl">📚</span>
                <p className="text-lg font-extrabold text-foreground">Nothing to show yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Your progress builds up here after your first lesson.
                </p>
                <Button asChild variant="cta" className="min-h-11 rounded-xl">
                  <Link to="/student/find-tutor">Find a tutor</Link>
                </Button>
              </div>
            ) : (
              <ul className="mt-3 space-y-3">
                {rows.map((row) => {
                  const rate = attendance(row);
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
          </div>
        </>
      )}
    </StudentShell>
  );
}
