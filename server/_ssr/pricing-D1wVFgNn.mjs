import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { F as Receipt, T as ShieldCheck, nn as Calculator } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { o as useCancellationPolicies, s as useCommissionExample } from "./public-data-D6Ffdjlb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pricing-D1wVFgNn.js
var import_jsx_runtime = require_jsx_runtime();
function PricingPage() {
	const { data: rules, isLoading } = useCommissionExample();
	const { data: policies } = useCancellationPolicies();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "band-hero border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site py-10 md:py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Pricing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display-hero mt-3 max-w-3xl",
						children: "No packages. You pay per lesson."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lead mt-4 max-w-2xl",
						children: "Each tutor sets their own hourly rate. The price of a lesson is simply that rate applied to the length of the lesson you book."
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "container-site section-y",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-warm p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 text-lg",
								children: "Lesson price"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "Tutor's hourly rate × lesson length. A shorter lesson costs proportionally less — there is no minimum bundle."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-warm p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 text-lg",
								children: "DiaLearn's share"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "A commission and platform fee are deducted from the lesson total before the tutor is paid. The applicable terms are shown below."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-warm p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 text-lg",
								children: "Held until delivered"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "Payment is held after booking and released to the tutor once the lesson has taken place."
							})
						]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site section-y",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display-section",
						children: "Current commission terms"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lead mt-3 max-w-2xl",
						children: "These figures are read live from DiaLearn's fee configuration, so this page is always accurate."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 grid gap-4 md:grid-cols-2",
						children: isLoading ? Array.from({ length: 2 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-2xl" }, index)) : (rules ?? []).map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-portal p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-base font-semibold",
									children: rule.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted-foreground capitalize",
									children: [
										"Applies to ",
										rule.applies_to,
										" · ",
										rule.model,
										" model"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-4 space-y-2 text-sm",
									children: [
										rule.model === "percentage" && rule.percentage !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-muted-foreground",
												children: "Commission"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
												className: "font-medium",
												children: [rule.percentage, "% of the lesson total"]
											})]
										}) : null,
										rule.model === "fixed" && rule.fixed_amount !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-muted-foreground",
												children: "Commission"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
												className: "font-medium",
												children: [
													rule.fixed_amount,
													" ",
													rule.currency ?? "",
													" per lesson"
												]
											})]
										}) : null,
										rule.model === "tiered" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-muted-foreground",
												children: "Commission"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "font-medium",
												children: "Tiered by monthly volume"
											})]
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-muted-foreground",
												children: "Platform fee"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
												className: "font-medium",
												children: [
													rule.platform_fee_percentage,
													"%",
													Number(rule.platform_fee_fixed) > 0 ? ` + ${rule.platform_fee_fixed} ${rule.currency ?? ""}` : ""
												]
											})]
										})
									]
								})
							]
						}, rule.name))
					}),
					!isLoading && (rules ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: "Fee terms are being published. Contact us and we will share the current structure."
					}) : null
				]
			})
		}),
		(policies ?? []).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "container-site section-y",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display-section",
					children: "Cancellations and refunds"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lead mt-3 max-w-2xl",
					children: "How much is refunded depends on how much notice is given before the lesson."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[30rem] text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 pr-4 font-semibold",
									children: "Policy"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 pr-4 font-semibold",
									children: "Notice given"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3 font-semibold",
									children: "Refunded"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (policies ?? []).map((policy) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-3 pr-4",
									children: [policy.name, policy.is_default ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2 text-xs text-muted-foreground",
										children: "default"
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-3 pr-4 text-muted-foreground",
									children: [policy.hours_before, "+ hours before"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "py-3 font-medium",
									children: [policy.refund_percentage, "%"]
								})
							]
						}, policy.name)) })]
					})
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "container-site section-y text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display-section",
					children: "See real tutor rates"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lead mx-auto mt-3 max-w-xl",
					children: "Rates vary by subject, experience and country. Browse tutors to compare."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col justify-center gap-3 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "cta",
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tutors",
							children: "Browse tutors"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/trust-and-safety",
							children: "Trust & safety"
						})
					})]
				})
			]
		})
	] });
}
//#endregion
export { PricingPage as component };
