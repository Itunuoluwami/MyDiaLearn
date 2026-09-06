import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ShieldAlert, UserCog } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "Users — DiaLearn admin" },
      { name: "description", content: "Search, suspend and edit accounts across every role on DiaLearn." },
    ],
  }),
  component: AdminUsersPage,
});

const ALL_ROLES: AppRole[] = ["student", "parent", "tutor", "agency", "admin"];

function EditRolesDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const currentRoles = useMemo(() => (user.user_roles ?? []).map((r) => r.role), [user]);
  const [selected, setSelected] = useState<Set<AppRole>>(new Set(currentRoles));
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
            {user.full_name ?? user.email ?? "This account"} — role changes take effect immediately across every
            portal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {ALL_ROLES.map((role) => (
            <label key={role} className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
              <Checkbox
                checked={selected.has(role)}
                onCheckedChange={(checked) => toggle(role, checked === true)}
              />
              {ROLE_LABEL[role]}
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={updateRoles.isPending || selected.size === 0}
            onClick={() =>
              updateRoles.mutate(
                { userId: user.id, roles: [...selected] },
                { onSuccess: onClose },
              )
            }
          >
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
    <AdminShell title="Users" description="Every account across the Public, Parent, Student, Tutor and Agency portals.">
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
              {ALL_ROLES.map((r) => (
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
                        {(user.user_roles ?? []).length === 0 ? (
                          <Badge variant="outline">{ROLE_LABEL[user.primary_role]}</Badge>
                        ) : (
                          (user.user_roles ?? []).map((r) => (
                            <Badge key={r.role} variant="outline">
                              {ROLE_LABEL[r.role]}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.is_active}
                          aria-label={user.is_active ? "Active" : "Suspended"}
                          onCheckedChange={(checked) => suspend.mutate({ id: user.id, isActive: checked })}
                        />
                        <span className="text-xs text-muted-foreground">
                          {user.is_active ? "Active" : "Suspended"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(user)}>
                        <UserCog className="size-4" />
                        Edit roles
                      </Button>
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
