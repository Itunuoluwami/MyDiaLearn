import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";
import type { z } from "zod";

import { authClient } from "@/lib/auth";
import { SIGNIN_SCHEMA } from "@/lib/auth-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { cn } from "@/lib/utils";

type SignInValues = z.input<typeof SIGNIN_SCHEMA>;

export function SignInForm({
  onSuccess,
  onSwitchToSignUp,
}: {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(SIGNIN_SCHEMA) as never,
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInValues) {
    setFormError(null);
    const { error } = await authClient.signInWithPassword({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });

    if (error) {
      const raw = (error.message || "").toLowerCase();
      if (raw.includes("invalid login")) {
        setFormError("That email and password combination doesn't match an account.");
      } else if (raw.includes("confirm")) {
        setFormError("Please verify your email address before signing in.");
      } else if (raw.includes("network") || raw.includes("fetch")) {
        setFormError("Something went wrong. Please check your connection and try again.");
      } else {
        setFormError("We couldn't sign you in right now. Please try again.");
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

      <div className="space-y-1.5">
        <Label htmlFor="signin-email">Email address</Label>
        <Input
          id="signin-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "signin-email-error" : undefined}
          className={cn(
            "h-11 transition-colors duration-200",
            errors.email && "border-destructive",
          )}
          {...register("email")}
        />
        {errors.email ? (
          <p
            id="signin-email-error"
            role="alert"
            className="flex items-start gap-1.5 text-xs text-destructive"
          >
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{errors.email.message}</span>
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="signin-password">Password</Label>
          <Link
            to="/auth/forgot-password"
            className="text-xs font-medium text-primary underline underline-offset-2"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="signin-password"
          autoComplete="current-password"
          disabled={isSubmitting}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "signin-password-error" : undefined}
          className={cn("transition-colors duration-200", errors.password && "border-destructive")}
          {...register("password")}
        />
        {errors.password ? (
          <p
            id="signin-password-error"
            role="alert"
            className="flex items-start gap-1.5 text-xs text-destructive"
          >
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{errors.password.message}</span>
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
            Signing you in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New to DiaLearn?{" "}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-semibold text-primary underline"
        >
          Create an account
        </button>
      </p>
    </form>
  );
}
