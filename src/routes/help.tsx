import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, LifeBuoy, Mail, Users, Wallet } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCancellationPolicies } from "@/lib/public-data";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help centre — DiaLearn" },
      {
        name: "description",
        content:
          "Answers for families, learners and tutors: booking, payments, cancellations, live classes, verification and payouts.",
      },
      { property: "og:title", content: "Help centre — DiaLearn" },
      {
        property: "og:description",
        content: "Answers for families, learners and tutors on DiaLearn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});

/**
 * Every answer here describes what the product actually does today.
 *
 * The cancellation window is the one thing not written in: it is an admin
 * setting, so it is read from the same `cancellation_policies` the refund
 * engine uses rather than repeated here, where it would drift the first time
 * someone changed it.
 */
const SECTIONS = [
  {
    icon: Users,
    title: "For parents",
    faqs: [
      {
        q: "How do I add my child?",
        a: "Open My Children from your dashboard and add them. You choose for each child whether they can sign in themselves, book their own lessons and message tutors — you can change any of those later.",
      },
      {
        q: "Do I have to pay before the lesson is confirmed?",
        a: "Yes. A lesson is only confirmed once payment has cleared and the tutor has accepted it. Until both have happened it stays pending, and you will see it as awaiting payment or awaiting the tutor.",
      },
      {
        q: "Can I see what my child is doing?",
        a: "Yes. Bookings, payments, messages and per-subject progress are all on your dashboard, and lesson feedback from the tutor appears there once a lesson is reviewed.",
      },
      {
        q: "How do I pay?",
        a: "Payment is taken per lesson when you book. DiaLearn never stores your card details — payment is handled by the payment provider.",
      },
    ],
  },
  {
    icon: GraduationCap,
    title: "For learners",
    faqs: [
      {
        q: "How do I join my class?",
        a: "Open My Classes and choose the lesson. The classroom opens with your lesson timer, chat, whiteboard and controls for your camera and microphone. You can open it before your tutor starts and check how you look.",
      },
      {
        q: "Where is my homework?",
        a: "Under Assignments. Work your tutor has set appears there, and once you submit it you will see it under 'With your tutor' until they send feedback back.",
      },
      {
        q: "Can I message my tutor?",
        a: "Yes, if your parent has enabled messaging on your account. Conversations stay inside DiaLearn so there is always a record.",
      },
    ],
  },
  {
    icon: Wallet,
    title: "Payments and refunds",
    faqs: [
      {
        q: "What am I charged?",
        a: "The lesson price is the tutor's hourly rate for the length you book, plus the payment processing fee shown before you confirm. Nothing is added afterwards.",
      },
      {
        q: "What happens if a lesson is cancelled?",
        a: "Refunds follow the cancellation policy on the booking, which depends on how far ahead you cancel. The current windows are listed below.",
      },
      {
        q: "What if my tutor does not turn up?",
        a: "Report it from the lesson. Our team reviews tutor no-shows and arranges a refund or a credit.",
      },
    ],
  },
  {
    icon: GraduationCap,
    title: "For tutors",
    faqs: [
      {
        q: "Why am I not showing in search?",
        a: "You appear in search once DiaLearn has verified you and your profile is listed. Complete your profile, add a subject and your availability, upload the required documents and submit for review.",
      },
      {
        q: "Who sets my hourly rate?",
        a: "DiaLearn sets it as part of verification. You will see it on your profile once it has been set, and it is used for every quote from then on.",
      },
      {
        q: "When am I paid?",
        a: "Earnings build up as lessons are delivered. You can request a payout once your available balance reaches the minimum, and payouts follow the published schedule shown on your earnings page.",
      },
      {
        q: "What does DiaLearn take?",
        a: "A commission on each lesson, plus the payment processing fee. Both are shown line by line on your earnings page for every lesson.",
      },
    ],
  },
] as const;

function HelpPage() {
  const policies = useCancellationPolicies();

  return (
    <PublicShell>
      <section className="border-b border-border bg-surface/60">
        <div className="container-site py-12 md:py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-deep">
            Help centre
          </p>
          <h1 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">
            How can we help?
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Answers to what families, learners and tutors ask most. If yours is not here, our team
            will reply.
          </p>
          <Button asChild variant="cta" className="mt-6 min-h-11">
            <Link to="/contact">
              <Mail className="size-4" /> Contact us
            </Link>
          </Button>
        </div>
      </section>

      <section className="container-site py-12 md:py-16">
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                  <section.icon className="size-5" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-extrabold">{section.title}</h2>
              </div>
              <Accordion type="single" collapsible className="mt-4">
                {section.faqs.map((faq) => (
                  <AccordionItem key={faq.q} value={faq.q}>
                    <AccordionTrigger className="text-left text-sm font-semibold">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface/60">
        <div className="container-site py-12 md:py-16">
          <h2 className="text-lg font-extrabold">Cancellation windows</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            These are the policies the refund engine applies, read live from DiaLearn's own
            settings.
          </p>
          {policies.isLoading ? (
            <div className="mt-5 space-y-2">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          ) : (
            <ul className="mt-5 space-y-2">
              {(policies.data ?? []).map((policy) => (
                <li
                  key={policy.name}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <span className="font-semibold">{policy.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {policy.hours_before > 0
                      ? `Cancel more than ${policy.hours_before} hours ahead`
                      : "Cancel inside the notice window"}{" "}
                    · {Number(policy.refund_percentage)}% refunded
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="container-site pb-16">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 px-5 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
            <LifeBuoy className="size-6" aria-hidden="true" />
          </span>
          <h2 className="text-base font-semibold">Still stuck?</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tell us what happened and which lesson it relates to, and we will come back to you.
          </p>
          <Button asChild variant="cta" className="mt-2 min-h-11">
            <Link to="/contact">Contact support</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
