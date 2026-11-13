import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Search } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurriculumFacets, useSubjectFacets } from "@/lib/public-data";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects taught on DiaLearn" },
      {
        name: "description",
        content:
          "Every subject DiaLearn tutors teach, from core school subjects to African languages, with the curricula they follow.",
      },
      { property: "og:title", content: "Subjects taught on DiaLearn" },
      {
        property: "og:description",
        content: "Browse every subject and curriculum available on DiaLearn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const subjects = useSubjectFacets();
  const curricula = useCurriculumFacets();

  // Grouped by the category the catalogue itself assigns, so adding a subject
  // in admin settings puts it on this page without a code change.
  const groups = useMemo(() => {
    const byCategory = new Map<string, typeof rows>();
    const rows = subjects.data ?? [];
    for (const subject of rows) {
      const key = subject.category || "Other";
      byCategory.set(key, [...(byCategory.get(key) ?? []), subject]);
    }
    return [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [subjects.data]);

  const taught = (subjects.data ?? []).filter((subject) => subject.tutor_count > 0).length;

  return (
    <PublicShell>
      <section className="border-b border-border bg-surface/60">
        <div className="container-site py-12 md:py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-deep">Subjects</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">
            What our tutors teach
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Every subject below is taught by verified DiaLearn tutors against the curriculum your
            child already follows at school.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="cta" className="min-h-11">
              <Link to="/tutors">
                <Search className="size-4" /> Browse tutors
              </Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link to="/how-it-works">How booking works</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-site py-12 md:py-16">
        {subjects.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="text-muted-foreground">No subjects are published yet.</p>
        ) : (
          <div className="space-y-10">
            {groups.map(([category, rows]) => (
              <div key={category}>
                <h2 className="text-lg font-extrabold">{category}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rows.map((subject) => (
                    <Link
                      key={subject.id}
                      to="/tutors"
                      search={{ subject: subject.id }}
                      className="focus-ring group flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                        <BookOpen className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-extrabold text-foreground">{subject.name}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {subject.tutor_count === 0
                            ? "Tutors joining soon"
                            : subject.tutor_count === 1
                              ? "1 tutor available"
                              : `${subject.tutor_count} tutors available`}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border bg-surface/60">
        <div className="container-site py-12 md:py-16">
          <h2 className="text-lg font-extrabold">Curricula we follow</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Tutors teach to the syllabus your child is examined on, so lessons reinforce school
            rather than running alongside it.
          </p>
          {curricula.isLoading ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-32 rounded-full" />
              ))}
            </div>
          ) : (
            <ul className="mt-5 flex flex-wrap gap-2">
              {(curricula.data ?? []).map((curriculum) => (
                <li
                  key={curriculum.id}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold"
                >
                  {curriculum.name}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-8 text-sm text-muted-foreground">
            {taught === 0
              ? "Tutors are being verified now."
              : `${taught} of these subjects already have a verified tutor ready to teach.`}
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
