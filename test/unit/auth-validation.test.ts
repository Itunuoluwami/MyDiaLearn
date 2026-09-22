import { describe, expect, it } from "vitest";

import {
  ACCEPT_INVITE_SCHEMA,
  CHANGE_PASSWORD_SCHEMA,
  INVITE_OTP_SCHEMA,
  PASSWORD_RULES,
  RESET_PASSWORD_SCHEMA,
  SIGNIN_SCHEMA,
  emailSchema,
  nameSchema,
  normalizePhoneDigits,
  passwordSchema,
  passwordStrength,
} from "@/lib/auth-validation";

/**
 * These schemas are the only real input validation in the application — every
 * other form submits straight to a Postgres function. When the NestJS backend
 * lands, these become the auth DTOs, so this file is the contract the port has
 * to reproduce exactly. A silent relaxation here weakens password policy for
 * the whole platform.
 */

describe("emailSchema", () => {
  it("lowercases and trims, so identity is case-insensitive", () => {
    expect(emailSchema.parse("  Ada@Example.COM  ")).toBe("ada@example.com");
  });

  it.each([
    "ada@example.com",
    "ada.lovelace@sub.example.co.uk",
    "ada+tutor@example.com",
    "a!#$%&'*+/=?^_`{|}~-@example.com",
  ])("accepts %s", (value) => {
    expect(() => emailSchema.parse(value)).not.toThrow();
  });

  it.each([
    "",
    "ada",
    "ada@",
    "@example.com",
    "ada@example",
    "ada @example.com",
    "ada@ex ample.com",
  ])("rejects %s", (value) => {
    expect(() => emailSchema.parse(value)).toThrow();
  });

  it("rejects an address longer than 254 characters", () => {
    expect(() => emailSchema.parse(`${"a".repeat(250)}@example.com`)).toThrow();
  });
});

describe("nameSchema", () => {
  const first = nameSchema("first");

  it("trims surrounding whitespace", () => {
    expect(first.parse("  Ada  ")).toBe("Ada");
  });

  it("requires at least 2 characters", () => {
    expect(() => first.parse("A")).toThrow();
    expect(() => first.parse("Ad")).not.toThrow();
  });

  it("rejects names over 50 characters", () => {
    expect(() => first.parse("a".repeat(51))).toThrow();
  });

  it("names the field in its message, so the form can point at the right input", () => {
    const last = nameSchema("last");
    expect(() => last.parse("")).toThrow(/last name/);
    expect(() => first.parse("")).toThrow(/first name/);
  });
});

describe("passwordSchema", () => {
  const valid = "Abcdefg1!";

  it("accepts a password meeting every rule", () => {
    expect(() => passwordSchema.parse(valid)).not.toThrow();
  });

  it.each([
    ["too short", "Ab1!"],
    ["no uppercase", "abcdefg1!"],
    ["no lowercase", "ABCDEFG1!"],
    ["no number", "Abcdefgh!"],
    ["no special character", "Abcdefg12"],
  ])("rejects a password with %s", (_label, value) => {
    expect(() => passwordSchema.parse(value)).toThrow();
  });

  it("caps length at 72, the bcrypt input limit", () => {
    expect(() => passwordSchema.parse(`Aa1!${"x".repeat(68)}`)).not.toThrow();
    expect(() => passwordSchema.parse(`Aa1!${"x".repeat(69)}`)).toThrow();
  });

  it("agrees with PASSWORD_RULES, which drives the on-screen checklist", () => {
    // The checklist and the schema are separate implementations of one policy.
    // If they drift, the form shows all ticks green and still refuses to submit.
    expect(PASSWORD_RULES.every((rule) => rule.test(valid))).toBe(true);
    for (const rule of PASSWORD_RULES) {
      expect(typeof rule.label).toBe("string");
    }
  });
});

describe("passwordStrength", () => {
  it.each([
    ["", 0, "Weak"],
    ["ab", 1, "Weak"],
    ["abA", 1, "Weak"],
    ["abA1", 2, "Fair"],
    ["Abcdefg1", 3, "Strong"],
    ["Abcdefg1!", 3, "Strong"],
    ["Abcdefghijk1!", 4, "Very strong"],
  ])("scores %s as %i (%s)", (value, score, label) => {
    expect(passwordStrength(value)).toEqual({ score, label });
  });

  it("reserves the top score for 12+ characters that pass every rule", () => {
    // 11 characters, all five rules satisfied — still not "Very strong".
    expect(passwordStrength("Abcdefghi1!").label).toBe("Strong");
    expect(passwordStrength("Abcdefghij1!").label).toBe("Very strong");
  });
});

describe("normalizePhoneDigits", () => {
  it.each([
    ["0803 123 4567", "8031234567"],
    ["(080) 312-3456", "803123456"],
    ["080.312.3456", "803123456"],
    ["00441234567", "441234567"],
  ])("normalises %s to %s", (input, expected) => {
    expect(normalizePhoneDigits(input)).toBe(expected);
  });

  it("strips leading zeros so a local number can take a country code", () => {
    expect(normalizePhoneDigits("0000123")).toBe("123");
  });
});

describe("INVITE_OTP_SCHEMA", () => {
  it("uppercases and strips spaces and dashes from the emailed code", () => {
    expect(INVITE_OTP_SCHEMA.parse("a1b2-c3d4 e5")).toBe("A1B2C3D4E5");
  });

  it("requires exactly 10 hex characters", () => {
    expect(() => INVITE_OTP_SCHEMA.parse("A1B2C3D4E")).toThrow();
    expect(() => INVITE_OTP_SCHEMA.parse("A1B2C3D4E5F")).toThrow();
    expect(() => INVITE_OTP_SCHEMA.parse("G1B2C3D4E5")).toThrow();
  });

  it("rejects an empty code with a message naming the invitation email", () => {
    expect(() => INVITE_OTP_SCHEMA.parse("")).toThrow(/invitation email/);
  });
});

describe("password confirmation", () => {
  const password = "Abcdefg1!";

  it.each([
    ["RESET_PASSWORD_SCHEMA", RESET_PASSWORD_SCHEMA],
    ["CHANGE_PASSWORD_SCHEMA", CHANGE_PASSWORD_SCHEMA],
  ])("%s rejects a mismatched confirmation", (_name, schema) => {
    expect(() => schema.parse({ password, confirmPassword: "Different1!" })).toThrow(
      /do not match/,
    );
    expect(() => schema.parse({ password, confirmPassword: password })).not.toThrow();
  });

  it("reports the mismatch against confirmPassword, not password", () => {
    const result = RESET_PASSWORD_SCHEMA.safeParse({
      password,
      confirmPassword: "Different1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("ACCEPT_INVITE_SCHEMA enforces the OTP and the confirmation together", () => {
    expect(() =>
      ACCEPT_INVITE_SCHEMA.parse({ otp: "a1b2c3d4e5", password, confirmPassword: password }),
    ).not.toThrow();
    expect(() =>
      ACCEPT_INVITE_SCHEMA.parse({ otp: "nothex1234", password, confirmPassword: password }),
    ).toThrow();
  });
});

describe("SIGNIN_SCHEMA", () => {
  it("normalises the email but accepts any non-empty password", () => {
    // Sign-in must not apply the creation-time password policy: an account made
    // before a policy change still has to be able to log in.
    expect(SIGNIN_SCHEMA.parse({ email: "  Ada@Example.com ", password: "x" })).toEqual({
      email: "ada@example.com",
      password: "x",
    });
  });

  it("rejects an empty password", () => {
    expect(() => SIGNIN_SCHEMA.parse({ email: "ada@example.com", password: "" })).toThrow();
  });
});
