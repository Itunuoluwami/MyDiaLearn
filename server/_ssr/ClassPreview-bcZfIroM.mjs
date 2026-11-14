import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { qt as Check, z as Play } from "../_libs/lucide-react.mjs";
import { a as settingText, d as usePublicSettings, r as settingList } from "./public-data-D6Ffdjlb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ClassPreview-bcZfIroM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* "What a DiaLearn class looks like" module.
* Video URL, poster, intro copy and bullets all come from admin-editable
* platform settings — nothing about the video is hardcoded.
*/
function ClassPreview({ heading = "What a DiaLearn class looks like" }) {
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const { data: settings } = usePublicSettings();
	const videoUrl = settingText(settings, "content.class_preview_video_url");
	const poster = settingText(settings, "content.class_preview_poster_url") || "/assets/class-poster-BWDZrZEq.jpg";
	const intro = settingText(settings, "content.class_preview_intro", "See what a typical DiaLearn lesson feels like.");
	const bullets = settingList(settings, "content.class_preview_bullets");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "display-section",
				children: heading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lead mx-auto mt-3 max-w-2xl",
				children: intro
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card-warm mt-8 overflow-hidden p-0 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative aspect-video w-full bg-ink",
					children: playing && videoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
						src: videoUrl,
						title: "DiaLearn sample lesson",
						allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
						allowFullScreen: true,
						className: "absolute inset-0 size-full"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setPlaying(true),
						disabled: !videoUrl,
						className: "focus-ring group absolute inset-0 size-full",
						"aria-label": "Play the sample DiaLearn lesson",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: poster,
								alt: "A DiaLearn tutor teaching a live online lesson",
								className: "size-full object-cover",
								loading: "lazy",
								width: 1600,
								height: 912
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 bg-ink/25 transition-colors group-hover:bg-ink/35" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute inset-0 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lift transition-transform group-hover:scale-105 md:size-20",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-7 translate-x-0.5 fill-current md:size-8" })
								})
							}),
							!videoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute inset-x-0 bottom-0 bg-ink/80 p-3 text-center text-xs text-ink-foreground",
								children: "A lesson preview video has not been published yet."
							}) : null
						]
					})
				}), bullets.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-3 p-5 sm:grid-cols-3 md:p-6",
					children: bullets.map((bullet) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 size-4 shrink-0 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: bullet })]
					}, bullet))
				}) : null]
			})
		]
	});
}
//#endregion
export { ClassPreview as t };
