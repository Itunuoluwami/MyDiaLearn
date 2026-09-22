import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import type { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { PASSWORD_RULES, RESET_PASSWORD_SCHEMA, passwordStrength } from "@/lib/auth-validation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { cn } from "@/lib/utils";

type ResetPasswordValues = z.input<typeof RESET_PASSWORD_SCHEMA>;

export function ResetPasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(RESET_PASSWORD_SCHEMA) as never,
    mode: "onBlur",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = watch("password");
  const strength = passwordStrength(password ?? "");

  async function onSubmit(values: ResetPasswordValues) {
    setFormError(null);
    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      const raw = (error.message || "").toLowerCase();
      if (raw.includes("same") || raw.includes("different from the old")) {
        setFormError("Please choose a password different from your current one.");
      } else if (raw.includes("network") || raw.includes("fetch")) {
        setFormError("Something went wrong. Please check your connection and try again.");
      } else if (raw.includes("session") || raw.includes("token") || raw.includes("expired")) {
        setFormError("This reset link has expired. Please request a new one.");
      } else {
        setFormError("We couldn't update your password right now. Please try again.");
      }
      return;
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
          <span>{formError}</span>
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="reset-password">New password</Label>
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          disabled={isSubmitting}
          aria-invalid={!!errors.password}
          aria-describedby="reset-password-requirements"
          className={cn("transition-colors duration-200", errors.password && "border-destructive")}
          {...register("password")}
        />

        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5" aria-hidden="true">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  strength.score >= step
                    ? strength.score >= 4
                      ? "bg-success"
                      : strength.score === 3
                        ? "bg-primary"
                        : "bg-secondary"
                    : "bg-muted",
                )}
              />
            ))}
          </div>
          <span className="w-20 text-right text-xs text-muted-foreground" aria-live="polite">
            {password ? strength.label : ""}
          </span>
        </div>

        <ul id="reset-password-requirements" className="grid gap-1 sm:grid-cols-2">
          {PASSWORD_RULES.map((rule) => {
            const met = rule.test(password ?? "");
            return (
              <li
                key={rule.key}
                className={cn(
                  "flex items-center gap-1.5 text-xs transition-colors duration-200",
                  met ? "text-success" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full border transition-colors duration-200",
                    met ? "border-success bg-success/10" : "border-border",
                  )}
                  aria-hidden="true"
                >
                  {met ? <Check className="size-3" /> : null}
                </span>
                <span>
                  {rule.label}
                  <span className="sr-only">{met ? " — met" : " — not met yet"}</span>
                </span>
              </li>
            );
          })}
        </ul>
        {errors.password ? (
          <p role="alert" className="flex items-start gap-1.5 text-xs text-destructive">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{errors.password.message}</span>
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reset-confirm-password">Confirm new password</Label>
        <PasswordInput
          id="reset-confirm-password"
          autoComplete="new-password"
          disabled={isSubmitting}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? "reset-confirm-password-error" : undefined}
          className={cn(
            "transition-colors duration-200",
            errors.confirmPassword && "border-destructive",
          )}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p
            id="reset-confirm-password-error"
            role="alert"
            className="flex items-start gap-1.5 text-xs text-destructive"
          >
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{errors.confirmPassword.message}</span>
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="cta"
        className="min-h-12 w-full text-base"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Updating password...
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}
