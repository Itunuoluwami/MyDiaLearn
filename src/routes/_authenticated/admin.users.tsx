import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Search, ShieldAlert, UserCog } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  ROLE_LABEL,
  useAdminUsers,
  useSuspendUser,
  useUpdateUserRoles,
  type AdminUser,
  type AppRole,
} from "@/lib/admin-data";
import { friendlyAdminError } from "@/lib/admin-governance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { adminBeforeLoad } from "@/lib/admin-guard";

export const Route = createFileRoute("/_authenticated/admin/users")({
  beforeLoad: adminBeforeLoad(),
  head: () => ({
    meta: [
      { title: "Users — DiaLearn admin" },
      {
        name: "description",
        content: "Search, suspend and edit accounts across every role on DiaLearn.",
      },
    ],
  }),
  component: AdminUsersPage,
});

/** Everyday roles only. admin and super_admin are deliberately absent: granting
 * either is a privilege change that goes through Admins & roles and the
 * approval queue, never a checkbox on the general user list. */
const ALL_ROLES: AppRole[] = ["student", "parent", "tutor", "agency"];

/** Still needed for the filter dropdown and the role badges on the table. */
const FILTER_ROLES: AppRole[] = ["student", "parent", "tutor", "agency", "admin", "super_admin"];

/** The embedded user_roles(role) select resolves to a SelectQueryError against
 *  the stale generated types, so the shape is asserted once here rather than at
 *  each use. Regenerating types.ts makes this cast redundant. */
function rolesOf(user: AdminUser): AppRole[] {
  const rows = (user.user_roles ?? []) as unknown as { role: AppRole }[];
  return rows.map((row) => row.role);
}

function EditRolesDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const currentRoles = useMemo(() => rolesOf(user), [user]);

  /** Held aside and merged back on save, so this dialog can never strip an
   *  elevated role by omission — removing one is an approval-gated action. */
  const elevatedRoles = useMemo(
    () => currentRoles.filter((role) => role === "admin" || role === "super_admin"),
    [currentRoles],
  );

  const [selected, setSelected] = useState<Set<AppRole>>(
    () => new Set(currentRoles.filter((role) => ALL_ROLES.includes(role))),
  );
  const updateRoles = useUpdateUserRoles();

  function toggle(role: AppRole, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(role);
      else next.delete(role);
      return next;
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit roles</DialogTitle>
          <DialogDescription>
            {user.full_name ?? user.email ?? "This account"} — changes take effect immediately
            across every portal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {ALL_ROLES.map((role) => (
            <label
              key={role}
              className="focus-within:ring-ring flex min-h-11 items-center gap-3 rounded-md border border-border p-3 text-sm transition-colors hover:bg-surface"
            >
              <Checkbox
                checked={selected.has(role)}
                onCheckedChange={(checked) => toggle(role, checked === true)}
              />
              {ROLE_LABEL[role]}
            </label>
          ))}

          {elevatedRoles.length > 0 ? (
            <p className="rounded-md bg-secondary-soft px-3 py-2.5 text-xs text-foreground">
              This account also holds{" "}
              <span className="font-semibold">
                {elevatedRoles.map((role) => ROLE_LABEL[role]).join(" and ")}
              </span>
              . Admin access is changed in Admins &amp; roles and needs a second approver, so it is
              left untouched here.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={updateRoles.isPending || selected.size + elevatedRoles.length === 0}
            onClick={() =>
              updateRoles.mutate(
                { userId: user.id, roles: [...selected, ...elevatedRoles] },
                {
                  onSuccess: () => {
                    toast.success("Roles updated");
                    onClose();
                  },
                  onError: (error) => toast.error(friendlyAdminError(error)),
                },
              )
            }
          >
            {updateRoles.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Save roles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminUsersPage() {
  const { hasPermission, loading } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<AppRole | "all">("all");
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const users = useAdminUsers({ search, role });
  const suspend = useSuspendUser();

  if (loading) {
    return (
      <AdminShell title="Users">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (!hasPermission("admin.users")) {
    return (
      <AdminShell title="Users">
        <div className="card-warm flex items-start gap-3 p-4 md:p-6">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account type doesn't include user management permissions.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Users"
      description="Every account across the Public, Parent, Student, Tutor and Agency portals."
    >
      <div className="panel-portal p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={role} onValueChange={(value) => setRole(value as AppRole | "all")}>
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {FILTER_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABEL[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : (users.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No users match your search.
                  </TableCell>
                </TableRow>
              ) : (
                (users.data ?? []).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rolesOf(user).length === 0 ? (
                          <Badge variant="outline">{ROLE_LABEL[user.primary_role]}</Badge>
                        ) : (
                          rolesOf(user).map((role) => (
                            <Badge key={role} variant="outline">
                              {ROLE_LABEL[role]}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {/* Not a switch any more: suspending an account is
                          approval-gated, so nothing changes on click and a
                          toggle would visibly spring back. */}
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            user.is_active
                              ? "bg-success/12 text-success"
                              : "bg-destructive/12 text-destructive",
                          )}
                        >
                          {user.is_active ? "Active" : "Suspended"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={suspend.isPending}
                          onClick={() =>
                            suspend.mutate(
                              { id: user.id, isActive: !user.is_active },
                              {
                                onSuccess: () =>
                                  toast.success(
                                    user.is_active
                                      ? "Suspension sent for approval"
                                      : "Restore sent for approval",
                                    {
                                      description:
                                        "Another admin has to approve it before it takes effect.",
                                    },
                                  ),
                                onError: (error) => toast.error(friendlyAdminError(error)),
                              },
                            )
                          }
                        >
                          {user.is_active ? "Suspend" : "Restore"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(user)}>
                          <UserCog className="size-4" />
                          Edit roles
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {editing ? <EditRolesDialog user={editing} onClose={() => setEditing(null)} /> : null}
    </AdminShell>
  );
}
