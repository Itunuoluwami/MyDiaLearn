import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { qt as Check } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
import { t as ClassPreview } from "./ClassPreview-bcZfIroM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/class-preview-CZfV2XLO.js
var import_jsx_runtime = require_jsx_runtime();
var INSIDE_A_LESSON = [
	"A 60-minute default lesson, adjustable to the length your child can focus for.",
	"The tutor sets out the goal for the hour, then works through problems together.",
	"Notes and whiteboard work are shared, so revision is possible afterwards.",
	"Parents receive the session summary, homework and recording link."
];
function ClassPreviewPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "container-site py-10 md:py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPreview, { heading: "What a DiaLearn class looks like" })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-border bg-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site section-y grid gap-8 lg:grid-cols-[minmax(20rem,1fr)_minmax(20rem,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Inside the hour"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section mt-2",
							children: "Calm, structured, one-to-one"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lead mt-3",
							children: "No large classes and no recorded lectures. Every DiaLearn lesson is a live conversation between one tutor and one student."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "card-warm space-y-3 p-5 md:p-6",
					children: INSIDE_A_LESSON.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 size-4 shrink-0 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item })]
					}, item))
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "container-site section-y text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display-section",
					children: "See it with your own tutor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lead mx-auto mt-3 max-w-xl",
					children: "Browse verified tutors and book a single lesson to start."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col justify-center gap-3 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "cta",
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tutors",
							children: "Find a tutor"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/how-it-works",
							children: "How it works"
						})
					})]
				})
			]
		})
	] });
}
//#endregion
export { ClassPreviewPage as component };
