import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import type { z } from "zod";

import { authClient } from "@/lib/auth";
import { FORGOT_PASSWORD_SCHEMA } from "@/lib/auth-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ForgotPasswordValues = z.input<typeof FORGOT_PASSWORD_SCHEMA>;

export function ForgotPasswordForm({ onSubmitted }: { onSubmitted: (email: string) => void }) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(FORGOT_PASSWORD_SCHEMA) as never,
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setFormError(null);
    const email = values.email.trim().toLowerCase();

    const { error } = await authClient.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      const raw = (error.message || "").toLowerCase();
      if (raw.includes("network") || raw.includes("fetch")) {
        setFormError("Something went wrong. Please check your connection and try again.");
        return;
      }
      // Supabase intentionally doesn't reveal whether an email is registered
      // for most errors here — fall through to the same success state so we
      // don't leak account existence, unless it's a hard rate-limit.
      if (raw.includes("rate limit") || raw.includes("too many")) {
        setFormError("Too many requests. Please wait a moment and try again.");
        return;
      }
    }

    onSubmitted(email);
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

      <div className="space-y-1.5">
        <Label htmlFor="forgot-email">Email address</Label>
        <Input
          id="forgot-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "forgot-email-error" : undefined}
          className={cn(
            "h-11 transition-colors duration-200",
            errors.email && "border-destructive",
          )}
          {...register("email")}
        />
        {errors.email ? (
          <p
            id="forgot-email-error"
            role="alert"
            className="flex items-start gap-1.5 text-xs text-destructive"
          >
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{errors.email.message}</span>
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
            Sending reset link...
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
}
