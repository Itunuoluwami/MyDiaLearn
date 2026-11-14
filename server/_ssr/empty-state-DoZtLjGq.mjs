import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn } from "./button-Be6IoNc1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/empty-state-DoZtLjGq.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Shared empty state: icon in a soft brand medallion, a plain-language title,
* one helpful sentence and an optional next action. Never "No data".
*/
function EmptyState({ icon: Icon, title, description, action, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("card-warm flex flex-col items-center justify-center px-6 py-10 text-center animate-fade-in", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": "true",
				className: "flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-soft to-secondary-soft text-primary-deep shadow-soft",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-6",
					strokeWidth: 1.75
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 text-lg",
				children: title
			}),
			description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-sm text-sm text-muted-foreground",
				children: description
			}) : null,
			action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: action
			}) : null
		]
	});
}
//#endregion
export { EmptyState as t };
