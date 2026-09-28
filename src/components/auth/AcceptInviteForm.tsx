import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import type { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { governanceRpc } from "@/integrations/supabase/governance-types";
import { friendlyAdminError, redeemInvitationViaApi } from "@/lib/admin-governance";
import { apiPost, useApiData } from "@/lib/api/data-client";
import { authClient } from "@/lib/auth";
import { ACCEPT_INVITE_SCHEMA, PASSWORD_RULES, passwordStrength } from "@/lib/auth-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { cn } from "@/lib/utils";

type AcceptInviteValues = z.input<typeof ACCEPT_INVITE_SCHEMA>;

const STRENGTH_TONE = [
  "bg-destructive",
  "bg-destructive",
  "bg-warning",
  "bg-secondary",
  "bg-success",
];

/**
 * Redeems an admin invitation: prove the emailed one-time password, then
 * replace it with a password of your own.
 *
 * Order matters here. The OTP is checked first, by admin_invite_redeem(), which
 * is what actually grants the role — so a wrong code costs nothing and changes
 * nothing. Only once that succeeds do we set the password, and only then do we
 * clear the forced-change flag the redeem set.
 *
 * Under the API the invitee is already signed in with a password they chose at
 * sign-up, so there is no generated password to replace — but the redeem still
 * sets the forced-change flag, and the API only changes a password given the
 * current one. So the form also asks for that, changes it, and signs back in
 * (a password change ends every session); the API clears the flag itself.
 */
export function AcceptInviteForm({ email, onSuccess }: { email: string; onSuccess: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const viaApi = useApiData();
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentError, setCurrentError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteValues>({
    resolver: zodResolver(ACCEPT_INVITE_SCHEMA) as never,
    mode: "onBlur",
    defaultValues: { otp: "", password: "", confirmPassword: "" },
  });

  const password = watch("password");
  const strength = passwordStrength(password ?? "");

  async function onSubmit(values: AcceptInviteValues) {
    setFormError(null);

    const otp = String(values.otp ?? "")
      .replace(/[\s-]/g, "")
      .toUpperCase();

    if (viaApi && !currentPassword) {
      setCurrentError("Enter the password you signed in with.");
      return;
    }
    setCurrentError(null);

    try {
      if (viaApi) await redeemInvitationViaApi(email, otp);
      else await governanceRpc<string>("admin_invite_redeem", { p_email: email, p_otp: otp });
    } catch (error) {
      const raw = String((error as { message?: string })?.message ?? "").toUpperCase();
      if (raw.includes("INVALID_OTP")) {
        setError("otp", {
          type: "server",
          message: "That code isn't right. Check the one in your invitation email.",
        });
        return;
      }
      setFormError(friendlyAdminError(error));
      return;
    }

    if (viaApi) {
      try {
        await apiPost("/auth/password/change", {
          currentPassword,
          newPassword: values.password,
        });
      } catch (error) {
        const raw = String((error as { message?: string })?.message ?? "").toLowerCase();
        setFormError(
          raw.includes("current password is incorrect")
            ? "Your admin access is set up, but the current password was wrong so the new one wasn't saved. Set it from Security."
            : "Your admin access is set up, but we couldn't save that password. Set one from Security after signing in.",
        );
        return;
      }
      const { error } = await authClient.signInWithPassword({ email, password: values.password });
      if (error) {
        setFormError("Your password was changed. Please sign in again with the new one.");
        return;
      }
      onSuccess();
      return;
    }

    const { error: passwordError } = await supabase.auth.updateUser({ password: values.password });
    if (passwordError) {
      // The role is granted at this point, so this is recoverable: they can
      // finish setting a password from Security once inside.
      setFormError(
        "Your admin access is set up, but we couldn't save that password. Try again, or set one from Security after signing in.",
      );
      return;
    }

    try {
      await governanceRpc<void>("clear_must_change_password");
    } catch {
      // Non-fatal: the guard will simply route them to Security to try again.
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {formError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          {formError}
        </p>
      ) : null}

      {viaApi ? (
        <div className="space-y-2">
          <Label htmlFor="invite-current-password">Current password</Label>
          <PasswordInput
            id="invite-current-password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            aria-invalid={Boolean(currentError)}
            aria-describedby={currentError ? "invite-current-password-error" : undefined}
            className={cn("h-11", currentError && "border-destructive")}
          />
          {currentError ? (
            <p id="invite-current-password-error" role="alert" className="text-xs text-destructive">
              {currentError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="invite-otp">One-time password</Label>
        <Input
          id="invite-otp"
          autoComplete="one-time-code"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="From your invitation email"
          className={cn("h-11 font-mono tracking-[0.18em]", errors.otp && "border-destructive")}
          aria-invalid={Boolean(errors.otp)}
          aria-describedby={errors.otp ? "invite-otp-error" : undefined}
          {...register("otp")}
        />
        {errors.otp ? (
          <p id="invite-otp-error" role="alert" className="text-xs text-destructive">
            {errors.otp.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-password">Choose a password</Label>
        <PasswordInput
          id="invite-password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "invite-password-error" : undefined}
          className={cn(errors.password && "border-destructive")}
          {...register("password")}
        />
        {errors.password ? (
          <p id="invite-password-error" role="alert" className="text-xs text-destructive">
            {errors.password.message}
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
              <span className="text-xs font-medium text-muted-foreground">{strength.label}</span>
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
                    <Check
                      className={cn("size-3.5 shrink-0", !met && "opacity-30")}
                      aria-hidden="true"
                    />
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-confirm">Confirm password</Label>
        <PasswordInput
          id="invite-confirm"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? "invite-confirm-error" : undefined}
          className={cn(errors.confirmPassword && "border-destructive")}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p id="invite-confirm-error" role="alert" className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" variant="cta" className="min-h-12 w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {isSubmitting ? "Setting up your access…" : "Accept invitation"}
      </Button>
    </form>
  );
}
