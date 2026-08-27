import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create a DiaLearn account" },
      {
        name: "description",
        content:
          "Sign in to DiaLearn or create a parent, student, tutor or agency account, verified by email code.",
      },
      { property: "og:title", content: "Sign in or create a DiaLearn account" },
      {
        property: "og:description",
        content:
          "Parent, student, tutor and agency accounts for the DiaLearn tutoring marketplace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading, refresh } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  if (!authLoading && session && !pendingEmail) {
    void navigate({ to: "/account", replace: true });
  }

  async function handleVerifyOtp(event: React.FormEvent) {
    event.preventDefault();
    if (!pendingEmail) return;
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: pendingEmail,
      token: otp,
      type: "email",
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.toLowerCase().includes("expired")
          ? "That code has expired. Request a new one."
          : "That code isn't valid. Please check and try again.",
      );
      return;
    }
    setPendingEmail(null);
    setOtp("");
    await refresh();
    toast.success("Email verified — your account is ready");
    void navigate({ to: "/account", replace: true });
  }

  async function handleResend() {
    if (!pendingEmail) return;
    const { error } = await supabase.auth.resend({ type: "signup", email: pendingEmail });
    if (error) {
      toast.error("We couldn't resend the code right now. Please try again shortly.");
      return;
    }
    toast.success("A new code is on its way");
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
            {pendingEmail ? (
              <section className="card-elevated flex flex-col items-center p-5 text-center md:p-8">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft">
                  <MailCheck className="size-7 text-primary" aria-hidden="true" />
                </span>
                <h1 className="display-section mt-6 text-2xl">Verify your email</h1>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Enter the 6-digit code we sent to{" "}
                  <span className="font-medium text-foreground">{pendingEmail}</span>.
                </p>
                <form onSubmit={handleVerifyOtp} className="mt-8 w-full max-w-sm space-y-6">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup className="justify-center gap-2.5">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="h-12 w-12 rounded-xl border border-input text-lg shadow-sm md:h-14 md:w-14"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  <Button
                    type="submit"
                    variant="cta"
                    className="min-h-12 w-full"
                    disabled={busy || otp.length < 6}
                  >
                    {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                    Verify and continue
                  </Button>
                  <div className="flex flex-col items-center gap-3 text-sm">
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Didn’t receive the code?{" "}
                      <span className="font-medium text-primary">Resend</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingEmail(null);
                        setOtp("");
                        setMode("signup");
                      }}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Use a different email
                    </button>
                  </div>
                </form>
              </section>
            ) : (
              <section className="card-elevated p-5 md:p-8">
                <p className="eyebrow">{BRAND.tagline}</p>
                <h1 className="display-section mt-2 text-3xl">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {mode === "signin"
                    ? "Sign in to manage your lessons, bookings and payments."
                    : "One account for parents, students, tutors and agencies."}
                </p>

                <div
                  role="tablist"
                  aria-label="Authentication mode"
                  className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
                >
                  {(["signin", "signup"] as const).map((value) => (
                    <button
                      key={value}
                      role="tab"
                      type="button"
                      aria-selected={mode === value}
                      onClick={() => setMode(value)}
                      className={cn(
                        "min-h-11 rounded-lg text-sm font-semibold transition-all duration-200",
                        mode === value
                          ? "bg-card text-foreground shadow-soft"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {value === "signin" ? "Sign in" : "Create account"}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  {mode === "signin" ? (
                    <SignInForm
                      onSuccess={async () => {
                        await refresh();
                        toast.success("Welcome back");
                        void navigate({ to: "/account", replace: true });
                      }}
                      onSwitchToSignUp={() => setMode("signup")}
                    />
                  ) : (
                    <SignUpForm
                      onVerificationRequired={(email) => {
                        setPendingEmail(email);
                        toast.success("We sent a 6-digit code to your email");
                      }}
                      onSwitchToSignIn={() => setMode("signin")}
                    />
                  )}
                </div>
              </section>
            )}
          </div>

          <AuthSidePanel />
        </div>
      </main>
    </div>
  );
}
