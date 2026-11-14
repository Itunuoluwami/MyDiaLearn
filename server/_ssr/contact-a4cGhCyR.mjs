import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button, t as BRAND } from "./button-Be6IoNc1.mjs";
import { J as MessageSquare, et as Mail } from "../_libs/lucide-react.mjs";
import { t as PublicShell } from "./PublicShell-B-2cvcEl.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-a4cGhCyR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TOPICS = [
	"Finding a tutor",
	"Becoming a tutor",
	"Tutor agency enquiry",
	"Payments and refunds",
	"Report a concern",
	"Something else"
];
var SUPPORT_EMAIL = "hello@dialearn.com";
function ContactPage() {
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [topic, setTopic] = (0, import_react.useState)(TOPICS[0]);
	const [message, setMessage] = (0, import_react.useState)("");
	function handleSubmit(event) {
		event.preventDefault();
		const subject = encodeURIComponent(`${topic} — ${name || "DiaLearn enquiry"}`);
		const body = encodeURIComponent(`${message}\n\n—\n${name}\n${email}`);
		window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
		toast.success("Opening your email app to send this message");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "band-hero border-b border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-site py-10 md:py-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Contact"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "display-hero mt-3 max-w-2xl",
					children: "We read every message."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "lead mt-4 max-w-2xl",
					children: [
						"Tell us what you need and the right person at ",
						BRAND.company,
						" will reply."
					]
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "container-site section-y grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "card-warm space-y-4 p-5 md:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "contact-name",
							children: "Your name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "contact-name",
							required: true,
							value: name,
							onChange: (event) => setName(event.target.value),
							className: "min-h-11"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "contact-email",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "contact-email",
							type: "email",
							required: true,
							value: email,
							onChange: (event) => setEmail(event.target.value),
							className: "min-h-11"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "What is this about?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: topic,
						onValueChange: setTopic,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "min-h-11 w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TOPICS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: item,
							children: item
						}, item)) })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "contact-message",
						children: "Message"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "contact-message",
						required: true,
						rows: 6,
						value: message,
						onChange: (event) => setMessage(event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "cta",
					size: "lg",
					className: "w-full sm:w-auto",
					children: "Send message"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-portal p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-5 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 text-base font-semibold",
						children: "Email us directly"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `mailto:${SUPPORT_EMAIL}`,
						className: "mt-1 block text-sm text-primary underline-offset-4 hover:underline",
						children: SUPPORT_EMAIL
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-portal p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-5 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 text-base font-semibold",
						children: "Response times"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Most enquiries are answered within one business day. Safety reports are prioritised."
					})
				]
			})]
		})]
	})] });
}
//#endregion
export { ContactPage as component };
