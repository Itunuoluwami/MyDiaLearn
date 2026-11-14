import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { it as LoaderCircle } from "../_libs/lucide-react.mjs";
import { i as apiPatch, r as apiGet } from "./data-client-kVSxwzg_.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useRedirectToPortalHome, t as PortalShell } from "./PortalShell-BYbUJZ2R.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-BzMt8rwY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountPage() {
	useRedirectToPortalHome();
	const { profile, permissions, refresh, user } = useAuth();
	const queryClient = useQueryClient();
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
		queryFn: async () => {
			return (await apiGet("/catalogue/currencies")).map(({ code, name, symbol }) => ({
				code,
				name,
				symbol
			}));
		}
	});
	const { data: permissionCatalog } = useQuery({
		queryKey: ["permission-catalog"],
		queryFn: async () => {
			return apiGet("/users/permissions/catalog");
		}
	});
	const save = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Not signed in");
			await apiPatch("/users/me", {
				...fullName ? { fullName } : {},
				...phone ? { phone } : {},
				...countryCode ? { countryCode } : {},
				timezone,
				preferredCurrency: currency,
				onboardingCompleted: true
			});
		},
		onSuccess: async () => {
			await refresh();
			await queryClient.invalidateQueries();
			toast.success("Profile updated");
		},
		onError: (error) => toast.error(error.message)
	});
	const timezones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["UTC"];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "My account",
		description: "Your details, timezone and account permissions.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "card-warm p-4 md:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold",
					children: "Profile"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 grid gap-4 sm:grid-cols-2",
					onSubmit: (event) => {
						event.preventDefault();
						save.mutate();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "full-name",
								children: "Full name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "full-name",
								value: fullName,
								onChange: (e) => setFullName(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "email",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "email",
								value: profile?.email ?? "",
								readOnly: true,
								disabled: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "phone",
								children: "Phone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "phone",
								value: phone,
								onChange: (e) => setPhone(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "country",
								children: "Country code"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "country",
								placeholder: "GB",
								maxLength: 2,
								value: countryCode,
								onChange: (e) => setCountryCode(e.target.value.toUpperCase())
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "currency",
								children: "Preferred currency"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: currency,
								onValueChange: setCurrency,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "currency",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select currency" })
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "timezone",
								children: "Timezone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: timezone,
								onValueChange: setTimezone,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "timezone",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select timezone" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
									className: "max-h-72",
									children: timezones.map((zone) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: zone,
										children: zone
									}, zone))
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: save.isPending,
								children: [save.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Save changes"]
							})
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "card-warm h-fit p-4 md:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold",
						children: "What you can do"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Permissions come from your account type and are configured by DiaLearn admins."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-2",
						children: permissions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-sm text-muted-foreground",
							children: "No permissions assigned yet."
						}) : permissions.map((key) => {
							const meta = permissionCatalog?.find((item) => item.key === key);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start justify-between gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: meta?.label ?? key }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "shrink-0 capitalize",
									children: meta?.category ?? "general"
								})]
							}, key);
						})
					})
				]
			})]
		})
	});
}
//#endregion
export { AccountPage as component };
