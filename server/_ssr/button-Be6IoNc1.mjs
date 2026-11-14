import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { h as Slot, v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-Be6IoNc1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Brand constants for DiaLearn (Sahara Hub Limited). */
var BRAND = {
	name: "DiaLearn",
	company: "Sahara Hub Limited",
	tagline: "Learn. Grow. Go Global.",
	/** Served from public/. Was a Lovable CDN path that 404d once we left. */
	logoUrl: "/dialearn-logo.png"
};
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow-soft hover:bg-primary-deep hover:shadow-lift hover:-translate-y-0.5",
			/** Key conversion moments only — "Book a Lesson". Use sparingly. */
			cta: "bg-gradient-to-b from-accent to-accent/90 text-accent-foreground shadow-lift hover:shadow-hover hover:brightness-[1.03] hover:-translate-y-0.5",
			/** Warm ochre, for secondary marketing actions. */
			warm: "bg-secondary text-secondary-foreground shadow-soft hover:shadow-lift hover:brightness-[1.03] hover:-translate-y-0.5",
			destructive: "bg-destructive text-destructive-foreground shadow-soft hover:brightness-95",
			outline: "border border-border bg-card text-foreground shadow-soft hover:bg-surface hover:border-primary-soft hover:shadow-lift hover:-translate-y-0.5",
			/** Quiet action on tinted backgrounds. */
			subtle: "bg-primary-soft text-primary-deep hover:bg-primary-soft/70",
			secondary: "bg-surface text-foreground hover:bg-muted",
			ghost: "text-foreground hover:bg-surface",
			/** For use on dark editorial bands. */
			onInk: "border border-ink-foreground/25 text-ink-foreground hover:bg-ink-foreground/10",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-11 px-5 py-2",
			sm: "h-9 px-3.5 text-[0.8125rem]",
			lg: "h-12 px-8 text-base",
			/** Compact control for dense portal toolbars and tables. */
			portal: "h-8 rounded-sm px-3 text-[0.8125rem] font-medium",
			icon: "h-11 w-11",
			iconSm: "h-8 w-8 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
export { cn as i, Button as n, buttonVariants as r, BRAND as t };
