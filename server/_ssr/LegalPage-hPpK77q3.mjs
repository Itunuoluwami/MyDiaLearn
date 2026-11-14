import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { et as Mail, m as TriangleAlert } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { d as usePublicSettings, r as settingList } from "./public-data-D6Ffdjlb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/LegalPage-hPpK77q3.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Terms and Privacy, rendered from admin-editable settings.
*
* The wording of a legal page belongs to whoever is accountable for it, not
* to a React file — so both pages read their sections from
* `platform_settings`, the same way the homepage copy and the notification
* templates do. Changing a clause is an edit in admin settings, not a deploy.
*
* While `content.legal_reviewed` is false the page says plainly that the text
* is a draft. Legal copy that nobody qualified has approved should never be
* presented as though it has been.
*/
function LegalPage({ title, intro, settingsKey, updated }) {
	const settings = usePublicSettings();
	const sections = settingList(settings.data, settingsKey);
	const reviewed = settings.data?.["content.legal_reviewed"] === true;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "border-b border-border bg-surface/60",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-site py-12 md:py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-bold uppercase tracking-widest text-primary-deep",
					children: "Legal"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-2xl text-muted-foreground",
					children: intro
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-xs text-muted-foreground",
					children: ["Last updated ", updated]
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "container-site py-12 md:py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-3xl",
			children: [
				!reviewed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-8 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
						className: "mt-0.5 size-5 shrink-0 text-warning",
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Draft, pending legal review"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "This page describes how DiaLearn works today and has not yet been approved by a qualified adviser. Nothing here limits any right you have under the law that applies to you."
					})] })]
				}) : null,
				settings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-6",
					children: Array.from({ length: 5 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-48" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full" })]
					}, index))
				}) : sections.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted-foreground",
					children: [
						"This page has not been published yet. Please",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/contact",
							className: "font-semibold text-primary-deep underline",
							children: "contact us"
						}),
						" ",
						"if you need these terms before then."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-8",
					children: sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-extrabold",
						children: section.heading
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 leading-relaxed text-muted-foreground",
						children: section.body
					})] }, section.heading))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-12 rounded-2xl border border-border bg-surface/60 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-semibold",
							children: "Questions about this page?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Write to us and mark your message for the attention of the data protection contact."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "mt-4 min-h-11",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/contact",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }), " Contact us"]
							})
						})
					]
				})
			]
		})
	})] });
}
//#endregion
export { LegalPage as t };
