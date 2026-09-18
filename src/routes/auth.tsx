import { useEffect, useState } from "react";
import {
  createFileRoute,
  useNavigate,
  useChildMatches,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, MailCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/hooks/use-auth";
import { portalHome } from "@/lib/portal-home";
import { Button } from "@/components/ui/button";
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
          "Sign in to DiaLearn or create a parent, student, tutor or agency account, verified by email link.",
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
  const { session, loading: authLoading, refresh, roles } = useAuth();

  /**
   * `/auth` is both a page and, because of flat file routing, the parent of
   * `/auth/forgot-password`, `/auth/reset-password` and `/auth/accept-invite`.
   * Without this the parent's own sign-in UI renders at every one of those
   * URLs and the child is never reached.
   */
  const childMatches = useChildMatches();
  const isChildRoute = childMatches.length > 0;

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    // Children own their own page. Accept-invite in particular arrives WITH a
    // session — the invite link establishes one — so redirecting on a session
    // here would bounce the invitee out before they can redeem the code.
    if (isChildRoute) return;
    if (authLoading || !session) return;
    void navigate({ to: portalHome(roles), replace: true });
  }, [isChildRoute, authLoading, session, roles, navigate]);

  async function handleResend() {
    if (!pendingEmail) return;
    const { error } = await supabase.auth.resend({ type: "signup", email: pendingEmail });
    if (error) {
      toast.error("We couldn't resend the email right now. Please try again shortly.");
      return;
    }
    toast.success("A new verification email is on its way");
  }

  if (isChildRoute) return <Outlet />;

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
                <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft">
                  <MailCheck className="size-8 text-primary" aria-hidden="true" />
                </span>
                <h1 className="display-section mt-6 text-2xl">Confirm your email</h1>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  We sent a verification link to{" "}
                  <span className="font-medium text-foreground">{pendingEmail}</span>. Click the
                  link in that email to finish setting up your account.
                </p>
                <div className="mt-8 w-full max-w-sm space-y-6">
                  <Button
                    type="button"
                    variant="cta"
                    className="min-h-12 w-full"
                    onClick={handleResend}
                  >
                    Resend verification email
                  </Button>
                  <div className="flex flex-col items-center gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setPendingEmail(null);
                        setMode("signup");
                      }}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Use a different email
                    </button>
                  </div>
                </div>
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
                      }}
                      onSwitchToSignUp={() => setMode("signup")}
                    />
                  ) : (
                    <SignUpForm
                      onVerificationRequired={(email) => {
                        setPendingEmail(email);
                        toast.success("We sent a verification link to your email");
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
