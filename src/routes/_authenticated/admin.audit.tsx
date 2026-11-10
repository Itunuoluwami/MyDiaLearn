import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Search, ShieldAlert } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminBeforeLoad } from "@/lib/admin-guard";
import { humanizeAuditAction, useAuditLogs } from "@/lib/admin-governance";
import type { AuditLogRow } from "@/lib/governance-types";
import { downloadCsv, toCsv } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  beforeLoad: adminBeforeLoad(),
  head: () => ({
    meta: [
      { title: "Audit log — DiaLearn admin" },
      {
        name: "description",
        content: "An append-only record of every admin action on the platform.",
      },
    ],
  }),
  component: AdminAuditPage,
});

/** Only the keys that actually differ, so the detail pane shows the change and
 *  not the whole row. */
function diffKeys(before: Record<string, unknown> | null, after: Record<string, unknown> | null) {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  return [...keys]
    .filter((key) => JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key]))
    .sort();
}

function renderValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function DetailSheet({ entry, onClose }: { entry: AuditLogRow; onClose: () => void }) {
  const keys = diffKeys(entry.before, entry.after);

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{humanizeAuditAction(entry.action)}</SheetTitle>
          <SheetDescription>
            {entry.actor_email ?? "System"} · {new Date(entry.created_at).toLocaleString()}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Action</dt>
            <dd className="font-mono text-xs">{entry.action}</dd>
            <dt className="text-muted-foreground">Entity</dt>
            <dd className="font-mono text-xs break-all">
              {entry.entity_type ?? "—"}
              {entry.entity_id ? ` / ${entry.entity_id}` : ""}
            </dd>
            <dt className="text-muted-foreground">IP</dt>
            <dd className="font-mono text-xs">{entry.ip ?? "—"}</dd>
          </dl>

          {keys.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold">What changed</h3>
              <div className="mt-2 overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Before</TableHead>
                      <TableHead>After</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key) => (
                      <TableRow key={key}>
                        <TableCell className="font-mono text-xs">{key}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {renderValue(entry.before?.[key])}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {renderValue(entry.after?.[key])}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This entry records an event rather than a field change.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AdminAuditPage() {
  const { hasPermission, loading } = useAuth();

  const [action, setAction] = useState("");
  const [actorEmail, setActorEmail] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<AuditLogRow | null>(null);

  const filters = useMemo(
    () => ({
      action: action.trim() || undefined,
      actorEmail: actorEmail.trim() || undefined,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
    }),
    [action, actorEmail, from, to],
  );

  const logs = useAuditLogs(filters);
  const rows = logs.data ?? [];

  if (loading) {
    return (
      <AdminShell title="Audit log">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (!hasPermission("admin.audit")) {
    return (
      <AdminShell title="Audit log">
        <div className="card-warm flex items-start gap-3 p-4 md:p-6">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Reading the audit log needs the audit permission. A super admin can grant it from
              Admins &amp; roles.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  function exportCsv() {
    const csv = toCsv(
      rows.map((row) => ({
        when: new Date(row.created_at).toISOString(),
        actor: row.actor_email ?? "",
        action: row.action,
        entity_type: row.entity_type ?? "",
        entity_id: row.entity_id ?? "",
        before: row.before ? JSON.stringify(row.before) : "",
        after: row.after ? JSON.stringify(row.after) : "",
        ip: row.ip ?? "",
      })),
      [
        { key: "when", label: "When" },
        { key: "actor", label: "Actor" },
        { key: "action", label: "Action" },
        { key: "entity_type", label: "Entity type" },
        { key: "entity_id", label: "Entity id" },
        { key: "before", label: "Before" },
        { key: "after", label: "After" },
        { key: "ip", label: "IP" },
      ],
    );
    downloadCsv(`dialearn-audit-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <AdminShell
      title="Audit log"
      description="Append-only. Every admin action is recorded here and nothing can edit or delete an entry."
    >
      <div className="panel-portal p-4 md:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto_auto]">
          <div className="space-y-2">
            <Label htmlFor="audit-action">Action</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="audit-action"
                placeholder="e.g. user_roles"
                className="pl-9"
                value={action}
                onChange={(event) => setAction(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="audit-actor">Actor email</Label>
            <Input
              id="audit-actor"
              placeholder="someone@dialearn.com"
              value={actorEmail}
              onChange={(event) => setActorEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audit-from">From</Label>
            <Input
              id="audit-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audit-to">To</Label>
            <Input
              id="audit-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              disabled={rows.length === 0}
              onClick={exportCsv}
            >
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead className="text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No activity matches these filters.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                      {new Date(row.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{row.actor_email ?? "System"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{humanizeAuditAction(row.action)}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {row.entity_type ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(row)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {rows.length >= 300 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Showing the most recent 300 entries. Narrow the date range to see further back.
          </p>
        ) : null}
      </div>

      {selected ? <DetailSheet entry={selected} onClose={() => setSelected(null)} /> : null}
    </AdminShell>
  );
}
