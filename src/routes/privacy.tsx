import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/public/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy notice — DiaLearn" },
      {
        name: "description",
        content:
          "What DiaLearn holds about families, learners and tutors, why, who it is shared with, and what you can ask us to do with it.",
      },
      { property: "og:title", content: "Privacy notice — DiaLearn" },
      {
        property: "og:description",
        content: "What DiaLearn holds about you, and what you can ask us to do with it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Privacy notice"
      intro="DiaLearn teaches children, so we collect as little as we can and are explicit about the rest."
      settingsKey="content.privacy_sections"
      updated="13 November 2026"
    />
  ),
});
