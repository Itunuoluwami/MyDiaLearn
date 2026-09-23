import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, MailCheck } from "lucide-react";

import { authClient } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your DiaLearn password" },
      {
        name: "description",
        content: "Request a password reset link for your DiaLearn account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleResend() {
    if (!sentTo) return;
    const { error } = await authClient.resetPasswordForEmail(sentTo, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    // Supabase deliberately doesn't reveal whether an address is registered,
    // so we show the same message either way — only a hard rate-limit differs.
    if (error?.message?.toLowerCase().includes("rate limit")) {
      toast.error("Too many requests. Please wait a moment and try again.");
      return;
    }
    toast.success("A new reset link is on its way, if that address has an account");
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-site flex min-h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={BRAND.logoUrl} alt="DiaLearn" className="h-11 w-auto md:h-12" />
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to site
          </Link>
        </div>
      </header>

      <main className="container-site py-6 md:py-12">
        <div className="grid items-start gap-8 lg:h-[36rem] lg:grid-cols-[minmax(22rem,1fr)_minmax(20rem,1fr)] lg:gap-12">
          <div className="mx-auto w-full max-w-lg lg:h-full lg:overflow-y-auto">
            {sentTo ? (
              <section className="card-elevated flex flex-col items-center p-5 text-center md:p-8">
                <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft">
                  <MailCheck className="size-8 text-primary" aria-hidden="true" />
                </span>
                <h1 className="display-section mt-6 text-2xl">Check your email</h1>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  If an account exists for{" "}
                  <span className="font-medium text-foreground">{sentTo}</span>, we've sent a link
                  to reset your password. It'll expire soon, so use it right away.
                </p>
                <div className="mt-8 w-full max-w-sm space-y-6">
                  <Button
                    type="button"
                    variant="cta"
                    className="min-h-12 w-full"
                    onClick={handleResend}
                  >
                    Resend link
                  </Button>
                  <div className="flex flex-col items-center gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => setSentTo(null)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Use a different email
                    </button>
                    <Link
                      to="/auth"
                      className="font-semibold text-primary underline underline-offset-2"
                    >
                      Back to sign in
                    </Link>
                  </div>
                </div>
              </section>
            ) : (
              <section className="card-elevated p-5 md:p-8">
                <p className="eyebrow">{BRAND.tagline}</p>
                <h1 className="display-section mt-2 text-3xl">Forgot your password?</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter the email address on your account and we'll send you a link to reset it.
                </p>

                <div className="mt-6">
                  <ForgotPasswordForm onSubmitted={(email) => setSentTo(email)} />
                </div>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Remembered it after all?{" "}
                  <Link to="/auth" className="font-semibold text-primary underline">
                    Back to sign in
                  </Link>
                </p>
              </section>
            )}
          </div>

          <AuthSidePanel />
        </div>
      </main>
    </div>
  );
}
