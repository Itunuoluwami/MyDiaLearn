import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { E as ShieldAlert, d as UserCog, it as LoaderCircle, k as Search } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { o as friendlyAdminError } from "./admin-governance-AZIEy_jw.mjs";
import { t as Checkbox } from "./checkbox-fH8q-trq.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CjMKxxgr.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-Drj9JKn2.mjs";
import { A as useSuspendUser, M as useUpdateUserRoles, p as useAdminUsers, t as ROLE_LABEL } from "./admin-data-uZ6jnAG3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.users-CA9k7Smz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Everyday roles only. admin and super_admin are deliberately absent: granting
* either is a privilege change that goes through Admins & roles and the
* approval queue, never a checkbox on the general user list. */
var ALL_ROLES = [
	"student",
	"parent",
	"tutor",
	"agency"
];
/** Still needed for the filter dropdown and the role badges on the table. */
var FILTER_ROLES = [
	"student",
	"parent",
	"tutor",
	"agency",
	"admin",
	"super_admin"
];
/** The embedded user_roles(role) select resolves to a SelectQueryError against
*  the stale generated types, so the shape is asserted once here rather than at
*  each use. Regenerating types.ts makes this cast redundant. */
function rolesOf(user) {
	return (user.user_roles ?? []).map((row) => row.role);
}
function EditRolesDialog({ user, onClose }) {
	const currentRoles = (0, import_react.useMemo)(() => rolesOf(user), [user]);
	/** Held aside and merged back on save, so this dialog can never strip an
	*  elevated role by omission — removing one is an approval-gated action. */
	const elevatedRoles = (0, import_react.useMemo)(() => currentRoles.filter((role) => role === "admin" || role === "super_admin"), [currentRoles]);
	const [selected, setSelected] = (0, import_react.useState)(() => new Set(currentRoles.filter((role) => ALL_ROLES.includes(role))));
	const updateRoles = useUpdateUserRoles();
	function toggle(role, checked) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (checked) next.add(role);
			else next.delete(role);
			return next;
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit roles" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [user.full_name ?? user.email ?? "This account", " — changes take effect immediately across every portal."] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 py-2",
				children: [ALL_ROLES.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "focus-within:ring-ring flex min-h-11 items-center gap-3 rounded-md border border-border p-3 text-sm transition-colors hover:bg-surface",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						checked: selected.has(role),
						onCheckedChange: (checked) => toggle(role, checked === true)
					}), ROLE_LABEL[role]]
				}, role)), elevatedRoles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-md bg-secondary-soft px-3 py-2.5 text-xs text-foreground",
					children: [
						"This account also holds",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: elevatedRoles.map((role) => ROLE_LABEL[role]).join(" and ")
						}),
						". Admin access is changed in Admins & roles and needs a second approver, so it is left untouched here."
					]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: onClose,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				disabled: updateRoles.isPending || selected.size + elevatedRoles.length === 0,
				onClick: () => updateRoles.mutate({
					userId: user.id,
					roles: [...selected, ...elevatedRoles]
				}, {
					onSuccess: () => {
						toast.success("Roles updated");
						onClose();
					},
					onError: (error) => toast.error(friendlyAdminError(error))
				}),
				children: [updateRoles.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Save roles"]
			})] })
		] })
	});
}
function AdminUsersPage() {
	const { hasPermission, loading } = useAuth();
	const [search, setSearch] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("all");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const users = useAdminUsers({
		search,
		role
	});
	const suspend = useSuspendUser();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Users",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!hasPermission("admin.users")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Users",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-warm flex items-start gap-3 p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: "Admin access required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Your account type doesn't include user management permissions."
			})] })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Users",
		description: "Every account across the Public, Parent, Student, Tutor and Agency portals.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-portal p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search by name or email",
						className: "pl-9",
						value: search,
						onChange: (e) => setSearch(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: role,
					onValueChange: (value) => setRole(value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "sm:w-48",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "All roles"
					}), FILTER_ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: r,
						children: ROLE_LABEL[r]
					}, r))] })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Name" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Email" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Roles" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Joined" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: users.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "text-center text-sm text-muted-foreground",
					children: "Loading…"
				}) }) : (users.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "text-center text-sm text-muted-foreground",
					children: "No users match your search."
				}) }) : (users.data ?? []).map((user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: user.full_name ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-muted-foreground",
						children: user.email ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: rolesOf(user).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: ROLE_LABEL[user.primary_role]
						}) : rolesOf(user).map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: ROLE_LABEL[role]
						}, role))
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-muted-foreground",
						children: new Date(user.created_at).toLocaleDateString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", user.is_active ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive"),
							children: user.is_active ? "Active" : "Suspended"
						})
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								disabled: suspend.isPending,
								onClick: () => suspend.mutate({
									id: user.id,
									isActive: !user.is_active
								}, {
									onSuccess: () => toast.success(user.is_active ? "Suspension sent for approval" : "Restore sent for approval", { description: "Another admin has to approve it before it takes effect." }),
									onError: (error) => toast.error(friendlyAdminError(error))
								}),
								children: user.is_active ? "Suspend" : "Restore"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setEditing(user),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCog, { className: "size-4" }), "Edit roles"]
							})]
						})
					})
				] }, user.id)) })] })
			})]
		}), editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditRolesDialog, {
			user: editing,
			onClose: () => setEditing(null)
		}) : null]
	});
}
//#endregion
export { AdminUsersPage as component };
