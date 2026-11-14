import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { I as Quote, y as Star } from "../_libs/lucide-react.mjs";
import { d as usePublicSettings, i as settingMap } from "./public-data-D6Ffdjlb.mjs";
import { t as parent_child_default } from "./parent-child-lYSaC0xx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AuthSidePanel-DhhEVo5S.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Imagery + reassuring copy shown beside the auth forms.
* All copy comes from the admin-editable `content.auth_panel` setting.
*/
function AuthSidePanel() {
	const { data: settings } = usePublicSettings();
	const panel = settingMap(settings, "content.auth_panel");
	const image = panel["image_url"]?.startsWith("http") ? panel["image_url"] : parent_child_default;
	const headline = panel["headline"] || "Learning starts with the right support.";
	const body = panel["body"] || "Connect with trusted African educators and give every learner the support they need to thrive.";
	const quote = panel["quote"];
	const author = panel["author"];
	const authorRole = panel["author_role"];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "relative hidden h-full overflow-hidden rounded-2xl lg:block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: image,
				alt: "A parent and child learning together with a DiaLearn tutor",
				className: "absolute inset-0 size-full object-cover",
				loading: "lazy"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-[oklch(0.24_0.04_215_/_0.92)] via-[oklch(0.24_0.04_215_/_0.55)] to-[oklch(0.24_0.04_215_/_0.2)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex h-full min-h-[34rem] flex-col justify-end gap-6 p-8 xl:p-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl leading-tight text-primary-foreground",
						children: headline
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-relaxed text-primary-foreground/85",
						children: body
					})]
				}), quote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
					className: "rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quote, {
							className: "size-5 text-secondary",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
							className: "mt-3 text-sm leading-relaxed text-primary-foreground",
							children: quote
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
							className: "mt-4 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-primary-foreground",
								children: author
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-primary-foreground/75",
								children: authorRole
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-0.5",
								"aria-label": "Rated 5 out of 5",
								children: [
									0,
									1,
									2,
									3,
									4
								].map((index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
									className: "size-3.5 fill-secondary text-secondary",
									"aria-hidden": "true"
								}, index))
							})]
						})
					]
				}) : null]
			})
		]
	});
}
//#endregion
export { AuthSidePanel as t };
