import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button, t as BRAND } from "./button-Be6IoNc1.mjs";
import { i as authClient } from "./auth-DVJYIAuV.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { Ut as CircleAlert, fn as ArrowLeft, it as LoaderCircle, m as TriangleAlert, qt as Check } from "../_libs/lucide-react.mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as RESET_PASSWORD_SCHEMA, i as PASSWORD_RULES, u as passwordStrength } from "./auth-validation-BByE_cjn.mjs";
import { t as PasswordInput } from "./PasswordInput-DdJnEogn.mjs";
import { t as AuthSidePanel } from "./AuthSidePanel-DhhEVo5S.mjs";
import { n as useForm, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.reset-password-B4GJPveU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPasswordForm({ onSuccess }) {
	const [formError, setFormError] = (0, import_react.useState)(null);
	const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
		resolver: u(RESET_PASSWORD_SCHEMA),
		mode: "onBlur",
		defaultValues: {
			password: "",
			confirmPassword: ""
		}
	});
	const password = watch("password");
	const strength = passwordStrength(password ?? "");
	async function onSubmit(values) {
		setFormError(null);
		const { error } = await authClient.updateUser({ password: values.password });
		if (error) {
			const raw = (error.message || "").toLowerCase();
			if (raw.includes("same") || raw.includes("different from the old")) setFormError("Please choose a password different from your current one.");
			else if (raw.includes("network") || raw.includes("fetch")) setFormError("Something went wrong. Please check your connection and try again.");
			else if (raw.includes("session") || raw.includes("token") || raw.includes("expired")) setFormError("This reset link has expired. Please request a new one.");
			else setFormError("We couldn't update your password right now. Please try again.");
			return;
		}
		onSuccess();
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
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "reset-password",
						children: "New password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
						id: "reset-password",
						autoComplete: "new-password",
						disabled: isSubmitting,
						"aria-invalid": !!errors.password,
						"aria-describedby": "reset-password-requirements",
						className: cn("transition-colors duration-200", errors.password && "border-destructive"),
						...register("password")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-1 gap-1.5",
							"aria-hidden": "true",
							children: [
								1,
								2,
								3,
								4
							].map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 flex-1 rounded-full transition-all duration-300", strength.score >= step ? strength.score >= 4 ? "bg-success" : strength.score === 3 ? "bg-primary" : "bg-secondary" : "bg-muted") }, step))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-20 text-right text-xs text-muted-foreground",
							"aria-live": "polite",
							children: password ? strength.label : ""
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						id: "reset-password-requirements",
						className: "grid gap-1 sm:grid-cols-2",
						children: PASSWORD_RULES.map((rule) => {
							const met = rule.test(password ?? "");
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: cn("flex items-center gap-1.5 text-xs transition-colors duration-200", met ? "text-success" : "text-muted-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("flex size-4 items-center justify-center rounded-full border transition-colors duration-200", met ? "border-success bg-success/10" : "border-border"),
									"aria-hidden": "true",
									children: met ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }) : null
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [rule.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									children: met ? " — met" : " — not met yet"
								})] })]
							}, rule.key);
						})
					}),
					errors.password ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						role: "alert",
						className: "flex items-start gap-1.5 text-xs text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							className: "mt-0.5 size-3.5 shrink-0",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errors.password.message })]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "reset-confirm-password",
						children: "Confirm new password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
						id: "reset-confirm-password",
						autoComplete: "new-password",
						disabled: isSubmitting,
						"aria-invalid": !!errors.confirmPassword,
						"aria-describedby": errors.confirmPassword ? "reset-confirm-password-error" : void 0,
						className: cn("transition-colors duration-200", errors.confirmPassword && "border-destructive"),
						...register("confirmPassword")
					}),
					errors.confirmPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						id: "reset-confirm-password-error",
						role: "alert",
						className: "flex items-start gap-1.5 text-xs text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							className: "mt-0.5 size-3.5 shrink-0",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errors.confirmPassword.message })]
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
				}), "Updating password..."] }) : "Update password"
			})
		]
	});
}
/** Reads Supabase's error params off either the hash (implicit flow) or the query string (PKCE). */
function readLinkError() {
	const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
	const query = new URLSearchParams(window.location.search);
	const description = hash.get("error_description") || query.get("error_description") || hash.get("error") || query.get("error");
	return description ? description.replace(/\+/g, " ") : null;
}
function ResetPasswordPage() {
	const navigate = useNavigate();
	const { refresh } = useAuth();
	const [state, setState] = (0, import_react.useState)("checking");
	(0, import_react.useEffect)(() => {
		let active = true;
		if (readLinkError()) {
			setState("invalid");
			return;
		}
		authClient.getSession().then(({ data }) => {
			if (active && data.session) setState("ready");
		});
		const { data: subscription } = authClient.onAuthStateChange((event, session) => {
			if (!active) return;
			if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" && session) setState("ready");
		});
		const timeout = window.setTimeout(() => {
			if (active) setState((current) => current === "checking" ? "invalid" : current);
		}, 6e3);
		return () => {
			active = false;
			subscription.subscription.unsubscribe();
			window.clearTimeout(timeout);
		};
	}, []);
	async function handleSuccess() {
		await refresh();
		toast.success("Your password has been updated");
		setState("done");
		navigate({
			to: "/auth",
			replace: true
		});
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
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "card-elevated p-5 md:p-8",
						children: state === "checking" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center py-10 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "size-8 animate-spin text-primary",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm text-muted-foreground",
								children: "Verifying your reset link..."
							})]
						}) : state === "invalid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-16 items-center justify-center rounded-2xl bg-destructive/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
										className: "size-8 text-destructive",
										"aria-hidden": "true"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "display-section mt-6 text-2xl",
									children: "This link isn't valid"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 max-w-xs text-sm text-muted-foreground",
									children: "Your password reset link may have expired or already been used. Request a new one to continue."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "cta",
									className: "mt-8 min-h-12 w-full max-w-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth/forgot-password",
										children: "Request a new link"
									})
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: BRAND.tagline
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "display-section mt-2 text-3xl",
								children: "Set a new password"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "Choose a new password for your account."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResetPasswordForm, { onSuccess: handleSuccess })
							})
						] })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSidePanel, {})]
			})
		})]
	});
}
//#endregion
export { ResetPasswordPage as component };
