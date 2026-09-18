import { z } from "zod";

/**
 * Shared sign-up validation. Used by the client form AND re-run on the server
 * (see `src/lib/signup.functions.ts`) — client-side validation is UX only,
 * never the security boundary.
 */

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  dial_code: string;
  min_digits: number;
  max_digits: number;
}

const NAME_PATTERN = /^[\p{L}][\p{L}\s'’.-]*$/u;

export function nameSchema(kind: "first" | "last") {
  const label = kind === "first" ? "first name" : "last name";
  return z
    .string()
    .trim()
    .min(1, { message: `Please enter your ${label}.` })
    .min(2, { message: `Your ${label} must be at least 2 characters.` })
    .max(50, { message: `Your ${label} must be 50 characters or fewer.` })
    .refine((value) => NAME_PATTERN.test(value), {
      message: `Please enter a valid ${label}.`,
    });
}

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Please enter your email address." })
  .max(254, { message: "That email address is too long." })
  .refine(
    (value) =>
      /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/.test(
        value,
      ),
    { message: "Please enter a valid email address." },
  )
  .transform((value) => value.toLowerCase());

export const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { key: "upper", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { key: "lower", label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { key: "number", label: "One number", test: (v: string) => /\d/.test(v) },
  {
    key: "special",
    label: "One special character",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
] as const;

export const passwordSchema = z
  .string()
  .min(1, { message: "Please create a password." })
  .max(72, { message: "Passwords can be at most 72 characters." })
  .refine((v) => v.length >= 8, { message: "Password must contain at least 8 characters." })
  .refine((v) => /[A-Z]/.test(v), { message: "Password must include an uppercase letter." })
  .refine((v) => /[a-z]/.test(v), { message: "Password must include a lowercase letter." })
  .refine((v) => /\d/.test(v), { message: "Password must include a number." })
  .refine((v) => /[^A-Za-z0-9]/.test(v), {
    message: "Password must include a special character.",
  });

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Weak" | "Fair" | "Strong" | "Very strong";
};

export function passwordStrength(value: string): PasswordStrength {
  const passed = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
  let score = 0;
  if (value.length > 0) score = Math.min(3, Math.max(1, passed - 1));
  if (passed === PASSWORD_RULES.length && value.length >= 12) score = 4;
  const labels = ["Weak", "Weak", "Fair", "Strong", "Very strong"] as const;
  return {
    score: Math.min(4, score) as PasswordStrength["score"],
    label: labels[Math.min(4, score)]!,
  };
}

/** Strips spaces, dashes, brackets and dots from a typed phone number. */
export function normalizePhoneDigits(value: string) {
  return value.replace(/[\s().-]/g, "").replace(/^0+/, "");
}

export const ROLE_VALUES = ["parent", "student", "tutor", "agency"] as const;
export type SignupRole = (typeof ROLE_VALUES)[number];

export interface SignupValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  countryCode: string;
  phone: string;
  role: string;
  acceptTerms: boolean;
}

/** Country-aware schema: phone length rules come from admin-managed settings. */
export function makeSignupSchema(countries: CountryOption[], roles: string[]) {
  const allowedRoles = roles.length ? roles : [...ROLE_VALUES];

  return z
    .object({
      firstName: nameSchema("first"),
      lastName: nameSchema("last"),
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: z.string().min(1, { message: "Please confirm your password." }),
      countryCode: z.string().min(1, { message: "Please select your country." }),
      phone: z.string().trim().min(1, { message: "Please enter your phone number." }),
      role: z.string().refine((value) => allowedRoles.includes(value), {
        message: "Please choose an account type.",
      }),
      acceptTerms: z.literal(true, {
        errorMap: () => ({
          message: "Please accept the Terms & Conditions to create your account.",
        }),
      }),
    })
    .superRefine((values, ctx) => {
      if (values.confirmPassword !== values.password) {
        ctx.addIssue({
          path: ["confirmPassword"],
          code: z.ZodIssueCode.custom,
          message: "Passwords do not match.",
        });
      }

      const digits = normalizePhoneDigits(values.phone);
      if (/[A-Za-z]/.test(values.phone) || !/^\d+$/.test(digits)) {
        ctx.addIssue({
          path: ["phone"],
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid phone number.",
        });
        return;
      }
      const country = countries.find((item) => item.code === values.countryCode);
      const min = country?.min_digits ?? 6;
      const max = country?.max_digits ?? 15;
      if (digits.length < min || digits.length > max) {
        ctx.addIssue({
          path: ["phone"],
          code: z.ZodIssueCode.custom,
          message: country
            ? `Please enter a valid ${country.name} phone number (${
                min === max ? `${min} digits` : `${min}–${max} digits`
              }).`
            : "Please enter a valid phone number.",
        });
      }
    });
}

/** Server-side schema: independent of client state, deliberately conservative. */
export const serverSignupSchema = z.object({
  firstName: nameSchema("first"),
  lastName: nameSchema("last"),
  email: emailSchema,
  password: passwordSchema,
  countryCode: z.string().trim().min(2).max(2),
  phone: z
    .string()
    .trim()
    .transform(normalizePhoneDigits)
    .refine((value) => /^\d{6,15}$/.test(value), {
      message: "Please enter a valid phone number.",
    }),
  dialCode: z
    .string()
    .trim()
    .regex(/^\+\d{1,4}$/, { message: "Please select your country." }),
  role: z.enum(ROLE_VALUES, { errorMap: () => ({ message: "Please choose an account type." }) }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Please accept the Terms & Conditions to continue." }),
  }),
  timezone: z.string().trim().max(64).optional(),
});

export type ServerSignupInput = z.input<typeof serverSignupSchema>;

export const SIGNIN_SCHEMA = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Please enter your password." }),
});

export const FORGOT_PASSWORD_SCHEMA = z.object({
  email: emailSchema,
});

export const RESET_PASSWORD_SCHEMA = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your new password." }),
  })
  .superRefine((values, ctx) => {
    if (values.confirmPassword !== values.password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
      });
    }
  });

/** The one-time password is 10 hex characters from pgcrypto, shown uppercase. */
export const INVITE_OTP_SCHEMA = z
  .string()
  .trim()
  .min(1, { message: "Please enter the one-time password from your invitation email." })
  .transform((value) => value.replace(/[\s-]/g, "").toUpperCase())
  .refine((value) => /^[0-9A-F]{10}$/.test(value), {
    message: "That code doesn't look right. It's 10 characters from your invitation email.",
  });

/** Accepting an admin invitation: prove the emailed code, then set a password. */
export const ACCEPT_INVITE_SCHEMA = z
  .object({
    otp: INVITE_OTP_SCHEMA,
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your new password." }),
  })
  .superRefine((values, ctx) => {
    if (values.confirmPassword !== values.password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
      });
    }
  });

/** Changing your own password from inside the admin portal. */
export const CHANGE_PASSWORD_SCHEMA = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your new password." }),
  })
  .superRefine((values, ctx) => {
    if (values.confirmPassword !== values.password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
      });
    }
  });
