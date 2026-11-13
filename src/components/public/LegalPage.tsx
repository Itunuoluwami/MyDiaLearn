import { Link } from "@tanstack/react-router";
import { AlertTriangle, Mail } from "lucide-react";

import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { settingList, usePublicSettings } from "@/lib/public-data";

export interface LegalSection {
  heading: string;
  body: string;
}

/**
 * Terms and Privacy, rendered from admin-editable settings.
 *
 * The wording of a legal page belongs to whoever is accountable for it, not
 * to a React file — so both pages read their sections from
 * `platform_settings`, the same way the homepage copy and the notification
 * templates do. Changing a clause is an edit in admin settings, not a deploy.
 *
 * While `content.legal_reviewed` is false the page says plainly that the text
 * is a draft. Legal copy that nobody qualified has approved should never be
 * presented as though it has been.
 */
export function LegalPage({
  title,
  intro,
  settingsKey,
  updated,
}: {
  title: string;
  intro: string;
  settingsKey: "content.terms_sections" | "content.privacy_sections";
  updated: string;
}) {
  const settings = usePublicSettings();
  const sections = settingList<LegalSection>(settings.data, settingsKey);
  const reviewed = settings.data?.["content.legal_reviewed"] === true;

  return (
    <PublicShell>
      <section className="border-b border-border bg-surface/60">
        <div className="container-site py-12 md:py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-deep">Legal</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{intro}</p>
          <p className="mt-4 text-xs text-muted-foreground">Last updated {updated}</p>
        </div>
      </section>

      <section className="container-site py-12 md:py-16">
        <div className="max-w-3xl">
          {!reviewed ? (
            <div className="mb-8 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">Draft, pending legal review</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This page describes how DiaLearn works today and has not yet been approved by a
                  qualified adviser. Nothing here limits any right you have under the law that
                  applies to you.
                </p>
              </div>
            </div>
          ) : null}

          {settings.isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : sections.length === 0 ? (
            <p className="text-muted-foreground">
              This page has not been published yet. Please{" "}
              <Link to="/contact" className="font-semibold text-primary-deep underline">
                contact us
              </Link>{" "}
              if you need these terms before then.
            </p>
          ) : (
            <div className="space-y-8">
              {sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="text-lg font-extrabold">{section.heading}</h2>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{section.body}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 rounded-2xl border border-border bg-surface/60 p-5">
            <h2 className="text-base font-semibold">Questions about this page?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Write to us and mark your message for the attention of the data protection contact.
            </p>
            <Button asChild variant="outline" className="mt-4 min-h-11">
              <Link to="/contact">
                <Mail className="size-4" /> Contact us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
