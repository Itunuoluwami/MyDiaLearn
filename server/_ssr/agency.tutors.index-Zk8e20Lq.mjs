import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { a as Users, et as Mail, it as LoaderCircle, l as UserPlus, u as UserMinus } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-Drj9JKn2.mjs";
import { n as VERIFICATION_TONE, t as VERIFICATION_LABEL } from "./tutor-data-BgedrW1M.mjs";
import { s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-CAdlRg97.mjs";
import { n as useAddAgencyTutor, t as AgencyShell, u as useAgencyTutors, v as useRemoveAgencyTutor } from "./AgencyShell-DfnQMswl.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agency.tutors.index-Zk8e20Lq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AddTutorDialog({ open, onClose }) {
	const add = useAddAgencyTutor();
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	async function handleSubmit(event) {
		event.preventDefault();
		if (fullName.trim().length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
			toast.error("Enter the tutor's full name and a valid email address.");
			return;
		}
		try {
			const result = await add.mutateAsync({
				fullName: fullName.trim(),
				email: email.trim().toLowerCase(),
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
			});
			toast.success(result.emailed ? `Tutor added. We've emailed ${email.trim()} a link to set their password.` : "Tutor added, but the email couldn't be sent. Ask them to use 'Forgot password' to sign in.");
			setFullName("");
			setEmail("");
			onClose();
		} catch (error) {
			toast.error(error.message || "We couldn't add that tutor.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (next) => !next && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add a tutor" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "We'll create their DiaLearn account under your agency and email them a link to set a password, so they can sign in and teach. You complete their profile next." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-4",
			onSubmit: (event) => void handleSubmit(event),
			noValidate: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "tutor-name",
						children: "Full name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "tutor-name",
						className: "min-h-11",
						value: fullName,
						onChange: (event) => setFullName(event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "tutor-email",
						children: "Email"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "tutor-email",
						type: "email",
						className: "min-h-11",
						value: email,
						onChange: (event) => setEmail(event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					className: "min-h-11",
					onClick: onClose,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					variant: "cta",
					className: "min-h-11",
					disabled: add.isPending,
					children: [add.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }), "Add and send invite"]
				})] })
			]
		})] })
	});
}
function AgencyTutorsPage() {
	const tutors = useAgencyTutors();
	const remove = useRemoveAgencyTutor();
	const [adding, setAdding] = (0, import_react.useState)(false);
	const [removing, setRemoving] = (0, import_react.useState)(null);
	const rows = tutors.data ?? [];
	async function confirmRemove() {
		if (!removing) return;
		try {
			await remove.mutateAsync(removing.tutorId);
			toast.success(`${removing.fullName ?? "Tutor"} is no longer part of your agency.`);
		} catch (error) {
			toast.error(error.message || "We couldn't remove that tutor.");
		} finally {
			setRemoving(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AgencyShell, {
		title: "Tutors",
		description: "Everyone teaching under your agency, their verification and earnings.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "cta",
			className: "min-h-11",
			onClick: () => setAdding(true),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), " Add a tutor"]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddTutorDialog, {
				open: adding,
				onClose: () => setAdding(false)
			}),
			tutors.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 4,
				height: "h-20"
			}) : tutors.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: tutors.error.message || "We couldn't load your tutors.",
				onRetry: () => void tutors.refetch()
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
				icon: Users,
				title: "No tutors yet",
				body: "Add a tutor to create their account under your agency. You can then fill in their profile, subjects and availability and submit them for verification.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "cta",
					className: "min-h-11",
					onClick: () => setAdding(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), " Add a tutor"]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				title: `${rows.length} tutor${rows.length === 1 ? "" : "s"}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: rows.map((tutor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/agency/tutors/$tutorId",
									params: { tutorId: tutor.tutorId },
									className: "focus-ring truncate rounded font-semibold hover:underline",
									children: tutor.fullName ?? "Tutor"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", VERIFICATION_TONE[tutor.verificationStatus]),
									children: tutor.isListed ? "Listed" : VERIFICATION_LABEL[tutor.verificationStatus]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 truncate text-xs text-muted-foreground",
								children: [tutor.email, tutor.headline ? ` · ${tutor.headline}` : ""]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-4 text-xs text-muted-foreground sm:justify-end",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground",
										children: tutor.lessonsCompleted
									}),
									" ",
									"lessons"
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Tutor",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground",
										children: formatMoney(tutor.tutorEarnings, tutor.currency)
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Agency",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground",
										children: formatMoney(tutor.agencyEarnings, tutor.currency)
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									size: "sm",
									className: "min-h-11 sm:min-h-9",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/agency/tutors/$tutorId",
										params: { tutorId: tutor.tutorId },
										children: "Manage"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									className: "size-11 sm:size-9",
									"aria-label": `Remove ${tutor.fullName ?? "tutor"} from agency`,
									onClick: () => setRemoving(tutor),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMinus, { className: "size-4" })
								})
							]
						})]
					}, tutor.tutorId))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: Boolean(removing),
				onOpenChange: (next) => !next && setRemoving(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
					"Remove ",
					removing?.fullName ?? "this tutor",
					"?"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "They keep their DiaLearn account and bookings, but leave your agency, stop appearing in search under your name, and you'll no longer receive a share of their lessons." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					disabled: remove.isPending,
					onClick: () => void confirmRemove(),
					children: "Remove from agency"
				})] })] })
			})
		]
	});
}
//#endregion
export { AgencyTutorsPage as component };
