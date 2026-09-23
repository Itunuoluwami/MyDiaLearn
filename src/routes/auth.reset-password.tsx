import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new DiaLearn password" },
      { name: "description", content: "Set a new password for your DiaLearn account." },
    ],
  }),
  component: ResetPasswordPage,
});

type LinkState = "checking" | "ready" | "invalid" | "done";

/** Reads Supabase's error params off either the hash (implicit flow) or the query string (PKCE). */
function readLinkError(): string | null {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const description =
    hash.get("error_description") ||
    query.get("error_description") ||
    hash.get("error") ||
    query.get("error");
  return description ? description.replace(/\+/g, " ") : null;
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [state, setState] = useState<LinkState>("checking");

  useEffect(() => {
    let active = true;

    const linkError = readLinkError();
    if (linkError) {
      setState("invalid");
      return;
    }

    // The Supabase client parses the recovery link's token on load and, once
    // it does, either a session already exists or it fires PASSWORD_RECOVERY.
    authClient.getSession().then(({ data }) => {
      if (active && data.session) setState("ready");
    });

    const { data: subscription } = authClient.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setState("ready");
      }
    });

    const timeout = window.setTimeout(() => {
      if (active) setState((current) => (current === "checking" ? "invalid" : current));
    }, 6000);

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, []);

  async function handleSuccess() {
    await refresh();
    toast.success("Your password has been updated");
    setState("done");
    void navigate({ to: "/auth", replace: true });
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
            <section className="card-elevated p-5 md:p-8">
              {state === "checking" ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
                  <p className="mt-4 text-sm text-muted-foreground">Verifying your reset link...</p>
                </div>
              ) : state === "invalid" ? (
                <div className="flex flex-col items-center text-center">
                  <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
                    <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
                  </span>
                  <h1 className="display-section mt-6 text-2xl">This link isn't valid</h1>
                  <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                    Your password reset link may have expired or already been used. Request a new
                    one to continue.
                  </p>
                  <Button asChild variant="cta" className="mt-8 min-h-12 w-full max-w-sm">
                    <Link to="/auth/forgot-password">Request a new link</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <p className="eyebrow">{BRAND.tagline}</p>
                  <h1 className="display-section mt-2 text-3xl">Set a new password</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose a new password for your account.
                  </p>
                  <div className="mt-6">
                    <ResetPasswordForm onSuccess={handleSuccess} />
                  </div>
                </>
              )}
            </section>
          </div>

          <AuthSidePanel />
        </div>
      </main>
    </div>
  );
}
