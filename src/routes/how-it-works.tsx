import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, CreditCard, LineChart, Search, ShieldCheck, Video } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How DiaLearn works for parents and students" },
      {
        name: "description",
        content:
          "Search verified African tutors, book a lesson in your own timezone, learn live one-to-one, and follow progress from your parent or student portal.",
      },
      { property: "og:title", content: "How DiaLearn works for parents and students" },
      {
        property: "og:description",
        content: "From searching for a tutor to reviewing lesson recordings — how DiaLearn works.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorksPage,
});

const STEPS = [
  {
    icon: Search,
    title: "1. Search with the filters that matter",
    body: "Filter by subject, curriculum, grade, tutor country, language, rating and hourly rate. Every option comes from the subjects, curricula and levels DiaLearn actually supports.",
  },
  {
    icon: CalendarCheck,
    title: "2. Choose a time in your timezone",
    body: "Tutor availability is shown in your local time. Booking rules — how far ahead you can book and how much notice a tutor needs — are set by DiaLearn, so you always see valid slots.",
  },
  {
    icon: CreditCard,
    title: "3. Pay securely, once",
    body: "The lesson price is the tutor's hourly rate multiplied by the length you pick. Funds are held until the lesson has been delivered, then released to the tutor.",
  },
  {
    icon: Video,
    title: "4. Meet live, one-to-one",
    body: "Lessons run in a live video classroom with a shared whiteboard. Nothing to install for most families.",
  },
  {
    icon: LineChart,
    title: "5. Follow progress",
    body: "Parents see every booking, session summary, homework note and recording in the parent portal — even for lessons they did not sit in on.",
  },
];

const FAQ = [
  {
    q: "Can a parent manage more than one child?",
    a: "Yes. A parent account can create a profile for each child, each with its own education level and curriculum, while the parent keeps control of payments and permissions.",
  },
  {
    q: "Can my child book lessons themselves?",
    a: "Only if you allow it. Each child profile has permissions for signing in, booking lessons and messaging tutors, and you can change them at any time.",
  },
  {
    q: "What if we need to cancel?",
    a: "DiaLearn publishes cancellation windows and the refund that applies to each. You can see the current policy on the Trust & safety page before you book.",
  },
  {
    q: "Which timezone are lessons shown in?",
    a: "Yours. Every booking stores the timezone it was made in, so the tutor sees their local time and you see yours.",
  },
];

function HowItWorksPage() {
  return (
    <PublicShell>
      <section className="band-hero border-b border-border">
        <div className="container-site py-10 md:py-16">
          <p className="eyebrow">For parents and students</p>
          <h1 className="display-hero mt-3 max-w-3xl">How DiaLearn works</h1>
          <p className="lead mt-4 max-w-2xl">
            Five steps, no packages and no subscriptions. Start with one lesson and continue only if
            it feels right.
          </p>
        </div>
      </section>

      <section className="container-site section-y">
        <div className="grid gap-4 md:grid-cols-2">
          {STEPS.map((step) => (
            <div key={step.title} className="card-warm p-5 md:p-6">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary-deep">
                <step.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-lg">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
          <div className="card-warm bg-primary-soft/40 p-5 md:p-6">
            <ShieldCheck className="size-6 text-primary" />
            <h2 className="mt-3 text-lg">Every tutor is verified first</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Identity, qualifications and a live teaching check are completed before a tutor appears
              in search.
            </p>
            <Button asChild variant="subtle" className="mt-4">
              <Link to="/trust-and-safety">See our checks</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="container-site section-y">
          <h2 className="display-section">Common questions</h2>
          <Accordion type="single" collapsible className="mt-6 max-w-3xl">
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="container-site section-y text-center">
        <h2 className="display-section">Find a tutor who knows your curriculum</h2>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="cta" size="lg">
            <Link to="/tutors">Find a tutor</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/pricing">How payment works</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
