import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button, t as BRAND } from "./button-Be6IoNc1.mjs";
import { i as authClient } from "./auth-DVJYIAuV.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { t as portalHome } from "./portal-home-BO3OTxAy.mjs";
import { Ut as CircleAlert, _t as GraduationCap, a as Users, fn as ArrowLeft, in as BookOpen, it as LoaderCircle, qt as Check, rn as Building2, tt as MailCheck } from "../_libs/lucide-react.mjs";
import { A as isRedirect, _ as Link, b as useRouter, f as useChildMatches, p as Outlet, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as apiGet } from "./data-client-kVSxwzg_.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { t as Checkbox } from "./checkbox-fH8q-trq.mjs";
import { c as makeSignupSchema, i as PASSWORD_RULES, l as normalizePhoneDigits, o as ROLE_VALUES, s as SIGNIN_SCHEMA, u as passwordStrength } from "./auth-validation-BByE_cjn.mjs";
import { t as PasswordInput } from "./PasswordInput-DdJnEogn.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-CAnc53sL.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { d as usePublicSettings, r as settingList } from "./public-data-D6Ffdjlb.mjs";
import { t as AuthSidePanel } from "./AuthSidePanel-DhhEVo5S.mjs";
import { n as useForm, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-CPfLGCUd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
function SignInForm({ onSuccess, onSwitchToSignUp }) {
	const [formError, setFormError] = (0, import_react.useState)(null);
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
		resolver: u(SIGNIN_SCHEMA),
		mode: "onBlur",
		defaultValues: {
			email: "",
			password: ""
		}
	});
	async function onSubmit(values) {
		setFormError(null);
		const { error } = await authClient.signInWithPassword({
			email: values.email.trim().toLowerCase(),
			password: values.password
		});
		if (error) {
			const raw = (error.message || "").toLowerCase();
			if (raw.includes("invalid login")) setFormError("That email and password combination doesn't match an account.");
			else if (raw.includes("confirm")) setFormError("Please verify your email address before signing in.");
			else if (raw.includes("network") || raw.includes("fetch")) setFormError("Something went wrong. Please check your connection and try again.");
			else setFormError("We couldn't sign you in right now. Please try again.");
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
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "signin-email",
						children: "Email address"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "signin-email",
						type: "email",
						inputMode: "email",
						autoComplete: "email",
						disabled: isSubmitting,
						"aria-invalid": !!errors.email,
						"aria-describedby": errors.email ? "signin-email-error" : void 0,
						className: cn("h-11 transition-colors duration-200", errors.email && "border-destructive"),
						...register("email")
					}),
					errors.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						id: "signin-email-error",
						role: "alert",
						className: "flex items-start gap-1.5 text-xs text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							className: "mt-0.5 size-3.5 shrink-0",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errors.email.message })]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "signin-password",
							children: "Password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth/forgot-password",
							className: "text-xs font-medium text-primary underline underline-offset-2",
							children: "Forgot password?"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
						id: "signin-password",
						autoComplete: "current-password",
						disabled: isSubmitting,
						"aria-invalid": !!errors.password,
						"aria-describedby": errors.password ? "signin-password-error" : void 0,
						className: cn("transition-colors duration-200", errors.password && "border-destructive"),
						...register("password")
					}),
					errors.password ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						id: "signin-password-error",
						role: "alert",
						className: "flex items-start gap-1.5 text-xs text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							className: "mt-0.5 size-3.5 shrink-0",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errors.password.message })]
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
				}), "Signing you in..."] }) : "Sign in"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-sm text-muted-foreground",
				children: [
					"New to DiaLearn?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onSwitchToSignUp,
						className: "font-semibold text-primary underline",
						children: "Create an account"
					})
				]
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* Server-side revalidation of the sign-up payload. The client form validates for
* UX; this is the authoritative check before we call the auth provider.
* The password is validated but never returned, logged or persisted here.
*/
var validateSignup = createServerFn({ method: "POST" }).inputValidator((input) => input).handler(createSsrRpc("8b6f9bebffbfd87bbc54fc0f1e5dd8ce1e7c8a02c08d7ce43e1abe4e378b95e7"));
var ROLE_META = {
	parent: {
		label: "Parent",
		description: "Manage your children's lessons and payments",
		icon: Users
	},
	student: {
		label: "Student",
		description: "Learn one-to-one with a vetted tutor",
		icon: BookOpen
	},
	tutor: {
		label: "Tutor",
		description: "Teach students in the diaspora",
		icon: GraduationCap
	},
	agency: {
		label: "Tutoring agency",
		description: "Manage a roster of tutors",
		icon: Building2
	}
};
var FIELD_ORDER = [
	"role",
	"firstName",
	"lastName",
	"email",
	"countryCode",
	"phone",
	"password",
	"confirmPassword",
	"acceptTerms"
];
function FieldError({ id, message }) {
	if (!message) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		id,
		role: "alert",
		className: "flex items-start gap-1.5 text-xs text-destructive",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
			className: "mt-0.5 size-3.5 shrink-0",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: message })]
	});
}
function SignUpForm({ onVerificationRequired, onSwitchToSignIn }) {
	const { data: settings } = usePublicSettings();
	const runServerValidation = useServerFn(validateSignup);
	const [formError, setFormError] = (0, import_react.useState)(null);
	const [step, setStep] = (0, import_react.useState)(1);
	const countries = (0, import_react.useMemo)(() => settingList(settings, "auth.countries"), [settings]);
	const { data: accountTypes } = useQuery({
		queryKey: ["setting", "auth.account_types"],
		queryFn: async () => {
			const value = (await apiGet("/catalogue/settings"))["auth.account_types"];
			return Array.isArray(value) ? value : [];
		},
		staleTime: 3e5
	});
	const roles = accountTypes?.length ? accountTypes : [...ROLE_VALUES];
	const schema = (0, import_react.useMemo)(() => makeSignupSchema(countries, roles), [countries, roles]);
	const form = useForm({
		resolver: u(schema),
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
			acceptTerms: false
		}
	});
	const { register, handleSubmit, watch, setValue, setError, formState, setFocus } = form;
	const { errors, isSubmitting, touchedFields, dirtyFields } = formState;
	const password = watch("password");
	const confirmPassword = watch("confirmPassword");
	const role = watch("role");
	const countryCode = watch("countryCode");
	const strength = passwordStrength(password ?? "");
	const selectedCountry = countries.find((item) => item.code === countryCode);
	const showValid = (field) => !errors[field] && (touchedFields[field] || dirtyFields[field]) && !!watch(field);
	async function onSubmit(values) {
		setFormError(null);
		const dialCode = selectedCountry?.dial_code ?? "";
		const check = await runServerValidation({ data: {
			firstName: values.firstName,
			lastName: values.lastName,
			email: values.email,
			password: values.password,
			countryCode: values.countryCode,
			phone: values.phone,
			dialCode,
			role: values.role,
			acceptTerms: true,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC"
		} }).catch(() => null);
		if (!check) {
			setFormError({ message: "Something went wrong. Please check your connection and try again." });
			return;
		}
		if (!check.ok) {
			for (const [field, message] of Object.entries(check.fieldErrors)) if (FIELD_ORDER.includes(field)) setError(field, {
				type: "server",
				message
			});
			const first = FIELD_ORDER.find((field) => field in check.fieldErrors);
			if (first) setFocus(first);
			else setFormError({ message: "We couldn't create your account right now. Please try again." });
			return;
		}
		const { normalized } = check;
		const { error } = await authClient.signUp({
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
					timezone: normalized.timezone
				},
				emailRedirectTo: `${window.location.origin}/auth`
			}
		});
		if (error) {
			const raw = (error.message || "").toLowerCase();
			if (raw.includes("already registered") || raw.includes("already been registered") || raw.includes("exists")) {
				setFormError({
					message: "An account with this email already exists. Try signing in instead.",
					showSignIn: true
				});
				setFocus("email");
			} else if (raw.includes("password")) {
				setFormError({ message: "Please choose a stronger password." });
				setFocus("password");
			} else if (raw.includes("network") || raw.includes("fetch")) setFormError({ message: "Something went wrong. Please check your connection and try again." });
			else setFormError({ message: "We couldn't create your account right now. Please try again." });
			return;
		}
		onVerificationRequired(normalized.email);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit(onSubmit),
		noValidate: true,
		className: "space-y-6",
		children: [formError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "alert",
			className: "rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-start gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
					className: "mt-0.5 size-4 shrink-0 text-destructive",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formError.message })]
			}), formError.showSignIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				size: "sm",
				className: "mt-3 min-h-11",
				onClick: onSwitchToSignIn,
				children: "Sign in"
			}) : null]
		}) : null, step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "text-sm font-medium text-foreground",
						children: "Step 1 of 2 — I'm signing up as"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: roles.map((option) => {
							const meta = ROLE_META[option] ?? {
								label: option,
								description: "DiaLearn account",
								icon: Users
							};
							const Icon = meta.icon;
							const active = role === option;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": active,
								onClick: () => setValue("role", option, {
									shouldValidate: true,
									shouldTouch: true
								}),
								className: cn("flex min-h-11 items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200", active ? "border-primary bg-primary-soft/50 shadow-soft" : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "size-4",
										"aria-hidden": "true"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-semibold text-foreground",
										children: meta.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs leading-snug text-muted-foreground",
										children: meta.description
									})]
								})]
							}, option);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, {
						id: "role-error",
						message: errors.role?.message
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "cta",
				className: "min-h-12 w-full text-base",
				onClick: async () => {
					if (await form.trigger("role")) setStep(2);
				},
				children: "Continue"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-sm text-muted-foreground",
				children: [
					"Already have an account?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onSwitchToSignIn,
						className: "font-semibold text-primary underline",
						children: "Sign in"
					})
				]
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-foreground",
					children: "Step 2 of 2 — your details"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setStep(1),
					className: "inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
						className: "size-4",
						"aria-hidden": "true"
					}), ROLE_META[role]?.label ?? role]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "firstName",
							children: "First name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "firstName",
								autoComplete: "given-name",
								disabled: isSubmitting,
								"aria-invalid": !!errors.firstName,
								"aria-describedby": errors.firstName ? "firstName-error" : void 0,
								className: cn("h-11 transition-colors duration-200", errors.firstName && "border-destructive", showValid("firstName") && "border-success/60 pr-9"),
								...register("firstName")
							}), showValid("firstName") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-success",
								"aria-hidden": "true"
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, {
							id: "firstName-error",
							message: errors.firstName?.message
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "lastName",
							children: "Last name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "lastName",
								autoComplete: "family-name",
								disabled: isSubmitting,
								"aria-invalid": !!errors.lastName,
								"aria-describedby": errors.lastName ? "lastName-error" : void 0,
								className: cn("h-11 transition-colors duration-200", errors.lastName && "border-destructive", showValid("lastName") && "border-success/60 pr-9"),
								...register("lastName")
							}), showValid("lastName") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-success",
								"aria-hidden": "true"
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, {
							id: "lastName-error",
							message: errors.lastName?.message
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "signup-email",
						children: "Email address"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "signup-email",
						type: "email",
						inputMode: "email",
						autoComplete: "email",
						disabled: isSubmitting,
						"aria-invalid": !!errors.email,
						"aria-describedby": errors.email ? "email-error" : "email-hint",
						className: cn("h-11 transition-colors duration-200", errors.email && "border-destructive", showValid("email") && "border-success/60"),
						...register("email")
					}),
					errors.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, {
						id: "email-error",
						message: errors.email.message
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: "email-hint",
						className: "text-xs text-muted-foreground",
						children: "We'll send a verification link to this address."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "phone",
						children: "Phone number"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Country and dialling code",
							disabled: isSubmitting,
							className: cn("h-11 w-[8.5rem] shrink-0 rounded-md border border-input bg-background px-2 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50", errors.countryCode && "border-destructive"),
							...register("countryCode"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Country"
							}), countries.map((country) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: country.code,
								children: [
									country.flag,
									" ",
									country.dial_code
								]
							}, country.code))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "phone",
							type: "tel",
							inputMode: "tel",
							autoComplete: "tel",
							placeholder: selectedCountry ? "8012345678" : "Select a country first",
							disabled: isSubmitting,
							"aria-invalid": !!errors.phone,
							"aria-describedby": errors.phone ? "phone-error" : "phone-hint",
							className: cn("h-11 flex-1 transition-colors duration-200", errors.phone && "border-destructive", showValid("phone") && "border-success/60"),
							...register("phone", { onBlur: (event) => setValue("phone", normalizePhoneDigits(event.target.value), { shouldValidate: true }) })
						})]
					}),
					errors.phone || errors.countryCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, {
						id: "phone-error",
						message: errors.countryCode?.message ?? errors.phone?.message
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: "phone-hint",
						className: "text-xs text-muted-foreground",
						children: selectedCountry ? `Enter your number without the ${selectedCountry.dial_code} code.` : "Choose your country, then enter your local number."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "signup-password",
						children: "Password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
						id: "signup-password",
						autoComplete: "new-password",
						disabled: isSubmitting,
						"aria-invalid": !!errors.password,
						"aria-describedby": "password-requirements",
						className: cn("transition-colors duration-200", errors.password && "border-destructive", showValid("password") && "border-success/60"),
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
						id: "password-requirements",
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, {
						id: "password-error",
						message: errors.password?.message
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "confirmPassword",
						children: "Confirm password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
						id: "confirmPassword",
						autoComplete: "new-password",
						disabled: isSubmitting,
						"aria-invalid": !!errors.confirmPassword,
						"aria-describedby": errors.confirmPassword ? "confirmPassword-error" : void 0,
						className: cn("transition-colors duration-200", errors.confirmPassword && "border-destructive", !errors.confirmPassword && !!confirmPassword && confirmPassword === password ? "border-success/60" : void 0),
						...register("confirmPassword", { onChange: () => {
							if (formState.submitCount > 0 || touchedFields.confirmPassword) form.trigger("confirmPassword");
						} })
					}),
					errors.confirmPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, {
						id: "confirmPassword-error",
						message: errors.confirmPassword.message
					}) : confirmPassword && confirmPassword === password ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-1.5 text-xs text-success",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-3.5",
							"aria-hidden": "true"
						}), " Passwords match"]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						id: "acceptTerms",
						checked: watch("acceptTerms"),
						disabled: isSubmitting,
						"aria-invalid": !!errors.acceptTerms,
						"aria-describedby": errors.acceptTerms ? "acceptTerms-error" : void 0,
						onCheckedChange: (checked) => setValue("acceptTerms", checked === true, {
							shouldValidate: formState.submitCount > 0,
							shouldTouch: true
						}),
						className: "mt-0.5"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "acceptTerms",
						className: "text-sm font-normal leading-relaxed",
						children: [
							"I agree to the",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/trust-and-safety",
								className: "font-medium text-primary underline",
								children: "Terms & Conditions"
							}),
							" ",
							"and",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/trust-and-safety",
								className: "font-medium text-primary underline",
								children: "Privacy Policy"
							}),
							"."
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldError, {
					id: "acceptTerms-error",
					message: errors.acceptTerms?.message
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				variant: "cta",
				className: "min-h-12 w-full text-base",
				disabled: isSubmitting,
				children: isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "size-4 animate-spin",
					"aria-hidden": "true"
				}), "Creating your account..."] }) : "Create account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-sm text-muted-foreground",
				children: [
					"Already have an account?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onSwitchToSignIn,
						className: "font-semibold text-primary underline",
						children: "Sign in"
					})
				]
			})
		] })]
	});
}
function AuthPage() {
	const navigate = useNavigate();
	const { session, loading: authLoading, refresh, roles } = useAuth();
	const isChildRoute = useChildMatches().length > 0;
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [pendingEmail, setPendingEmail] = (0, import_react.useState)(null);
	/**
	* Consume an email-verification token when the confirmation link lands here.
	*
	* The NestJS provider emails a link to `/auth?verify=<token>`; the app has to
	* complete verification by calling the API. (Under the Supabase provider no
	* such param arrives — it confirms on its own hosted page — so this stays
	* inert there.) Runs once on mount; the token is stripped from the URL so a
	* reload or a shared address cannot replay it.
	*/
	(0, import_react.useEffect)(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("verify");
		if (!token) return;
		params.delete("verify");
		const qs = params.toString();
		window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
		authClient.verifyEmail(token).then(({ error }) => {
			if (error) toast.error("This verification link has expired. Please sign in to request a new one.");
			else toast.success("Your email is verified. You can sign in now.");
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (isChildRoute) return;
		if (authLoading || !session) return;
		navigate({
			to: portalHome(roles),
			replace: true
		});
	}, [
		isChildRoute,
		authLoading,
		session,
		roles,
		navigate
	]);
	async function handleResend() {
		if (!pendingEmail) return;
		const { error } = await authClient.resend({
			type: "signup",
			email: pendingEmail
		});
		if (error) {
			toast.error("We couldn't resend the email right now. Please try again shortly.");
			return;
		}
		toast.success("A new verification email is on its way");
	}
	if (isChildRoute) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
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
					children: pendingEmail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
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
								children: "Confirm your email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 max-w-xs text-sm text-muted-foreground",
								children: [
									"We sent a verification link to",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-foreground",
										children: pendingEmail
									}),
									". Click the link in that email to finish setting up your account."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 w-full max-w-sm space-y-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "cta",
									className: "min-h-12 w-full",
									onClick: handleResend,
									children: "Resend verification email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-col items-center gap-3 text-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											setPendingEmail(null);
											setMode("signup");
										},
										className: "text-muted-foreground transition-colors hover:text-foreground",
										children: "Use a different email"
									})
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
								children: mode === "signin" ? "Welcome back" : "Create your account"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: mode === "signin" ? "Sign in to manage your lessons, bookings and payments." : "One account for parents, students, tutors and agencies."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								role: "tablist",
								"aria-label": "Authentication mode",
								className: "mt-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1",
								children: ["signin", "signup"].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									role: "tab",
									type: "button",
									"aria-selected": mode === value,
									onClick: () => setMode(value),
									className: cn("min-h-11 rounded-lg text-sm font-semibold transition-all duration-200", mode === value ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"),
									children: value === "signin" ? "Sign in" : "Create account"
								}, value))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6",
								children: mode === "signin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInForm, {
									onSuccess: async () => {
										await refresh();
										toast.success("Welcome back");
									},
									onSwitchToSignUp: () => setMode("signup")
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignUpForm, {
									onVerificationRequired: (email) => {
										setPendingEmail(email);
										toast.success("We sent a verification link to your email");
									},
									onSwitchToSignIn: () => setMode("signin")
								})
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSidePanel, {})]
			})
		})]
	});
}
//#endregion
export { AuthPage as component };
