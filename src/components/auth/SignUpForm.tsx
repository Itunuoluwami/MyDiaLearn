import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  GraduationCap,
  Loader2,
  Users,
  Building2,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { validateSignup } from "@/lib/signup.functions";
import {
  makeSignupSchema,
  normalizePhoneDigits,
  passwordStrength,
  PASSWORD_RULES,
  ROLE_VALUES,
  type CountryOption,
  type SignupValues,
} from "@/lib/auth-validation";
import { settingList, usePublicSettings } from "@/lib/public-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { cn } from "@/lib/utils";

const ROLE_META: Record<string, { label: string; description: string; icon: LucideIcon }> = {
  parent: {
    label: "Parent",
    description: "Manage your children's lessons and payments",
    icon: Users,
  },
  student: { label: "Student", description: "Learn one-to-one with a vetted tutor", icon: BookOpen },
  tutor: { label: "Tutor", description: "Teach students in the diaspora", icon: GraduationCap },
  agency: { label: "Tutoring agency", description: "Manage a roster of tutors", icon: Building2 },
};

const FIELD_ORDER: (keyof SignupValues)[] = [
  "role",
  "firstName",
  "lastName",
  "email",
  "countryCode",
  "phone",
  "password",
  "confirmPassword",
  "acceptTerms",
];

function FieldError({ id, message }: { id: string; message?: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-start gap-1.5 text-xs text-destructive">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

export function SignUpForm({
  onVerificationRequired,
  onSwitchToSignIn,
}: {
  onVerificationRequired: (email: string) => void;
  onSwitchToSignIn: () => void;
}) {
  const { data: settings } = usePublicSettings();
  const runServerValidation = useServerFn(validateSignup);
  const [formError, setFormError] = useState<{ message: string; showSignIn?: boolean } | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const countries = useMemo(
    () => settingList<CountryOption>(settings, "auth.countries"),
    [settings],
  );

  const { data: accountTypes } = useQuery({
    queryKey: ["setting", "auth.account_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "auth.account_types")
        .maybeSingle();
      if (error) throw error;
      return Array.isArray(data?.value) ? (data.value as string[]) : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const roles = accountTypes?.length ? accountTypes : [...ROLE_VALUES];
  const schema = useMemo(() => makeSignupSchema(countries, roles), [countries, roles]);

  const form = useForm<SignupValues>({
    resolver: zodResolver(schema) as never,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      countryCode: "",
      phone: "",
      role: "parent",
      acceptTerms: false,
    },
  });

  const { register, handleSubmit, watch, setValue, setError, formState, setFocus } = form;
  const { errors, isSubmitting, touchedFields, dirtyFields } = formState;

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const role = watch("role");
  const countryCode = watch("countryCode");
  const strength = passwordStrength(password ?? "");
  const selectedCountry = countries.find((item) => item.code === countryCode);

  const showValid = (field: keyof SignupValues) =>
    !errors[field] && (touchedFields[field] || dirtyFields[field]) && !!watch(field);

  async function onSubmit(values: SignupValues) {
    setFormError(null);

    const dialCode = selectedCountry?.dial_code ?? "";
    const check = await runServerValidation({
      data: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        countryCode: values.countryCode,
        phone: values.phone,
        dialCode,
        role: values.role as (typeof ROLE_VALUES)[number],
        acceptTerms: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
      },
    }).catch(() => null);

    if (!check) {
      setFormError({
        message: "Something went wrong. Please check your connection and try again.",
      });
      return;
    }

    if (!check.ok) {
      for (const [field, message] of Object.entries(check.fieldErrors)) {
        if (FIELD_ORDER.includes(field as keyof SignupValues)) {
          setError(field as keyof SignupValues, { type: "server", message });
        }
      }
      const first = FIELD_ORDER.find((field) => field in check.fieldErrors);
      if (first) setFocus(first);
      else setFormError({ message: "We couldn't create your account right now. Please try again." });
      return;
    }

    const { normalized } = check;
    const { error } = await supabase.auth.signUp({
      email: normalized.email,
      password: values.password,
      options: {
        data: {
          full_name: normalized.fullName,
          first_name: normalized.firstName,
          last_name: normalized.lastName,
          phone: normalized.phone,
          country_code: normalized.countryCode,
          role: normalized.role,
          timezone: normalized.timezone,
        },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      const raw = (error.message || "").toLowerCase();
      if (raw.includes("already registered") || raw.includes("already been registered") || raw.includes("exists")) {
        setFormError({
          message: "An account with this email already exists. Try signing in instead.",
          showSignIn: true,
        });
        setFocus("email");
      } else if (raw.includes("password")) {
        setFormError({ message: "Please choose a stronger password." });
        setFocus("password");
      } else if (raw.includes("network") || raw.includes("fetch")) {
        setFormError({
          message: "Something went wrong. Please check your connection and try again.",
        });
      } else {
        setFormError({ message: "We couldn't create your account right now. Please try again." });
      }
      return;
    }

    onVerificationRequired(normalized.email);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {formError ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground"
        >
          <p className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <span>{formError.message}</span>
          </p>
          {formError.showSignIn ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 min-h-11"
              onClick={onSwitchToSignIn}
            >
              Sign in
            </Button>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
      <>
      {/* Step 1 — account type */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Step 1 of 2 — I'm signing up as
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {roles.map((option) => {
            const meta = ROLE_META[option] ?? {
              label: option,
              description: "DiaLearn account",
              icon: Users,
            };
            const Icon = meta.icon;
            const active = role === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setValue("role", option, { shouldValidate: true, shouldTouch: true })
                }
                className={cn(
                  "flex min-h-11 items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200",
                  active
                    ? "border-primary bg-primary-soft/50 shadow-soft"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{meta.label}</span>
                  <span className="block text-xs leading-snug text-muted-foreground">
                    {meta.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <FieldError id="role-error" message={errors.role?.message} />
      </fieldset>

      <Button
        type="button"
        variant="cta"
        className="min-h-12 w-full text-base"
        onClick={async () => {
          const valid = await form.trigger("role");
          if (valid) setStep(2);
        }}
      >
        Continue
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-semibold text-primary underline"
        >
          Sign in
        </button>
      </p>
      </>
      ) : (
      <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          Step 2 of 2 — your details
        </p>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {ROLE_META[role]?.label ?? role}
        </button>
      </div>

      {/* Names */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <div className="relative">
            <Input
              id="firstName"
              autoComplete="given-name"
              disabled={isSubmitting}
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
              className={cn(
                "h-11 transition-colors duration-200",
                errors.firstName && "border-destructive",
                showValid("firstName") && "border-success/60 pr-9",
              )}
              {...register("firstName")}
            />
            {showValid("firstName") ? (
              <Check
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-success"
                aria-hidden="true"
              />
            ) : null}
          </div>
          <FieldError id="firstName-error" message={errors.firstName?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <div className="relative">
            <Input
              id="lastName"
              autoComplete="family-name"
              disabled={isSubmitting}
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              className={cn(
                "h-11 transition-colors duration-200",
                errors.lastName && "border-destructive",
                showValid("lastName") && "border-success/60 pr-9",
              )}
              {...register("lastName")}
            />
            {showValid("lastName") ? (
              <Check
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-success"
                aria-hidden="true"
              />
            ) : null}
          </div>
          <FieldError id="lastName-error" message={errors.lastName?.message} />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-email">Email address</Label>
        <Input
          id="signup-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : "email-hint"}
          className={cn(
            "h-11 transition-colors duration-200",
            errors.email && "border-destructive",
            showValid("email") && "border-success/60",
          )}
          {...register("email")}
        />
        {errors.email ? (
          <FieldError id="email-error" message={errors.email.message} />
        ) : (
          <p id="email-hint" className="text-xs text-muted-foreground">
            We'll send a 6-digit verification code to this address.
          </p>
        )}
      </div>

      {/* Phone with country selector */}
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone number</Label>
        <div className="flex gap-2">
          <select
            aria-label="Country and dialling code"
            disabled={isSubmitting}
            className={cn(
              "h-11 w-[8.5rem] shrink-0 rounded-md border border-input bg-background px-2 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              errors.countryCode && "border-destructive",
            )}
            {...register("countryCode")}
          >
            <option value="">Country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.dial_code}
              </option>
            ))}
          </select>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={selectedCountry ? "8012345678" : "Select a country first"}
            disabled={isSubmitting}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
            className={cn(
              "h-11 flex-1 transition-colors duration-200",
              errors.phone && "border-destructive",
              showValid("phone") && "border-success/60",
            )}
            {...register("phone", {
              onBlur: (event: React.FocusEvent<HTMLInputElement>) =>
                setValue("phone", normalizePhoneDigits(event.target.value), {
                  shouldValidate: true,
                }),
            })}
          />
        </div>
        {errors.phone || errors.countryCode ? (
          <FieldError
            id="phone-error"
            message={errors.countryCode?.message ?? errors.phone?.message}
          />
        ) : (
          <p id="phone-hint" className="text-xs text-muted-foreground">
            {selectedCountry
              ? `Enter your number without the ${selectedCountry.dial_code} code.`
              : "Choose your country, then enter your local number."}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          disabled={isSubmitting}
          aria-invalid={!!errors.password}
          aria-describedby="password-requirements"
          className={cn(
            "transition-colors duration-200",
            errors.password && "border-destructive",
            showValid("password") && "border-success/60",
          )}
          {...register("password")}
        />

        {/* Strength */}
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

        <ul id="password-requirements" className="grid gap-1 sm:grid-cols-2">
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
        <FieldError id="password-error" message={errors.password?.message} />
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          disabled={isSubmitting}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
          className={cn(
            "transition-colors duration-200",
            errors.confirmPassword && "border-destructive",
            !errors.confirmPassword && !!confirmPassword && confirmPassword === password
              ? "border-success/60"
              : undefined,
          )}
          {...register("confirmPassword", {
            onChange: () => {
              if (formState.submitCount > 0 || touchedFields.confirmPassword) {
                void form.trigger("confirmPassword");
              }
            },
          })}
        />
        {errors.confirmPassword ? (
          <FieldError id="confirmPassword-error" message={errors.confirmPassword.message} />
        ) : confirmPassword && confirmPassword === password ? (
          <p className="flex items-center gap-1.5 text-xs text-success">
            <Check className="size-3.5" aria-hidden="true" /> Passwords match
          </p>
        ) : null}
      </div>

      {/* Terms */}
      <div className="space-y-1.5">
        <div className="flex items-start gap-3">
          <Checkbox
            id="acceptTerms"
            checked={watch("acceptTerms")}
            disabled={isSubmitting}
            aria-invalid={!!errors.acceptTerms}
            aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined}
            onCheckedChange={(checked) =>
              setValue("acceptTerms", checked === true, {
                shouldValidate: formState.submitCount > 0,
                shouldTouch: true,
              })
            }
            className="mt-0.5"
          />
          <Label htmlFor="acceptTerms" className="text-sm font-normal leading-relaxed">
            I agree to the{" "}
            <a href="/trust-and-safety" className="font-medium text-primary underline">
              Terms &amp; Conditions
            </a>{" "}
            and{" "}
            <a href="/trust-and-safety" className="font-medium text-primary underline">
              Privacy Policy
            </a>
            .
          </Label>
        </div>
        <FieldError id="acceptTerms-error" message={errors.acceptTerms?.message} />
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
            Creating your account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-semibold text-primary underline"
        >
          Sign in
        </button>
      </p>
      </>
      )}
    </form>
  );
}
