import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn } from "./button-Be6IoNc1.mjs";
import { Kt as ChevronDown, Wt as ChevronUp, k as Search, qt as Check } from "../_libs/lucide-react.mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/select-BCADeg5Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Radix renders a hidden native <select> when the trigger sits inside a <form>.
* When a controlled value is applied before the matching option has registered,
* that native element bounces back a change event with an empty value, which
* silently wipes the caller's state (forms then "save" empty fields).
* Empty strings are never valid item values, so swallow them.
*/
var Select = ({ onValueChange, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select$1, {
	...props,
	onValueChange: (next) => {
		if (next === "") return;
		onValueChange?.(next);
	}
});
Select.displayName = "Select";
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
/** Pull plain text out of arbitrary React children so options can be filtered. */
function childText(node) {
	if (node === null || node === void 0 || typeof node === "boolean") return "";
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(childText).join(" ");
	if (import_react.isValidElement(node)) return childText(node.props.children);
	return "";
}
function isSelectItem(node) {
	return import_react.isValidElement(node) && node.type === SelectItem;
}
function countItems(children) {
	let total = 0;
	import_react.Children.forEach(children, (child) => {
		if (isSelectItem(child)) total += 1;
		else if (import_react.isValidElement(child)) total += countItems(child.props.children);
	});
	return total;
}
function filterChildren(children, query) {
	return import_react.Children.map(children, (child) => {
		if (isSelectItem(child)) return (childText(child.props.children) || String(child.props.value ?? "")).toLowerCase().includes(query) ? child : null;
		if (import_react.isValidElement(child)) {
			const nested = child.props.children;
			if (nested === void 0) return child;
			const filtered = filterChildren(nested, query);
			if (!import_react.Children.toArray(filtered).some(Boolean)) return null;
			return import_react.cloneElement(child, { children: filtered });
		}
		return child;
	});
}
/** Long lists (more than this many options) get a search box automatically. */
var SEARCH_THRESHOLD = 8;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", searchable, searchPlaceholder, ...props }, ref) => {
	const [query, setQuery] = import_react.useState("");
	const total = import_react.useMemo(() => countItems(children), [children]);
	const showSearch = searchable ?? total > SEARCH_THRESHOLD;
	const normalized = query.trim().toLowerCase();
	const visible = import_react.useMemo(() => showSearch && normalized ? filterChildren(children, normalized) : children, [
		children,
		normalized,
		showSearch
	]);
	const hasResults = import_react.Children.toArray(visible).some(Boolean);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
		ref,
		className: cn("relative z-50 flex max-h-(--radix-select-content-available-height) min-w-[8rem] flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
		position,
		...props,
		children: [
			showSearch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky top-0 z-10 border-b bg-popover p-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						className: "pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoFocus: true,
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: searchPlaceholder ?? "Search…",
						"aria-label": searchPlaceholder ?? "Search options",
						className: "h-10 w-full rounded-md border border-input bg-transparent pl-8 pr-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring",
						onKeyDown: (event) => {
							if (![
								"ArrowDown",
								"ArrowUp",
								"Enter",
								"Escape",
								"Tab"
							].includes(event.key)) event.stopPropagation();
						}
					})]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectViewport, {
				className: cn("max-h-72 overflow-y-auto overflow-x-hidden p-1", position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]"),
				children: [visible, showSearch && !hasResults ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-2 py-6 text-center text-sm text-muted-foreground",
					children: "No matches found"
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
		]
	}) });
});
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
//#endregion
export { SelectValue as a, SelectTrigger as i, SelectContent as n, SelectItem as r, Select as t };
