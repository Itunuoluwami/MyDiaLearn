import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { i as authClient } from "./auth-DVJYIAuV.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { M as Save, T as ShieldCheck, ft as KeyRound, it as LoaderCircle } from "../_libs/lucide-react.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as apiPatch, r as apiGet } from "./data-client-kVSxwzg_.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { l as SectionCard } from "./ui-bAhnOVkK.mjs";
import { t as ParentShell } from "./ParentShell-C4Q6P4BE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BkNI-3SJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const { profile, user, roles, refresh, loading } = useAuth();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (loading) return;
		if (roles.includes("tutor") && !roles.includes("parent")) navigate({
			to: "/tutor/settings",
			replace: true
		});
	}, [
		loading,
		roles,
		navigate
	]);
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [countryCode, setCountryCode] = (0, import_react.useState)("");
	const [timezone, setTimezone] = (0, import_react.useState)("UTC");
	const [currency, setCurrency] = (0, import_react.useState)("USD");
	(0, import_react.useEffect)(() => {
		if (!profile) return;
		setFullName(profile.full_name ?? "");
		setPhone(profile.phone ?? "");
		setCountryCode(profile.country_code ?? "");
		setTimezone(profile.timezone);
		setCurrency(profile.preferred_currency);
	}, [profile]);
	const { data: currencies } = useQuery({
		queryKey: ["currencies"],
		staleTime: 3e5,
		queryFn: async () => {
			return (await apiGet("/catalogue/currencies")).map(({ code, name, symbol }) => ({
				code,
				name,
				symbol
			}));
		}
	});
	const timezones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["UTC"];
	const save = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("You need to be signed in.");
			await apiPatch("/users/me", {
				...fullName ? { fullName } : {},
				...phone ? { phone } : {},
				...countryCode ? { countryCode } : {},
				timezone,
				preferredCurrency: currency
			});
		},
		onSuccess: async () => {
			await refresh();
			await queryClient.invalidateQueries();
			toast.success("Settings saved");
		},
		onError: () => toast.error("We couldn't save your settings. Please try again.")
	});
	const resetPassword = useMutation({
		mutationFn: async () => {
			if (!profile?.email) throw new Error("No email on this account.");
			const { error } = await authClient.resetPasswordForEmail(profile.email, { redirectTo: `${window.location.origin}/auth` });
			if (error) throw error;
		},
		onSuccess: () => toast.success("Password reset link sent to your email."),
		onError: () => toast.error("We couldn't send the reset link. Please try again.")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentShell, {
		title: "Settings",
		description: "Your profile, preferences and account security.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Profile",
					description: "Used on bookings and messages with tutors.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-4 sm:grid-cols-2",
						onSubmit: (event) => {
							event.preventDefault();
							save.mutate();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "s-name",
									children: "Full name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "s-name",
									className: "min-h-11",
									value: fullName,
									onChange: (event) => setFullName(event.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "s-email",
									children: "Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "s-email",
									className: "min-h-11",
									value: profile?.email ?? "",
									disabled: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "s-phone",
									children: "Phone"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "s-phone",
									className: "min-h-11",
									value: phone,
									onChange: (event) => setPhone(event.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "s-country",
									children: "Country code"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "s-country",
									className: "min-h-11",
									value: countryCode,
									onChange: (event) => setCountryCode(event.target.value.toUpperCase()),
									maxLength: 2
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "s-timezone",
									children: "Timezone"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: timezone,
									onValueChange: setTimezone,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "s-timezone",
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
										className: "max-h-72",
										children: timezones.map((zone) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: zone,
											children: zone
										}, zone))
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "s-currency",
									children: "Preferred currency"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: currency,
									onValueChange: setCurrency,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "s-currency",
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (currencies ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: item.code,
										children: [
											item.symbol,
											" ",
											item.code,
											" — ",
											item.name
										]
									}, item.code)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sm:col-span-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									variant: "cta",
									className: "min-h-12 w-full sm:w-auto",
									disabled: save.isPending,
									children: [save.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), "Save changes"]
								})
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Security",
					description: "Password resets are sent to your email address.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "min-h-12",
						disabled: resetPassword.isPending,
						onClick: () => resetPassword.mutate(),
						children: [resetPassword.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" }), "Send password reset link"]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "space-y-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Account",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: roles.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "capitalize",
								children: role
							}, role))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-start gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
								className: "mt-0.5 size-3.5 shrink-0",
								"aria-hidden": "true"
							}), "Currency and timezone shape how prices and class times are shown to you across DiaLearn."]
						})]
					})
				})
			})]
		})
	});
}
//#endregion
export { SettingsPage as component };
