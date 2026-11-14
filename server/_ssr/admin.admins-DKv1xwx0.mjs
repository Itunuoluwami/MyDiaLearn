import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { C as SlidersHorizontal, E as ShieldAlert, Nt as Copy, T as ShieldCheck, et as Mail, it as LoaderCircle, l as UserPlus, t as X } from "../_libs/lucide-react.mjs";
import { a as SheetTitle, i as SheetHeader, n as SheetContent, r as SheetDescription, t as Sheet } from "./sheet-Cis54Nrd.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { S as useUserPermissions, _ as usePermissionCatalog, b as useRevokeInvitation, c as inviteAdminViaApi, l as isSuperAdminAccount, m as useAdminInvitations, n as INVITATION_STATUS_TONE, o as friendlyAdminError, p as useAdminAccounts, t as INVITATION_STATUS_LABEL, v as useRequestElevatedRole, x as useSetUserPermission } from "./admin-governance-AZIEy_jw.mjs";
import { t as Checkbox } from "./checkbox-fH8q-trq.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CjMKxxgr.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-Drj9JKn2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.admins-DKv1xwx0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InviteDialog({ onClose }) {
	const catalog = usePermissionCatalog();
	const [email, setEmail] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("admin");
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [pending, setPending] = (0, import_react.useState)(false);
	const [formError, setFormError] = (0, import_react.useState)(null);
	const [issuedOtp, setIssuedOtp] = (0, import_react.useState)(null);
	const adminPermissions = (0, import_react.useMemo)(() => (catalog.data ?? []).filter((p) => p.category === "admin"), [catalog.data]);
	function toggle(key, checked) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (checked) next.add(key);
			else next.delete(key);
			return next;
		});
	}
	async function handleSubmit(event) {
		event.preventDefault();
		setFormError(null);
		setPending(true);
		const result = await inviteAdminViaApi({
			email: email.trim().toLowerCase(),
			role,
			permissionKeys: [...selected]
		}).then((created) => ({
			ok: true,
			...created
		}), (error) => ({
			ok: false,
			formError: friendlyAdminError(error)
		}));
		setPending(false);
		if (!result.ok) {
			setFormError(result.formError);
			return;
		}
		if (result.emailed) {
			toast.success("Invitation sent", { description: `${email} will find the code and link in their inbox.` });
			onClose();
			return;
		}
		setIssuedOtp(result.otp ?? null);
	}
	if (issuedOtp) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Share this code directly" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [email, " already has a DiaLearn account, so no invitation email was sent. Give them this code yourself, and ask them to sign in and open /auth/accept-invite."] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 rounded-md border border-border bg-surface p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "flex-1 font-mono text-lg font-semibold tracking-[0.2em]",
					children: issuedOtp
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => {
						navigator.clipboard.writeText(issuedOtp);
						toast.success("Code copied");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Copy"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "This is the only time the code is shown. If it gets lost, revoke the invitation and send a new one."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: onClose,
				children: "Done"
			}) })
		] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Invite an admin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "They receive a one-time password and a sign-in link by email, and choose their own password on the way in." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-5 py-1",
				onSubmit: handleSubmit,
				noValidate: true,
				children: [
					formError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						role: "alert",
						className: "flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "mt-0.5 size-4 shrink-0 text-destructive" }), formError]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "invite-email",
								children: "Work email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "invite-email",
								type: "email",
								required: true,
								placeholder: "name@yourcompany.com",
								value: email,
								onChange: (event) => setEmail(event.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Only domains on the allow-list in Platform settings can be invited."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "invite-role",
								children: "Tier"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: role,
								onValueChange: (value) => setRole(value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "invite-role",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "admin",
									children: "Admin"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "super_admin",
									children: "Super admin"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: role === "super_admin" ? "Super admins hold every permission and can invite and remove other admins." : "Admins get the standard bundle, plus anything you tick below."
							})
						]
					}),
					role === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Extra permissions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-1.5",
							children: adminPermissions.map((permission) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex min-h-11 items-start gap-3 rounded-md border border-border p-3 text-sm transition-colors hover:bg-surface",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									className: "mt-0.5",
									checked: selected.has(permission.key),
									onCheckedChange: (checked) => toggle(permission.key, checked === true)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block font-medium",
										children: permission.label
									}), permission.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted-foreground",
										children: permission.description
									}) : null]
								})]
							}, permission.key))
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: onClose,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: pending || email.trim().length === 0,
						children: [pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }), pending ? "Sending…" : "Send invitation"]
					})] })
				]
			})]
		})
	});
}
function PermissionSheet({ account, onClose }) {
	const catalog = usePermissionCatalog();
	const overrides = useUserPermissions(account.id);
	const setPermission = useSetUserPermission();
	const isSuper = isSuperAdminAccount(account);
	const overrideMap = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const row of overrides.data ?? []) map.set(row.permission_key, row.granted);
		return map;
	}, [overrides.data]);
	function stateFor(key) {
		if (!overrideMap.has(key)) return "inherit";
		return overrideMap.get(key) ? "grant" : "deny";
	}
	function apply(key, next) {
		setPermission.mutate({
			userId: account.id,
			permissionKey: key,
			granted: next === "inherit" ? null : next === "grant"
		}, {
			onSuccess: () => toast.success("Permission updated"),
			onError: (error) => toast.error(friendlyAdminError(error))
		});
	}
	const permissions = catalog.data;
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const permission of permissions ?? []) {
			const list = map.get(permission.category) ?? [];
			list.push(permission);
			map.set(permission.category, list);
		}
		return [...map.entries()].sort(([a], [b]) => a === "admin" ? -1 : b === "admin" ? 1 : a.localeCompare(b));
	}, [permissions]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "right",
			className: "w-full overflow-y-auto sm:max-w-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: account.full_name ?? account.email ?? "This admin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Grant or deny individual permissions. Anything left on Inherit follows the role." })] }),
				isSuper ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex items-start gap-3 rounded-md bg-primary-soft p-3.5 text-sm text-primary-deep",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This account is a super admin, so it holds every permission regardless of what is set here. Drop them to Admin first if you need to scope their access." })]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 space-y-6",
					children: grouped.map(([category, permissions]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "eyebrow",
						children: category
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 space-y-1.5",
						children: (permissions ?? []).map((permission) => {
							const current = stateFor(permission.key);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2.5 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: permission.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-xs text-muted-foreground",
										children: permission.key
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									role: "group",
									"aria-label": `${permission.label} access`,
									className: "flex shrink-0 rounded-md border border-border p-0.5",
									children: [
										"inherit",
										"grant",
										"deny"
									].map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: isSuper || setPermission.isPending,
										"aria-pressed": current === option,
										onClick: () => apply(permission.key, option),
										className: cn("focus-ring min-h-8 rounded-sm px-2.5 text-xs font-medium capitalize transition-colors disabled:opacity-50", current === option ? option === "deny" ? "bg-destructive/12 text-destructive" : option === "grant" ? "bg-success/12 text-success" : "bg-surface text-foreground" : "text-muted-foreground hover:bg-surface"),
										children: option
									}, option))
								})]
							}, permission.key);
						})
					})] }, category))
				})
			]
		})
	});
}
function AdminAdminsPage() {
	const { loading, user } = useAuth();
	const accounts = useAdminAccounts();
	const invitations = useAdminInvitations();
	const revokeInvitation = useRevokeInvitation();
	const requestRole = useRequestElevatedRole();
	const [inviting, setInviting] = (0, import_react.useState)(false);
	const [managing, setManaging] = (0, import_react.useState)(null);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Admins & roles",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	const rows = accounts.data ?? [];
	const pendingInvites = (invitations.data ?? []).filter((invite) => invite.status === "pending");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Admins & roles",
		description: "Who holds admin access, what each of them can reach, and who has been invited.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			onClick: () => setInviting(true),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), "Invite admin"]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "admins",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "flex h-auto w-full flex-wrap justify-start gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "admins",
							className: "min-h-11",
							children: [
								"Admins (",
								rows.length,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "invitations",
							className: "min-h-11",
							children: ["Invitations", pendingInvites.length > 0 ? ` (${pendingInvites.length})` : ""]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "admins",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "panel-portal mt-4 p-4 md:p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Name" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Email" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tier" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Manage"
									})
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: accounts.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: 5,
									className: "text-center text-sm text-muted-foreground",
									children: "Loading…"
								}) }) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: 5,
									className: "text-center text-sm text-muted-foreground",
									children: "No admin accounts yet."
								}) }) : rows.map((account) => {
									const isSuper = isSuperAdminAccount(account);
									const isSelf = account.id === user?.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
											className: "font-medium",
											children: [account.full_name ?? "—", isSelf ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "ml-2 text-xs text-muted-foreground",
												children: "(you)"
											}) : null]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-muted-foreground",
											children: account.email ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: cn(isSuper ? "bg-primary-soft text-primary-deep" : "bg-secondary-soft text-foreground"),
											children: isSuper ? "Super admin" : "Admin"
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: !account.is_active ? "Suspended" : account.must_change_password ? "Password not yet set" : "Active"
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-end gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													variant: "ghost",
													size: "sm",
													onClick: () => setManaging(account),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-4" }), "Permissions"]
												}), !isSelf ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													variant: "ghost",
													size: "sm",
													className: "text-destructive",
													disabled: requestRole.isPending,
													onClick: () => requestRole.mutate({
														userId: account.id,
														role: isSuper ? "super_admin" : "admin",
														revoke: true
													}, {
														onSuccess: () => toast.success("Sent for approval", { description: "Another admin has to approve removing this access before it takes effect." }),
														onError: (error) => toast.error(friendlyAdminError(error))
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), "Remove"]
												}) : null]
											})
										})
									] }, account.id);
								}) })] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-xs text-muted-foreground",
								children: "Granting or removing admin access always goes to Approvals for a second admin to confirm — including when you do it. You can't change your own roles at all."
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "invitations",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							className: "panel-portal mt-4 p-4 md:p-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Email" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tier" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Expires" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Action"
									})
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: invitations.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: 5,
									className: "text-center text-sm text-muted-foreground",
									children: "Loading…"
								}) }) : (invitations.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: 5,
									className: "text-center text-sm text-muted-foreground",
									children: "Nobody has been invited yet."
								}) }) : (invitations.data ?? []).map((invite) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-medium",
										children: invite.email
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-muted-foreground",
										children: invite.role === "super_admin" ? "Super admin" : "Admin"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: cn(INVITATION_STATUS_TONE[invite.status]),
										children: INVITATION_STATUS_LABEL[invite.status]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-muted-foreground tabular-nums",
										children: new Date(invite.otp_expires_at).toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right",
										children: invite.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											className: "text-destructive",
											disabled: revokeInvitation.isPending,
											onClick: () => revokeInvitation.mutate(invite.id, {
												onSuccess: () => toast.success("Invitation revoked"),
												onError: (error) => toast.error(friendlyAdminError(error))
											}),
											children: "Revoke"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "—"
										})
									})
								] }, invite.id)) })] })
							})
						})
					})
				]
			}),
			inviting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InviteDialog, { onClose: () => setInviting(false) }) : null,
			managing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionSheet, {
				account: managing,
				onClose: () => setManaging(null)
			}) : null
		]
	});
}
//#endregion
export { AdminAdminsPage as component };
