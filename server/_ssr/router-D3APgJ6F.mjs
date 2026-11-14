import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as authClient, n as ApiError } from "./auth-DVJYIAuV.mjs";
import { t as AuthProvider } from "./use-auth-DHsIU0kT.mjs";
import { N as redirect, _ as Link, b as useRouter, c as HeadContent, d as createRouter, g as createRootRouteWithContext, h as createFileRoute, m as lazyRouteComponent, p as Outlet, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as adminBeforeLoad } from "./admin-guard-DXXXDJr3.mjs";
import { t as Route$79 } from "./agency.tutors._tutorId-BIg1fFLd.mjs";
import { t as Route$80 } from "./book._tutorId-DPI0BbQu.mjs";
import { t as Route$81 } from "./children._studentId-CaJRDlz1.mjs";
import { t as Route$82 } from "./find-tutor-E8PUcA8a.mjs";
import { t as Route$83 } from "./tutors.index-Bf0eMr7X.mjs";
import { t as Route$84 } from "./tutors._tutorId-Nb72jl5m.mjs";
import { t as Route$85 } from "./student.book._tutorId-wW_zd9hY.mjs";
import { t as Route$86 } from "./student.classroom._bookingId-C87UtU4_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-D3APgJ6F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-CyCNW9Ck.css";
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$78 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "DiaLearn — African tutors for diaspora families" },
			{
				name: "description",
				content: "DiaLearn connects diaspora students and parents with vetted African tutors for calm, one-to-one learning."
			},
			{
				name: "author",
				content: "Sahara Hub Limited"
			},
			{
				property: "og:title",
				content: "DiaLearn — African tutors for diaspora families"
			},
			{
				property: "og:description",
				content: "DiaLearn connects diaspora students and parents with vetted African tutors for calm, one-to-one learning."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..600&family=Public+Sans:ital,wght@0,300..800;1,400..600&display=swap"
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon.png"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$78.useRouteContext();
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		const { data } = authClient.onAuthStateChange((event) => {
			if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
			router.invalidate();
			if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
		});
		return () => data.subscription.unsubscribe();
	}, [router, queryClient]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})] })
	});
}
var $$splitComponentImporter$77 = () => import("./routes-xwGA3yv4.mjs");
var Route$77 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "DiaLearn — African tutors for diaspora families" },
		{
			name: "description",
			content: "Book one-to-one lessons with vetted African tutors. DiaLearn connects diaspora students and parents with teachers who know their curriculum."
		},
		{
			property: "og:title",
			content: "DiaLearn — African tutors for diaspora families"
		},
		{
			property: "og:description",
			content: "Book one-to-one lessons with vetted African tutors who know your child's curriculum."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$77, "component")
});
/** Decorative persona icons, cycled in order — content itself stays DB-driven. */
var $$splitComponentImporter$76 = () => import("./route-Di7iQBCH.mjs");
var Route$76 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await authClient.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$76, "component")
});
var $$splitComponentImporter$75 = () => import("./about-DpiG5qSw.mjs");
var Route$75 = createFileRoute("/about")({
	head: () => ({ meta: [
		{ title: "About DiaLearn — by Sahara Hub Limited" },
		{
			name: "description",
			content: "DiaLearn is built by Sahara Hub Limited to connect diaspora families with African teachers, keeping language, curriculum and culture within reach."
		},
		{
			property: "og:title",
			content: "About DiaLearn — by Sahara Hub Limited"
		},
		{
			property: "og:description",
			content: "Why Sahara Hub Limited built DiaLearn for diaspora families and African teachers."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$75, "component")
});
var $$splitComponentImporter$74 = () => import("./auth-CPfLGCUd.mjs");
var Route$74 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Sign in or create a DiaLearn account" },
		{
			name: "description",
			content: "Sign in to DiaLearn or create a parent, student, tutor or agency account, verified by email link."
		},
		{
			property: "og:title",
			content: "Sign in or create a DiaLearn account"
		},
		{
			property: "og:description",
			content: "Parent, student, tutor and agency accounts for the DiaLearn tutoring marketplace."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$74, "component")
});
var $$splitComponentImporter$73 = () => import("./become-a-tutor-Ykr5KFlK.mjs");
var Route$73 = createFileRoute("/become-a-tutor")({
	head: () => ({ meta: [
		{ title: "Become a DiaLearn tutor" },
		{
			name: "description",
			content: "Teach diaspora students from anywhere in Africa. See the DiaLearn verification steps, how you set your rate and how payouts work."
		},
		{
			property: "og:title",
			content: "Become a DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "Teach diaspora families, set your own rate and get paid reliably with DiaLearn."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$73, "component")
});
var $$splitComponentImporter$72 = () => import("./class-preview-CZfV2XLO.mjs");
var Route$72 = createFileRoute("/class-preview")({
	head: () => ({ meta: [
		{ title: "What a DiaLearn class looks like" },
		{
			name: "description",
			content: "Watch a sample DiaLearn lesson: live one-to-one video, a shared whiteboard and a recording parents can review afterwards."
		},
		{
			property: "og:title",
			content: "What a DiaLearn class looks like"
		},
		{
			property: "og:description",
			content: "See a sample DiaLearn lesson before you book — live, one-to-one and recorded."
		},
		{
			property: "og:type",
			content: "video.other"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$72, "component")
});
var $$splitComponentImporter$71 = () => import("./contact-a4cGhCyR.mjs");
var Route$71 = createFileRoute("/contact")({
	head: () => ({ meta: [
		{ title: "Contact DiaLearn" },
		{
			name: "description",
			content: "Contact the DiaLearn team about finding a tutor, joining as a tutor or agency, or reporting a concern."
		},
		{
			property: "og:title",
			content: "Contact DiaLearn"
		},
		{
			property: "og:description",
			content: "Questions about tutoring, joining as a tutor or agency, or a concern to report?"
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$71, "component")
});
var $$splitComponentImporter$70 = () => import("./explore-BqJR_IRr.mjs");
var Route$70 = createFileRoute("/explore")({
	head: () => ({ meta: [
		{ title: "Explore tutors, subjects and curricula — DiaLearn" },
		{
			name: "description",
			content: "Browse DiaLearn by subject, curriculum, tutor location or tutor profile — every path leads to the same verified tutor search."
		},
		{
			property: "og:title",
			content: "Explore tutors, subjects and curricula — DiaLearn"
		},
		{
			property: "og:description",
			content: "Four ways to browse DiaLearn: by subject, curriculum, location or tutor."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$70, "component")
});
var $$splitComponentImporter$69 = () => import("./for-agencies-BfLrfgvQ.mjs");
var Route$69 = createFileRoute("/for-agencies")({
	head: () => ({ meta: [
		{ title: "DiaLearn for tutor agencies" },
		{
			name: "description",
			content: "Bring your tutoring team onto DiaLearn: manage a verified roster, agency-level commission terms and consolidated reporting."
		},
		{
			property: "og:title",
			content: "DiaLearn for tutor agencies"
		},
		{
			property: "og:description",
			content: "Manage a verified roster of tutors, agency commission terms and reporting in one place."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$69, "component")
});
var $$splitComponentImporter$68 = () => import("./help-4NB2b5Wo.mjs");
var Route$68 = createFileRoute("/help")({
	head: () => ({ meta: [
		{ title: "Help centre — DiaLearn" },
		{
			name: "description",
			content: "Answers for families, learners and tutors: booking, payments, cancellations, live classes, verification and payouts."
		},
		{
			property: "og:title",
			content: "Help centre — DiaLearn"
		},
		{
			property: "og:description",
			content: "Answers for families, learners and tutors on DiaLearn."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$68, "component")
});
/**
* Every answer here describes what the product actually does today.
*
* The cancellation window is the one thing not written in: it is an admin
* setting, so it is read from the same `cancellation_policies` the refund
* engine uses rather than repeated here, where it would drift the first time
* someone changed it.
*/
var $$splitComponentImporter$67 = () => import("./how-it-works-B3tmokw6.mjs");
var Route$67 = createFileRoute("/how-it-works")({
	head: () => ({ meta: [
		{ title: "How DiaLearn works for parents and students" },
		{
			name: "description",
			content: "Search verified African tutors, book a lesson in your own timezone, learn live one-to-one, and follow progress from your parent or student portal."
		},
		{
			property: "og:title",
			content: "How DiaLearn works for parents and students"
		},
		{
			property: "og:description",
			content: "From searching for a tutor to reviewing lesson recordings — how DiaLearn works."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$67, "component")
});
var $$splitComponentImporter$66 = () => import("./pricing-D1wVFgNn.mjs");
var Route$66 = createFileRoute("/pricing")({
	head: () => ({ meta: [
		{ title: "How payment works on DiaLearn" },
		{
			name: "description",
			content: "Lesson prices come from the tutor's hourly rate and the lesson length. See how DiaLearn's commission, platform fee and refund windows work."
		},
		{
			property: "og:title",
			content: "How payment works on DiaLearn"
		},
		{
			property: "og:description",
			content: "Tutor rate times lesson length, plus a transparent platform fee. No packages."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$66, "component")
});
var $$splitComponentImporter$65 = () => import("./privacy-CkHmBqot.mjs");
var Route$65 = createFileRoute("/privacy")({
	head: () => ({ meta: [
		{ title: "Privacy notice — DiaLearn" },
		{
			name: "description",
			content: "What DiaLearn holds about families, learners and tutors, why, who it is shared with, and what you can ask us to do with it."
		},
		{
			property: "og:title",
			content: "Privacy notice — DiaLearn"
		},
		{
			property: "og:description",
			content: "What DiaLearn holds about you, and what you can ask us to do with it."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$65, "component")
});
var $$splitComponentImporter$64 = () => import("./subjects-B7AcDaCL.mjs");
var Route$64 = createFileRoute("/subjects")({
	head: () => ({ meta: [
		{ title: "Subjects taught on DiaLearn" },
		{
			name: "description",
			content: "Every subject DiaLearn tutors teach, from core school subjects to African languages, with the curricula they follow."
		},
		{
			property: "og:title",
			content: "Subjects taught on DiaLearn"
		},
		{
			property: "og:description",
			content: "Browse every subject and curriculum available on DiaLearn."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$64, "component")
});
var $$splitComponentImporter$63 = () => import("./terms-BhyHO9lY.mjs");
var Route$63 = createFileRoute("/terms")({
	head: () => ({ meta: [
		{ title: "Terms of service — DiaLearn" },
		{
			name: "description",
			content: "The terms families and tutors agree to when they use DiaLearn: accounts, booking, payment, commission, cancellations and conduct."
		},
		{
			property: "og:title",
			content: "Terms of service — DiaLearn"
		},
		{
			property: "og:description",
			content: "The terms families and tutors agree to when they use DiaLearn."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$63, "component")
});
var $$splitComponentImporter$62 = () => import("./trust-and-safety-DbqPlVft.mjs");
var Route$62 = createFileRoute("/trust-and-safety")({
	head: () => ({ meta: [
		{ title: "Trust & safety at DiaLearn" },
		{
			name: "description",
			content: "How DiaLearn verifies tutors, protects children, secures payments and handles cancellations and refunds."
		},
		{
			property: "og:title",
			content: "Trust & safety at DiaLearn"
		},
		{
			property: "og:description",
			content: "Tutor verification, child safety, secure payments and clear refund windows."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$62, "component")
});
var $$splitComponentImporter$61 = () => import("./account-BzMt8rwY.mjs");
var Route$61 = createFileRoute("/_authenticated/account")({
	head: () => ({ meta: [
		{ title: "My DiaLearn account" },
		{
			name: "description",
			content: "Manage your DiaLearn profile, timezone, currency and account permissions."
		},
		{
			property: "og:title",
			content: "My DiaLearn account"
		},
		{
			property: "og:description",
			content: "Manage your DiaLearn profile and preferences."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$61, "component")
});
var $$splitComponentImporter$60 = () => import("./bookings-B0MCCLfC.mjs");
var Route$60 = createFileRoute("/_authenticated/bookings")({
	head: () => ({ meta: [
		{ title: "Bookings & schedule — DiaLearn parent portal" },
		{
			name: "description",
			content: "See every scheduled, completed and cancelled class across all your children, in your own timezone."
		},
		{
			property: "og:title",
			content: "Bookings & schedule — DiaLearn parent portal"
		},
		{
			property: "og:description",
			content: "One family schedule across every child and tutor."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$60, "component")
});
var $$splitComponentImporter$59 = () => import("./dashboard-Dc9K0j1j.mjs");
var Route$59 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [
		{ title: "Parent dashboard — DiaLearn" },
		{
			name: "description",
			content: "See every child's upcoming classes, learning hours, tutors, payments and approvals in one calm family view."
		},
		{
			property: "og:title",
			content: "Parent dashboard — DiaLearn"
		},
		{
			property: "og:description",
			content: "Your family's education command centre: classes, tutors, progress and payments."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$59, "component")
});
var $$splitComponentImporter$58 = () => import("./family-CFb7VOzN.mjs");
var Route$58 = createFileRoute("/_authenticated/family")({
	head: () => ({ meta: [
		{ title: "Family & student profiles — DiaLearn" },
		{
			name: "description",
			content: "Create and manage linked child student profiles, each with its own curriculum, level and learning goals."
		},
		{
			property: "og:title",
			content: "Family & student profiles — DiaLearn"
		},
		{
			property: "og:description",
			content: "Parents manage every child's education profile and permissions in one place."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$58, "component")
});
var $$splitComponentImporter$57 = () => import("./messages-CuOlUX_6.mjs");
var Route$57 = createFileRoute("/_authenticated/messages")({
	head: () => ({ meta: [
		{ title: "Messages — DiaLearn parent portal" },
		{
			name: "description",
			content: "Talk to your children's tutors. Every conversation stays on DiaLearn so there is a record."
		},
		{
			property: "og:title",
			content: "Messages — DiaLearn parent portal"
		},
		{
			property: "og:description",
			content: "Talk to your children's tutors, on the record."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$57, "component")
});
var $$splitComponentImporter$56 = () => import("./my-tutors-BcvpmLm2.mjs");
var Route$56 = createFileRoute("/_authenticated/my-tutors")({
	head: () => ({ meta: [
		{ title: "Your tutors — DiaLearn parent portal" },
		{
			name: "description",
			content: "The tutors your children have lessons with, how much they have taught and when you next see them."
		},
		{
			property: "og:title",
			content: "Your tutors — DiaLearn parent portal"
		},
		{
			property: "og:description",
			content: "The tutors your children have lessons with."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$56, "component")
});
var $$splitComponentImporter$55 = () => import("./notifications-CwcwxvcS.mjs");
var Route$55 = createFileRoute("/_authenticated/notifications")({
	head: () => ({ meta: [
		{ title: "Notifications — DiaLearn parent portal" },
		{
			name: "description",
			content: "Class reminders, booking confirmations, payment receipts and tutor messages for your whole family."
		},
		{
			property: "og:title",
			content: "Notifications — DiaLearn parent portal"
		},
		{
			property: "og:description",
			content: "Every DiaLearn alert for your family in one place."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$55, "component")
});
var $$splitComponentImporter$54 = () => import("./payments-CWBcCfrP.mjs");
var Route$54 = createFileRoute("/_authenticated/payments")({
	head: () => ({ meta: [
		{ title: "Payments — DiaLearn parent portal" },
		{
			name: "description",
			content: "Every lesson charge and refund on your family account, with what each one paid for."
		},
		{
			property: "og:title",
			content: "Payments — DiaLearn parent portal"
		},
		{
			property: "og:description",
			content: "Every lesson charge and refund on your family account."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$54, "component")
});
/** Money only adds up within one currency, so totals are kept per currency. */
var $$splitComponentImporter$53 = () => import("./progress-D_nBHcIv.mjs");
var Route$53 = createFileRoute("/_authenticated/progress")({
	head: () => ({ meta: [
		{ title: "Learning progress — DiaLearn parent portal" },
		{
			name: "description",
			content: "How each child is doing by subject: lessons completed, attendance and the ratings their tutors gave."
		},
		{
			property: "og:title",
			content: "Learning progress — DiaLearn parent portal"
		},
		{
			property: "og:description",
			content: "How each child is doing, subject by subject."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$53, "component")
});
/** Attendance as a percentage, or null when there is nothing to divide by. */
var $$splitComponentImporter$52 = () => import("./reports-OFzrTqMf.mjs");
var Route$52 = createFileRoute("/_authenticated/reports")({
	head: () => ({ meta: [
		{ title: "Reports — DiaLearn parent portal" },
		{
			name: "description",
			content: "A month-by-month summary of your family's lessons and spend, with a CSV you can download."
		},
		{
			property: "og:title",
			content: "Reports — DiaLearn parent portal"
		},
		{
			property: "og:description",
			content: "A month-by-month summary of lessons and spend."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$52, "component")
});
var $$splitComponentImporter$51 = () => import("./settings-BkNI-3SJ.mjs");
var Route$51 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [
		{ title: "Settings — DiaLearn parent portal" },
		{
			name: "description",
			content: "Update your parent profile, contact details, timezone and preferred currency, and manage account security."
		},
		{
			property: "og:title",
			content: "Settings — DiaLearn parent portal"
		},
		{
			property: "og:description",
			content: "Manage your DiaLearn account preferences and security."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$51, "component")
});
var $$splitComponentImporter$50 = () => import("./auth.accept-invite-DH4_JsQ1.mjs");
var Route$50 = createFileRoute("/auth/accept-invite")({
	head: () => ({ meta: [{ title: "Accept your DiaLearn admin invitation" }, {
		name: "description",
		content: "Enter your one-time password and choose a password for your DiaLearn admin account."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$50, "component")
});
/** Supabase puts link errors on the hash (implicit flow) or the query (PKCE). */
var $$splitComponentImporter$49 = () => import("./auth.forgot-password-DLSqEJvJ.mjs");
var Route$49 = createFileRoute("/auth/forgot-password")({
	head: () => ({ meta: [{ title: "Reset your DiaLearn password" }, {
		name: "description",
		content: "Request a password reset link for your DiaLearn account."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$49, "component")
});
var $$splitComponentImporter$48 = () => import("./auth.reset-password-B4GJPveU.mjs");
var Route$48 = createFileRoute("/auth/reset-password")({
	head: () => ({ meta: [{ title: "Set a new DiaLearn password" }, {
		name: "description",
		content: "Set a new password for your DiaLearn account."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$48, "component")
});
/** Reads Supabase's error params off either the hash (implicit flow) or the query string (PKCE). */
var $$splitComponentImporter$47 = () => import("./admin.admins-DKv1xwx0.mjs");
var Route$47 = createFileRoute("/_authenticated/admin/admins")({
	beforeLoad: adminBeforeLoad({ superAdminOnly: true }),
	head: () => ({ meta: [{ title: "Admins & roles — DiaLearn admin" }, {
		name: "description",
		content: "Invite admins, and decide what each of them can reach."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$47, "component")
});
var $$splitComponentImporter$46 = () => import("./admin.agencies-BZdMgx7q.mjs");
var Route$46 = createFileRoute("/_authenticated/admin/agencies")({
	beforeLoad: adminBeforeLoad(),
	head: () => ({ meta: [{ title: "Agencies — DiaLearn admin" }, {
		name: "description",
		content: "Review tutoring agencies, verify them and set their agreed share."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$46, "component")
});
var $$splitComponentImporter$45 = () => import("./admin.approvals-79OQmrun.mjs");
var Route$45 = createFileRoute("/_authenticated/admin/approvals")({
	beforeLoad: adminBeforeLoad(),
	head: () => ({ meta: [{ title: "Approvals — DiaLearn admin" }, {
		name: "description",
		content: "Review and approve admin actions that move money or change who has access."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$45, "component")
});
var $$splitComponentImporter$44 = () => import("./admin.audit-wXakufHB.mjs");
var Route$44 = createFileRoute("/_authenticated/admin/audit")({
	beforeLoad: adminBeforeLoad(),
	head: () => ({ meta: [{ title: "Audit log — DiaLearn admin" }, {
		name: "description",
		content: "An append-only record of every admin action on the platform."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$44, "component")
});
/** Only the keys that actually differ, so the detail pane shows the change and
*  not the whole row. */
var $$splitComponentImporter$43 = () => import("./admin.bookings-Bqdfs1xa.mjs");
var Route$43 = createFileRoute("/_authenticated/admin/bookings")({
	beforeLoad: adminBeforeLoad(),
	head: () => ({ meta: [{ title: "Bookings — DiaLearn admin" }, {
		name: "description",
		content: "Search, override and cancel bookings across the platform."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$43, "component")
});
/** Overrides that don't touch money — cancellation is a separate flow so the
* refund calculation can never be skipped by accident. */
var $$splitComponentImporter$42 = () => import("./admin.dashboard-DD1G733i.mjs");
var Route$42 = createFileRoute("/_authenticated/admin/dashboard")({
	beforeLoad: adminBeforeLoad(),
	head: () => ({ meta: [{ title: "Admin dashboard — DiaLearn" }, {
		name: "description",
		content: "Platform-wide growth, marketplace and quality KPIs for the DiaLearn admin team."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$42, "component")
});
var $$splitComponentImporter$41 = () => import("./admin.disputes-DJ7XphcH.mjs");
var Route$41 = createFileRoute("/_authenticated/admin/disputes")({
	beforeLoad: adminBeforeLoad(),
	head: () => ({ meta: [{ title: "Disputes — DiaLearn admin" }, {
		name: "description",
		content: "Review and resolve disputes raised between platform users."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$41, "component")
});
var $$splitComponentImporter$40 = () => import("./admin.moderation-BmDIWH5k.mjs");
var Route$40 = createFileRoute("/_authenticated/admin/moderation")({
	beforeLoad: adminBeforeLoad(),
	head: () => ({ meta: [{ title: "Moderation — DiaLearn admin" }, {
		name: "description",
		content: "Moderate reviews and messages; suspend accounts from Users."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$40, "component")
});
var $$splitComponentImporter$39 = () => import("./admin.payments-DVk1qXFg.mjs");
var Route$39 = createFileRoute("/_authenticated/admin/payments")({
	beforeLoad: adminBeforeLoad(),
	head: () => ({ meta: [{ title: "Payments — DiaLearn admin" }, {
		name: "description",
		content: "Transaction history, flagged payments and refunds across the platform."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$39, "component")
});
var $$splitComponentImporter$38 = () => import("./admin.payouts-BhCQUADi.mjs");
var Route$38 = createFileRoute("/_authenticated/admin/payouts")({
	beforeLoad: adminBeforeLoad(),
	head: () => ({ meta: [{ title: "Payouts — DiaLearn admin" }, {
		name: "description",
		content: "Review and settle tutor payout requests."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$38, "component")
});
var $$splitComponentImporter$37 = () => import("./admin.reports-CVRxDjM9.mjs");
var Route$37 = createFileRoute("/_authenticated/admin/reports")({
	beforeLoad: adminBeforeLoad(),
	head: () => ({ meta: [{ title: "Reports — DiaLearn admin" }, {
		name: "description",
		content: "Growth, revenue, engagement and quality figures for a chosen date range, exportable as CSV."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$37, "component")
});
var $$splitComponentImporter$36 = () => import("./admin.security-DL9_4AkK.mjs");
var Route$36 = createFileRoute("/_authenticated/admin/security")({
	beforeLoad: adminBeforeLoad({ allowPasswordChangePending: true }),
	head: () => ({ meta: [{ title: "Security — DiaLearn admin" }, {
		name: "description",
		content: "Change the password on your DiaLearn admin account."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$36, "component")
});
var $$splitComponentImporter$35 = () => import("./admin.settings-CcQREHUl.mjs");
var Route$35 = createFileRoute("/_authenticated/admin/settings")({
	beforeLoad: adminBeforeLoad(),
	head: () => ({ meta: [
		{ title: "Platform settings — DiaLearn admin" },
		{
			name: "description",
			content: "Admin-editable subjects, curricula, commission rules and notification templates for DiaLearn."
		},
		{
			property: "og:title",
			content: "Platform settings — DiaLearn admin"
		},
		{
			property: "og:description",
			content: "Configure marketplace taxonomy, commission and notification templates."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$35, "component")
});
var $$splitComponentImporter$34 = () => import("./admin.users-CA9k7Smz.mjs");
var Route$34 = createFileRoute("/_authenticated/admin/users")({
	beforeLoad: adminBeforeLoad(),
	head: () => ({ meta: [{ title: "Users — DiaLearn admin" }, {
		name: "description",
		content: "Search, suspend and edit accounts across every role on DiaLearn."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$34, "component")
});
/** Everyday roles only. admin and super_admin are deliberately absent: granting
* either is a privilege change that goes through Admins & roles and the
* approval queue, never a checkbox on the general user list. */
/** Still needed for the filter dropdown and the role badges on the table. */
/** The embedded user_roles(role) select resolves to a SelectQueryError against
*  the stale generated types, so the shape is asserted once here rather than at
*  each use. Regenerating types.ts makes this cast redundant. */
var $$splitComponentImporter$33 = () => import("./admin.verification-BuaoiVId.mjs");
var Route$33 = createFileRoute("/_authenticated/admin/verification")({
	beforeLoad: adminBeforeLoad(),
	head: () => ({ meta: [{ title: "Tutor verification — DiaLearn admin" }, {
		name: "description",
		content: "Review tutor qualifications and identity documents before they go live in search."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$33, "component")
});
var $$splitComponentImporter$32 = () => import("./agency.bookings-DJnrUrjf.mjs");
var Route$32 = createFileRoute("/_authenticated/agency/bookings")({
	head: () => ({ meta: [{ title: "Bookings — DiaLearn agency" }, {
		name: "description",
		content: "Every lesson booked with your agency's tutors."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$32, "component")
});
var $$splitComponentImporter$31 = () => import("./agency.dashboard-CHoL9Dno.mjs");
var Route$31 = createFileRoute("/_authenticated/agency/dashboard")({
	head: () => ({ meta: [{ title: "Agency dashboard — DiaLearn" }, {
		name: "description",
		content: "Your tutoring team at a glance: tutors, verification, bookings and earnings."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$31, "component")
});
var $$splitComponentImporter$30 = () => import("./agency.earnings-DIr89Mt0.mjs");
var Route$30 = createFileRoute("/_authenticated/agency/earnings")({
	head: () => ({ meta: [{ title: "Earnings — DiaLearn agency" }, {
		name: "description",
		content: "Your agency's share, each tutor's totals, and your payouts."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$30, "component")
});
var $$splitComponentImporter$29 = () => import("./agency.profile-DoK7hVpH.mjs");
var Route$29 = createFileRoute("/_authenticated/agency/profile")({
	head: () => ({ meta: [{ title: "Agency profile — DiaLearn" }, {
		name: "description",
		content: "Your agency's details and its verification with DiaLearn."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$29, "component")
});
var $$splitComponentImporter$28 = () => import("./children.index-BG3BDODK.mjs");
var Route$28 = createFileRoute("/_authenticated/children/")({
	head: () => ({ meta: [
		{ title: "My children — DiaLearn parent portal" },
		{
			name: "description",
			content: "Add learners, keep each child's curriculum and level up to date, and control what they can do on DiaLearn."
		},
		{
			property: "og:title",
			content: "My children — DiaLearn parent portal"
		},
		{
			property: "og:description",
			content: "One place to manage each child's education profile and permissions."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$28, "component")
});
var $$splitComponentImporter$27 = () => import("./student.dashboard-CkO8OhfY.mjs");
var Route$27 = createFileRoute("/_authenticated/student/dashboard")({
	head: () => ({ meta: [{ title: "My Dashboard — DiaLearn Student Portal" }, {
		name: "description",
		content: "See your upcoming classes, assignments due and latest tutor feedback."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$27, "component")
});
var $$splitComponentImporter$26 = () => import("./student.find-tutor-mo7jZAbB.mjs");
var Route$26 = createFileRoute("/_authenticated/student/find-tutor")({
	head: () => ({ meta: [{ title: "Find a Tutor — DiaLearn Student Portal" }, {
		name: "description",
		content: "Search verified tutors to help you learn. Ask a parent to book one for you."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
var $$splitComponentImporter$25 = () => import("./student.history-BPkJ9Xl3.mjs");
var Route$25 = createFileRoute("/_authenticated/student/history")({
	head: () => ({ meta: [{ title: "My Classes & Progress — DiaLearn Student Portal" }, {
		name: "description",
		content: "View your class history, tutor notes and track your learning progress."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var $$splitComponentImporter$24 = () => import("./student.materials-ZkwvQ9Nt.mjs");
var Route$24 = createFileRoute("/_authenticated/student/materials")({
	head: () => ({ meta: [{ title: "Assignments & Materials — DiaLearn Student Portal" }, {
		name: "description",
		content: "View learning materials and submit your assignments."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
var $$splitComponentImporter$23 = () => import("./student.messages-DLOBLY4G.mjs");
var Route$23 = createFileRoute("/_authenticated/student/messages")({
	head: () => ({ meta: [{ title: "Messages — DiaLearn Student Portal" }, {
		name: "description",
		content: "Send and receive messages with your tutors securely on DiaLearn."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./student.my-tutors-CdDPKCYI.mjs");
var Route$22 = createFileRoute("/_authenticated/student/my-tutors")({
	head: () => ({ meta: [{ title: "My Tutors — DiaLearn Student Portal" }, {
		name: "description",
		content: "The tutors you learn with, your lessons together and when you next meet."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
/** One entry per tutor, built from the learner's own bookings. */
var $$splitComponentImporter$21 = () => import("./student.notifications-Di_MrW0W.mjs");
var Route$21 = createFileRoute("/_authenticated/student/notifications")({
	head: () => ({ meta: [{ title: "Notifications — DiaLearn Student Portal" }, {
		name: "description",
		content: "Your latest notifications from DiaLearn."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./student.progress-DWdHqqFU.mjs");
var Route$20 = createFileRoute("/_authenticated/student/progress")({
	head: () => ({ meta: [{ title: "My Progress — DiaLearn Student Portal" }, {
		name: "description",
		content: "Lessons completed, time spent learning and how you are doing in each subject."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
/** Attendance as a percentage, or null when nothing has happened yet. */
var $$splitComponentImporter$19 = () => import("./student.schedule-CeeJvznW.mjs");
var Route$19 = createFileRoute("/_authenticated/student/schedule")({
	head: () => ({ meta: [{ title: "Schedule — DiaLearn Student Portal" }, {
		name: "description",
		content: "Your upcoming lessons, grouped by day and shown in your own timezone."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
/** A lesson is joinable from fifteen minutes before it starts. */
var $$splitComponentImporter$18 = () => import("./tutor.analytics-DuDaYj4F.mjs");
var Route$18 = createFileRoute("/_authenticated/tutor/analytics")({
	head: () => ({ meta: [{ title: "Analytics — DiaLearn tutor" }, {
		name: "description",
		content: "How your teaching is going: lessons delivered, attendance, cancellations, earnings and what families rate you on."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./tutor.assignments-DNAeYek8.mjs");
var Route$17 = createFileRoute("/_authenticated/tutor/assignments")({
	head: () => ({ meta: [
		{ title: "Assignments — DiaLearn tutor" },
		{
			name: "description",
			content: "Set homework for your DiaLearn learners, follow submissions from draft to reviewed, and leave written feedback."
		},
		{
			property: "og:title",
			content: "Assignments — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "Homework, submissions and feedback in one workspace."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./tutor.availability-Ln5sieZX.mjs");
var Route$16 = createFileRoute("/_authenticated/tutor/availability")({
	head: () => ({ meta: [
		{ title: "Availability — DiaLearn tutor" },
		{
			name: "description",
			content: "Set the weekly hours you teach. Families only ever see slots inside your own availability windows."
		},
		{
			property: "og:title",
			content: "Availability — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "Publish the weekly hours you teach, in your own timezone."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./tutor.classes-CSliHsWR.mjs");
var Route$15 = createFileRoute("/_authenticated/tutor/classes")({
	head: () => ({ meta: [
		{ title: "My classes — DiaLearn tutor" },
		{
			name: "description",
			content: "Review lesson requests, confirmed classes, past lessons and cancellations, grouped by day in your own timezone."
		},
		{
			property: "og:title",
			content: "My classes — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "Your teaching calendar: requests, confirmed lessons and history in one place."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./tutor.dashboard-Bz30DpNr.mjs");
var Route$14 = createFileRoute("/_authenticated/tutor/dashboard")({
	head: () => ({ meta: [
		{ title: "Tutor dashboard — DiaLearn" },
		{
			name: "description",
			content: "Your teaching day at a glance: today's classes, lesson requests, students and verification status."
		},
		{
			property: "og:title",
			content: "Tutor dashboard — DiaLearn"
		},
		{
			property: "og:description",
			content: "Teach with confidence: classes, requests, students and verification in one calm view."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./tutor.earnings-BsoQettv.mjs");
var Route$13 = createFileRoute("/_authenticated/tutor/earnings")({
	head: () => ({ meta: [
		{ title: "Earnings & payouts — DiaLearn tutor" },
		{
			name: "description",
			content: "Track your available balance, pending earnings, platform commission per lesson and request payouts in your settlement currency."
		},
		{
			property: "og:title",
			content: "Earnings & payouts — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "Every lesson's gross, commission and net amount, plus payout history."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./tutor.messages-Crs78VIC.mjs");
var Route$12 = createFileRoute("/_authenticated/tutor/messages")({
	head: () => ({ meta: [
		{ title: "Messages — DiaLearn tutor" },
		{
			name: "description",
			content: "Message learners and their guardians securely inside DiaLearn, with every conversation kept on the platform."
		},
		{
			property: "og:title",
			content: "Messages — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "Secure in-platform conversations with the families you teach."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./tutor.notifications-BbWRbCi3.mjs");
var Route$11 = createFileRoute("/_authenticated/tutor/notifications")({
	head: () => ({ meta: [
		{ title: "Notifications — DiaLearn tutor" },
		{
			name: "description",
			content: "Booking requests, verification decisions and platform updates, all generated from DiaLearn's notification templates."
		},
		{
			property: "og:title",
			content: "Notifications — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "Everything DiaLearn needs to tell you, in one quiet inbox."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./tutor.onboarding-Ulg7oZdz.mjs");
var Route$10 = createFileRoute("/_authenticated/tutor/onboarding")({
	head: () => ({ meta: [{ title: "Set up your teaching profile — DiaLearn tutor" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./tutor.profile-85DajUuj.mjs");
var Route$9 = createFileRoute("/_authenticated/tutor/profile")({
	head: () => ({ meta: [
		{ title: "Teaching profile — DiaLearn tutor" },
		{
			name: "description",
			content: "Tell families who you teach, how you teach and what you charge. Your profile goes live once you are verified."
		},
		{
			property: "og:title",
			content: "Teaching profile — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "Craft the profile families read before they book a lesson with you."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./tutor.resources-__cC0Tt4.mjs");
var Route$8 = createFileRoute("/_authenticated/tutor/resources")({
	head: () => ({ meta: [
		{ title: "Learning materials — DiaLearn tutor" },
		{
			name: "description",
			content: "Build a library of PDFs, videos and links for your DiaLearn learners, stored privately and shared only with the families you choose."
		},
		{
			property: "og:title",
			content: "Learning materials — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "Your teaching library: worksheets, recordings and reading links."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./tutor.reviews-tXulVwI2.mjs");
var Route$7 = createFileRoute("/_authenticated/tutor/reviews")({
	head: () => ({ meta: [
		{ title: "Ratings & reviews — DiaLearn tutor" },
		{
			name: "description",
			content: "See how families rate your teaching quality, communication, punctuality and preparation, with every published review in one place."
		},
		{
			property: "og:title",
			content: "Ratings & reviews — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "Your rating breakdown and the words families used."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./tutor.settings-D9CIehUP.mjs");
var Route$6 = createFileRoute("/_authenticated/tutor/settings")({
	head: () => ({ meta: [
		{ title: "Settings — DiaLearn tutor portal" },
		{
			name: "description",
			content: "Update your tutor account details, timezone and settlement currency, and manage security, payouts and availability."
		},
		{
			property: "og:title",
			content: "Settings — DiaLearn tutor portal"
		},
		{
			property: "og:description",
			content: "Manage your DiaLearn tutor account, security and payout preferences."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./tutor.students-CJ3Uetev.mjs");
var Route$5 = createFileRoute("/_authenticated/tutor/students")({
	head: () => ({ meta: [
		{ title: "My students — DiaLearn tutor" },
		{
			name: "description",
			content: "Every learner you teach, with their level, curriculum, subjects, lessons completed and next class."
		},
		{
			property: "og:title",
			content: "My students — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "A calm roster of the learners you teach on DiaLearn."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./tutor.verification-D2T4bQUF.mjs");
var Route$4 = createFileRoute("/_authenticated/tutor/verification")({
	head: () => ({ meta: [
		{ title: "Verification — DiaLearn tutor" },
		{
			name: "description",
			content: "Upload your identity and qualification documents. Every DiaLearn tutor is verified by our team before appearing in search."
		},
		{
			property: "og:title",
			content: "Verification — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "Complete the DiaLearn verification steps so families can book you with confidence."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./agency.tutors.index-Zk8e20Lq.mjs");
var Route$3 = createFileRoute("/_authenticated/agency/tutors/")({
	head: () => ({ meta: [{ title: "Tutors — DiaLearn agency" }, {
		name: "description",
		content: "Add and manage the tutors under your agency."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./tutor.classroom._bookingId-Bhm2qCaS.mjs");
var Route$2 = createFileRoute("/_authenticated/tutor/classroom/$bookingId")({
	head: () => ({ meta: [
		{ title: "Live classroom — DiaLearn tutor" },
		{
			name: "description",
			content: "Run your DiaLearn lesson: video area, shared whiteboard, class chat and a lesson timer, with access limited to the people in the booking."
		},
		{
			property: "og:title",
			content: "Live classroom — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "Your teaching room for confirmed DiaLearn lessons."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./tutor.notes._bookingId-eD8nCkXM.mjs");
var Route$1 = createFileRoute("/_authenticated/tutor/notes/$bookingId")({
	head: () => ({ meta: [
		{ title: "Lesson notes — DiaLearn tutor" },
		{
			name: "description",
			content: "Capture what was covered, how the learner is doing, what to improve and the next steps, straight after a DiaLearn lesson."
		},
		{
			property: "og:title",
			content: "Lesson notes — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "A fast post-class record shared with the learner's family."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./tutor.students._studentId-PCIwf_7R.mjs");
var Route = createFileRoute("/_authenticated/tutor/students/$studentId")({
	head: () => ({ meta: [
		{ title: "Learner progress — DiaLearn tutor" },
		{
			name: "description",
			content: "Follow one learner's DiaLearn journey: hours taught, attendance, lesson history, assignments and your notes."
		},
		{
			property: "og:title",
			content: "Learner progress — DiaLearn tutor"
		},
		{
			property: "og:description",
			content: "Hours, attendance and assignments for a single learner."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$77.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$78
});
var AuthenticatedRouteRoute = Route$76.update({
	id: "/_authenticated",
	getParentRoute: () => Route$78
});
var AboutRoute = Route$75.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$78
});
var AuthRoute = Route$74.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$78
});
var BecomeATutorRoute = Route$73.update({
	id: "/become-a-tutor",
	path: "/become-a-tutor",
	getParentRoute: () => Route$78
});
var ClassPreviewRoute = Route$72.update({
	id: "/class-preview",
	path: "/class-preview",
	getParentRoute: () => Route$78
});
var ContactRoute = Route$71.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => Route$78
});
var ExploreRoute = Route$70.update({
	id: "/explore",
	path: "/explore",
	getParentRoute: () => Route$78
});
var ForAgenciesRoute = Route$69.update({
	id: "/for-agencies",
	path: "/for-agencies",
	getParentRoute: () => Route$78
});
var HelpRoute = Route$68.update({
	id: "/help",
	path: "/help",
	getParentRoute: () => Route$78
});
var HowItWorksRoute = Route$67.update({
	id: "/how-it-works",
	path: "/how-it-works",
	getParentRoute: () => Route$78
});
var PricingRoute = Route$66.update({
	id: "/pricing",
	path: "/pricing",
	getParentRoute: () => Route$78
});
var PrivacyRoute = Route$65.update({
	id: "/privacy",
	path: "/privacy",
	getParentRoute: () => Route$78
});
var SubjectsRoute = Route$64.update({
	id: "/subjects",
	path: "/subjects",
	getParentRoute: () => Route$78
});
var TermsRoute = Route$63.update({
	id: "/terms",
	path: "/terms",
	getParentRoute: () => Route$78
});
var TrustAndSafetyRoute = Route$62.update({
	id: "/trust-and-safety",
	path: "/trust-and-safety",
	getParentRoute: () => Route$78
});
var AuthenticatedAccountRoute = Route$61.update({
	id: "/account",
	path: "/account",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedBookingsRoute = Route$60.update({
	id: "/bookings",
	path: "/bookings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDashboardRoute = Route$59.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedFamilyRoute = Route$58.update({
	id: "/family",
	path: "/family",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedFindTutorRoute = Route$82.update({
	id: "/find-tutor",
	path: "/find-tutor",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedMessagesRoute = Route$57.update({
	id: "/messages",
	path: "/messages",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedMyTutorsRoute = Route$56.update({
	id: "/my-tutors",
	path: "/my-tutors",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedNotificationsRoute = Route$55.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedPaymentsRoute = Route$54.update({
	id: "/payments",
	path: "/payments",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProgressRoute = Route$53.update({
	id: "/progress",
	path: "/progress",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedReportsRoute = Route$52.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSettingsRoute = Route$51.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthAcceptInviteRoute = Route$50.update({
	id: "/accept-invite",
	path: "/accept-invite",
	getParentRoute: () => AuthRoute
});
var AuthForgotPasswordRoute = Route$49.update({
	id: "/forgot-password",
	path: "/forgot-password",
	getParentRoute: () => AuthRoute
});
var AuthResetPasswordRoute = Route$48.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => AuthRoute
});
var TutorsIndexRoute = Route$83.update({
	id: "/tutors/",
	path: "/tutors/",
	getParentRoute: () => Route$78
});
var TutorsTutorIdRoute = Route$84.update({
	id: "/tutors/$tutorId",
	path: "/tutors/$tutorId",
	getParentRoute: () => Route$78
});
var AuthenticatedAdminAdminsRoute = Route$47.update({
	id: "/admin/admins",
	path: "/admin/admins",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminAgenciesRoute = Route$46.update({
	id: "/admin/agencies",
	path: "/admin/agencies",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminApprovalsRoute = Route$45.update({
	id: "/admin/approvals",
	path: "/admin/approvals",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminAuditRoute = Route$44.update({
	id: "/admin/audit",
	path: "/admin/audit",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminBookingsRoute = Route$43.update({
	id: "/admin/bookings",
	path: "/admin/bookings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminDashboardRoute = Route$42.update({
	id: "/admin/dashboard",
	path: "/admin/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminDisputesRoute = Route$41.update({
	id: "/admin/disputes",
	path: "/admin/disputes",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminModerationRoute = Route$40.update({
	id: "/admin/moderation",
	path: "/admin/moderation",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminPaymentsRoute = Route$39.update({
	id: "/admin/payments",
	path: "/admin/payments",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminPayoutsRoute = Route$38.update({
	id: "/admin/payouts",
	path: "/admin/payouts",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminReportsRoute = Route$37.update({
	id: "/admin/reports",
	path: "/admin/reports",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminSecurityRoute = Route$36.update({
	id: "/admin/security",
	path: "/admin/security",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminSettingsRoute = Route$35.update({
	id: "/admin/settings",
	path: "/admin/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminUsersRoute = Route$34.update({
	id: "/admin/users",
	path: "/admin/users",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminVerificationRoute = Route$33.update({
	id: "/admin/verification",
	path: "/admin/verification",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAgencyBookingsRoute = Route$32.update({
	id: "/agency/bookings",
	path: "/agency/bookings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAgencyDashboardRoute = Route$31.update({
	id: "/agency/dashboard",
	path: "/agency/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAgencyEarningsRoute = Route$30.update({
	id: "/agency/earnings",
	path: "/agency/earnings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAgencyProfileRoute = Route$29.update({
	id: "/agency/profile",
	path: "/agency/profile",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedBookTutorIdRoute = Route$80.update({
	id: "/book/$tutorId",
	path: "/book/$tutorId",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedChildrenIndexRoute = Route$28.update({
	id: "/children/",
	path: "/children/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedChildrenStudentIdRoute = Route$81.update({
	id: "/children/$studentId",
	path: "/children/$studentId",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedStudentDashboardRoute = Route$27.update({
	id: "/student/dashboard",
	path: "/student/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedStudentFindTutorRoute = Route$26.update({
	id: "/student/find-tutor",
	path: "/student/find-tutor",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedStudentHistoryRoute = Route$25.update({
	id: "/student/history",
	path: "/student/history",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedStudentMaterialsRoute = Route$24.update({
	id: "/student/materials",
	path: "/student/materials",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedStudentMessagesRoute = Route$23.update({
	id: "/student/messages",
	path: "/student/messages",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedStudentMyTutorsRoute = Route$22.update({
	id: "/student/my-tutors",
	path: "/student/my-tutors",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedStudentNotificationsRoute = Route$21.update({
	id: "/student/notifications",
	path: "/student/notifications",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedStudentProgressRoute = Route$20.update({
	id: "/student/progress",
	path: "/student/progress",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedStudentScheduleRoute = Route$19.update({
	id: "/student/schedule",
	path: "/student/schedule",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorAnalyticsRoute = Route$18.update({
	id: "/tutor/analytics",
	path: "/tutor/analytics",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorAssignmentsRoute = Route$17.update({
	id: "/tutor/assignments",
	path: "/tutor/assignments",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorAvailabilityRoute = Route$16.update({
	id: "/tutor/availability",
	path: "/tutor/availability",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorClassesRoute = Route$15.update({
	id: "/tutor/classes",
	path: "/tutor/classes",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorDashboardRoute = Route$14.update({
	id: "/tutor/dashboard",
	path: "/tutor/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorEarningsRoute = Route$13.update({
	id: "/tutor/earnings",
	path: "/tutor/earnings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorMessagesRoute = Route$12.update({
	id: "/tutor/messages",
	path: "/tutor/messages",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorNotificationsRoute = Route$11.update({
	id: "/tutor/notifications",
	path: "/tutor/notifications",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorOnboardingRoute = Route$10.update({
	id: "/tutor/onboarding",
	path: "/tutor/onboarding",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorProfileRoute = Route$9.update({
	id: "/tutor/profile",
	path: "/tutor/profile",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorResourcesRoute = Route$8.update({
	id: "/tutor/resources",
	path: "/tutor/resources",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorReviewsRoute = Route$7.update({
	id: "/tutor/reviews",
	path: "/tutor/reviews",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorSettingsRoute = Route$6.update({
	id: "/tutor/settings",
	path: "/tutor/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorStudentsRoute = Route$5.update({
	id: "/tutor/students",
	path: "/tutor/students",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorVerificationRoute = Route$4.update({
	id: "/tutor/verification",
	path: "/tutor/verification",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAgencyTutorsIndexRoute = Route$3.update({
	id: "/agency/tutors/",
	path: "/agency/tutors/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAgencyTutorsTutorIdRoute = Route$79.update({
	id: "/agency/tutors/$tutorId",
	path: "/agency/tutors/$tutorId",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedStudentBookTutorIdRoute = Route$85.update({
	id: "/student/book/$tutorId",
	path: "/student/book/$tutorId",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedStudentClassroomBookingIdRoute = Route$86.update({
	id: "/student/classroom/$bookingId",
	path: "/student/classroom/$bookingId",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorClassroomBookingIdRoute = Route$2.update({
	id: "/tutor/classroom/$bookingId",
	path: "/tutor/classroom/$bookingId",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorNotesBookingIdRoute = Route$1.update({
	id: "/tutor/notes/$bookingId",
	path: "/tutor/notes/$bookingId",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTutorStudentsRouteChildren = { AuthenticatedTutorStudentsStudentIdRoute: Route.update({
	id: "/$studentId",
	path: "/$studentId",
	getParentRoute: () => AuthenticatedTutorStudentsRoute
}) };
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAccountRoute,
	AuthenticatedBookingsRoute,
	AuthenticatedDashboardRoute,
	AuthenticatedFamilyRoute,
	AuthenticatedFindTutorRoute,
	AuthenticatedMessagesRoute,
	AuthenticatedMyTutorsRoute,
	AuthenticatedNotificationsRoute,
	AuthenticatedPaymentsRoute,
	AuthenticatedProgressRoute,
	AuthenticatedReportsRoute,
	AuthenticatedSettingsRoute,
	AuthenticatedAdminAdminsRoute,
	AuthenticatedAdminAgenciesRoute,
	AuthenticatedAdminApprovalsRoute,
	AuthenticatedAdminAuditRoute,
	AuthenticatedAdminBookingsRoute,
	AuthenticatedAdminDashboardRoute,
	AuthenticatedAdminDisputesRoute,
	AuthenticatedAdminModerationRoute,
	AuthenticatedAdminPaymentsRoute,
	AuthenticatedAdminPayoutsRoute,
	AuthenticatedAdminReportsRoute,
	AuthenticatedAdminSecurityRoute,
	AuthenticatedAdminSettingsRoute,
	AuthenticatedAdminUsersRoute,
	AuthenticatedAdminVerificationRoute,
	AuthenticatedAgencyBookingsRoute,
	AuthenticatedAgencyDashboardRoute,
	AuthenticatedAgencyEarningsRoute,
	AuthenticatedAgencyProfileRoute,
	AuthenticatedBookTutorIdRoute,
	AuthenticatedChildrenStudentIdRoute,
	AuthenticatedStudentDashboardRoute,
	AuthenticatedStudentFindTutorRoute,
	AuthenticatedStudentHistoryRoute,
	AuthenticatedStudentMaterialsRoute,
	AuthenticatedStudentMessagesRoute,
	AuthenticatedStudentMyTutorsRoute,
	AuthenticatedStudentNotificationsRoute,
	AuthenticatedStudentProgressRoute,
	AuthenticatedStudentScheduleRoute,
	AuthenticatedTutorAnalyticsRoute,
	AuthenticatedTutorAssignmentsRoute,
	AuthenticatedTutorAvailabilityRoute,
	AuthenticatedTutorClassesRoute,
	AuthenticatedTutorDashboardRoute,
	AuthenticatedTutorEarningsRoute,
	AuthenticatedTutorMessagesRoute,
	AuthenticatedTutorNotificationsRoute,
	AuthenticatedTutorOnboardingRoute,
	AuthenticatedTutorProfileRoute,
	AuthenticatedTutorResourcesRoute,
	AuthenticatedTutorReviewsRoute,
	AuthenticatedTutorSettingsRoute,
	AuthenticatedTutorStudentsRoute: AuthenticatedTutorStudentsRoute._addFileChildren(AuthenticatedTutorStudentsRouteChildren),
	AuthenticatedTutorVerificationRoute,
	AuthenticatedChildrenIndexRoute,
	AuthenticatedAgencyTutorsTutorIdRoute,
	AuthenticatedStudentBookTutorIdRoute,
	AuthenticatedStudentClassroomBookingIdRoute,
	AuthenticatedTutorClassroomBookingIdRoute,
	AuthenticatedTutorNotesBookingIdRoute,
	AuthenticatedAgencyTutorsIndexRoute
};
var AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
var AuthRouteChildren = {
	AuthAcceptInviteRoute,
	AuthForgotPasswordRoute,
	AuthResetPasswordRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
	AboutRoute,
	AuthRoute: AuthRoute._addFileChildren(AuthRouteChildren),
	BecomeATutorRoute,
	ClassPreviewRoute,
	ContactRoute,
	ExploreRoute,
	ForAgenciesRoute,
	HelpRoute,
	HowItWorksRoute,
	PricingRoute,
	PrivacyRoute,
	SubjectsRoute,
	TermsRoute,
	TrustAndSafetyRoute,
	TutorsTutorIdRoute,
	TutorsIndexRoute
};
var routeTree = Route$78._addFileChildren(rootRouteChildren)._addFileTypes();
/**
* Query defaults, chosen for a database that is not on this machine.
*
* PostgreSQL is hosted, so a request costs 1–3 seconds of round trip, and the
* API rate-limits to 120 requests a minute. React Query's own defaults —
* `staleTime: 0`, refetch on every mount and every window focus, three
* retries — were written for a fast local API and are actively harmful here:
* shared hooks like `useTutorRecord` are called from both the page and the
* shell, so a single navigation refetched the same rows several times, and a
* run of screens could spend the minute's budget and start failing. That is
* what made the verification screen show "we couldn't load your verification
* status" at random while the endpoint behind it was perfectly healthy.
*/
function createQueryClient() {
	return new QueryClient({ defaultOptions: { queries: {
		staleTime: 3e4,
		refetchOnWindowFocus: false,
		retry: (failureCount, error) => {
			if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
			return failureCount < 2;
		}
	} } });
}
var getRouter = () => {
	const queryClient = createQueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 3e4
	});
};
//#endregion
export { getRouter };
