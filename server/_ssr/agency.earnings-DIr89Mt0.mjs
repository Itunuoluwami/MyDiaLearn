import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { B as PiggyBank, a as Users, it as LoaderCircle, n as Wallet, sn as Banknote } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-Drj9JKn2.mjs";
import { s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
import { b as useRequestAgencyPayout, c as useAgencyEarnings, l as useAgencyPayouts, t as AgencyShell, u as useAgencyTutors } from "./AgencyShell-DfnQMswl.mjs";
import { a as KpiSkeletonGrid, i as KpiCard, l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { i as PAYOUT_TONE, r as PAYOUT_LABEL } from "./tutor-workspace-DMY2LNJP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agency.earnings-DIr89Mt0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AgencyEarningsPage() {
	const earnings = useAgencyEarnings();
	const payouts = useAgencyPayouts();
	const tutors = useAgencyTutors();
	const request = useRequestAgencyPayout();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [amount, setAmount] = (0, import_react.useState)("");
	const totals = earnings.data;
	const currency = totals?.currency ?? "USD";
	const available = Number(totals?.availableBalance ?? 0);
	const minimum = Number(totals?.minimumPayout ?? 0);
	async function handleRequest() {
		const value = Number(amount);
		if (!Number.isFinite(value) || value <= 0) {
			toast.error("Enter an amount greater than zero.");
			return;
		}
		if (minimum > 0 && value < minimum) {
			toast.error(`The minimum payout is ${formatMoney(minimum, currency)}.`);
			return;
		}
		if (value > available) {
			toast.error("That is more than your available balance.");
			return;
		}
		try {
			await request.mutateAsync(value);
			toast.success("Payout requested");
			setAmount("");
			setOpen(false);
		} catch (error) {
			toast.error(error.message || "We couldn't request that payout.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgencyShell, {
		title: "Earnings",
		description: totals ? `Your agency receives ${Number(totals.revenueSharePercentage)}% of each tutor's lesson earnings. Tutors are paid their share separately.` : "Your agency's share of your tutors' lessons, and your payouts.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
			open,
			onOpenChange: setOpen,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "cta",
					className: "min-h-11",
					disabled: !totals || available <= 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4" }), " Request payout"]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Request an agency payout" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Available now: ",
					formatMoney(available, currency),
					".",
					minimum > 0 ? ` Minimum payout ${formatMoney(minimum, currency)}.` : "",
					totals?.scheduleLabel ? ` ${totals.scheduleLabel}` : ""
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "payout-amount",
						children: [
							"Amount (",
							currency,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "payout-amount",
						inputMode: "decimal",
						className: "min-h-11",
						value: amount,
						onChange: (event) => setAmount(event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "min-h-11",
					onClick: () => setOpen(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "cta",
					className: "min-h-11",
					disabled: request.isPending,
					onClick: () => void handleRequest(),
					children: [request.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Request payout"]
				})] })
			] })]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				earnings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiSkeletonGrid, { count: 4 }) : earnings.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
					message: earnings.error.message || "We couldn't load your earnings.",
					onRetry: () => void earnings.refetch()
				}) : totals ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Available",
							value: formatMoney(totals.availableBalance, currency),
							icon: Wallet,
							variant: "primary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Agency earnings",
							value: formatMoney(totals.agencyEarnings, currency),
							hint: `From ${formatMoney(totals.grossRevenue, currency)} billed`,
							icon: PiggyBank
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Paid out",
							value: formatMoney(totals.paidOut, currency),
							icon: Banknote
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Payouts pending",
							value: formatMoney(totals.pendingPayouts, currency),
							...totals.nextPayoutDate ? { hint: `Next payout ${totals.nextPayoutDate}` } : {},
							icon: Banknote
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Earnings by tutor",
					description: "What each tutor has billed and earned, and your agency's share.",
					children: tutors.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
						rows: 3,
						height: "h-12"
					}) : tutors.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
						message: "We couldn't load your tutors.",
						onRetry: () => void tutors.refetch()
					}) : (tutors.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
						icon: Users,
						title: "No tutors yet",
						body: "Tutor earnings appear here once your tutors start teaching."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[34rem] text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 font-semibold",
										children: "Tutor"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 text-right font-semibold",
										children: "Lessons"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 text-right font-semibold",
										children: "Billed"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 pr-3 text-right font-semibold",
										children: "Tutor share"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 text-right font-semibold",
										children: "Agency share"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (tutors.data ?? []).map((tutor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border last:border-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 pr-3 font-medium",
										children: tutor.fullName ?? "Tutor"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 pr-3 text-right tabular-nums",
										children: tutor.lessonsCompleted
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 pr-3 text-right tabular-nums",
										children: formatMoney(tutor.grossAmount, tutor.currency)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 pr-3 text-right tabular-nums",
										children: formatMoney(tutor.tutorEarnings, tutor.currency)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 text-right tabular-nums",
										children: formatMoney(tutor.agencyEarnings, tutor.currency)
									})
								]
							}, tutor.tutorId)) })]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Payout history",
					children: payouts.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
						rows: 2,
						height: "h-12"
					}) : payouts.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
						message: "We couldn't load payouts.",
						onRetry: () => void payouts.refetch()
					}) : (payouts.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
						icon: Banknote,
						title: "No payouts yet",
						body: "Request a payout once your available balance reaches the minimum."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: (payouts.data ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-3 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold tabular-nums",
								children: formatMoney(row.amount, row.currency)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"Requested ",
									new Date(row.requested_at).toLocaleDateString(),
									row.settled_at ? ` · settled ${new Date(row.settled_at).toLocaleDateString()}` : ""
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("rounded-full px-2.5 py-1 text-xs font-semibold", PAYOUT_TONE[row.status]),
								children: PAYOUT_LABEL[row.status] ?? row.status
							})]
						}, row.id))
					})
				})
			]
		})
	});
}
//#endregion
export { AgencyEarningsPage as component };
