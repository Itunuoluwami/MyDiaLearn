import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button, t as BRAND } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { t as portalHome } from "./portal-home-BO3OTxAy.mjs";
import { Q as Menu } from "../_libs/lucide-react.mjs";
import { n as SheetContent, o as SheetTrigger, t as Sheet } from "./sheet-Cis54Nrd.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-separator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PublicShell-B-2cvcEl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Separator = import_react.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	decorative,
	orientation,
	className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
	...props
}));
Separator.displayName = Root.displayName;
var NAV_LINKS = [
	{
		to: "/explore",
		label: "Explore"
	},
	{
		to: "/tutors",
		label: "Find a tutor"
	},
	{
		to: "/how-it-works",
		label: "How it works"
	},
	{
		to: "/pricing",
		label: "Pricing"
	},
	{
		to: "/become-a-tutor",
		label: "Become a tutor"
	},
	{
		to: "/for-agencies",
		label: "For agencies"
	}
];
var FOOTER_GROUPS = [
	{
		title: "Learn",
		links: [
			{
				to: "/explore",
				label: "Explore subjects"
			},
			{
				to: "/subjects",
				label: "All subjects"
			},
			{
				to: "/tutors",
				label: "Browse tutors"
			},
			{
				to: "/how-it-works",
				label: "How it works"
			},
			{
				to: "/class-preview",
				label: "What a class looks like"
			},
			{
				to: "/pricing",
				label: "How payment works"
			}
		]
	},
	{
		title: "Teach",
		links: [
			{
				to: "/become-a-tutor",
				label: "Become a tutor"
			},
			{
				to: "/for-agencies",
				label: "For tutor agencies"
			},
			{
				to: "/auth",
				label: "Tutor sign in"
			}
		]
	},
	{
		title: "Company",
		links: [
			{
				to: "/about",
				label: "About DiaLearn"
			},
			{
				to: "/trust-and-safety",
				label: "Trust & safety"
			},
			{
				to: "/help",
				label: "Help centre"
			},
			{
				to: "/contact",
				label: "Contact us"
			}
		]
	},
	{
		title: "Legal",
		links: [{
			to: "/terms",
			label: "Terms of service"
		}, {
			to: "/privacy",
			label: "Privacy notice"
		}]
	}
];
function PublicShell({ children }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const { session, loading, roles } = useAuth();
	const portalPath = portalHome(roles);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container-site grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2 lg:flex lg:justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "flex min-w-0 items-center",
							"aria-label": "DiaLearn home",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: BRAND.logoUrl,
								alt: "DiaLearn",
								className: "h-11 w-auto md:h-12"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "hidden items-center gap-1 lg:flex",
							"aria-label": "Main",
							children: NAV_LINKS.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: link.to,
								className: "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
								activeProps: { className: "text-foreground" },
								children: link.label
							}, link.to))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hidden items-center gap-2 sm:flex",
								children: loading ? null : session ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: portalPath,
										children: portalPath === "/account" ? "My account" : "Dashboard"
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "ghost",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth",
										children: "Sign in"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "cta",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/tutors",
										children: "Find a tutor"
									})
								})] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
								open,
								onOpenChange: setOpen,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "icon",
										className: "size-11 lg:hidden",
										"aria-label": "Open menu",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
									side: "right",
									className: "w-[19rem] overflow-y-auto p-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "border-b border-border p-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: BRAND.logoUrl,
												alt: "DiaLearn",
												className: "h-11 w-auto"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
											className: "flex flex-col p-2",
											"aria-label": "Mobile",
											children: [
												NAV_LINKS.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: link.to,
													onClick: () => setOpen(false),
													className: "flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted",
													children: link.label
												}, link.to)),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-2" }),
												[
													{
														to: "/about",
														label: "About"
													},
													{
														to: "/trust-and-safety",
														label: "Trust & safety"
													},
													{
														to: "/contact",
														label: "Contact"
													}
												].map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: link.to,
													onClick: () => setOpen(false),
													className: "flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
													children: link.label
												}, link.to))
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-col gap-2 p-4",
											children: session ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												asChild: true,
												onClick: () => setOpen(false),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: portalPath,
													children: portalPath === "/account" ? "My account" : "Dashboard"
												})
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												asChild: true,
												variant: "cta",
												onClick: () => setOpen(false),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/tutors",
													children: "Find a tutor"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												asChild: true,
												variant: "outline",
												onClick: () => setOpen(false),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/auth",
													children: "Sign in"
												})
											})] })
										})
									]
								})]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "band-ink mt-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container-site py-10 md:py-14",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-8 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: BRAND.logoUrl,
							alt: "DiaLearn",
							className: "h-11 w-auto brightness-0 invert",
							loading: "lazy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 max-w-xs text-sm text-ink-foreground/70",
							children: [BRAND.tagline, " — one-to-one lessons between diaspora families and vetted African tutors."]
						})] }), FOOTER_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-sm font-semibold text-secondary",
							children: group.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1",
							children: group.links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: link.to,
								className: "flex min-h-9 items-center text-sm text-ink-foreground/75 transition-colors hover:text-ink-foreground",
								children: link.label
							}) }, link.label))
						})] }, group.title))]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 border-t border-ink-foreground/15 pt-6 text-xs text-ink-foreground/60",
						children: [
							"© ",
							(/* @__PURE__ */ new Date()).getFullYear(),
							" ",
							BRAND.company,
							". All rights reserved."
						]
					})]
				})
			})
		]
	});
}
//#endregion
export { PublicShell as t };
