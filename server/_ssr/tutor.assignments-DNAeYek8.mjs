import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { O as Send, R as Plus, Rt as ClipboardList } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-Drj9JKn2.mjs";
import { g as useTutorStudents } from "./tutor-data-BgedrW1M.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { c as formatRelative, w as useSubjectOptions } from "./parent-data-Dj0LJH5W.mjs";
import { n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { g as useLearningResources, k as useUpdateAssignment, n as ASSIGNMENT_TONE, s as useAssignments, t as ASSIGNMENT_LABEL, u as useCreateAssignment } from "./tutor-workspace-DMY2LNJP.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.assignments-DNAeYek8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUSES = [
	"draft",
	"assigned",
	"submitted",
	"reviewed"
];
function TutorAssignmentsPage() {
	const assignments = useAssignments();
	const create = useCreateAssignment();
	const update = useUpdateAssignment();
	const students = useTutorStudents();
	const subjects = useSubjectOptions();
	const resources = useLearningResources();
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [active, setActive] = (0, import_react.useState)(null);
	const [feedback, setFeedback] = (0, import_react.useState)("");
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		instructions: "",
		submissionRequirements: "",
		studentId: "",
		subjectId: "",
		resourceId: "",
		dueAt: ""
	});
	const rows = assignments.data ?? [];
	const filtered = (0, import_react.useMemo)(() => filter === "all" ? rows : rows.filter((row) => row.status === filter), [rows, filter]);
	async function handleCreate(assignNow) {
		if (!form.title.trim() || !form.studentId) {
			toast.error("Add a title and choose a learner.");
			return;
		}
		try {
			await create.mutateAsync({
				title: form.title.trim(),
				instructions: form.instructions.trim() || null,
				submissionRequirements: form.submissionRequirements.trim() || null,
				studentId: form.studentId,
				subjectId: form.subjectId || null,
				resourceId: form.resourceId || null,
				dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
				assignNow
			});
			toast.success(assignNow ? "Assignment sent to the learner" : "Draft saved");
			setOpen(false);
			setForm({
				title: "",
				instructions: "",
				submissionRequirements: "",
				studentId: "",
				subjectId: "",
				resourceId: "",
				dueAt: ""
			});
		} catch {
			toast.error("We couldn't save that assignment.");
		}
	}
	async function assignNow(row) {
		try {
			await update.mutateAsync({
				id: row.id,
				patch: { status: "assigned" }
			});
			toast.success("Assignment sent");
		} catch {
			toast.error("We couldn't send that assignment.");
		}
	}
	async function saveFeedback() {
		if (!active) return;
		try {
			await update.mutateAsync({
				id: active.id,
				patch: {
					feedback: feedback.trim() || null,
					status: "reviewed"
				}
			});
			toast.success("Feedback shared with the learner");
			setActive(null);
			setFeedback("");
		} catch {
			toast.error("We couldn't save that feedback.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TutorShell, {
		title: "Assignments",
		description: "Set homework, follow submissions and give feedback.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
			open,
			onOpenChange: setOpen,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "cta",
					className: "min-h-11 sm:min-h-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New assignment"]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-h-[90vh] overflow-y-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New assignment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Learners and their guardians are notified when you assign it." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "assignment-title",
									children: "Title"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "assignment-title",
									className: "min-h-11",
									value: form.title,
									onChange: (event) => setForm((prev) => ({
										...prev,
										title: event.target.value
									})),
									placeholder: "Quadratic equations — practice set"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "assignment-student",
									children: "Learner"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.studentId,
									onValueChange: (value) => setForm((prev) => ({
										...prev,
										studentId: value
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "assignment-student",
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a learner" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (students.data ?? []).map((student) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: student.student_id,
										children: student.first_name
									}, student.student_id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "assignment-subject",
										children: "Subject (optional)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.subjectId,
										onValueChange: (value) => setForm((prev) => ({
											...prev,
											subjectId: value
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											id: "assignment-subject",
											className: "min-h-11",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any subject" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (subjects.data ?? []).map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: subject.id,
											children: subject.name
										}, subject.id)) })]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "assignment-due",
										children: "Due (optional)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "assignment-due",
										type: "datetime-local",
										className: "min-h-11",
										value: form.dueAt,
										onChange: (event) => setForm((prev) => ({
											...prev,
											dueAt: event.target.value
										}))
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "assignment-resource",
									children: "Attach material (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.resourceId,
									onValueChange: (value) => setForm((prev) => ({
										...prev,
										resourceId: value
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "assignment-resource",
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "No attachment" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (resources.data ?? []).map((resource) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: resource.id,
										children: resource.title
									}, resource.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "assignment-instructions",
									children: "Instructions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "assignment-instructions",
									rows: 3,
									value: form.instructions,
									onChange: (event) => setForm((prev) => ({
										...prev,
										instructions: event.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "assignment-requirements",
									children: "What to submit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "assignment-requirements",
									rows: 2,
									value: form.submissionRequirements,
									onChange: (event) => setForm((prev) => ({
										...prev,
										submissionRequirements: event.target.value
									})),
									placeholder: "Photos of your working, or a typed answer."
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "min-h-11 sm:min-h-10",
							disabled: create.isPending,
							onClick: () => void handleCreate(false),
							children: "Save draft"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "cta",
							className: "min-h-11 sm:min-h-10",
							disabled: create.isPending,
							onClick: () => void handleCreate(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), " Assign now"]
						})]
					})
				]
			})]
		}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-5xl space-y-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: filter,
				onValueChange: (value) => setFilter(value),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "w-full justify-start overflow-x-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "all",
						className: "min-h-11",
						children: "All"
					}), STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: status,
						className: "min-h-11",
						children: ASSIGNMENT_LABEL[status]
					}, status))]
				})
			}), assignments.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 4,
				height: "h-28"
			}) : assignments.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't load your assignments.",
				onRetry: () => void assignments.refetch()
			}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
				icon: ClipboardList,
				title: "No assignments here",
				body: "Set homework after a lesson to keep learners practising between classes."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: filtered.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "truncate text-sm font-semibold md:text-base",
									children: row.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 text-xs text-muted-foreground",
									children: [
										row.students?.first_name ?? "Learner",
										row.subjects?.name ? ` · ${row.subjects.name}` : "",
										row.due_at ? ` · due ${formatRelative(row.due_at)}` : ""
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", ASSIGNMENT_TONE[row.status]),
								children: ASSIGNMENT_LABEL[row.status]
							})]
						}),
						row.instructions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 line-clamp-2 text-xs text-muted-foreground",
							children: row.instructions
						}) : null,
						row.submission_text ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 rounded-xl bg-surface/70 p-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: "Submitted:"
								}),
								" ",
								row.submission_text
							]
						}) : null,
						row.feedback ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 rounded-xl bg-success/10 p-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: "Your feedback:"
								}),
								" ",
								row.feedback
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [row.status === "draft" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "cta",
								size: "sm",
								className: "min-h-11 sm:min-h-10",
								disabled: update.isPending,
								onClick: () => void assignNow(row),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), " Assign now"]
							}) : null, row.status === "submitted" || row.status === "reviewed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								className: "min-h-11 sm:min-h-10",
								onClick: () => {
									setActive(row);
									setFeedback(row.feedback ?? "");
								},
								children: row.status === "reviewed" ? "Edit feedback" : "Review & give feedback"
							}) : null]
						})
					]
				}, row.id))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: Boolean(active),
			onOpenChange: (value) => value ? null : setActive(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Feedback" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: active?.title })] }),
				active?.submission_text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl bg-surface/70 p-3 text-sm",
					children: active.submission_text
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "assignment-feedback",
						children: "Your notes for the learner"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "assignment-feedback",
						rows: 4,
						value: feedback,
						onChange: (event) => setFeedback(event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "cta",
					className: "min-h-11 sm:min-h-10",
					disabled: update.isPending,
					onClick: () => void saveFeedback(),
					children: "Mark reviewed"
				}) })
			] })
		})]
	});
}
//#endregion
export { TutorAssignmentsPage as component };
