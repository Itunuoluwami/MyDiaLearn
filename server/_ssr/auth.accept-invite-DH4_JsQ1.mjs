import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button, t as BRAND } from "./button-Be6IoNc1.mjs";
import { i as authClient } from "./auth-DVJYIAuV.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { Ut as CircleAlert, fn as ArrowLeft, it as LoaderCircle, m as TriangleAlert, qt as Check } from "../_libs/lucide-react.mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as apiPost } from "./data-client-kVSxwzg_.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { n as clearAdminContextCache } from "./admin-guard-DXXXDJr3.mjs";
import { o as friendlyAdminError, u as redeemInvitationViaApi } from "./admin-governance-AZIEy_jw.mjs";
import { i as PASSWORD_RULES, t as ACCEPT_INVITE_SCHEMA, u as passwordStrength } from "./auth-validation-BByE_cjn.mjs";
import { t as PasswordInput } from "./PasswordInput-DdJnEogn.mjs";
import { t as AuthSidePanel } from "./AuthSidePanel-DhhEVo5S.mjs";
import { n as useForm, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.accept-invite-DH4_JsQ1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STRENGTH_TONE = [
	"bg-destructive",
	"bg-destructive",
	"bg-warning",
	"bg-secondary",
	"bg-success"
];
/**
* Redeems an admin invitation: prove the emailed one-time password, then
* replace it with a password of your own.
*
* Order matters here. The OTP is checked first, by admin_invite_redeem(), which
* is what actually grants the role — so a wrong code costs nothing and changes
* nothing. Only once that succeeds do we set the password, and only then do we
* clear the forced-change flag the redeem set.
*
* Under the API the invitee is already signed in with a password they chose at
* sign-up, so there is no generated password to replace — but the redeem still
* sets the forced-change flag, and the API only changes a password given the
* current one. So the form also asks for that, changes it, and signs back in
* (a password change ends every session); the API clears the flag itself.
*/
function AcceptInviteForm({ email, onSuccess }) {
	const [formError, setFormError] = (0, import_react.useState)(null);
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [currentError, setCurrentError] = (0, import_react.useState)(null);
	const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm({
		resolver: u(ACCEPT_INVITE_SCHEMA),
		mode: "onBlur",
		defaultValues: {
			otp: "",
			password: "",
			confirmPassword: ""
		}
	});
	const password = watch("password");
	const strength = passwordStrength(password ?? "");
	async function onSubmit(values) {
		setFormError(null);
		const otp = String(values.otp ?? "").replace(/[\s-]/g, "").toUpperCase();
		if (!currentPassword) {
			setCurrentError("Enter the password you signed in with.");
			return;
		}
		setCurrentError(null);
		try {
			await redeemInvitationViaApi(email, otp);
		} catch (error) {
			if (String(error?.message ?? "").toUpperCase().includes("INVALID_OTP")) {
				setError("otp", {
					type: "server",
					message: "That code isn't right. Check the one in your invitation email."
				});
				return;
			}
			setFormError(friendlyAdminError(error));
			return;
		}
		try {
			await apiPost("/auth/password/change", {
				currentPassword,
				newPassword: values.password
			});
		} catch (error) {
			const raw = String(error?.message ?? "").toLowerCase();
			setFormError(raw.includes("current password is incorrect") ? "Your admin access is set up, but the current password was wrong so the new one wasn't saved. Set it from Security." : "Your admin access is set up, but we couldn't save that password. Set one from Security after signing in.");
			return;
		}
		const { error } = await authClient.signInWithPassword({
			email,
			password: values.password
		});
		if (error) {
			setFormError("Your password was changed. Please sign in again with the new one.");
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
				}), formError]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "invite-current-password",
						children: "Current password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
						id: "invite-current-password",
						autoComplete: "current-password",
						value: currentPassword,
						onChange: (event) => setCurrentPassword(event.target.value),
						"aria-invalid": Boolean(currentError),
						"aria-describedby": currentError ? "invite-current-password-error" : void 0,
						className: cn("h-11", currentError && "border-destructive")
					}),
					currentError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: "invite-current-password-error",
						role: "alert",
						className: "text-xs text-destructive",
						children: currentError
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "invite-otp",
						children: "One-time password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "invite-otp",
						autoComplete: "one-time-code",
						autoCapitalize: "characters",
						spellCheck: false,
						placeholder: "From your invitation email",
						className: cn("h-11 font-mono tracking-[0.18em]", errors.otp && "border-destructive"),
						"aria-invalid": Boolean(errors.otp),
						"aria-describedby": errors.otp ? "invite-otp-error" : void 0,
						...register("otp")
					}),
					errors.otp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: "invite-otp-error",
						role: "alert",
						className: "text-xs text-destructive",
						children: errors.otp.message
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "invite-password",
						children: "Choose a password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
						id: "invite-password",
						autoComplete: "new-password",
						"aria-invalid": Boolean(errors.password),
						"aria-describedby": errors.password ? "invite-password-error" : void 0,
						className: cn(errors.password && "border-destructive"),
						...register("password")
					}),
					errors.password ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: "invite-password-error",
						role: "alert",
						className: "text-xs text-destructive",
						children: errors.password.message
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
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: cn("size-3.5 shrink-0", !met && "opacity-30"),
										"aria-hidden": "true"
									}), rule.label]
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
						htmlFor: "invite-confirm",
						children: "Confirm password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
						id: "invite-confirm",
						autoComplete: "new-password",
						"aria-invalid": Boolean(errors.confirmPassword),
						"aria-describedby": errors.confirmPassword ? "invite-confirm-error" : void 0,
						className: cn(errors.confirmPassword && "border-destructive"),
						...register("confirmPassword")
					}),
					errors.confirmPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: "invite-confirm-error",
						role: "alert",
						className: "text-xs text-destructive",
						children: errors.confirmPassword.message
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				variant: "cta",
				className: "min-h-12 w-full",
				disabled: isSubmitting,
				children: [isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "size-4 animate-spin",
					"aria-hidden": "true"
				}) : null, isSubmitting ? "Setting up your access…" : "Accept invitation"]
			})
		]
	});
}
/** Supabase puts link errors on the hash (implicit flow) or the query (PKCE). */
function readLinkError() {
	const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
	const query = new URLSearchParams(window.location.search);
	const description = hash.get("error_description") || query.get("error_description") || hash.get("error") || query.get("error");
	return description ? description.replace(/\+/g, " ") : null;
}
function AcceptInvitePage() {
	const navigate = useNavigate();
	const { refresh } = useAuth();
	const [state, setState] = (0, import_react.useState)("checking");
	const [email, setEmail] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let active = true;
		if (authClient.provider === "nestjs") {
			authClient.getSession().then(({ data }) => {
				if (!active) return;
				if (data.session) {
					setEmail(data.session.user.email ?? "");
					setState("ready");
				} else {
					setEmail(new URLSearchParams(window.location.search).get("email") ?? "");
					setState("signin");
				}
			});
			return () => {
				active = false;
			};
		}
		if (readLinkError()) {
			setState("invalid");
			return;
		}
		authClient.getSession().then(({ data }) => {
			if (!active || !data.session) return;
			setEmail(data.session.user.email ?? "");
			setState("ready");
		});
		const { data: subscription } = authClient.onAuthStateChange((event, session) => {
			if (!active) return;
			if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY" || event === "USER_UPDATED") && session) {
				setEmail(session.user.email ?? "");
				setState("ready");
			}
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
		clearAdminContextCache();
		await refresh();
		setState("done");
		toast.success("Welcome to the DiaLearn admin portal");
		navigate({
			to: "/admin/dashboard",
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
				className: "grid items-start gap-8 lg:grid-cols-[minmax(22rem,1fr)_minmax(20rem,1fr)] lg:gap-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto w-full max-w-lg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "card-elevated p-5 md:p-8",
						children: state === "checking" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center py-10 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "size-8 animate-spin text-primary",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm text-muted-foreground",
								children: "Checking your invitation…"
							})]
						}) : state === "signin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "display-section text-2xl",
									children: "Sign in to accept your invitation"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 max-w-sm text-sm text-muted-foreground",
									children: [
										"Sign in",
										email ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											" ",
											"as ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium text-foreground",
												children: email
											})
										] }) : null,
										" ",
										"— or create an account with that address — then come back to this page and enter the code from your invitation email."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "cta",
									className: "mt-8 min-h-12 w-full max-w-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth",
										children: "Go to sign in"
									})
								})
							]
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
									children: "This invitation link isn't valid"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 max-w-xs text-sm text-muted-foreground",
									children: "It may have expired or already been used. Ask the person who invited you to send a new one."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "cta",
									className: "mt-8 min-h-12 w-full max-w-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth",
										children: "Go to sign in"
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
								children: "Set up your admin access"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: email ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									"Signing in as ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-foreground",
										children: email
									}),
									". Enter the one-time password from your invitation email, then choose a password of your own."
								] }) : "Enter the one-time password from your invitation email, then choose a password of your own."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AcceptInviteForm, {
									email,
									onSuccess: handleSuccess
								})
							})
						] })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSidePanel, {})]
			})
		})]
	});
}
//#endregion
export { AcceptInvitePage as component };
