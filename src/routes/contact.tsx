import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact DiaLearn" },
      {
        name: "description",
        content:
          "Contact the DiaLearn team about finding a tutor, joining as a tutor or agency, or reporting a concern.",
      },
      { property: "og:title", content: "Contact DiaLearn" },
      {
        property: "og:description",
        content: "Questions about tutoring, joining as a tutor or agency, or a concern to report?",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const TOPICS = [
  "Finding a tutor",
  "Becoming a tutor",
  "Tutor agency enquiry",
  "Payments and refunds",
  "Report a concern",
  "Something else",
];

const SUPPORT_EMAIL = "hello@dialearn.com";

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]!);
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const subject = encodeURIComponent(`${topic} — ${name || "DiaLearn enquiry"}`);
    const body = encodeURIComponent(`${message}\n\n—\n${name}\n${email}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    toast.success("Opening your email app to send this message");
  }

  return (
    <PublicShell>
      <section className="band-hero border-b border-border">
        <div className="container-site py-10 md:py-14">
          <p className="eyebrow">Contact</p>
          <h1 className="display-hero mt-3 max-w-2xl">We read every message.</h1>
          <p className="lead mt-4 max-w-2xl">
            Tell us what you need and the right person at {BRAND.company} will reply.
          </p>
        </div>
      </section>

      <section className="container-site section-y grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form onSubmit={handleSubmit} className="card-warm space-y-4 p-5 md:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Your name</Label>
              <Input
                id="contact-name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="min-h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>What is this about?</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              required
              rows={6}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>

          <Button type="submit" variant="cta" size="lg" className="w-full sm:w-auto">
            Send message
          </Button>
        </form>

        <aside className="space-y-4">
          <div className="panel-portal p-5">
            <Mail className="size-5 text-primary" />
            <h2 className="mt-3 text-base font-semibold">Email us directly</h2>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-1 block text-sm text-primary underline-offset-4 hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
          <div className="panel-portal p-5">
            <MessageSquare className="size-5 text-primary" />
            <h2 className="mt-3 text-base font-semibold">Response times</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Most enquiries are answered within one business day. Safety reports are prioritised.
            </p>
          </div>
        </aside>
      </section>
    </PublicShell>
  );
}
