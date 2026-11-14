import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { a as Users, rn as Building2 } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { _ as useVerificationSteps } from "./public-data-D6Ffdjlb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/for-agencies-BfLrfgvQ.js
var import_jsx_runtime = require_jsx_runtime();
var students_online_default = "/assets/students-online-BgEeQl9h.jpg";
var VALUE = [
	{
		title: "One roster, one dashboard",
		body: "Add your tutors, track their verification status and see every booking across the agency."
	},
	{
		title: "Agency-level commission terms",
		body: "DiaLearn can apply commission rules specific to your agency rather than the platform default."
	},
	{
		title: "Demand you don't have to chase",
		body: "Your tutors appear in the same search diaspora parents already use, with your agency name on their profile."
	},
	{
		title: "Consolidated reporting",
		body: "Lessons delivered, earnings and payouts summarised across your whole team."
	}
];
function ForAgenciesPage() {
	const { data: steps, isLoading } = useVerificationSteps();
	const agencySteps = (steps ?? []).filter((step) => step.applies_to === "agency");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "band-hero border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site grid items-center gap-10 py-10 md:py-16 lg:grid-cols-[minmax(20rem,1.1fr)_minmax(18rem,0.9fr)] lg:gap-14",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "For tutoring organisations"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "display-hero mt-3 max-w-3xl",
							children: "Bring your teaching team to DiaLearn"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lead mt-4 max-w-2xl",
							children: "If you already run a tutoring business in Africa, DiaLearn gives your team access to diaspora families — with the oversight an agency needs."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-col gap-3 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "cta",
								size: "lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									children: "Register your agency"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								size: "lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/contact",
									children: "Talk to our team"
								})
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "media-frame aspect-[4/3] w-full min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: students_online_default,
						alt: "Students learning online with laptops and notebooks in a bright study space",
						width: 1280,
						height: 960,
						loading: "lazy"
					})
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "container-site section-y",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "display-section",
				children: "What an agency gets"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-2",
				children: VALUE.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-warm p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-5 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 text-lg",
							children: item.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: item.body
						})
					]
				}, item.title))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site section-y",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display-section",
						children: "Agency verification"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lead mt-3 max-w-2xl",
						children: "Agencies complete their own checks before their tutors can be listed."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-6 space-y-3",
						children: isLoading ? Array.from({ length: 3 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-xl" }, index)) : agencySteps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "panel-portal flex items-start gap-4 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-sm font-semibold text-secondary-foreground",
								children: index + 1
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-base font-semibold",
									children: step.name
								}), step.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: step.description
								}) : null]
							})]
						}, step.id))
					}),
					!isLoading && agencySteps.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: "Agency verification steps are being finalised — register and our team will walk you through them."
					}) : null
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "container-site section-y",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card-warm flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-6 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section mt-3",
							children: "Register your agency"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lead mt-2 max-w-xl",
							children: "Create an agency account, verify your organisation and start adding tutors."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "cta",
					size: "lg",
					className: "shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						children: "Create an agency account"
					})
				})]
			})
		})
	] });
}
//#endregion
export { ForAgenciesPage as component };
