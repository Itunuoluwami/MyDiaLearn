import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn } from "./button-Be6IoNc1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lazy-image-ELIP8TVW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Image that lazy-loads below the fold and fades in once decoded, so a slow
* network never looks like broken UI.
*/
function LazyImage({ src, alt, className, wrapperClassName, eager = false, sizes }) {
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("relative block overflow-hidden bg-muted", wrapperClassName),
		children: [!loaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			className: "absolute inset-0 shimmer"
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt,
			...sizes ? { sizes } : {},
			loading: eager ? "eager" : "lazy",
			decoding: "async",
			onLoad: () => setLoaded(true),
			onError: () => setLoaded(true),
			className: cn("h-full w-full object-cover transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0", className)
		})]
	});
}
//#endregion
export { LazyImage as t };
