import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { R as Plus, a as Users } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as childName, r as childInitials } from "./parent-data-Dj0LJH5W.mjs";
import { r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ChildSwitcher-D_zmULnc.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Reusable child selector. Horizontal and thumb-friendly on mobile, compact
* chips on desktop. Selection is owned by the caller so every screen can scope
* its data to exactly one child.
*/
function ChildSwitcher({ children: kids, selectedId, onSelect, allowAll = true, className }) {
	if (kids.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
		icon: Users,
		title: "Add your first learner",
		body: "Create a profile to start finding tutors and managing their learning journey.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "cta",
			className: "min-h-11",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/children",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add child"]
			})
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "tablist",
		"aria-label": "Select a child",
		className: cn("-mx-1 flex gap-2 overflow-x-auto px-1 pb-1", className),
		children: [allowAll ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			role: "tab",
			"aria-selected": selectedId === null,
			onClick: () => onSelect(null),
			className: cn("focus-ring flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200", selectedId === null ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-card text-muted-foreground hover:text-foreground"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
				className: "size-4",
				"aria-hidden": "true"
			}), " All children"]
		}) : null, kids.map((child) => {
			const active = selectedId === child.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				role: "tab",
				"aria-selected": active,
				onClick: () => onSelect(child.id),
				className: cn("focus-ring flex min-h-11 shrink-0 items-center gap-2 rounded-full border pl-1.5 pr-4 text-sm font-medium transition-all duration-200", active ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-card text-muted-foreground hover:text-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("flex size-8 items-center justify-center rounded-full text-xs font-semibold", active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary-soft text-primary-deep"),
					children: childInitials(child)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "max-w-28 truncate",
					children: childName(child)
				})]
			}, child.id);
		})]
	});
}
//#endregion
export { ChildSwitcher as t };
