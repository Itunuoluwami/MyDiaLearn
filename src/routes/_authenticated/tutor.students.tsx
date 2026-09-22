import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, GraduationCap, Users } from "lucide-react";

import { TutorShell } from "@/components/tutor/TutorShell";
import {
  CardSkeletonList,
  EmptyPanel,
  LoadError,
  MetaItem,
  SectionCard,
} from "@/components/parent/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDayInZone, formatTimeInZone } from "@/lib/parent-data";
import { useTutorStudents, useTutorTimezone } from "@/lib/tutor-data";

export const Route = createFileRoute("/_authenticated/tutor/students")({
  head: () => ({
    meta: [
      { title: "My students — DiaLearn tutor" },
      {
        name: "description",
        content:
          "Every learner you teach, with their level, curriculum, subjects, lessons completed and next class.",
      },
      { property: "og:title", content: "My students — DiaLearn tutor" },
      {
        property: "og:description",
        content: "A calm roster of the learners you teach on DiaLearn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorStudentsPage,
});

function TutorStudentsPage() {
  const timezone = useTutorTimezone();
  const students = useTutorStudents();
  const rows = students.data ?? [];

  return (
    <TutorShell
      title="My students"
      description="Only the details a tutor needs: first name, level, subjects and lesson history."
    >
      <div className="max-w-5xl space-y-5">
        {students.isLoading ? (
          <CardSkeletonList rows={3} height="h-28" />
        ) : students.isError ? (
          <LoadError
            message="We couldn't load your students right now."
            onRetry={() => void students.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyPanel
            icon={Users}
            title="No students yet"
            body="Learners appear here as soon as a family books their first lesson with you."
            action={
              <Button asChild variant="cta" className="min-h-11">
                <Link to="/tutor/availability">Set availability</Link>
              </Button>
            }
          />
        ) : (
          <SectionCard title={`${rows.length} ${rows.length === 1 ? "learner" : "learners"}`}>
            <div className="grid gap-3 md:grid-cols-2">
              {rows.map((student) => (
                <article
                  key={student.student_id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:shadow-lift"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="size-11 shrink-0">
                      {student.avatar_url ? (
                        <AvatarImage src={student.avatar_url} alt="" loading="lazy" />
                      ) : null}
                      <AvatarFallback className="bg-primary-soft text-sm font-semibold text-primary-deep">
                        {(student.first_name ?? "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold md:text-base">
                        {student.first_name}
                      </h3>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {[student.education_level_name, student.curriculum_name]
                          .filter(Boolean)
                          .join(" · ") || "Level not set"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                        <MetaItem icon={GraduationCap}>
                          {Number(student.lessons_completed ?? 0)} lessons taught
                        </MetaItem>
                        <MetaItem icon={CalendarDays}>
                          {student.next_class_at
                            ? `Next ${formatDayInZone(student.next_class_at, timezone)}, ${formatTimeInZone(student.next_class_at, timezone)}`
                            : "No class scheduled"}
                        </MetaItem>
                      </div>
                      {(student.subjects ?? []).length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(student.subjects ?? []).slice(0, 4).map((subject) => (
                            <Badge key={subject} variant="secondary" className="text-[0.7rem]">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </TutorShell>
  );
}
