import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { ClassPreview } from "@/components/public/ClassPreview";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/class-preview")({
  head: () => ({
    meta: [
      { title: "What a DiaLearn class looks like" },
      {
        name: "description",
        content:
          "Watch a sample DiaLearn lesson: live one-to-one video, a shared whiteboard and a recording parents can review afterwards.",
      },
      { property: "og:title", content: "What a DiaLearn class looks like" },
      {
        property: "og:description",
        content: "See a sample DiaLearn lesson before you book — live, one-to-one and recorded.",
      },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClassPreviewPage,
});

const INSIDE_A_LESSON = [
  "A 60-minute default lesson, adjustable to the length your child can focus for.",
  "The tutor sets out the goal for the hour, then works through problems together.",
  "Notes and whiteboard work are shared, so revision is possible afterwards.",
  "Parents receive the session summary, homework and recording link.",
];

function ClassPreviewPage() {
  return (
    <PublicShell>
      <section className="container-site py-10 md:py-16">
        <ClassPreview heading="What a DiaLearn class looks like" />
      </section>

      <section className="border-y border-border bg-surface">
        <div className="container-site section-y grid gap-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Inside the hour</p>
            <h2 className="display-section mt-2">Calm, structured, one-to-one</h2>
            <p className="lead mt-3">
              No large classes and no recorded lectures. Every DiaLearn lesson is a live conversation
              between one tutor and one student.
            </p>
          </div>
          <ul className="card-warm space-y-3 p-5 md:p-6">
            {INSIDE_A_LESSON.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-site section-y text-center">
        <h2 className="display-section">See it with your own tutor</h2>
        <p className="lead mx-auto mt-3 max-w-xl">
          Browse verified tutors and book a single lesson to start.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="cta" size="lg">
            <Link to="/tutors">Find a tutor</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/how-it-works">How it works</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
