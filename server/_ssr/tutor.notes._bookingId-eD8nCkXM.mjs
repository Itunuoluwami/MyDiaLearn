import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { Ht as CircleCheck, W as NotebookPen, fn as ArrowLeft } from "../_libs/lucide-react.mjs";
import { _ as Link, y as useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { p as useTutorBookings, v as useTutorTimezone } from "./tutor-data-BgedrW1M.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { a as formatDayInZone, l as formatTimeInZone } from "./parent-data-Dj0LJH5W.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError } from "./ui-bAhnOVkK.mjs";
import { _ as useLessonNote, w as useSaveLessonNote } from "./tutor-workspace-DMY2LNJP.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.notes._bookingId-eD8nCkXM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FIELDS = [
	{
		key: "covered",
		label: "What we covered",
		placeholder: "Topics, examples and exercises you worked through together."
	},
	{
		key: "understanding",
		label: "Understanding",
		placeholder: "What the learner grasped confidently today."
	},
	{
		key: "improvements",
		label: "Areas to improve",
		placeholder: "Where they need more practice or support."
	},
	{
		key: "next_steps",
		label: "Next steps",
		placeholder: "Homework, revision and the plan for the next lesson."
	}
];
function LessonNotesPage() {
	const { bookingId } = useParams({ from: "/_authenticated/tutor/notes/$bookingId" });
	const timezone = useTutorTimezone();
	const note = useLessonNote(bookingId);
	const save = useSaveLessonNote(bookingId);
	const booking = (useTutorBookings().data ?? []).find((row) => row.id === bookingId);
	const [form, setForm] = (0, import_react.useState)({
		covered: "",
		understanding: "",
		improvements: "",
		next_steps: ""
	});
	(0, import_react.useEffect)(() => {
		if (!note.data) return;
		setForm({
			covered: note.data.covered ?? "",
			understanding: note.data.understanding ?? "",
			improvements: note.data.improvements ?? "",
			next_steps: note.data.next_steps ?? ""
		});
	}, [note.data]);
	async function handleSubmit() {
		try {
			await save.mutateAsync(form);
			toast.success("Lesson notes saved");
		} catch {
			toast.error("We couldn't save these notes.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Lesson notes",
		description: booking ? `${booking.subject_name ?? "Lesson"} with ${booking.student_first_name ?? "your learner"} · ${formatDayInZone(booking.starts_at, timezone)}, ${formatTimeInZone(booking.starts_at, timezone)}` : "A quick record while the lesson is still fresh",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			className: "min-h-11 sm:min-h-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/tutor/classes",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Back to classes"]
			})
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-3xl space-y-5",
			children: note.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 2,
				height: "h-40"
			}) : note.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't load the notes for this lesson.",
				onRetry: () => void note.refetch()
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				title: "After the class",
				description: "Families see these notes in their portal, so keep them warm and specific.",
				action: note.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
						className: "size-3.5",
						"aria-hidden": "true"
					}), " Saved"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5 rounded-full bg-secondary-soft px-2.5 py-1 text-xs font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotebookPen, {
						className: "size-3.5",
						"aria-hidden": "true"
					}), " Not written yet"]
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-4",
					onSubmit: (event) => {
						event.preventDefault();
						handleSubmit();
					},
					children: [FIELDS.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: `note-${field.key}`,
							children: field.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: `note-${field.key}`,
							rows: 3,
							value: form[field.key],
							placeholder: field.placeholder,
							onChange: (event) => setForm((prev) => ({
								...prev,
								[field.key]: event.target.value
							}))
						})]
					}, field.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "cta",
							className: "min-h-11 sm:min-h-10",
							disabled: save.isPending,
							children: save.isPending ? "Saving…" : "Save notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "min-h-11 sm:min-h-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/tutor/assignments",
								children: "Set an assignment"
							})
						})]
					})]
				})
			})
		})
	});
}
//#endregion
export { LessonNotesPage as component };
