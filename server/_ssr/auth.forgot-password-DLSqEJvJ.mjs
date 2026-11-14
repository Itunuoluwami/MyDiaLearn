import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button, t as BRAND } from "./button-Be6IoNc1.mjs";
import { i as authClient } from "./auth-DVJYIAuV.mjs";
import { Ut as CircleAlert, fn as ArrowLeft, it as LoaderCircle, tt as MailCheck } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { r as FORGOT_PASSWORD_SCHEMA } from "./auth-validation-BByE_cjn.mjs";
import { t as AuthSidePanel } from "./AuthSidePanel-DhhEVo5S.mjs";
import { n as useForm, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.forgot-password-DLSqEJvJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ForgotPasswordForm({ onSubmitted }) {
	const [formError, setFormError] = (0, import_react.useState)(null);
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
		resolver: u(FORGOT_PASSWORD_SCHEMA),
		mode: "onBlur",
		defaultValues: { email: "" }
	});
	async function onSubmit(values) {
		setFormError(null);
		const email = values.email.trim().toLowerCase();
		const { error } = await authClient.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` });
		if (error) {
			const raw = (error.message || "").toLowerCase();
			if (raw.includes("network") || raw.includes("fetch")) {
				setFormError("Something went wrong. Please check your connection and try again.");
				return;
			}
			if (raw.includes("rate limit") || raw.includes("too many")) {
				setFormError("Too many requests. Please wait a moment and try again.");
				return;
			}
		}
		onSubmitted(email);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit(onSubmit),
		noValidate: true,
		className: "space-y-5",
		children: [
			formError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "alert",
				className: "flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
					className: "mt-0.5 size-4 shrink-0 text-destructive",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formError })]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "forgot-email",
						children: "Email address"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "forgot-email",
						type: "email",
						inputMode: "email",
						autoComplete: "email",
						disabled: isSubmitting,
						"aria-invalid": !!errors.email,
						"aria-describedby": errors.email ? "forgot-email-error" : void 0,
						className: cn("h-11 transition-colors duration-200", errors.email && "border-destructive"),
						...register("email")
					}),
					errors.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						id: "forgot-email-error",
						role: "alert",
						className: "flex items-start gap-1.5 text-xs text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							className: "mt-0.5 size-3.5 shrink-0",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errors.email.message })]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				variant: "cta",
				className: "min-h-12 w-full text-base",
				disabled: isSubmitting,
				children: isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "size-4 animate-spin",
					"aria-hidden": "true"
				}), "Sending reset link..."] }) : "Send reset link"
			})
		]
	});
}
function ForgotPasswordPage() {
	const [sentTo, setSentTo] = (0, import_react.useState)(null);
	async function handleResend() {
		if (!sentTo) return;
		const { error } = await authClient.resetPasswordForEmail(sentTo, { redirectTo: `${window.location.origin}/auth/reset-password` });
		if (error?.message?.toLowerCase().includes("rate limit")) {
			toast.error("Too many requests. Please wait a moment and try again.");
			return;
		}
		toast.success("A new reset link is on its way, if that address has an account");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site flex min-h-16 items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: BRAND.logoUrl,
						alt: "DiaLearn",
						className: "h-11 w-auto md:h-12"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
						className: "size-4",
						"aria-hidden": "true"
					}), "Back to site"]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "container-site py-6 md:py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid items-start gap-8 lg:h-[36rem] lg:grid-cols-[minmax(22rem,1fr)_minmax(20rem,1fr)] lg:gap-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto w-full max-w-lg lg:h-full lg:overflow-y-auto",
					children: sentTo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "card-elevated flex flex-col items-center p-5 text-center md:p-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-16 items-center justify-center rounded-2xl bg-primary-soft",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailCheck, {
									className: "size-8 text-primary",
									"aria-hidden": "true"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "display-section mt-6 text-2xl",
								children: "Check your email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 max-w-xs text-sm text-muted-foreground",
								children: [
									"If an account exists for",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-foreground",
										children: sentTo
									}),
									", we've sent a link to reset your password. It'll expire soon, so use it right away."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 w-full max-w-sm space-y-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "cta",
									className: "min-h-12 w-full",
									onClick: handleResend,
									children: "Resend link"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col items-center gap-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setSentTo(null),
										className: "text-muted-foreground transition-colors hover:text-foreground",
										children: "Use a different email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth",
										className: "font-semibold text-primary underline underline-offset-2",
										children: "Back to sign in"
									})]
								})]
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "card-elevated p-5 md:p-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: BRAND.tagline
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "display-section mt-2 text-3xl",
								children: "Forgot your password?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "Enter the email address on your account and we'll send you a link to reset it."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForgotPasswordForm, { onSubmitted: (email) => setSentTo(email) })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-6 text-center text-sm text-muted-foreground",
								children: [
									"Remembered it after all?",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth",
										className: "font-semibold text-primary underline",
										children: "Back to sign in"
									})
								]
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSidePanel, {})]
			})
		})]
	});
}
//#endregion
export { ForgotPasswordPage as component };
