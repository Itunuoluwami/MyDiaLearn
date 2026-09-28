import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { adminBeforeLoad } from "@/lib/admin-guard";
import { clearAdminContextCache } from "@/lib/admin-guard";
import { useChangeOwnPassword, friendlyAdminError } from "@/lib/admin-governance";
import { useApiData } from "@/lib/api/data-client";
import { CHANGE_PASSWORD_SCHEMA, PASSWORD_RULES, passwordStrength } from "@/lib/auth-validation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/security")({
  // The one admin route reachable while must_change_password is set — every
  // other one redirects here, so this must not redirect to itself.
  beforeLoad: adminBeforeLoad({ allowPasswordChangePending: true }),
  head: () => ({
    meta: [
      { title: "Security — DiaLearn admin" },
      { name: "description", content: "Change the password on your DiaLearn admin account." },
    ],
  }),
  component: AdminSecurityPage,
});

const STRENGTH_TONE = [
  "bg-destructive",
  "bg-destructive",
  "bg-warning",
  "bg-secondary",
  "bg-success",
];

function AdminSecurityPage() {
  const { profile, mustChangePassword, refresh, loading } = useAuth();
  const navigate = useNavigate();
  const changePassword = useChangeOwnPassword();

  // Under the API a password change needs the current one (see useChangeOwnPassword).
  const needsCurrent = useApiData();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = passwordStrength(password);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});

    const parsed = CHANGE_PASSWORD_SCHEMA.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    if (needsCurrent && !currentPassword) {
      setErrors({ currentPassword: "Enter your current password." });
      return;
    }

    const input = needsCurrent
      ? { password, currentPassword, email: profile?.email ?? "" }
      : password;
    changePassword.mutate(input, {
      onSuccess: async () => {
        setCurrentPassword("");
        setPassword("");
        setConfirmPassword("");
        clearAdminContextCache();
        await refresh();
        toast.success("Password updated");
        if (mustChangePassword) void navigate({ to: "/admin/dashboard", replace: true });
      },
      onError: (error) => {
        const raw = String((error as Error)?.message ?? "").toLowerCase();
        if (raw.includes("current password is incorrect")) {
          setErrors({ currentPassword: "Your current password is incorrect." });
          return;
        }
        if (raw.includes("same") || raw.includes("different from the old")) {
          setErrors({ password: "Please choose a password different from your current one." });
          return;
        }
        toast.error(friendlyAdminError(error));
      },
    });
  }

  if (loading) {
    return (
      <AdminShell title="Security">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Security" description="The password on your own DiaLearn admin account.">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,32rem)_1fr]">
        <div className="space-y-5">
          {mustChangePassword ? (
            <div className="card-warm flex items-start gap-3 p-4 md:p-5">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" />
              <div>
                <h2 className="text-base font-semibold">Choose your own password</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your account was set up with a one-time password from your invitation. Replace it
                  now — the rest of the admin portal opens up as soon as you do.
                </p>
              </div>
            </div>
          ) : null}

          <section className="panel-portal p-4 md:p-6">
            <h2 className="text-base font-semibold">Change password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed in as {profile?.email ?? "this account"}.
            </p>

            <form className="mt-5 space-y-5" onSubmit={handleSubmit} noValidate>
              {needsCurrent ? (
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <PasswordInput
                    id="current-password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    aria-invalid={Boolean(errors["currentPassword"])}
                    aria-describedby={
                      errors["currentPassword"] ? "current-password-error" : undefined
                    }
                    className={cn(errors["currentPassword"] && "border-destructive")}
                  />
                  {errors["currentPassword"] ? (
                    <p
                      id="current-password-error"
                      role="alert"
                      className="text-xs text-destructive"
                    >
                      {errors["currentPassword"]}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(errors["password"])}
                  aria-describedby={errors["password"] ? "new-password-error" : undefined}
                  className={cn(errors["password"] && "border-destructive")}
                />
                {errors["password"] ? (
                  <p id="new-password-error" role="alert" className="text-xs text-destructive">
                    {errors["password"]}
                  </p>
                ) : null}

                {password ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-200",
                            STRENGTH_TONE[strength.score] ?? "bg-muted",
                          )}
                          style={{ width: `${Math.max(strength.score, 1) * 25}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {strength.label}
                      </span>
                    </div>
                    <ul className="grid gap-1.5 sm:grid-cols-2">
                      {PASSWORD_RULES.map((rule) => {
                        const met = rule.test(password);
                        return (
                          <li
                            key={rule.key}
                            className={cn(
                              "flex items-center gap-1.5 text-xs",
                              met ? "text-success" : "text-muted-foreground",
                            )}
                          >
                            <Check className={cn("size-3.5 shrink-0", !met && "opacity-30")} />
                            {rule.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <PasswordInput
                  id="confirm-password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  aria-invalid={Boolean(errors["confirmPassword"])}
                  aria-describedby={
                    errors["confirmPassword"] ? "confirm-password-error" : undefined
                  }
                  className={cn(errors["confirmPassword"] && "border-destructive")}
                />
                {errors["confirmPassword"] ? (
                  <p id="confirm-password-error" role="alert" className="text-xs text-destructive">
                    {errors["confirmPassword"]}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="min-h-11 w-full sm:w-auto"
                disabled={changePassword.isPending}
              >
                {changePassword.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <KeyRound className="size-4" />
                )}
                {changePassword.isPending ? "Updating…" : "Update password"}
              </Button>
            </form>
          </section>
        </div>

        <aside className="panel-portal h-fit p-4 md:p-6">
          <h2 className="text-base font-semibold">Why this matters</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Admin accounts can move money, change what other people can see, and grant access to the
            platform. Every one of those actions is recorded against your name in the audit log, so
            the password on this account should be yours alone and used nowhere else.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            A password issued in an invitation has been seen by at least two people and one email
            inbox. That is why it only works once.
          </p>
        </aside>
      </div>
    </AdminShell>
  );
}
