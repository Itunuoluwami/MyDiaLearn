import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { St as Flag, it as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as apiPost } from "./data-client-kVSxwzg_.mjs";
import { t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-Drj9JKn2.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ReportIssueDialog-DKUG413I.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DISPUTE_CATEGORY_LABEL = {
	payment: "Payment issue",
	conduct: "Conduct concern",
	quality: "Lesson quality",
	scheduling: "Scheduling problem",
	other: "Something else"
};
var DISPUTE_CATEGORY_OPTIONS = [
	"payment",
	"conduct",
	"quality",
	"scheduling",
	"other"
];
/**
* Raises a dispute against a booking via the raise_dispute() RPC (added in
* the Admin Portal Phase 4A disputes migration). The RPC itself validates
* the caller is actually a party to the booking — booked_by, the student,
* the student's parent, or the tutor — so this hook can be used as-is from
* the Parent, Student and Tutor portals without any extra client-side
* authorization logic.
*/
function useRaiseDispute() {
	return useMutation({ mutationFn: async (input) => {
		return (await apiPost(`/bookings/${input.bookingId}/disputes`, {
			category: input.category,
			description: input.description
		})).id;
	} });
}
/**
* "Report an issue" — the Parent/Student/Tutor-side UI for raise_dispute(),
* which existed as a callable RPC (Admin Portal Phase 4A) with no UI trigger
* in any portal until now. Works the same in all three portals since the
* RPC itself checks the caller is actually party to the booking; each portal
* just needs to render this next to its booking.
*/
function ReportIssueDialog({ bookingId, trigger }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [category, setCategory] = (0, import_react.useState)("other");
	const [description, setDescription] = (0, import_react.useState)("");
	const raiseDispute = useRaiseDispute();
	function reset() {
		setCategory("other");
		setDescription("");
	}
	async function handleSubmit() {
		if (description.trim().length < 10) {
			toast.error("Give us a few more details (at least 10 characters).");
			return;
		}
		try {
			await raiseDispute.mutateAsync({
				bookingId,
				category,
				description: description.trim()
			});
			toast.success("Reported — the DiaLearn team will review it.");
			setOpen(false);
			reset();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Couldn't submit your report. Please try again.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: (next) => {
			setOpen(next);
			if (!next) reset();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: trigger ?? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				className: "min-h-11 text-muted-foreground sm:min-h-9",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" }), "Report an issue"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Report an issue" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Tell us what happened with this lesson. DiaLearn will review it and follow up." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "What kind of issue?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: category,
						onValueChange: (value) => setCategory(value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: DISPUTE_CATEGORY_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: option,
							children: DISPUTE_CATEGORY_LABEL[option]
						}, option)) })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "issue-description",
						children: "What happened?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "issue-description",
						rows: 4,
						placeholder: "Share as much detail as you can — dates, what was said, what you expected instead.",
						value: description,
						onChange: (event) => setDescription(event.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => setOpen(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				disabled: raiseDispute.isPending,
				onClick: () => void handleSubmit(),
				children: [raiseDispute.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" }), "Submit report"]
			})] })
		] })]
	});
}
//#endregion
export { ReportIssueDialog as t };
