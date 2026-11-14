import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { f as UserCheck, ln as BadgeCheck, rt as Lock, wt as Eye } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { _ as useVerificationSteps, o as useCancellationPolicies } from "./public-data-D6Ffdjlb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trust-and-safety-DbqPlVft.js
var import_jsx_runtime = require_jsx_runtime();
var PILLARS = [
	{
		icon: UserCheck,
		title: "Verified before listed",
		body: "No tutor appears in search until every required verification step is complete and approved by our team."
	},
	{
		icon: Eye,
		title: "Parents keep oversight",
		body: "Parents control whether a child can sign in, book lessons or message tutors, and can review every session afterwards."
	},
	{
		icon: Lock,
		title: "Payments held safely",
		body: "Lesson fees are held after booking and only released to the tutor once the lesson has been delivered."
	},
	{
		icon: BadgeCheck,
		title: "Reviews that stay honest",
		body: "Only families who have completed a lesson can review a tutor, and reviews are published as written."
	}
];
function TrustPage() {
	const { data: steps, isLoading } = useVerificationSteps();
	const { data: policies } = useCancellationPolicies();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "band-hero border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site py-10 md:py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Trust & safety"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display-hero mt-3 max-w-3xl",
						children: "Careful with your child, careful with your money."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lead mt-4 max-w-2xl",
						children: "DiaLearn is built for parents who are far from the classroom. These are the safeguards that make that workable."
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "container-site section-y",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: PILLARS.map((pillar) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-warm p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(pillar.icon, { className: "size-5 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 text-lg",
							children: pillar.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: pillar.body
						})
					]
				}, pillar.title))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site section-y",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display-section",
						children: "Our verification checks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lead mt-3 max-w-2xl",
						children: "The current checklist, straight from our verification configuration."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-6 grid gap-3 md:grid-cols-2",
						children: isLoading ? Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-xl" }, index)) : (steps ?? []).map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "panel-portal p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-base font-semibold",
									children: step.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted-foreground capitalize",
									children: [
										step.applies_to,
										" · ",
										step.is_required ? "required" : "optional"
									]
								}),
								step.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: step.description
								}) : null
							]
						}, step.id))
					})
				]
			})
		}),
		(policies ?? []).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "container-site section-y",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "display-section",
				children: "Cancellations and refunds"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 grid gap-3 md:grid-cols-2",
				children: (policies ?? []).map((policy) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "card-warm p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold",
							children: policy.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [
								"Cancel at least ",
								policy.hours_before,
								" hours before the lesson for a",
								" ",
								policy.refund_percentage,
								"% refund."
							]
						}),
						policy.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: policy.description
						}) : null
					]
				}, policy.name))
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "band-ink",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site section-y",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display-section max-w-2xl",
						children: "Something doesn't feel right?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lead mt-3 max-w-2xl text-ink-foreground/80",
						children: "Report any concern about a tutor, a lesson or a payment and our team will investigate."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "onInk",
						size: "lg",
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/contact",
							children: "Contact our team"
						})
					})
				]
			})
		})
	] });
}
//#endregion
export { TrustPage as component };
