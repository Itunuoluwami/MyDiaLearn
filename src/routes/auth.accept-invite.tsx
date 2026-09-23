import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/hooks/use-auth";
import { clearAdminContextCache } from "@/lib/admin-guard";
import { Button } from "@/components/ui/button";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import { AcceptInviteForm } from "@/components/auth/AcceptInviteForm";

export const Route = createFileRoute("/auth/accept-invite")({
  head: () => ({
    meta: [
      { title: "Accept your DiaLearn admin invitation" },
      {
        name: "description",
        content:
          "Enter your one-time password and choose a password for your DiaLearn admin account.",
      },
    ],
  }),
  component: AcceptInvitePage,
});

type LinkState = "checking" | "ready" | "invalid" | "done";

/** Supabase puts link errors on the hash (implicit flow) or the query (PKCE). */
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

function AcceptInvitePage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [state, setState] = useState<LinkState>("checking");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let active = true;

    if (readLinkError()) {
      setState("invalid");
      return;
    }

    // The invite link carries a token the Supabase client exchanges for a
    // session on load. Same shape as the recovery flow: either the session is
    // already there, or SIGNED_IN lands shortly after.
    authClient.getSession().then(({ data }) => {
      if (!active || !data.session) return;
      setEmail(data.session.user.email ?? "");
      setState("ready");
    });

    const { data: subscription } = authClient.onAuthStateChange((event, session) => {
      if (!active) return;
      if (
        (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY" || event === "USER_UPDATED") &&
        session
      ) {
        setEmail(session.user.email ?? "");
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
    clearAdminContextCache();
    await refresh();
    setState("done");
    toast.success("Welcome to the DiaLearn admin portal");
    void navigate({ to: "/admin/dashboard", replace: true });
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
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(22rem,1fr)_minmax(20rem,1fr)] lg:gap-12">
          <div className="mx-auto w-full max-w-lg">
            <section className="card-elevated p-5 md:p-8">
              {state === "checking" ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
                  <p className="mt-4 text-sm text-muted-foreground">Checking your invitation…</p>
                </div>
              ) : state === "invalid" ? (
                <div className="flex flex-col items-center text-center">
                  <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
                    <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
                  </span>
                  <h1 className="display-section mt-6 text-2xl">
                    This invitation link isn't valid
                  </h1>
                  <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                    It may have expired or already been used. Ask the person who invited you to send
                    a new one.
                  </p>
                  <Button asChild variant="cta" className="mt-8 min-h-12 w-full max-w-sm">
                    <Link to="/auth">Go to sign in</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <p className="eyebrow">{BRAND.tagline}</p>
                  <h1 className="display-section mt-2 text-3xl">Set up your admin access</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {email ? (
                      <>
                        Signing in as <span className="font-medium text-foreground">{email}</span>.
                        Enter the one-time password from your invitation email, then choose a
                        password of your own.
                      </>
                    ) : (
                      "Enter the one-time password from your invitation email, then choose a password of your own."
                    )}
                  </p>
                  <div className="mt-6">
                    <AcceptInviteForm email={email} onSuccess={handleSuccess} />
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
