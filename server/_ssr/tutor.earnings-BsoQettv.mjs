import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { B as PiggyBank, F as Receipt, Pt as Coins, n as Wallet, sn as Banknote } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-Drj9JKn2.mjs";
import { c as formatRelative, s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
import { a as KpiSkeletonGrid, c as PaymentStatusBadge, i as KpiCard, l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { C as useRequestPayout, b as usePayouts, i as PAYOUT_TONE, m as useEarningsSummary, p as useEarningsRecords, r as PAYOUT_LABEL } from "./tutor-workspace-DMY2LNJP.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.earnings-BsoQettv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TutorEarningsPage() {
	const summary = useEarningsSummary();
	const records = useEarningsRecords();
	const payouts = usePayouts();
	const requestPayout = useRequestPayout();
	const [amount, setAmount] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const totals = summary.data;
	const currency = totals?.currency ?? "USD";
	const available = Number(totals?.available_balance ?? 0);
	const minimum = Number(totals?.minimum_payout ?? 0);
	const eligible = available > 0 && available >= minimum;
	async function handleRequest() {
		const value = Number(amount);
		if (!Number.isFinite(value) || value <= 0) {
			toast.error("Enter an amount greater than zero.");
			return;
		}
		try {
			await requestPayout.mutateAsync(value);
			setOpen(false);
			setAmount("");
			toast.success("Payout requested");
		} catch (error) {
			const message = error instanceof Error ? error.message : "";
			toast.error(message.includes("BELOW_MINIMUM") ? `Payouts start at ${formatMoney(minimum, currency)}.` : message.includes("INSUFFICIENT_BALANCE") ? "That's more than your available balance." : "We couldn't request that payout.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Earnings",
		description: totals?.schedule_label ? `${totals.schedule_label} · figures come from your confirmed lessons` : "Balances, commission and payouts from your confirmed lessons",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
			open,
			onOpenChange: setOpen,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "cta",
					className: "min-h-11 sm:min-h-10",
					disabled: !eligible,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4" }), " Request payout"]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Request a payout" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Available now: ",
					formatMoney(available, currency),
					". Minimum payout",
					" ",
					formatMoney(minimum, currency),
					"."
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
						onChange: (event) => setAmount(event.target.value),
						placeholder: String(available)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "cta",
					className: "min-h-11 sm:min-h-10",
					disabled: requestPayout.isPending,
					onClick: () => void handleRequest(),
					children: requestPayout.isPending ? "Requesting…" : "Request payout"
				}) })
			] })]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-5xl space-y-5",
			children: [summary.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiSkeletonGrid, {}) : summary.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't load your earnings right now.",
				onRetry: () => void summary.refetch()
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Available",
						value: formatMoney(available, currency),
						hint: eligible ? "Ready to withdraw" : `Minimum ${formatMoney(minimum, currency)}`,
						icon: Wallet,
						variant: "primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Pending",
						value: formatMoney(Number(totals?.pending_earnings ?? 0), currency),
						hint: "Lessons not yet settled",
						icon: Coins
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Net earnings",
						value: formatMoney(Number(totals?.net_earnings ?? 0), currency),
						hint: `Gross ${formatMoney(Number(totals?.gross_revenue ?? 0), currency)}`,
						icon: PiggyBank
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Paid out",
						value: formatMoney(Number(totals?.paid_out ?? 0), currency),
						hint: Number(totals?.pending_payouts ?? 0) > 0 ? `${formatMoney(Number(totals?.pending_payouts ?? 0), currency)} in progress` : "Settled to you",
						icon: Banknote
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
				title: "How your lesson value breaks down",
				description: "Commission and fees are set by DiaLearn's pricing rules, never fixed in this screen.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-surface/70 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
								children: "Gross lesson revenue"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 text-lg font-semibold tabular-nums",
								children: formatMoney(Number(totals?.gross_revenue ?? 0), currency)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-surface/70 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
								children: "Platform commission"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "mt-1 text-lg font-semibold tabular-nums",
								children: ["−", formatMoney(Number(totals?.platform_commission ?? 0), currency)]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-surface/70 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
								children: "Payment fees"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "mt-1 text-lg font-semibold tabular-nums",
								children: ["−", formatMoney(Number(totals?.payment_fees ?? 0), currency)]
							})]
						})
					]
				}), totals?.next_payout_date ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [
						"Next scheduled settlement ",
						formatRelative(totals.next_payout_date),
						"."
					]
				}) : null]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "lessons",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "w-full justify-start overflow-x-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "lessons",
							className: "min-h-11",
							children: "Per lesson"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "payouts",
							className: "min-h-11",
							children: "Payout history"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "lessons",
						className: "mt-4",
						children: records.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
							rows: 4,
							height: "h-20"
						}) : records.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
							message: "We couldn't load your lesson earnings.",
							onRetry: () => void records.refetch()
						}) : (records.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
							icon: Receipt,
							title: "No earnings yet",
							body: "Once a family pays for a confirmed lesson, that lesson's gross, commission and net amount appear here."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: (records.data ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow duration-200 hover:shadow-lift",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
											className: "truncate text-sm font-semibold",
											children: [row.subject_name ?? "Lesson", row.student_first_name ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-normal text-muted-foreground",
												children: [
													" ",
													"· ",
													row.student_first_name
												]
											}) : null]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-0.5 text-xs text-muted-foreground",
											children: formatRelative(row.occurred_at)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentStatusBadge, { status: row.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-semibold tabular-nums",
											children: formatMoney(Number(row.net_amount ?? 0), row.settlement_currency ?? row.currency)
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Gross" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "font-medium text-foreground",
												children: formatMoney(Number(row.gross_amount ?? 0), row.currency)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Commission" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "font-medium text-foreground",
												children: formatMoney(Number(row.commission_amount ?? 0), row.currency)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Platform fee" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "font-medium text-foreground",
												children: formatMoney(Number(row.platform_fee ?? 0), row.currency)
											})]
										}),
										row.settlement_currency && row.settlement_currency !== row.currency ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Rate" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
												className: "font-medium text-foreground",
												children: [
													"1 ",
													row.currency,
													" = ",
													row.exchange_rate,
													" ",
													row.settlement_currency
												]
											})]
										}) : null
									]
								})]
							}, row.payment_id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "payouts",
						className: "mt-4",
						children: payouts.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
							rows: 3,
							height: "h-20"
						}) : payouts.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
							message: "We couldn't load your payouts.",
							onRetry: () => void payouts.refetch()
						}) : (payouts.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
							icon: Wallet,
							title: "No payouts requested",
							body: "When your available balance reaches the minimum, you can request a payout and follow its settlement here."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: (payouts.data ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4 shadow-soft",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold tabular-nums",
										children: formatMoney(Number(row.amount), row.currency)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 text-xs text-muted-foreground",
										children: [
											"Requested ",
											formatRelative(row.requested_at),
											row.settled_at ? ` · settled ${formatRelative(row.settled_at)}` : "",
											row.reference ? ` · ref ${row.reference}` : ""
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", PAYOUT_TONE[row.status]),
									children: PAYOUT_LABEL[row.status]
								})]
							}, row.id))
						})
					})
				]
			})]
		})
	});
}
//#endregion
export { TutorEarningsPage as component };
