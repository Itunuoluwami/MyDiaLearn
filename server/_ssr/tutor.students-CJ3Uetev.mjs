import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { Qt as CalendarDays, _t as GraduationCap, a as Users } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { g as useTutorStudents, v as useTutorTimezone } from "./tutor-data-BgedrW1M.mjs";
import { a as formatDayInZone, l as formatTimeInZone } from "./parent-data-Dj0LJH5W.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel, s as MetaItem } from "./ui-bAhnOVkK.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-C7Z5PUu0.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.students-CJ3Uetev.js
var import_jsx_runtime = require_jsx_runtime();
function TutorStudentsPage() {
	const timezone = useTutorTimezone();
	const students = useTutorStudents();
	const rows = students.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "My students",
		description: "Only the details a tutor needs: first name, level, subjects and lesson history.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-5xl space-y-5",
			children: students.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 3,
				height: "h-28"
			}) : students.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't load your students right now.",
				onRetry: () => void students.refetch()
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
				icon: Users,
				title: "No students yet",
				body: "Learners appear here as soon as a family books their first lesson with you.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "cta",
					className: "min-h-11",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/tutor/availability",
						children: "Set availability"
					})
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				title: `${rows.length} ${rows.length === 1 ? "learner" : "learners"}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 md:grid-cols-2",
					children: rows.map((student) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
						className: "rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:shadow-lift",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
								className: "size-11 shrink-0",
								children: [student.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
									src: student.avatar_url,
									alt: "",
									loading: "lazy"
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
									className: "bg-primary-soft text-sm font-semibold text-primary-deep",
									children: (student.first_name ?? "?").charAt(0).toUpperCase()
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "truncate text-sm font-semibold md:text-base",
										children: student.first_name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 truncate text-xs text-muted-foreground",
										children: [student.education_level_name, student.curriculum_name].filter(Boolean).join(" · ") || "Level not set"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap gap-x-4 gap-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MetaItem, {
											icon: GraduationCap,
											children: [Number(student.lessons_completed ?? 0), " lessons taught"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaItem, {
											icon: CalendarDays,
											children: student.next_class_at ? `Next ${formatDayInZone(student.next_class_at, timezone)}, ${formatTimeInZone(student.next_class_at, timezone)}` : "No class scheduled"
										})]
									}),
									(student.subjects ?? []).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 flex flex-wrap gap-1.5",
										children: (student.subjects ?? []).slice(0, 4).map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											className: "text-[0.7rem]",
											children: subject
										}, subject))
									}) : null
								]
							})]
						})
					}, student.student_id))
				})
			})
		})
	});
}
//#endregion
export { TutorStudentsPage as component };
