import { createServerFn } from "@tanstack/react-start";

import { serverSignupSchema, type ServerSignupInput } from "@/lib/auth-validation";

/**
 * Server-side revalidation of the sign-up payload. The client form validates for
 * UX; this is the authoritative check before we call the auth provider.
 * The password is validated but never returned, logged or persisted here.
 */
export const validateSignup = createServerFn({ method: "POST" })
  .inputValidator((input: ServerSignupInput) => input)
  .handler(async ({ data }) => {
    const parsed = serverSignupSchema.safeParse(data);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { ok: false as const, fieldErrors };
    }

    const value = parsed.data;
    return {
      ok: true as const,
      normalized: {
        email: value.email,
        fullName: `${value.firstName} ${value.lastName}`.replace(/\s+/g, " ").trim(),
        firstName: value.firstName,
        lastName: value.lastName,
        phone: `${value.dialCode}${value.phone}`,
        countryCode: value.countryCode,
        role: value.role,
        timezone: value.timezone && value.timezone.length ? value.timezone : "UTC",
      },
    };
  });
