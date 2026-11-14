import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn } from "./button-Be6IoNc1.mjs";
import { X as MessageSquareQuote, y as Star } from "../_libs/lucide-react.mjs";
import { c as formatRelative } from "./parent-data-Dj0LJH5W.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { O as useTutorReviews, S as useRatingSummary, x as useRatingCategories } from "./tutor-workspace-DMY2LNJP.mjs";
import { t as Progress } from "./progress-CmdFJCtB.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.reviews-tXulVwI2.js
var import_jsx_runtime = require_jsx_runtime();
function Stars({ score }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex items-center gap-0.5",
		"aria-label": `${score} out of 5`,
		children: [
			1,
			2,
			3,
			4,
			5
		].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
			className: cn("size-3.5", value <= Math.round(score) ? "fill-secondary text-secondary" : "text-border"),
			"aria-hidden": "true"
		}, value))
	});
}
function TutorReviewsPage() {
	const summary = useRatingSummary();
	const categories = useRatingCategories();
	const reviews = useTutorReviews();
	const totals = summary.data;
	const count = Number(totals?.rating_count ?? 0);
	const buckets = [
		{
			label: "5",
			value: Number(totals?.five_star ?? 0)
		},
		{
			label: "4",
			value: Number(totals?.four_star ?? 0)
		},
		{
			label: "3",
			value: Number(totals?.three_star ?? 0)
		},
		{
			label: "2",
			value: Number(totals?.two_star ?? 0)
		},
		{
			label: "1",
			value: Number(totals?.one_star ?? 0)
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Ratings & reviews",
		description: "Feedback from the families you teach, exactly as they left it.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-4xl space-y-5",
			children: [
				summary.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-44 rounded-2xl shimmer" }) : summary.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
					message: "We couldn't load your rating summary.",
					onRetry: () => void summary.refetch()
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Your rating",
					description: count === 0 ? "No ratings yet — they arrive after your first completed lessons." : `${count} ${count === 1 ? "review" : "reviews"} from families`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-primary-soft/60 p-4 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-4xl font-semibold tabular-nums text-primary-deep",
									children: Number(totals?.rating_avg ?? 0).toFixed(1)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex justify-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { score: Number(totals?.rating_avg ?? 0) })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted-foreground",
									children: "Overall average"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2",
							children: buckets.map((bucket) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "w-8 text-xs font-medium text-muted-foreground",
										children: [bucket.label, "★"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
										value: count === 0 ? 0 : bucket.value / count * 100,
										className: "h-2 flex-1"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-8 text-right text-xs tabular-nums text-muted-foreground",
										children: bucket.value
									})
								]
							}, bucket.label))
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "By category",
					description: "Categories are managed by DiaLearn, so families rate every tutor on the same things.",
					children: categories.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
						rows: 3,
						height: "h-12"
					}) : (categories.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Category scores appear once families start rating your lessons."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-3 sm:grid-cols-2",
						children: (categories.data ?? []).map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl bg-surface/70 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-medium",
										children: category.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-semibold tabular-nums",
										children: Number(category.average_score ?? 0).toFixed(1)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
									value: Number(category.average_score ?? 0) / 5 * 100,
									className: "mt-2 h-1.5"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: [
										Number(category.response_count ?? 0),
										" ",
										Number(category.response_count ?? 0) === 1 ? "response" : "responses"
									]
								})
							]
						}, category.category_id))
					})
				}),
				reviews.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
					rows: 3,
					height: "h-24"
				}) : reviews.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
					message: "We couldn't load your reviews.",
					onRetry: () => void reviews.refetch()
				}) : (reviews.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
					icon: MessageSquareQuote,
					title: "No written reviews yet",
					body: "Families are invited to review after a completed lesson. Their words will appear here and on your public profile."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: (reviews.data ?? []).map((review) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-2xl border border-border bg-card p-4 shadow-soft",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-semibold",
									children: review.reviewer_name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [review.subject_name ? `${review.subject_name} · ` : "", formatRelative(review.created_at)]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { score: Number(review.score) })]
						}), review.comment ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm",
							children: [
								"“",
								review.comment,
								"”"
							]
						}) : null]
					}, review.id))
				})
			]
		})
	});
}
//#endregion
export { TutorReviewsPage as component };
