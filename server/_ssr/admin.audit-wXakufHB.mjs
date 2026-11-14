import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { At as Download, E as ShieldAlert, k as Search } from "../_libs/lucide-react.mjs";
import { a as SheetTitle, i as SheetHeader, n as SheetContent, r as SheetDescription, t as Sheet } from "./sheet-Cis54Nrd.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { h as useAuditLogs, s as humanizeAuditAction } from "./admin-governance-AZIEy_jw.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CjMKxxgr.mjs";
import { n as toCsv, t as downloadCsv } from "./csv-DYK3q72x.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.audit-wXakufHB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Only the keys that actually differ, so the detail pane shows the change and
*  not the whole row. */
function diffKeys(before, after) {
	return [.../* @__PURE__ */ new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])].filter((key) => JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key])).sort();
}
function renderValue(value) {
	if (value === null || value === void 0) return "—";
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}
function DetailSheet({ entry, onClose }) {
	const keys = diffKeys(entry.before, entry.after);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "right",
			className: "w-full overflow-y-auto sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: humanizeAuditAction(entry.action) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetDescription, { children: [
				entry.actor_email ?? "System",
				" · ",
				new Date(entry.created_at).toLocaleString()
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Action"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-mono text-xs",
							children: entry.action
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Entity"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
							className: "font-mono text-xs break-all",
							children: [entry.entity_type ?? "—", entry.entity_id ? ` / ${entry.entity_id}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "IP"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-mono text-xs",
							children: entry.ip ?? "—"
						})
					]
				}), keys.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "What changed"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 overflow-x-auto rounded-md border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Field" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Before" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "After" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: keys.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							children: key
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs text-muted-foreground",
							children: renderValue(entry.before?.[key])
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							children: renderValue(entry.after?.[key])
						})
					] }, key)) })] })
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "This entry records an event rather than a field change."
				})]
			})]
		})
	});
}
function AdminAuditPage() {
	const { hasPermission, loading } = useAuth();
	const [action, setAction] = (0, import_react.useState)("");
	const [actorEmail, setActorEmail] = (0, import_react.useState)("");
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const filters = (0, import_react.useMemo)(() => ({
		action: action.trim() || void 0,
		actorEmail: actorEmail.trim() || void 0,
		from: from ? new Date(from).toISOString() : void 0,
		to: to ? (/* @__PURE__ */ new Date(`${to}T23:59:59`)).toISOString() : void 0
	}), [
		action,
		actorEmail,
		from,
		to
	]);
	const logs = useAuditLogs(filters);
	const rows = logs.data ?? [];
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Audit log",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!hasPermission("admin.audit")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Audit log",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-warm flex items-start gap-3 p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: "Admin access required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Reading the audit log needs the audit permission. A super admin can grant it from Admins & roles."
			})] })]
		})
	});
	function exportCsv() {
		const csv = toCsv(rows.map((row) => ({
			when: new Date(row.created_at).toISOString(),
			actor: row.actor_email ?? "",
			action: row.action,
			entity_type: row.entity_type ?? "",
			entity_id: row.entity_id ?? "",
			before: row.before ? JSON.stringify(row.before) : "",
			after: row.after ? JSON.stringify(row.after) : "",
			ip: row.ip ?? ""
		})), [
			{
				key: "when",
				label: "When"
			},
			{
				key: "actor",
				label: "Actor"
			},
			{
				key: "action",
				label: "Action"
			},
			{
				key: "entity_type",
				label: "Entity type"
			},
			{
				key: "entity_id",
				label: "Entity id"
			},
			{
				key: "before",
				label: "Before"
			},
			{
				key: "after",
				label: "After"
			},
			{
				key: "ip",
				label: "IP"
			}
		]);
		downloadCsv(`dialearn-audit-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, csv);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Audit log",
		description: "Append-only. Every admin action is recorded here and nothing can edit or delete an entry.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-portal p-4 md:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto_auto]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "audit-action",
								children: "Action"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "audit-action",
									placeholder: "e.g. user_roles",
									className: "pl-9",
									value: action,
									onChange: (event) => setAction(event.target.value)
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "audit-actor",
								children: "Actor email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "audit-actor",
								placeholder: "someone@dialearn.com",
								value: actorEmail,
								onChange: (event) => setActorEmail(event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "audit-from",
								children: "From"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "audit-from",
								type: "date",
								value: from,
								onChange: (event) => setFrom(event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "audit-to",
								children: "To"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "audit-to",
								type: "date",
								value: to,
								onChange: (event) => setTo(event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "w-full sm:w-auto",
								disabled: rows.length === 0,
								onClick: exportCsv,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export"]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "When" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Actor" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Action" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Entity" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Detail"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: logs.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 5,
						className: "text-center text-sm text-muted-foreground",
						children: "Loading…"
					}) }) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 5,
						className: "text-center text-sm text-muted-foreground",
						children: "No activity matches these filters."
					}) }) : rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "whitespace-nowrap text-muted-foreground tabular-nums",
							children: new Date(row.created_at).toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: row.actor_email ?? "System"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: humanizeAuditAction(row.action)
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs text-muted-foreground",
							children: row.entity_type ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setSelected(row),
								children: "View"
							})
						})
					] }, row.id)) })] })
				}),
				rows.length >= 300 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Showing the most recent 300 entries. Narrow the date range to see further back."
				}) : null
			]
		}), selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSheet, {
			entry: selected,
			onClose: () => setSelected(null)
		}) : null]
	});
}
//#endregion
export { AdminAuditPage as component };
