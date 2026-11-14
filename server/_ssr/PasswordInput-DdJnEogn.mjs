import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn } from "./button-Be6IoNc1.mjs";
import { Tt as EyeOff, wt as Eye } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PasswordInput-DdJnEogn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PasswordInput = (0, import_react.forwardRef)(function PasswordInput({ className, ...props }, ref) {
	const [visible, setVisible] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			...props,
			ref,
			type: visible ? "text" : "password",
			className: cn("h-11 pr-12", className)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setVisible((value) => !value),
			"aria-label": visible ? "Hide password" : "Show password",
			"aria-pressed": visible,
			disabled: props.disabled,
			className: "absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
			children: visible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, {
				className: "size-4",
				"aria-hidden": "true"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
				className: "size-4",
				"aria-hidden": "true"
			})
		})]
	});
});
//#endregion
export { PasswordInput as t };
