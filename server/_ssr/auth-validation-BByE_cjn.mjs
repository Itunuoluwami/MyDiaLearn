import { a as ZodIssueCode, i as stringType, n as literalType, r as objectType, t as enumType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-validation-BByE_cjn.js
var NAME_PATTERN = /^[\p{L}][\p{L}\s'’.-]*$/u;
function nameSchema(kind) {
	const label = kind === "first" ? "first name" : "last name";
	return stringType().trim().min(1, { message: `Please enter your ${label}.` }).min(2, { message: `Your ${label} must be at least 2 characters.` }).max(50, { message: `Your ${label} must be 50 characters or fewer.` }).refine((value) => NAME_PATTERN.test(value), { message: `Please enter a valid ${label}.` });
}
var emailSchema = stringType().trim().min(1, { message: "Please enter your email address." }).max(254, { message: "That email address is too long." }).refine((value) => /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/.test(value), { message: "Please enter a valid email address." }).transform((value) => value.toLowerCase());
var PASSWORD_RULES = [
	{
		key: "length",
		label: "At least 8 characters",
		test: (v) => v.length >= 8
	},
	{
		key: "upper",
		label: "One uppercase letter",
		test: (v) => /[A-Z]/.test(v)
	},
	{
		key: "lower",
		label: "One lowercase letter",
		test: (v) => /[a-z]/.test(v)
	},
	{
		key: "number",
		label: "One number",
		test: (v) => /\d/.test(v)
	},
	{
		key: "special",
		label: "One special character",
		test: (v) => /[^A-Za-z0-9]/.test(v)
	}
];
var passwordSchema = stringType().min(1, { message: "Please create a password." }).max(72, { message: "Passwords can be at most 72 characters." }).refine((v) => v.length >= 8, { message: "Password must contain at least 8 characters." }).refine((v) => /[A-Z]/.test(v), { message: "Password must include an uppercase letter." }).refine((v) => /[a-z]/.test(v), { message: "Password must include a lowercase letter." }).refine((v) => /\d/.test(v), { message: "Password must include a number." }).refine((v) => /[^A-Za-z0-9]/.test(v), { message: "Password must include a special character." });
function passwordStrength(value) {
	const passed = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
	let score = 0;
	if (value.length > 0) score = Math.min(3, Math.max(1, passed - 1));
	if (passed === PASSWORD_RULES.length && value.length >= 12) score = 4;
	return {
		score: Math.min(4, score),
		label: [
			"Weak",
			"Weak",
			"Fair",
			"Strong",
			"Very strong"
		][Math.min(4, score)]
	};
}
/** Strips spaces, dashes, brackets and dots from a typed phone number. */
function normalizePhoneDigits(value) {
	return value.replace(/[\s().-]/g, "").replace(/^0+/, "");
}
var ROLE_VALUES = [
	"parent",
	"student",
	"tutor",
	"agency"
];
/** Country-aware schema: phone length rules come from admin-managed settings. */
function makeSignupSchema(countries, roles) {
	const allowedRoles = roles.length ? roles : [...ROLE_VALUES];
	return objectType({
		firstName: nameSchema("first"),
		lastName: nameSchema("last"),
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: stringType().min(1, { message: "Please confirm your password." }),
		countryCode: stringType().min(1, { message: "Please select your country." }),
		phone: stringType().trim().min(1, { message: "Please enter your phone number." }),
		role: stringType().refine((value) => allowedRoles.includes(value), { message: "Please choose an account type." }),
		acceptTerms: literalType(true, { errorMap: () => ({ message: "Please accept the Terms & Conditions to create your account." }) })
	}).superRefine((values, ctx) => {
		if (values.confirmPassword !== values.password) ctx.addIssue({
			path: ["confirmPassword"],
			code: ZodIssueCode.custom,
			message: "Passwords do not match."
		});
		const digits = normalizePhoneDigits(values.phone);
		if (/[A-Za-z]/.test(values.phone) || !/^\d+$/.test(digits)) {
			ctx.addIssue({
				path: ["phone"],
				code: ZodIssueCode.custom,
				message: "Please enter a valid phone number."
			});
			return;
		}
		const country = countries.find((item) => item.code === values.countryCode);
		const min = country?.min_digits ?? 6;
		const max = country?.max_digits ?? 15;
		if (digits.length < min || digits.length > max) ctx.addIssue({
			path: ["phone"],
			code: ZodIssueCode.custom,
			message: country ? `Please enter a valid ${country.name} phone number (${min === max ? `${min} digits` : `${min}–${max} digits`}).` : "Please enter a valid phone number."
		});
	});
}
/** Server-side schema: independent of client state, deliberately conservative. */
var serverSignupSchema = objectType({
	firstName: nameSchema("first"),
	lastName: nameSchema("last"),
	email: emailSchema,
	password: passwordSchema,
	countryCode: stringType().trim().min(2).max(2),
	phone: stringType().trim().transform(normalizePhoneDigits).refine((value) => /^\d{6,15}$/.test(value), { message: "Please enter a valid phone number." }),
	dialCode: stringType().trim().regex(/^\+\d{1,4}$/, { message: "Please select your country." }),
	role: enumType(ROLE_VALUES, { errorMap: () => ({ message: "Please choose an account type." }) }),
	acceptTerms: literalType(true, { errorMap: () => ({ message: "Please accept the Terms & Conditions to continue." }) }),
	timezone: stringType().trim().max(64).optional()
});
var SIGNIN_SCHEMA = objectType({
	email: emailSchema,
	password: stringType().min(1, { message: "Please enter your password." })
});
var FORGOT_PASSWORD_SCHEMA = objectType({ email: emailSchema });
var RESET_PASSWORD_SCHEMA = objectType({
	password: passwordSchema,
	confirmPassword: stringType().min(1, { message: "Please confirm your new password." })
}).superRefine((values, ctx) => {
	if (values.confirmPassword !== values.password) ctx.addIssue({
		path: ["confirmPassword"],
		code: ZodIssueCode.custom,
		message: "Passwords do not match."
	});
});
/** The one-time password is 10 hex characters from pgcrypto, shown uppercase. */
var INVITE_OTP_SCHEMA = stringType().trim().min(1, { message: "Please enter the one-time password from your invitation email." }).transform((value) => value.replace(/[\s-]/g, "").toUpperCase()).refine((value) => /^[0-9A-F]{10}$/.test(value), { message: "That code doesn't look right. It's 10 characters from your invitation email." });
/** Accepting an admin invitation: prove the emailed code, then set a password. */
var ACCEPT_INVITE_SCHEMA = objectType({
	otp: INVITE_OTP_SCHEMA,
	password: passwordSchema,
	confirmPassword: stringType().min(1, { message: "Please confirm your new password." })
}).superRefine((values, ctx) => {
	if (values.confirmPassword !== values.password) ctx.addIssue({
		path: ["confirmPassword"],
		code: ZodIssueCode.custom,
		message: "Passwords do not match."
	});
});
/** Changing your own password from inside the admin portal. */
var CHANGE_PASSWORD_SCHEMA = objectType({
	password: passwordSchema,
	confirmPassword: stringType().min(1, { message: "Please confirm your new password." })
}).superRefine((values, ctx) => {
	if (values.confirmPassword !== values.password) ctx.addIssue({
		path: ["confirmPassword"],
		code: ZodIssueCode.custom,
		message: "Passwords do not match."
	});
});
//#endregion
export { RESET_PASSWORD_SCHEMA as a, makeSignupSchema as c, serverSignupSchema as d, PASSWORD_RULES as i, normalizePhoneDigits as l, CHANGE_PASSWORD_SCHEMA as n, ROLE_VALUES as o, FORGOT_PASSWORD_SCHEMA as r, SIGNIN_SCHEMA as s, ACCEPT_INVITE_SCHEMA as t, passwordStrength as u };
