import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { E as ShieldAlert, ft as KeyRound, it as LoaderCircle, qt as Check } from "../_libs/lucide-react.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as useApiData } from "./data-client-kVSxwzg_.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { n as clearAdminContextCache } from "./admin-guard-DXXXDJr3.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { g as useChangeOwnPassword, o as friendlyAdminError } from "./admin-governance-AZIEy_jw.mjs";
import { i as PASSWORD_RULES, n as CHANGE_PASSWORD_SCHEMA, u as passwordStrength } from "./auth-validation-BByE_cjn.mjs";
import { t as PasswordInput } from "./PasswordInput-DdJnEogn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.security-DL9_4AkK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STRENGTH_TONE = [
	"bg-destructive",
	"bg-destructive",
	"bg-warning",
	"bg-secondary",
	"bg-success"
];
function AdminSecurityPage() {
	const { profile, mustChangePassword, refresh, loading } = useAuth();
	const navigate = useNavigate();
	const changePassword = useChangeOwnPassword();
	const needsCurrent = useApiData();
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [errors, setErrors] = (0, import_react.useState)({});
	const strength = passwordStrength(password);
	function handleSubmit(event) {
		event.preventDefault();
		setErrors({});
		const parsed = CHANGE_PASSWORD_SCHEMA.safeParse({
			password,
			confirmPassword
		});
		if (!parsed.success) {
			const next = {};
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
		const input = needsCurrent ? {
			password,
			currentPassword,
			email: profile?.email ?? ""
		} : password;
		changePassword.mutate(input, {
			onSuccess: async () => {
				setCurrentPassword("");
				setPassword("");
				setConfirmPassword("");
				clearAdminContextCache();
				await refresh();
				toast.success("Password updated");
				if (mustChangePassword) navigate({
					to: "/admin/dashboard",
					replace: true
				});
			},
			onError: (error) => {
				const raw = String(error?.message ?? "").toLowerCase();
				if (raw.includes("current password is incorrect")) {
					setErrors({ currentPassword: "Your current password is incorrect." });
					return;
				}
				if (raw.includes("same") || raw.includes("different from the old")) {
					setErrors({ password: "Please choose a password different from your current one." });
					return;
				}
				toast.error(friendlyAdminError(error));
			}
		});
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Security",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Security",
		description: "The password on your own DiaLearn admin account.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-[minmax(0,32rem)_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [mustChangePassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-warm flex items-start gap-3 p-4 md:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "mt-0.5 size-5 shrink-0 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold",
						children: "Choose your own password"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Your account was set up with a one-time password from your invitation. Replace it now — the rest of the admin portal opens up as soon as you do."
					})] })]
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel-portal p-4 md:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-semibold",
							children: "Change password"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [
								"Signed in as ",
								profile?.email ?? "this account",
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-5 space-y-5",
							onSubmit: handleSubmit,
							noValidate: true,
							children: [
								needsCurrent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "current-password",
											children: "Current password"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
											id: "current-password",
											autoComplete: "current-password",
											value: currentPassword,
											onChange: (event) => setCurrentPassword(event.target.value),
											"aria-invalid": Boolean(errors["currentPassword"]),
											"aria-describedby": errors["currentPassword"] ? "current-password-error" : void 0,
											className: cn(errors["currentPassword"] && "border-destructive")
										}),
										errors["currentPassword"] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											id: "current-password-error",
											role: "alert",
											className: "text-xs text-destructive",
											children: errors["currentPassword"]
										}) : null
									]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "new-password",
											children: "New password"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
											id: "new-password",
											autoComplete: "new-password",
											value: password,
											onChange: (event) => setPassword(event.target.value),
											"aria-invalid": Boolean(errors["password"]),
											"aria-describedby": errors["password"] ? "new-password-error" : void 0,
											className: cn(errors["password"] && "border-destructive")
										}),
										errors["password"] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											id: "new-password-error",
											role: "alert",
											className: "text-xs text-destructive",
											children: errors["password"]
										}) : null,
										password ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2 pt-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-1.5 flex-1 overflow-hidden rounded-full bg-muted",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: cn("h-full rounded-full transition-all duration-200", STRENGTH_TONE[strength.score] ?? "bg-muted"),
														style: { width: `${Math.max(strength.score, 1) * 25}%` }
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs font-medium text-muted-foreground",
													children: strength.label
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "grid gap-1.5 sm:grid-cols-2",
												children: PASSWORD_RULES.map((rule) => {
													const met = rule.test(password);
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
														className: cn("flex items-center gap-1.5 text-xs", met ? "text-success" : "text-muted-foreground"),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("size-3.5 shrink-0", !met && "opacity-30") }), rule.label]
													}, rule.key);
												})
											})]
										}) : null
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "confirm-password",
											children: "Confirm new password"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
											id: "confirm-password",
											autoComplete: "new-password",
											value: confirmPassword,
											onChange: (event) => setConfirmPassword(event.target.value),
											"aria-invalid": Boolean(errors["confirmPassword"]),
											"aria-describedby": errors["confirmPassword"] ? "confirm-password-error" : void 0,
											className: cn(errors["confirmPassword"] && "border-destructive")
										}),
										errors["confirmPassword"] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											id: "confirm-password-error",
											role: "alert",
											className: "text-xs text-destructive",
											children: errors["confirmPassword"]
										}) : null
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									className: "min-h-11 w-full sm:w-auto",
									disabled: changePassword.isPending,
									children: [changePassword.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" }), changePassword.isPending ? "Updating…" : "Update password"]
								})
							]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "panel-portal h-fit p-4 md:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold",
						children: "Why this matters"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Admin accounts can move money, change what other people can see, and grant access to the platform. Every one of those actions is recorded against your name in the audit log, so the password on this account should be yours alone and used nowhere else."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: "A password issued in an invitation has been seen by at least two people and one email inbox. That is why it only works once."
					})
				]
			})]
		})
	});
}
//#endregion
export { AdminSecurityPage as component };
