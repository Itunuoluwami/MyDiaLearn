import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { Ct as FileText, T as ShieldCheck, _ as Trash2, ln as BadgeCheck, p as Upload } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { C as useVerificationSteps, S as useVerificationProgress, _ as useTutorSummary, c as useDeleteTutorDocument, f as useSubmitVerification, h as useTutorRecord, l as useMyTutorSubjects, m as useTutorDocuments, n as VERIFICATION_TONE, o as useAvailabilityWindows, t as VERIFICATION_LABEL, x as useUploadTutorDocument } from "./tutor-data-BgedrW1M.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError } from "./ui-bAhnOVkK.mjs";
import { t as Progress } from "./progress-CmdFJCtB.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.verification-D2T4bQUF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MAX_FILE_BYTES = 10485760;
function TutorVerificationPage() {
	const tutor = useTutorRecord();
	useTutorSummary();
	const mySubjects = useMyTutorSubjects();
	const windows = useAvailabilityWindows();
	const steps = useVerificationSteps();
	const progress = useVerificationProgress();
	const documents = useTutorDocuments();
	const upload = useUploadTutorDocument();
	const removeDoc = useDeleteTutorDocument();
	const submit = useSubmitVerification();
	const [stepId, setStepId] = (0, import_react.useState)("");
	const [label, setLabel] = (0, import_react.useState)("");
	const fileRef = (0, import_react.useRef)(null);
	const record = tutor.data;
	const stepList = steps.data ?? [];
	const docs = documents.data ?? [];
	const progressByStep = (0, import_react.useMemo)(() => new Map((progress.data ?? []).map((row) => [row.step_id, row])), [progress.data]);
	const requiredSteps = stepList.filter((step) => step.is_required);
	const coveredRequired = requiredSteps.filter((step) => docs.some((doc) => doc.step_id === step.id)).length;
	const completion = requiredSteps.length ? Math.round(coveredRequired / requiredSteps.length * 100) : 0;
	/**
	* What the tutor must have before DiaLearn will look at them.
	*
	* This used to gate on `profile_complete`, which also requires an hourly
	* rate — and the rate is not the tutor's to set. The profile screen disables
	* that field and says DiaLearn sets it as part of verification, while the
	* admin queue only lists tutors who have left `unverified`. So every new
	* tutor was deadlocked: no rate until an admin sets one, no admin sees them
	* until they submit, no submitting until there is a rate.
	*
	* `tutor_submit_verification()` — the actual rule — asks for none of that. It
	* only refuses when the tutor is already verified, suspended or in review. So
	* the button now checks what the tutor genuinely owns and what the reviewers
	* need to see: a biography, a subject, availability, and the required
	* documents.
	*/
	const readyToReview = Boolean(record?.biography && record.biography.trim().length > 40) && (mySubjects.data ?? []).length > 0 && (windows.data ?? []).some((w) => w.is_active);
	const canSubmit = Boolean(record) && ["unverified", "rejected"].includes(record?.verification_status ?? "") && coveredRequired === requiredSteps.length && requiredSteps.length > 0 && readyToReview;
	async function handleUpload() {
		const file = fileRef.current?.files?.[0];
		if (!file) {
			toast.error("Choose a file to upload.");
			return;
		}
		if (file.size > MAX_FILE_BYTES) {
			toast.error("Files must be 10MB or smaller.");
			return;
		}
		const cleanLabel = label.trim();
		if (cleanLabel.length < 3 || cleanLabel.length > 120) {
			toast.error("Give the document a short name (3–120 characters).");
			return;
		}
		try {
			await upload.mutateAsync({
				file,
				label: cleanLabel,
				stepId: stepId || null
			});
			setLabel("");
			setStepId("");
			if (fileRef.current) fileRef.current.value = "";
			toast.success("Document uploaded");
		} catch {
			toast.error("We couldn't upload that document.");
		}
	}
	async function handleSubmit() {
		try {
			await submit.mutateAsync();
			toast.success("Submitted — our team will review your documents.");
		} catch {
			toast.error("We couldn't submit your verification.");
		}
	}
	if (tutor.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Verification",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
			rows: 3,
			height: "h-32"
		})
	});
	if (tutor.isError || !record) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Verification",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
			message: "We couldn't load your verification status right now.",
			onRetry: () => void tutor.refetch()
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Verification",
		description: "Trust is the product. Every tutor is reviewed by the DiaLearn team before families can book them.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-4xl space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-border bg-card p-5 shadow-soft md:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
										children: "Current status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1.5 flex items-center gap-2 text-lg font-semibold",
										children: [record.verification_status === "verified" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-5 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5 text-primary" }), VERIFICATION_LABEL[record.verification_status]]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 max-w-lg text-sm text-muted-foreground",
										children: record.verification_status === "verified" ? "You're verified. Control whether you appear in tutor search from your teaching profile." : record.verification_status === "pending" || record.verification_status === "in_review" ? "Your documents are with our review team. We'll notify you as soon as there's a decision." : record.verification_status === "suspended" ? "Your account is suspended. Please contact the DiaLearn team." : "Upload the required documents below, then submit for review. Your profile stays private until you're approved."
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("rounded-full px-3 py-1.5 text-xs font-semibold", VERIFICATION_TONE[record.verification_status]),
								children: VERIFICATION_LABEL[record.verification_status]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: completion,
								className: "h-2 min-w-40 flex-1"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-semibold tabular-nums",
								children: [
									coveredRequired,
									"/",
									requiredSteps.length,
									" required"
								]
							})]
						}),
						!readyToReview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 rounded-xl bg-secondary-soft/70 p-3 text-xs text-muted-foreground",
							children: [
								"Add your biography, subjects and availability before submitting.",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/tutor/profile",
									className: "font-semibold text-primary-deep underline",
									children: "Open teaching profile"
								})
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "cta",
								className: "min-h-11",
								disabled: !canSubmit || submit.isPending,
								onClick: () => void handleSubmit(),
								children: "Submit for review"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								className: "min-h-11",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/tutor/profile",
									children: "Edit teaching profile"
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Required steps",
					description: "Verification steps are defined by DiaLearn and can change over time.",
					children: steps.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
						rows: 3,
						height: "h-16"
					}) : steps.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
						message: "We couldn't load the verification steps.",
						onRetry: () => void steps.refetch()
					}) : stepList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No verification steps are configured yet. Please check back shortly."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-3",
						children: stepList.map((step) => {
							const stepDocs = docs.filter((doc) => doc.step_id === step.id);
							const state = progressByStep.get(step.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-xl border border-border bg-card p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-sm font-semibold",
												children: [step.name, step.is_required ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-2 text-xs font-normal text-muted-foreground",
													children: "Optional"
												})]
											}), step.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: step.description
											}) : null]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("rounded-full px-2.5 py-1 text-xs font-semibold", VERIFICATION_TONE[state?.status ?? (stepDocs.length ? "pending" : "unverified")]),
											children: VERIFICATION_LABEL[state?.status ?? (stepDocs.length ? "pending" : "unverified")]
										})]
									}),
									state?.reviewer_notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 rounded-lg bg-surface/70 p-3 text-xs text-muted-foreground",
										children: ["Reviewer note: ", state.reviewer_notes]
									}) : null,
									stepDocs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-xs text-muted-foreground",
										children: [
											stepDocs.length,
											" ",
											stepDocs.length === 1 ? "document" : "documents",
											" ",
											"attached"
										]
									}) : null
								]
							}, step.id);
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
					title: "Upload a document",
					description: "Stored privately. Only you and the DiaLearn review team can open your files.",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "doc-step",
									children: "Verification step"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: stepId,
									onValueChange: setStepId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "doc-step",
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a step" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: stepList.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: step.id,
										children: step.name
									}, step.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "doc-label",
									children: "Document name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "doc-label",
									className: "min-h-11",
									maxLength: 120,
									placeholder: "Passport data page",
									value: label,
									onChange: (event) => setLabel(event.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "doc-file",
									children: "File (PDF or image, max 10MB)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "doc-file",
									ref: fileRef,
									type: "file",
									className: "min-h-11",
									accept: "application/pdf,image/png,image/jpeg,image/webp"
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "cta",
						className: "mt-4 min-h-11",
						disabled: upload.isPending,
						onClick: () => void handleUpload(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), " Upload document"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Your documents",
					children: documents.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
						rows: 2,
						height: "h-16"
					}) : documents.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
						message: "We couldn't load your documents.",
						onRetry: () => void documents.refetch()
					}) : docs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Nothing uploaded yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: docs.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-deep",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-semibold",
										children: doc.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [VERIFICATION_LABEL[doc.status], doc.size_bytes ? ` · ${(doc.size_bytes / 1024 / 1024).toFixed(2)} MB` : ""]
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": `Delete ${doc.label}`,
								className: "size-11 shrink-0 sm:size-9",
								disabled: removeDoc.isPending || record.verification_status === "verified",
								onClick: () => void removeDoc.mutateAsync({
									id: doc.id,
									storage_path: doc.storage_path
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						}, doc.id))
					})
				})
			]
		})
	});
}
//#endregion
export { TutorVerificationPage as component };
