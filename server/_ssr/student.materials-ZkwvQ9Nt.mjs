import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { Ct as FileText, Ht as CircleCheck, It as Clock, O as Send, at as Link, in as BookOpen, p as Upload } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { f as useSubmitAssignment, l as useStudentMaterials, s as useStudentAssignments, t as StudentShell } from "./StudentShell-CJwiZRhj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student.materials-ZkwvQ9Nt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_LABEL = {
	assigned: "To Do",
	pending: "Pending",
	submitted: "Submitted",
	under_review: "Under Review",
	completed: "Done",
	overdue: "Overdue"
};
var STATUS_COLOR = {
	assigned: "bg-secondary/15 text-secondary-foreground",
	pending: "bg-warning/15 text-warning",
	submitted: "bg-primary/10 text-primary",
	under_review: "bg-primary/10 text-primary",
	completed: "bg-success/10 text-success",
	overdue: "bg-destructive/10 text-destructive"
};
function StudentMaterialsPage() {
	const allAssignments = useStudentAssignments();
	const materials = useStudentMaterials();
	const submitAssignment = useSubmitAssignment();
	const [activeTab, setActiveTab] = (0, import_react.useState)("assignments");
	const [submitting, setSubmitting] = (0, import_react.useState)(null);
	const [text, setText] = (0, import_react.useState)({});
	(0, import_react.useRef)({});
	async function handleSubmit(id) {
		const submissionText = text[id]?.trim() || void 0;
		try {
			await submitAssignment.mutateAsync({
				id,
				...submissionText ? { text: submissionText } : {}
			});
			toast.success("Assignment submitted! 🎉");
			setSubmitting(null);
			setText((prev) => {
				const next = { ...prev };
				delete next[id];
				return next;
			});
		} catch {
			toast.error("Couldn't submit. Please try again.");
		}
	}
	const pending = (allAssignments.data ?? []).filter((a) => a.status === "assigned");
	const submitted = (allAssignments.data ?? []).filter((a) => a.status === "submitted");
	const completed = (allAssignments.data ?? []).filter((a) => a.status === "reviewed");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: "📚 Assignments & Materials",
		description: "View what your tutor shared and submit your work here.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: activeTab,
			onValueChange: setActiveTab,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "mb-5 h-12 rounded-2xl bg-muted p-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "assignments",
							className: "min-w-28 rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
							children: ["Assignments", pending.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 flex size-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white",
								children: pending.length
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "materials",
							className: "min-w-28 rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
							children: "Materials"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "completed",
							className: "min-w-28 rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
							children: "Completed"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "assignments",
					className: "space-y-4",
					children: [allAssignments.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonList, { rows: 3 }) : pending.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						emoji: "✅",
						message: "No pending assignments — great work!"
					}) : pending.map((a) => {
						const isSubmitting = submitting === a.id;
						const overdue = a.due_at && new Date(a.due_at) < /* @__PURE__ */ new Date() && a.status !== "submitted";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("rounded-2xl border p-5 transition-shadow", overdue ? "border-destructive/30 bg-destructive/5" : "border-border bg-card hover:shadow-sm"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-2xl",
											children: "📋"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-extrabold text-foreground",
												children: a.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-sm text-muted-foreground",
												children: [
													a.subjects?.name,
													" · ",
													"by",
													" ",
													a.tutors?.profiles?.full_name ?? "Your Tutor"
												]
											}),
											a.due_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: cn("mt-1 flex items-center gap-1 text-xs font-bold", overdue ? "text-destructive" : "text-muted-foreground"),
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5" }),
													overdue ? "⚠️ Overdue · " : "Due: ",
													new Date(a.due_at).toLocaleDateString(void 0, {
														weekday: "short",
														day: "numeric",
														month: "short"
													})
												]
											})
										] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: cn("rounded-full text-xs font-bold", STATUS_COLOR[a.status]),
										children: STATUS_LABEL[a.status] ?? a.status
									})]
								}),
								a.instructions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 rounded-xl border border-border/60 bg-muted/50 p-3 text-sm text-foreground leading-relaxed",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-1 text-xs font-extrabold uppercase tracking-wide text-muted-foreground",
										children: "Instructions"
									}), a.instructions]
								}),
								isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										placeholder: "Write your answer here, or explain your work…",
										className: "min-h-28 rounded-xl resize-none text-sm",
										value: text[a.id] ?? "",
										onChange: (e) => setText((prev) => ({
											...prev,
											[a.id]: e.target.value
										}))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											className: "min-h-10 rounded-xl bg-accent font-bold text-white hover:bg-accent/90",
											onClick: () => void handleSubmit(a.id),
											disabled: submitAssignment.isPending,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4 mr-1" }), "Submit Assignment"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											className: "min-h-10 rounded-xl font-bold",
											onClick: () => {
												setSubmitting(null);
											},
											children: "Cancel"
										})]
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									className: "mt-4 min-h-10 rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90",
									onClick: () => setSubmitting(a.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4 mr-1" }), " Submit Work"]
								})
							]
						}, a.id);
					}), submitted.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-extrabold uppercase tracking-wide text-muted-foreground",
							children: "With your tutor"
						}), submitted.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-extrabold text-foreground",
											children: a.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: a.subjects?.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm text-muted-foreground",
											children: "Submitted — waiting on feedback from your tutor."
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "rounded-full bg-primary/10 text-xs font-bold text-primary",
									children: "Submitted"
								})
							]
						}, a.id))]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "materials",
					className: "space-y-4",
					children: materials.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonList, { rows: 3 }) : (materials.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						emoji: "📂",
						message: "No materials yet. Your tutor will share resources here."
					}) : (materials.data ?? []).map((material) => {
						const Icon = material.resource_type === "document" ? FileText : material.resource_type === "link" ? Link : BookOpen;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-4 rounded-2xl border border-border bg-card p-5 hover:shadow-sm transition-shadow",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-extrabold text-foreground truncate",
											children: material.title
										}),
										material.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-0.5 text-sm text-muted-foreground",
											children: material.description
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: [
												"Shared by",
												" ",
												material.tutors?.profiles?.full_name ?? "Tutor",
												" · ",
												new Date(material.created_at).toLocaleDateString()
											]
										})
									]
								}),
								material.external_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "sm",
									variant: "outline",
									className: "min-h-10 shrink-0 rounded-xl font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: material.external_url,
										target: "_blank",
										rel: "noopener noreferrer",
										children: "Open"
									})
								})
							]
						}, material.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "completed",
					className: "space-y-4",
					children: allAssignments.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonList, { rows: 2 }) : completed.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						emoji: "🏆",
						message: "Submit assignments to see them here once graded."
					}) : completed.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-4 rounded-2xl border border-success/20 bg-success/5 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-extrabold text-foreground",
										children: a.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: a.subjects?.name
									}),
									a.feedback && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mb-1 text-xs font-extrabold uppercase tracking-wide text-primary",
											children: "Tutor Feedback"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-foreground leading-relaxed",
											children: a.feedback
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "rounded-full bg-success/10 text-xs font-bold text-success",
								children: "Done ✓"
							})
						]
					}, a.id))
				})
			]
		})
	});
}
function EmptyState({ emoji, message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-5xl",
			children: emoji
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-bold text-foreground",
			children: message
		})]
	});
}
function SkeletonList({ rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 animate-pulse rounded-2xl bg-muted" }, i))
	});
}
//#endregion
export { StudentMaterialsPage as component };
