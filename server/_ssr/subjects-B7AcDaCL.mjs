import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { in as BookOpen, k as Search } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { l as useCurriculumFacets, p as useSubjectFacets } from "./public-data-D6Ffdjlb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/subjects-B7AcDaCL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SubjectsPage() {
	const subjects = useSubjectFacets();
	const curricula = useCurriculumFacets();
	const groups = (0, import_react.useMemo)(() => {
		const byCategory = /* @__PURE__ */ new Map();
		const rows = subjects.data ?? [];
		for (const subject of rows) {
			const key = subject.category || "Other";
			byCategory.set(key, [...byCategory.get(key) ?? [], subject]);
		}
		return [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b));
	}, [subjects.data]);
	const taught = (subjects.data ?? []).filter((subject) => subject.tutor_count > 0).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-b border-border bg-surface/60",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site py-12 md:py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold uppercase tracking-widest text-primary-deep",
						children: "Subjects"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl",
						children: "What our tutors teach"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-muted-foreground",
						children: "Every subject below is taught by verified DiaLearn tutors against the curriculum your child already follows at school."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "cta",
							className: "min-h-11",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/tutors",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), " Browse tutors"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "min-h-11",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/how-it-works",
								children: "How booking works"
							})
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "container-site py-12 md:py-16",
			children: subjects.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: Array.from({ length: 6 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-2xl" }, index))
			}) : groups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "No subjects are published yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-10",
				children: groups.map(([category, rows]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-extrabold",
					children: category
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: rows.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/tutors",
						search: { subject: subject.id },
						className: "focus-ring group flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
								className: "size-5",
								"aria-hidden": "true"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-extrabold text-foreground",
								children: subject.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-xs text-muted-foreground",
								children: subject.tutor_count === 0 ? "Tutors joining soon" : subject.tutor_count === 1 ? "1 tutor available" : `${subject.tutor_count} tutors available`
							})]
						})]
					}, subject.id))
				})] }, category))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-t border-border bg-surface/60",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site py-12 md:py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-extrabold",
						children: "Curricula we follow"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm text-muted-foreground",
						children: "Tutors teach to the syllabus your child is examined on, so lessons reinforce school rather than running alongside it."
					}),
					curricula.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 flex flex-wrap gap-2",
						children: Array.from({ length: 5 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-32 rounded-full" }, index))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-5 flex flex-wrap gap-2",
						children: (curricula.data ?? []).map((curriculum) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold",
							children: curriculum.name
						}, curriculum.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-sm text-muted-foreground",
						children: taught === 0 ? "Tutors are being verified now." : `${taught} of these subjects already have a verified tutor ready to teach.`
					})
				]
			})
		})
	] });
}
//#endregion
export { SubjectsPage as component };
