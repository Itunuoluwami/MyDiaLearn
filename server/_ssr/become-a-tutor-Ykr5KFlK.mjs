import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { Ht as CircleCheck, n as Wallet } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { _ as useVerificationSteps } from "./public-data-D6Ffdjlb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/become-a-tutor-Ykr5KFlK.js
var import_jsx_runtime = require_jsx_runtime();
var educator_whiteboard_default = "/assets/educator-whiteboard-CARqQvAU.jpg";
var BENEFITS = [
	{
		title: "Teach the curriculum you know",
		body: "Match with families sitting the exams you already teach — WAEC, IGCSE, AP, IB and more."
	},
	{
		title: "Set your own hourly rate",
		body: "You choose your rate and currency. Lesson prices are calculated from it automatically."
	},
	{
		title: "Reliable, transparent payouts",
		body: "Fees and commission are published up front, and payouts follow the platform's payout policy."
	},
	{
		title: "Your calendar, your rules",
		body: "Publish weekly availability windows in your own timezone. DiaLearn never double-books you."
	}
];
function BecomeTutorPage() {
	const { data: steps, isLoading } = useVerificationSteps();
	const tutorSteps = (steps ?? []).filter((step) => step.applies_to === "tutor");
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
							children: "For teachers across Africa"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "display-hero mt-3 max-w-3xl",
							children: "Teach diaspora students, from wherever you are."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lead mt-4 max-w-2xl",
							children: "DiaLearn brings you students whose families want a teacher who understands both their curriculum and where they come from."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-col gap-3 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "cta",
								size: "lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									children: "Start your tutor application"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								size: "lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/pricing",
									children: "See fees and payouts"
								})
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "media-frame aspect-[4/3] w-full min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: educator_whiteboard_default,
						alt: "An African educator teaching mathematics on a glass whiteboard during an online class",
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
				children: "Why teach with DiaLearn"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-2",
				children: BENEFITS.map((benefit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-warm p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 text-lg",
							children: benefit.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: benefit.body
						})
					]
				}, benefit.title))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site section-y",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display-section",
						children: "Your onboarding, step by step"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lead mt-3 max-w-2xl",
						children: "These are the checks DiaLearn currently requires before a tutor profile goes live."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-6 space-y-3",
						children: isLoading ? Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-xl" }, index)) : tutorSteps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "panel-portal flex items-start gap-4 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary-deep",
								children: index + 1
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "text-base font-semibold",
									children: [step.name, step.is_required ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2 text-xs font-normal text-muted-foreground",
										children: "optional"
									})]
								}), step.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: step.description
								}) : null]
							})]
						}, step.id))
					}),
					!isLoading && tutorSteps.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: "Verification steps are being finalised. Create an account and we will guide you through them."
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-6 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display-section mt-3",
							children: "Ready to apply?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lead mt-2 max-w-xl",
							children: "Create a tutor account, complete verification and publish your profile."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "cta",
					size: "lg",
					className: "shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						children: "Create a tutor account"
					})
				})]
			})
		})
	] });
}
//#endregion
export { BecomeTutorPage as component };
