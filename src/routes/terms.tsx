import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/public/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of service — DiaLearn" },
      {
        name: "description",
        content:
          "The terms families and tutors agree to when they use DiaLearn: accounts, booking, payment, commission, cancellations and conduct.",
      },
      { property: "og:title", content: "Terms of service — DiaLearn" },
      {
        property: "og:description",
        content: "The terms families and tutors agree to when they use DiaLearn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Terms of service"
      intro="DiaLearn is a marketplace. These terms cover what we do, what tutors and families agree to, and how money is handled."
      settingsKey="content.terms_sections"
      updated="13 November 2026"
    />
  ),
});
