import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { Mt as CreditCard, T as ShieldCheck, Yt as ChartLine, en as CalendarCheck, k as Search, r as Video } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
import { i as AccordionTrigger, n as AccordionContent, r as AccordionItem, t as Accordion } from "./accordion-DzVkTL4X.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/how-it-works-B3tmokw6.js
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	{
		icon: Search,
		title: "1. Search with the filters that matter",
		body: "Filter by subject, curriculum, grade, tutor country, language, rating and hourly rate. Every option comes from the subjects, curricula and levels DiaLearn actually supports."
	},
	{
		icon: CalendarCheck,
		title: "2. Choose a time in your timezone",
		body: "Tutor availability is shown in your local time. Booking rules — how far ahead you can book and how much notice a tutor needs — are set by DiaLearn, so you always see valid slots."
	},
	{
		icon: CreditCard,
		title: "3. Pay securely, once",
		body: "The lesson price is the tutor's hourly rate multiplied by the length you pick. Funds are held until the lesson has been delivered, then released to the tutor."
	},
	{
		icon: Video,
		title: "4. Meet live, one-to-one",
		body: "Lessons run in a live video classroom with a shared whiteboard. Nothing to install for most families."
	},
	{
		icon: ChartLine,
		title: "5. Follow progress",
		body: "Parents see every booking, session summary, homework note and recording in the parent portal — even for lessons they did not sit in on."
	}
];
var FAQ = [
	{
		q: "Can a parent manage more than one child?",
		a: "Yes. A parent account can create a profile for each child, each with its own education level and curriculum, while the parent keeps control of payments and permissions."
	},
	{
		q: "Can my child book lessons themselves?",
		a: "Only if you allow it. Each child profile has permissions for signing in, booking lessons and messaging tutors, and you can change them at any time."
	},
	{
		q: "What if we need to cancel?",
		a: "DiaLearn publishes cancellation windows and the refund that applies to each. You can see the current policy on the Trust & safety page before you book."
	},
	{
		q: "Which timezone are lessons shown in?",
		a: "Yours. Every booking stores the timezone it was made in, so the tutor sees their local time and you see yours."
	}
];
function HowItWorksPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "band-hero border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site py-10 md:py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "For parents and students"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display-hero mt-3 max-w-3xl",
						children: "How DiaLearn works"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lead mt-4 max-w-2xl",
						children: "Five steps, no packages and no subscriptions. Start with one lesson and continue only if it feels right."
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "container-site section-y",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [STEPS.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-warm p-5 md:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary-deep",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(step.icon, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-4 text-lg",
							children: step.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: step.body
						})
					]
				}, step.title)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-warm bg-primary-soft/40 p-5 md:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-6 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 text-lg",
							children: "Every tutor is verified first"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "Identity, qualifications and a live teaching check are completed before a tutor appears in search."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "subtle",
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/trust-and-safety",
								children: "See our checks"
							})
						})
					]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site section-y",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display-section",
					children: "Common questions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accordion, {
					type: "single",
					collapsible: true,
					className: "mt-6 max-w-3xl",
					children: FAQ.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
						value: item.q,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionTrigger, {
							className: "text-left text-base",
							children: item.q
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, {
							className: "text-sm text-muted-foreground",
							children: item.a
						})]
					}, item.q))
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "container-site section-y text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "display-section",
				children: "Find a tutor who knows your curriculum"
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
						to: "/pricing",
						children: "How payment works"
					})
				})]
			})]
		})
	] });
}
//#endregion
export { HowItWorksPage as component };
