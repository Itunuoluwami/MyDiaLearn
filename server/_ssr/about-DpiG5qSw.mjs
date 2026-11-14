import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button, t as BRAND } from "./button-Be6IoNc1.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-DpiG5qSw.js
var import_jsx_runtime = require_jsx_runtime();
var VALUES = [
	{
		title: "Teachers first",
		body: "African teachers are the product, not an afterthought. They set their rates and keep ownership of how they teach."
	},
	{
		title: "Calm over urgency",
		body: "No countdown timers, no discount theatre. Families should choose a tutor the way they choose a school."
	},
	{
		title: "Culture is curriculum",
		body: "Language, history and identity sit alongside maths and science, because that is what families ask us for."
	}
];
function AboutPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "band-hero border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site py-10 md:py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: BRAND.company
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display-hero mt-3 max-w-3xl",
						children: "Built for families who left, and teachers who stayed."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "lead mt-4 max-w-2xl",
						children: [BRAND.name, " exists because diaspora parents keep asking the same question: who can teach my child the curriculum they sit, and still speak to them about home?"]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "container-site section-y grid gap-8 lg:grid-cols-[minmax(20rem,1fr)_minmax(20rem,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display-section",
					children: "Our story"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-4 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [BRAND.company, " works across education and technology in Africa. DiaLearn started as a simple observation: families abroad were paying a premium for tutoring that had no connection to their child's exam board or their heritage, while excellent teachers across the continent were under-booked."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "DiaLearn puts the two sides in the same place, with the structure a marketplace needs — verification, secure payments, clear cancellation terms and a parent who stays in control." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "We are deliberately unhurried about growth. Every tutor listed has been checked by a person, and every feature is judged by whether a parent thousands of miles away can trust it." })
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: VALUES.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-warm p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg",
						children: value.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: value.body
					})]
				}, value.title))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-t border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site section-y text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display-section",
					children: BRAND.tagline
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
							to: "/become-a-tutor",
							children: "Teach with us"
						})
					})]
				})]
			})
		})
	] });
}
//#endregion
export { AboutPage as component };
