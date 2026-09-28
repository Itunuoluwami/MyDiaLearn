import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Copy,
  Loader2,
  Mail,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminBeforeLoad } from "@/lib/admin-guard";
import { inviteAdmin } from "@/lib/admin-invite.functions";
import {
  INVITATION_STATUS_LABEL,
  INVITATION_STATUS_TONE,
  friendlyAdminError,
  isSuperAdminAccount,
  useAdminAccounts,
  useAdminInvitations,
  usePermissionCatalog,
  useRequestElevatedRole,
  useRevokeInvitation,
  useSetUserPermission,
  useUserPermissions,
  type AdminAccount,
  inviteAdminViaApi,
} from "@/lib/admin-governance";
import { useApiData } from "@/lib/api/data-client";
import type { PermissionRow } from "@/integrations/supabase/governance-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/admins")({
  // Plain admins have no business here at all, so this one redirects rather
  // than rendering a wall.
  beforeLoad: adminBeforeLoad({ superAdminOnly: true }),
  head: () => ({
    meta: [
      { title: "Admins & roles — DiaLearn admin" },
      {
        name: "description",
        content: "Invite admins, and decide what each of them can reach.",
      },
    ],
  }),
  component: AdminAdminsPage,
});

/* ------------------------------------------------------------------ */
/* Invite                                                              */
/* ------------------------------------------------------------------ */

function InviteDialog({ onClose }: { onClose: () => void }) {
  const send = useServerFn(inviteAdmin);
  const viaApi = useApiData();
  const catalog = usePermissionCatalog();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin">("admin");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [issuedOtp, setIssuedOtp] = useState<string | null>(null);

  const adminPermissions = useMemo(
    () => (catalog.data ?? []).filter((p) => p.category === "admin"),
    [catalog.data],
  );

  function toggle(key: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setPending(true);

    // Under the API the backend creates the invitation and emails the code;
    // the Supabase path keeps its server function.
    const result = viaApi
      ? await inviteAdminViaApi({
          email: email.trim().toLowerCase(),
          role,
          permissionKeys: [...selected],
        }).then(
          (created) => ({ ok: true as const, ...created }),
          (error: unknown) => ({ ok: false as const, formError: friendlyAdminError(error) }),
        )
      : await send({
          data: {
            email,
            role,
            permissionKeys: [...selected],
            origin: window.location.origin,
          },
        }).catch(() => null);

    setPending(false);

    if (!result) {
      setFormError("Something went wrong. Please check your connection and try again.");
      return;
    }
    if (!result.ok) {
      setFormError(
        "formError" in result ? result.formError : (Object.values(result.fieldErrors)[0] ?? null),
      );
      return;
    }

    if (result.emailed) {
      toast.success("Invitation sent", {
        description: `${email} will find the code and link in their inbox.`,
      });
      onClose();
      return;
    }

    // No mail went out (an existing account under Supabase, or email not
    // configured on the API) — show the code once so it can be passed on.
    setIssuedOtp(result.otp ?? null);
  }

  if (issuedOtp) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this code directly</DialogTitle>
            <DialogDescription>
              {email} already has a DiaLearn account, so no invitation email was sent. Give them
              this code yourself, and ask them to sign in and open /auth/accept-invite.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 rounded-md border border-border bg-surface p-4">
            <code className="flex-1 font-mono text-lg font-semibold tracking-[0.2em]">
              {issuedOtp}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(issuedOtp);
                toast.success("Code copied");
              }}
            >
              <Copy className="size-4" />
              Copy
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            This is the only time the code is shown. If it gets lost, revoke the invitation and send
            a new one.
          </p>

          <DialogFooter>
            <Button onClick={onClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite an admin</DialogTitle>
          <DialogDescription>
            They receive a one-time password and a sign-in link by email, and choose their own
            password on the way in.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5 py-1" onSubmit={handleSubmit} noValidate>
          {formError ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm"
            >
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
              {formError}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="invite-email">Work email</Label>
            <Input
              id="invite-email"
              type="email"
              required
              placeholder="name@yourcompany.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Only domains on the allow-list in Platform settings can be invited.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Tier</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as "admin" | "super_admin")}
            >
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === "super_admin"
                ? "Super admins hold every permission and can invite and remove other admins."
                : "Admins get the standard bundle, plus anything you tick below."}
            </p>
          </div>

          {role === "admin" ? (
            <div className="space-y-2">
              <Label>Extra permissions</Label>
              <div className="grid gap-1.5">
                {adminPermissions.map((permission) => (
                  <label
                    key={permission.key}
                    className="flex min-h-11 items-start gap-3 rounded-md border border-border p-3 text-sm transition-colors hover:bg-surface"
                  >
                    <Checkbox
                      className="mt-0.5"
                      checked={selected.has(permission.key)}
                      onCheckedChange={(checked) => toggle(permission.key, checked === true)}
                    />
                    <span className="min-w-0">
                      <span className="block font-medium">{permission.label}</span>
                      {permission.description ? (
                        <span className="block text-xs text-muted-foreground">
                          {permission.description}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || email.trim().length === 0}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
              {pending ? "Sending…" : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Permission matrix                                                   */
/* ------------------------------------------------------------------ */

type OverrideState = "inherit" | "grant" | "deny";

function PermissionSheet({ account, onClose }: { account: AdminAccount; onClose: () => void }) {
  const catalog = usePermissionCatalog();
  const overrides = useUserPermissions(account.id);
  const setPermission = useSetUserPermission();

  const isSuper = isSuperAdminAccount(account);

  const overrideMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const row of overrides.data ?? []) map.set(row.permission_key, row.granted);
    return map;
  }, [overrides.data]);

  function stateFor(key: string): OverrideState {
    if (!overrideMap.has(key)) return "inherit";
    return overrideMap.get(key) ? "grant" : "deny";
  }

  function apply(key: string, next: OverrideState) {
    setPermission.mutate(
      {
        userId: account.id,
        permissionKey: key,
        granted: next === "inherit" ? null : next === "grant",
      },
      {
        onSuccess: () => toast.success("Permission updated"),
        onError: (error) => toast.error(friendlyAdminError(error)),
      },
    );
  }

  const permissions = catalog.data;

  // Admin permissions first, then everything else alphabetically — this sheet
  // is opened to change admin access, so that group should not be hunted for.
  const grouped = useMemo(() => {
    const map = new Map<string, PermissionRow[]>();
    for (const permission of permissions ?? []) {
      const list = map.get(permission.category) ?? [];
      list.push(permission);
      map.set(permission.category, list);
    }
    return [...map.entries()].sort(([a], [b]) =>
      a === "admin" ? -1 : b === "admin" ? 1 : a.localeCompare(b),
    );
  }, [permissions]);

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{account.full_name ?? account.email ?? "This admin"}</SheetTitle>
          <SheetDescription>
            Grant or deny individual permissions. Anything left on Inherit follows the role.
          </SheetDescription>
        </SheetHeader>

        {isSuper ? (
          <div className="mt-5 flex items-start gap-3 rounded-md bg-primary-soft p-3.5 text-sm text-primary-deep">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            <p>
              This account is a super admin, so it holds every permission regardless of what is set
              here. Drop them to Admin first if you need to scope their access.
            </p>
          </div>
        ) : null}

        <div className="mt-5 space-y-6">
          {grouped.map(([category, permissions]) => (
            <section key={category}>
              <h3 className="eyebrow">{category}</h3>
              <div className="mt-2 space-y-1.5">
                {(permissions ?? []).map((permission) => {
                  const current = stateFor(permission.key);
                  return (
                    <div
                      key={permission.key}
                      className="flex flex-col gap-2.5 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{permission.label}</p>
                        <p className="font-mono text-xs text-muted-foreground">{permission.key}</p>
                      </div>
                      <div
                        role="group"
                        aria-label={`${permission.label} access`}
                        className="flex shrink-0 rounded-md border border-border p-0.5"
                      >
                        {(["inherit", "grant", "deny"] as OverrideState[]).map((option) => (
                          <button
                            key={option}
                            type="button"
                            disabled={isSuper || setPermission.isPending}
                            aria-pressed={current === option}
                            onClick={() => apply(permission.key, option)}
                            className={cn(
                              "focus-ring min-h-8 rounded-sm px-2.5 text-xs font-medium capitalize transition-colors disabled:opacity-50",
                              current === option
                                ? option === "deny"
                                  ? "bg-destructive/12 text-destructive"
                                  : option === "grant"
                                    ? "bg-success/12 text-success"
                                    : "bg-surface text-foreground"
                                : "text-muted-foreground hover:bg-surface",
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function AdminAdminsPage() {
  const { loading, user } = useAuth();
  const accounts = useAdminAccounts();
  const invitations = useAdminInvitations();
  const revokeInvitation = useRevokeInvitation();
  const requestRole = useRequestElevatedRole();

  const [inviting, setInviting] = useState(false);
  const [managing, setManaging] = useState<AdminAccount | null>(null);

  if (loading) {
    return (
      <AdminShell title="Admins & roles">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  const rows = accounts.data ?? [];
  const pendingInvites = (invitations.data ?? []).filter((invite) => invite.status === "pending");

  return (
    <AdminShell
      title="Admins & roles"
      description="Who holds admin access, what each of them can reach, and who has been invited."
      actions={
        <Button onClick={() => setInviting(true)}>
          <UserPlus className="size-4" />
          Invite admin
        </Button>
      }
    >
      <Tabs defaultValue="admins">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="admins" className="min-h-11">
            Admins ({rows.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="min-h-11">
            Invitations{pendingInvites.length > 0 ? ` (${pendingInvites.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admins">
          <section className="panel-portal mt-4 p-4 md:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        No admin accounts yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((account) => {
                      const isSuper = isSuperAdminAccount(account);
                      const isSelf = account.id === user?.id;
                      return (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">
                            {account.full_name ?? "—"}
                            {isSelf ? (
                              <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {account.email ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                isSuper
                                  ? "bg-primary-soft text-primary-deep"
                                  : "bg-secondary-soft text-foreground",
                              )}
                            >
                              {isSuper ? "Super admin" : "Admin"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {!account.is_active
                                ? "Suspended"
                                : account.must_change_password
                                  ? "Password not yet set"
                                  : "Active"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setManaging(account)}
                              >
                                <SlidersHorizontal className="size-4" />
                                Permissions
                              </Button>
                              {!isSelf ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  disabled={requestRole.isPending}
                                  onClick={() =>
                                    requestRole.mutate(
                                      {
                                        userId: account.id,
                                        role: isSuper ? "super_admin" : "admin",
                                        revoke: true,
                                      },
                                      {
                                        onSuccess: () =>
                                          toast.success("Sent for approval", {
                                            description:
                                              "Another admin has to approve removing this access before it takes effect.",
                                          }),
                                        onError: (error) => toast.error(friendlyAdminError(error)),
                                      },
                                    )
                                  }
                                >
                                  <X className="size-4" />
                                  Remove
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Granting or removing admin access always goes to Approvals for a second admin to
              confirm — including when you do it. You can't change your own roles at all.
            </p>
          </section>
        </TabsContent>

        <TabsContent value="invitations">
          <section className="panel-portal mt-4 p-4 md:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : (invitations.data ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        Nobody has been invited yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (invitations.data ?? []).map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell className="font-medium">{invite.email}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {invite.role === "super_admin" ? "Super admin" : "Admin"}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(INVITATION_STATUS_TONE[invite.status])}>
                            {INVITATION_STATUS_LABEL[invite.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {new Date(invite.otp_expires_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {invite.status === "pending" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              disabled={revokeInvitation.isPending}
                              onClick={() =>
                                revokeInvitation.mutate(invite.id, {
                                  onSuccess: () => toast.success("Invitation revoked"),
                                  onError: (error) => toast.error(friendlyAdminError(error)),
                                })
                              }
                            >
                              Revoke
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </TabsContent>
      </Tabs>

      {inviting ? <InviteDialog onClose={() => setInviting(false)} /> : null}
      {managing ? <PermissionSheet account={managing} onClose={() => setManaging(null)} /> : null}
    </AdminShell>
  );
}
