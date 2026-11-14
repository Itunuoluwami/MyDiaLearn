import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { Ct as FileText, Et as ExternalLink, R as Plus, _ as Trash2, bt as FolderOpen, ht as Image, ot as Link2, p as Upload, r as Video } from "../_libs/lucide-react.mjs";
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
import { a as RESOURCE_LABEL, d as useCreateResource, f as useDeleteResource, g as useLearningResources, o as openStoredFile } from "./tutor-workspace-DMY2LNJP.mjs";
import { t as Progress } from "./progress-CmdFJCtB.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.resources-__cC0Tt4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TYPE_ICON = {
	pdf: FileText,
	video: Video,
	link: Link2,
	document: FileText,
	image: Image,
	other: FolderOpen
};
var LINK_TYPES = ["link", "video"];
function TutorResourcesPage() {
	const resources = useLearningResources();
	const create = useCreateResource();
	const remove = useDeleteResource();
	const subjects = useSubjectOptions();
	const students = useTutorStudents();
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		description: "",
		resourceType: "pdf",
		subjectId: "",
		studentId: "",
		externalUrl: ""
	});
	const [file, setFile] = (0, import_react.useState)(null);
	const rows = resources.data ?? [];
	const filtered = (0, import_react.useMemo)(() => filter === "all" ? rows : rows.filter((row) => row.resource_type === filter), [rows, filter]);
	const needsLink = LINK_TYPES.includes(form.resourceType);
	function reset() {
		setForm({
			title: "",
			description: "",
			resourceType: "pdf",
			subjectId: "",
			studentId: "",
			externalUrl: ""
		});
		setFile(null);
		setProgress(0);
	}
	async function handleCreate() {
		if (!form.title.trim()) {
			toast.error("Give this material a title.");
			return;
		}
		if (needsLink && !form.externalUrl.trim()) {
			toast.error("Add the link you want to share.");
			return;
		}
		if (!needsLink && !file) {
			toast.error("Choose a file to upload.");
			return;
		}
		try {
			await create.mutateAsync({
				title: form.title.trim(),
				description: form.description.trim() || null,
				resourceType: form.resourceType,
				subjectId: form.subjectId || null,
				studentId: form.studentId || null,
				externalUrl: needsLink ? form.externalUrl.trim() : null,
				file: needsLink ? null : file,
				onProgress: setProgress
			});
			toast.success("Material added");
			setOpen(false);
			reset();
		} catch {
			toast.error("We couldn't save that material.");
			setProgress(0);
		}
	}
	async function handleOpen(row) {
		try {
			if (row.storage_path) await openStoredFile(row.storage_path);
			else if (row.external_url) window.open(row.external_url, "_blank", "noopener,noreferrer");
		} catch {
			toast.error("That file couldn't be opened.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Learning materials",
		description: "Private by default — share a file with one learner or keep it for all your classes.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
			open,
			onOpenChange: (value) => {
				setOpen(value);
				if (!value) reset();
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "cta",
					className: "min-h-11 sm:min-h-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add material"]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-h-[90vh] overflow-y-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add learning material" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Uploaded files are stored privately and opened through short-lived secure links." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "resource-title",
									children: "Title"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "resource-title",
									className: "min-h-11",
									value: form.title,
									onChange: (event) => setForm((prev) => ({
										...prev,
										title: event.target.value
									})),
									placeholder: "Algebra practice set 3"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "resource-type",
									children: "Type"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.resourceType,
									onValueChange: (value) => setForm((prev) => ({
										...prev,
										resourceType: value
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "resource-type",
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.keys(RESOURCE_LABEL).map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: type,
										children: RESOURCE_LABEL[type]
									}, type)) })]
								})]
							}),
							needsLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "resource-url",
									children: "Link"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "resource-url",
									className: "min-h-11",
									inputMode: "url",
									value: form.externalUrl,
									onChange: (event) => setForm((prev) => ({
										...prev,
										externalUrl: event.target.value
									})),
									placeholder: "https://…"
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "resource-file",
									children: "File"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "resource-file",
									type: "file",
									className: "min-h-11",
									onChange: (event) => setFile(event.target.files?.[0] ?? null)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "resource-subject",
									children: "Subject (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.subjectId,
									onValueChange: (value) => setForm((prev) => ({
										...prev,
										subjectId: value
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "resource-subject",
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Any subject" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (subjects.data ?? []).map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: subject.id,
										children: subject.name
									}, subject.id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "resource-student",
									children: "Share with (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.studentId,
									onValueChange: (value) => setForm((prev) => ({
										...prev,
										studentId: value
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "resource-student",
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Keep in my library" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (students.data ?? []).map((student) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: student.student_id,
										children: student.first_name
									}, student.student_id)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "resource-description",
									children: "Description (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "resource-description",
									rows: 2,
									value: form.description,
									onChange: (event) => setForm((prev) => ({
										...prev,
										description: event.target.value
									}))
								})]
							}),
							create.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: progress,
								className: "h-2"
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "cta",
						className: "min-h-11 sm:min-h-10",
						disabled: create.isPending,
						onClick: () => void handleCreate(),
						children: create.isPending ? "Saving…" : "Add material"
					}) })
				]
			})]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					}), Object.keys(RESOURCE_LABEL).map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: type,
						className: "min-h-11",
						children: RESOURCE_LABEL[type]
					}, type))]
				})
			}), resources.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 4,
				height: "h-24"
			}) : resources.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't load your materials.",
				onRetry: () => void resources.refetch()
			}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
				icon: Upload,
				title: "Your library is empty",
				body: "Add worksheets, recordings and reading links once, then reuse them across every learner you teach."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: filtered.map((row) => {
					const Icon = TYPE_ICON[row.resource_type];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "flex flex-col rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "size-5",
										"aria-hidden": "true"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "truncate text-sm font-semibold",
										children: row.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 text-xs text-muted-foreground",
										children: [
											RESOURCE_LABEL[row.resource_type],
											" · added ",
											formatRelative(row.created_at)
										]
									})]
								})]
							}),
							row.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 line-clamp-2 text-xs text-muted-foreground",
								children: row.description
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-1.5",
								children: [row.subjects?.name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-surface px-2.5 py-1 text-xs text-muted-foreground",
									children: row.subjects.name
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-surface px-2.5 py-1 text-xs text-muted-foreground",
									children: row.students?.first_name ? `Shared with ${row.students.first_name}` : "My library"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "min-h-11 flex-1 sm:min-h-10",
									onClick: () => void handleOpen(row),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" }), " Open"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									className: "min-h-11 min-w-11 text-muted-foreground hover:text-destructive",
									"aria-label": `Delete ${row.title}`,
									disabled: remove.isPending,
									onClick: () => {
										remove.mutateAsync({
											id: row.id,
											storage_path: row.storage_path
										}).then(() => toast.success("Material removed")).catch(() => toast.error("We couldn't remove that material."));
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})]
							})
						]
					}, row.id);
				})
			})]
		})
	});
}
//#endregion
export { TutorResourcesPage as component };
