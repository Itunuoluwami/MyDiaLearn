import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { Bt as CircleX, Ct as FileText, E as ShieldAlert, Ht as CircleCheck, M as Save, T as ShieldCheck, it as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { N as useVerificationQueue, O as useSetTutorHourlyRate, g as useDocumentUrl, j as useTutorVerificationDetail, m as useApproveTutor, w as useReviewTutorDocument, x as useRejectTutor } from "./admin-data-uZ6jnAG3.mjs";
import { n as VERIFICATION_TONE, t as VERIFICATION_LABEL } from "./tutor-data-BgedrW1M.mjs";
import { s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-CAdlRg97.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.verification-BuaoiVId.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var QUEUE_FILTERS = [
	{
		value: "pending",
		label: "Pending"
	},
	{
		value: "in_review",
		label: "In review"
	},
	{
		value: "verified",
		label: "Verified"
	},
	{
		value: "rejected",
		label: "Rejected"
	},
	{
		value: "all",
		label: "All submitted"
	}
];
function DocumentRow({ document }) {
	const getUrl = useDocumentUrl();
	const review = useReviewTutorDocument();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm font-medium",
					children: document.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: document.mime_type ?? "file"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: cn(VERIFICATION_TONE[document.status]),
					children: VERIFICATION_LABEL[document.status]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					disabled: getUrl.isPending,
					onClick: () => getUrl.mutate(document.storage_path, {
						onSuccess: (url) => window.open(url, "_blank", "noopener,noreferrer"),
						onError: (error) => toast.error(error.message)
					}),
					children: [getUrl.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "View"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					disabled: review.isPending || document.status === "verified",
					onClick: () => review.mutate({
						documentId: document.id,
						status: "verified"
					}),
					children: "Mark reviewed"
				})
			]
		})]
	});
}
function HourlyRateEditor({ tutor }) {
	const setRate = useSetTutorHourlyRate();
	const [draft, setDraft] = (0, import_react.useState)(tutor.hourly_rate === null ? "" : String(tutor.hourly_rate));
	(0, import_react.useEffect)(() => {
		setDraft(tutor.hourly_rate === null ? "" : String(tutor.hourly_rate));
	}, [tutor.id, tutor.hourly_rate]);
	const dirty = draft !== (tutor.hourly_rate === null ? "" : String(tutor.hourly_rate));
	function handleSave() {
		const value = Number(draft);
		if (!Number.isFinite(value) || value <= 0) {
			toast.error("Enter a valid hourly rate.");
			return;
		}
		setRate.mutate({
			tutorId: tutor.id,
			hourlyRate: value
		}, {
			onSuccess: () => toast.success("Hourly rate updated"),
			onError: (error) => toast.error(error.message)
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-surface/50 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
			htmlFor: "tutor-hourly-rate",
			className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
			children: [
				"Hourly rate (",
				tutor.currency ?? "USD",
				") — set by DiaLearn, tutors can't edit this"
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "tutor-hourly-rate",
					type: "number",
					min: 0,
					step: "0.01",
					className: "w-32",
					value: draft,
					onChange: (event) => setDraft(event.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					disabled: !dirty || setRate.isPending,
					onClick: handleSave,
					children: [setRate.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), "Save rate"]
				}),
				tutor.hourly_rate !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: [
						"Currently ",
						formatMoney(tutor.hourly_rate, tutor.currency ?? "USD"),
						"/hr"
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-warning",
					children: "Not set yet — this tutor can't be booked until it is."
				})
			]
		})]
	});
}
function QueueDetail({ tutor }) {
	const detail = useTutorVerificationDetail(tutor.id);
	const approve = useApproveTutor();
	const reject = useRejectTutor();
	const [rejectOpen, setRejectOpen] = (0, import_react.useState)(false);
	const profile = tutor.profiles;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel-portal p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold",
						children: profile?.full_name ?? "Tutor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: profile?.email
					}),
					tutor.headline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: tutor.headline
					}) : null
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: cn(VERIFICATION_TONE[tutor.verification_status]),
					children: VERIFICATION_LABEL[tutor.verification_status]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HourlyRateEditor, { tutor })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Verification steps"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 space-y-2",
					children: [(detail.data?.steps ?? []).map((step) => {
						const status = (detail.data?.progress ?? []).find((p) => p.step_id === step.id)?.status ?? "unverified";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-md border border-border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-medium",
								children: [step.name, step.is_required ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 text-xs text-destructive",
									children: "*"
								}) : null]
							}), step.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: step.description
							}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: cn(VERIFICATION_TONE[status]),
								children: VERIFICATION_LABEL[status]
							})]
						}, step.id);
					}), detail.data && detail.data.steps.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No verification steps configured yet."
					}) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Submitted documents"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 space-y-2",
					children: [(detail.data?.documents ?? []).map((document) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentRow, { document }, document.id)), detail.data && detail.data.documents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No documents submitted yet."
					}) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, {
					open: rejectOpen,
					onOpenChange: setRejectOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "text-destructive",
						onClick: () => setRejectOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4" }), "Reject"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Reject this tutor's verification?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [profile?.full_name ?? "This tutor", " will stay hidden from search until they resubmit and are re-reviewed."] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
						onClick: () => {
							reject.mutate({ tutorId: tutor.id }, {
								onSuccess: () => toast.success("Verification rejected"),
								onError: (error) => toast.error(error.message)
							});
						},
						children: "Reject verification"
					})] })] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: approve.isPending,
					onClick: () => approve.mutate(tutor.id, {
						onSuccess: () => toast.success("Tutor verified and listed"),
						onError: (error) => toast.error(error.message)
					}),
					children: [approve.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), "Approve & list"]
				})]
			})
		]
	});
}
function AdminVerificationPage() {
	const { hasPermission, loading } = useAuth();
	const [filter, setFilter] = (0, import_react.useState)("pending");
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const queue = useVerificationQueue(filter);
	const selected = (queue.data ?? []).find((item) => item.id === selectedId) ?? (queue.data ?? [])[0] ?? null;
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Tutor verification",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!hasPermission("admin.verification")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Tutor verification",
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
		title: "Tutor verification",
		description: "Every tutor stays unlisted until qualifications and identity documents are reviewed here.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-[20rem_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-portal p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: filter,
					onValueChange: (value) => setFilter(value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: QUEUE_FILTERS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: option.value,
						children: option.label
					}, option.value)) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-2",
					children: queue.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Loading…"
					}) : (queue.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Nothing in this queue."
					}) : (queue.data ?? []).map((item) => {
						const profile = item.profiles;
						const active = selected?.id === item.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSelectedId(item.id),
							className: cn("focus-ring flex w-full flex-col gap-1 rounded-md border p-3 text-left text-sm transition-colors", active ? "border-primary bg-primary-soft" : "border-border hover:bg-surface"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: profile?.full_name ?? "Tutor"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: profile?.email
								}),
								item.agency_name ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: ["Agency: ", item.agency_name]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: cn("mt-1 w-fit", VERIFICATION_TONE[item.verification_status]),
									children: VERIFICATION_LABEL[item.verification_status]
								})
							]
						}, item.id);
					})
				})]
			}), selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueueDetail, { tutor: selected }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-portal flex flex-col items-center justify-center gap-2 p-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-8 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Select a tutor from the queue to review."
				})]
			})]
		})
	});
}
//#endregion
export { AdminVerificationPage as component };
