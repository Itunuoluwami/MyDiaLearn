import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { Bt as CircleX, E as ShieldAlert, Ht as CircleCheck, it as LoaderCircle, rn as Building2 } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { C as useReviewAgencyStep, T as useSetAgencyShare, h as useDecideAgency, n as useAdminAgencies, r as useAdminAgency } from "./admin-data-uZ6jnAG3.mjs";
import { n as VERIFICATION_TONE, t as VERIFICATION_LABEL } from "./tutor-data-BgedrW1M.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.agencies-BZdMgx7q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FILTERS = [
	{
		value: "pending",
		label: "Awaiting review"
	},
	{
		value: "verified",
		label: "Verified"
	},
	{
		value: "rejected",
		label: "Needs changes"
	},
	{
		value: "suspended",
		label: "Suspended"
	},
	{
		value: "unverified",
		label: "Not submitted"
	},
	{
		value: "all",
		label: "All agencies"
	}
];
function AgencyReview({ agencyId, canSetShare }) {
	const detail = useAdminAgency(agencyId);
	const reviewStep = useReviewAgencyStep();
	const decide = useDecideAgency();
	const setShare = useSetAgencyShare();
	const [notes, setNotes] = (0, import_react.useState)({});
	const [share, setShareValue] = (0, import_react.useState)("");
	const [reason, setReason] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (detail.data) setShareValue(String(Number(detail.data.agency.revenue_share_percentage)));
	}, [detail.data]);
	if (detail.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Loading…"
	});
	if (detail.isError || !detail.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-destructive",
		children: "We couldn't load this agency."
	});
	const { agency, steps, tutors } = detail.data;
	async function step(stepId, status) {
		try {
			await reviewStep.mutateAsync({
				agencyId,
				stepId,
				status,
				reviewerNotes: notes[stepId] ?? null
			});
			toast.success("Step updated");
		} catch (error) {
			toast.error(error.message || "We couldn't update that step.");
		}
	}
	async function decision(status) {
		try {
			await decide.mutateAsync({
				agencyId,
				status,
				...reason.trim() ? { reason: reason.trim() } : {}
			});
			toast.success(status === "verified" ? "Agency verified — its verified tutors are now listed." : status === "rejected" ? "Agency sent back for changes." : "Agency suspended — its tutors are unlisted.");
			setReason("");
		} catch (error) {
			toast.error(error.message || "We couldn't record that decision.");
		}
	}
	async function saveShare() {
		const value = Number(share);
		if (!Number.isFinite(value) || value < 0 || value > 100) {
			toast.error("Enter a percentage between 0 and 100.");
			return;
		}
		try {
			await setShare.mutateAsync({
				agencyId,
				revenueSharePercentage: value
			});
			toast.success("Agency share updated for future payments.");
		} catch (error) {
			toast.error(error.message || "We couldn't update the share.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-portal p-4 md:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold",
							children: agency.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								agency.owner_name,
								" · ",
								agency.owner_email
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							className: cn(VERIFICATION_TONE[agency.verification_status]),
							children: VERIFICATION_LABEL[agency.verification_status]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid gap-3 text-sm sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted-foreground",
								children: "Registration number"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-medium",
								children: agency.registration_number ?? "—"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted-foreground",
								children: "Country"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-medium",
								children: agency.country_code ?? "—"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted-foreground",
								children: "Contact"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "font-medium",
								children: [agency.contact_email ?? "—", agency.contact_phone ? ` · ${agency.contact_phone}` : ""]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted-foreground",
								children: "Website"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "truncate font-medium",
								children: agency.website ?? "—"
							})] })
						]
					}),
					agency.about ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: agency.about
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-portal p-4 md:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-semibold",
					children: "Verification steps"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-3",
					children: steps.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-md border border-border p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: s.name
								}), s.status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: cn(VERIFICATION_TONE[s.status]),
									children: VERIFICATION_LABEL[s.status]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Not submitted"
								})]
							}),
							s.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: s.description
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								className: "mt-2",
								rows: 2,
								placeholder: "Notes for the agency (optional)",
								value: notes[s.id] ?? s.reviewer_notes ?? "",
								onChange: (event) => setNotes((prev) => ({
									...prev,
									[s.id]: event.target.value
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									disabled: reviewStep.isPending,
									onClick: () => void step(s.id, "verified"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), " Approve step"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									disabled: reviewStep.isPending,
									onClick: () => void step(s.id, "rejected"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4" }), " Needs changes"]
								})]
							})
						]
					}, s.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-portal p-4 md:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-semibold",
						children: "Decision"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Verifying lists the agency's already-verified tutors; rejecting or suspending unlists them."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						className: "mt-3",
						rows: 2,
						placeholder: "Reason (optional, recorded in the audit log)",
						value: reason,
						onChange: (event) => setReason(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "cta",
								disabled: decide.isPending || agency.verification_status === "verified",
								onClick: () => void decision("verified"),
								children: [decide.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Verify agency"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								disabled: decide.isPending,
								onClick: () => void decision("rejected"),
								children: "Send back for changes"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								disabled: decide.isPending || agency.verification_status === "suspended",
								onClick: () => void decision("suspended"),
								children: "Suspend"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-portal p-4 md:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-semibold",
						children: "Agency share"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "The percentage of each tutor's earnings (after DiaLearn's commission) paid to the agency, from the agency agreement. Applies to payments made from now on."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "share",
								children: "Share (%)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "share",
								inputMode: "decimal",
								className: "w-32",
								value: share,
								disabled: !canSetShare,
								onChange: (event) => setShareValue(event.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							disabled: !canSetShare || setShare.isPending,
							onClick: () => void saveShare(),
							children: "Save share"
						})]
					}),
					!canSetShare ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: "Changing the share needs the platform settings permission."
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-portal p-4 md:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "text-base font-semibold",
						children: [
							"Tutors (",
							tutors.length,
							")"
						]
					}),
					tutors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "No tutors added yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 divide-y divide-border",
						children: tutors.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-2 py-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: t.full_name ?? "Tutor"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [" · ", t.email]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: cn(VERIFICATION_TONE[t.verification_status]),
								children: t.is_listed ? "Listed" : VERIFICATION_LABEL[t.verification_status]
							})]
						}, t.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: "Review each tutor's own documents in Tutor verification."
					})
				]
			})
		]
	});
}
function AdminAgenciesPage() {
	const { hasPermission, loading } = useAuth();
	const [filter, setFilter] = (0, import_react.useState)("pending");
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const agencies = useAdminAgencies(filter);
	const rows = agencies.data ?? [];
	const selected = rows.find((row) => row.id === selectedId) ?? rows[0] ?? null;
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Agencies",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!hasPermission("admin.verification")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Agencies",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-warm flex items-start gap-3 p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: "Admin access required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Your account type doesn't include verification review permissions."
			})] })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Agencies",
		description: "Tutoring agencies are verified here before any of their tutors can be listed.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-[20rem_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-portal p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: filter,
					onValueChange: (value) => setFilter(value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: FILTERS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: option.value,
						children: option.label
					}, option.value)) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-2",
					children: agencies.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Loading…"
					}) : agencies.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-destructive",
						children: agencies.error.message
					}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Nothing in this queue."
					}) : rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSelectedId(row.id),
						className: cn("focus-ring flex w-full flex-col gap-1 rounded-md border p-3 text-left text-sm transition-colors", selected?.id === row.id ? "border-primary bg-primary-soft" : "border-border hover:bg-surface"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: row.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [
									row.tutor_count,
									" tutor",
									row.tutor_count === 1 ? "" : "s",
									" ·",
									" ",
									Number(row.revenue_share_percentage),
									"% share"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: cn("mt-1 w-fit", VERIFICATION_TONE[row.verification_status]),
								children: VERIFICATION_LABEL[row.verification_status]
							})
						]
					}, row.id))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgencyReview, {
				agencyId: selected.id,
				canSetShare: hasPermission("admin.settings")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-portal flex flex-col items-center p-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-8 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "Select an agency to review."
				})]
			}) })]
		})
	});
}
//#endregion
export { AdminAgenciesPage as component };
