import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { Ht as CircleCheck, O as Send, T as ShieldCheck, it as LoaderCircle, rn as Building2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { n as VERIFICATION_TONE, t as VERIFICATION_LABEL } from "./tutor-data-BgedrW1M.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { S as useSubmitAgencyVerification, a as useAgency, t as AgencyShell, w as useUpdateAgency } from "./AgencyShell-DfnQMswl.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError } from "./ui-bAhnOVkK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agency.profile-DoK7hVpH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY = {
	name: "",
	registrationNumber: "",
	countryCode: "",
	contactEmail: "",
	contactPhone: "",
	website: "",
	about: ""
};
function AgencyProfilePage() {
	const agency = useAgency();
	const update = useUpdateAgency();
	const submit = useSubmitAgencyVerification();
	const [form, setForm] = (0, import_react.useState)(EMPTY);
	(0, import_react.useEffect)(() => {
		const a = agency.data;
		if (!a) return;
		setForm({
			name: a.name ?? "",
			registrationNumber: a.registrationNumber ?? "",
			countryCode: a.countryCode ?? "",
			contactEmail: a.contactEmail ?? "",
			contactPhone: a.contactPhone ?? "",
			website: a.website ?? "",
			about: a.about ?? ""
		});
	}, [agency.data]);
	const status = agency.data?.verificationStatus;
	const canSubmit = status === "unverified" || status === "rejected";
	const steps = agency.data?.verificationSteps ?? [];
	function set(key, value) {
		setForm((prev) => ({
			...prev,
			[key]: value
		}));
	}
	async function handleSave(event) {
		event.preventDefault();
		if (form.name.trim().length < 2) {
			toast.error("Please enter your agency's name.");
			return;
		}
		try {
			await update.mutateAsync({
				name: form.name.trim(),
				registrationNumber: form.registrationNumber.trim() || null,
				countryCode: form.countryCode.trim().toUpperCase() || null,
				contactEmail: form.contactEmail.trim() || null,
				contactPhone: form.contactPhone.trim() || null,
				website: form.website.trim() || null,
				about: form.about.trim() || null
			});
			toast.success("Agency details saved");
		} catch (error) {
			toast.error(error.message || "We couldn't save those details.");
		}
	}
	async function handleSubmit() {
		if (!form.registrationNumber.trim()) {
			toast.error("Add your business registration number before submitting.");
			return;
		}
		try {
			await submit.mutateAsync();
			toast.success("Submitted — our team will review your agency.");
		} catch (error) {
			toast.error(error.message || "We couldn't submit your agency.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgencyShell, {
		title: "Agency profile",
		description: "How your agency appears to DiaLearn, and its verification.",
		children: agency.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
			rows: 2,
			height: "h-48"
		}) : agency.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
			message: agency.error.message || "We couldn't load your agency.",
			onRetry: () => void agency.refetch()
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				title: "Agency details",
				description: "Families see your agency's name on your tutors' profiles.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-4",
					onSubmit: (event) => void handleSave(event),
					noValidate: true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "agency-name",
								children: "Agency name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "agency-name",
								className: "min-h-11",
								value: form.name,
								onChange: (event) => set("name", event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "agency-reg",
										children: "Business registration number"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "agency-reg",
										className: "min-h-11",
										value: form.registrationNumber,
										onChange: (event) => set("registrationNumber", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "agency-country",
										children: "Country (2-letter code)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "agency-country",
										className: "min-h-11 uppercase",
										maxLength: 2,
										value: form.countryCode,
										onChange: (event) => set("countryCode", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "agency-email",
										children: "Contact email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "agency-email",
										type: "email",
										className: "min-h-11",
										value: form.contactEmail,
										onChange: (event) => set("contactEmail", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "agency-phone",
										children: "Contact phone"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "agency-phone",
										type: "tel",
										className: "min-h-11",
										value: form.contactPhone,
										onChange: (event) => set("contactPhone", event.target.value)
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "agency-web",
								children: "Website"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "agency-web",
								type: "url",
								placeholder: "https://",
								className: "min-h-11",
								value: form.website,
								onChange: (event) => set("website", event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "agency-about",
								children: "About your agency"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "agency-about",
								rows: 5,
								value: form.about,
								onChange: (event) => set("about", event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							variant: "cta",
							className: "min-h-11",
							disabled: update.isPending,
							children: [update.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Save details"]
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Verification",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, {
									className: "size-4 text-primary",
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("rounded-full px-2.5 py-1 text-xs font-semibold", status ? VERIFICATION_TONE[status] : ""),
									children: status ? VERIFICATION_LABEL[status] : "—"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-3",
								children: steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-xl border border-border bg-surface/60 p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-semibold",
												children: step.name
											}), step.status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold", VERIFICATION_TONE[step.status]),
												children: VERIFICATION_LABEL[step.status]
											}) : null]
										}),
										step.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: step.description
										}) : null,
										step.reviewer_notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: "Reviewer: "
											}), step.reviewer_notes]
										}) : null
									]
								}, step.id))
							}),
							canSubmit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "cta",
								className: "min-h-11 w-full",
								disabled: submit.isPending,
								onClick: () => void handleSubmit(),
								children: [submit.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), "Submit for verification"]
							}) : status === "verified" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-sm text-success",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), " Your agency is verified."]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-start gap-2 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-4 shrink-0" }), "Our team is reviewing your agency. We'll update this page when it's done."]
							})
						]
					})
				})
			})]
		})
	});
}
//#endregion
export { AgencyProfilePage as component };
