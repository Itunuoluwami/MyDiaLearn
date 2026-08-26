import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, ShieldAlert, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Platform settings — DiaLearn admin" },
      {
        name: "description",
        content:
          "Admin-editable subjects, curricula, commission rules and notification templates for DiaLearn.",
      },
      { property: "og:title", content: "Platform settings — DiaLearn admin" },
      {
        property: "og:description",
        content: "Configure marketplace taxonomy, commission and notification templates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSettingsPage,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="panel-portal mt-4 p-4 md:p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SubjectsTab() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const subjects = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, slug, category, is_active, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("subjects").insert({
        name,
        slug: slugify(name),
        category: category || null,
        sort_order: (subjects.data?.length ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setName("");
      setCategory("");
      await queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      toast.success("Subject added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("subjects").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-subjects"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-subjects"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Panel title="Subjects" description="The subject list powering search, filters and tutor profiles.">
      <form
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="subject-name">Subject name</Label>
          <Input id="subject-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject-category">Category</Label>
          <Input id="subject-category" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full sm:w-auto" disabled={create.isPending}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </form>

      <ul className="mt-5 divide-y divide-border">
        {(subjects.data ?? []).map((subject) => (
          <li key={subject.id} className="flex min-h-14 flex-wrap items-center justify-between gap-3 py-2">
            <div>
              <p className="text-sm font-medium">{subject.name}</p>
              <p className="text-xs text-muted-foreground">{subject.category ?? "Uncategorised"}</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={subject.is_active}
                aria-label="Active"
                onCheckedChange={(checked) => toggle.mutate({ id: subject.id, is_active: checked })}
              />
              <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove.mutate(subject.id)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function CurriculaTab() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");

  const curricula = useQuery({
    queryKey: ["admin-curricula"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curricula")
        .select("id, name, code, country_code, is_active, education_levels(id, name)")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("curricula").insert({
        name,
        code: slugify(name),
        country_code: country || null,
        sort_order: (curricula.data?.length ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setName("");
      setCountry("");
      await queryClient.invalidateQueries({ queryKey: ["admin-curricula"] });
      toast.success("Curriculum added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("curricula").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-curricula"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Panel title="Curricula & levels" description="Curricula and the education levels students are placed in.">
      <form
        className="grid gap-3 sm:grid-cols-[1fr_10rem_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="curriculum-name">Curriculum name</Label>
          <Input id="curriculum-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="curriculum-country">Country code</Label>
          <Input
            id="curriculum-country"
            maxLength={2}
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full sm:w-auto" disabled={create.isPending}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </form>

      <ul className="mt-5 space-y-3">
        {(curricula.data ?? []).map((curriculum) => (
          <li key={curriculum.id} className="rounded-md border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{curriculum.name}</p>
                <p className="text-xs text-muted-foreground">
                  {curriculum.country_code ?? "International"} · {curriculum.education_levels.length} levels
                </p>
              </div>
              <Switch
                checked={curriculum.is_active}
                aria-label="Active"
                onCheckedChange={(checked) => toggle.mutate({ id: curriculum.id, is_active: checked })}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {curriculum.education_levels.map((level) => (
                <Badge key={level.id} variant="outline">
                  {level.name}
                </Badge>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function CommissionTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    model: "percentage",
    percentage: "15",
    fixed_amount: "",
    platform_fee_percentage: "2.5",
    applies_to: "tutor",
  });

  const rules = useQuery({
    queryKey: ["admin-commission"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_rules")
        .select(
          "id, name, model, percentage, fixed_amount, platform_fee_percentage, applies_to, priority, is_active",
        )
        .order("priority", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("commission_rules").insert({
        name: form.name,
        model: form.model as "percentage" | "fixed" | "tiered",
        percentage: form.percentage ? Number(form.percentage) : null,
        fixed_amount: form.fixed_amount ? Number(form.fixed_amount) : null,
        platform_fee_percentage: Number(form.platform_fee_percentage || 0),
        applies_to: form.applies_to as "tutor" | "agency" | "parent" | "student" | "admin",
        priority: (rules.data?.length ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setForm({ ...form, name: "" });
      await queryClient.invalidateQueries({ queryKey: ["admin-commission"] });
      toast.success("Commission rule added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("commission_rules").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-commission"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Panel
      title="Commission & fees"
      description="Percentage, fixed or tiered commission plus the platform fee. Lesson prices are always derived from rate × duration."
    >
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="rule-name">Rule name</Label>
          <Input
            id="rule-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Model</Label>
          <Select value={form.model} onValueChange={(value) => setForm({ ...form, model: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed amount</SelectItem>
              <SelectItem value="tiered">Tiered</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Applies to</Label>
          <Select value={form.applies_to} onValueChange={(value) => setForm({ ...form, applies_to: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tutor">Independent tutors</SelectItem>
              <SelectItem value="agency">Agency tutors</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rule-percentage">Commission %</Label>
          <Input
            id="rule-percentage"
            type="number"
            step="0.001"
            value={form.percentage}
            onChange={(e) => setForm({ ...form, percentage: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rule-fixed">Fixed amount</Label>
          <Input
            id="rule-fixed"
            type="number"
            step="0.01"
            value={form.fixed_amount}
            onChange={(e) => setForm({ ...form, fixed_amount: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rule-fee">Platform fee %</Label>
          <Input
            id="rule-fee"
            type="number"
            step="0.001"
            value={form.platform_fee_percentage}
            onChange={(e) => setForm({ ...form, platform_fee_percentage: e.target.value })}
          />
        </div>
        <div className="flex items-end sm:col-span-2">
          <Button type="submit" disabled={create.isPending}>
            <Plus className="size-4" />
            Add rule
          </Button>
        </div>
      </form>

      <ul className="mt-5 divide-y divide-border">
        {(rules.data ?? []).map((rule) => (
          <li key={rule.id} className="flex min-h-14 flex-wrap items-center justify-between gap-3 py-2">
            <div>
              <p className="text-sm font-medium">{rule.name}</p>
              <p className="text-xs text-muted-foreground">
                {rule.model === "percentage"
                  ? `${rule.percentage ?? 0}% commission`
                  : rule.model === "fixed"
                    ? `${rule.fixed_amount ?? 0} fixed`
                    : "Tiered"}{" "}
                · {rule.platform_fee_percentage}% platform fee · {rule.applies_to}
              </p>
            </div>
            <Switch
              checked={rule.is_active}
              aria-label="Active"
              onCheckedChange={(checked) => toggle.mutate({ id: rule.id, is_active: checked })}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function TemplatesTab() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const templates = useQuery({
    queryKey: ["admin-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_templates")
        .select("id, trigger_key, channel, audience, subject, body, description, is_active")
        .order("trigger_key");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: string }) => {
      const { error } = await supabase.from("notification_templates").update({ body }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
      toast.success("Template saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("notification_templates").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-templates"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Panel
      title="Notification templates"
      description="Every trigger and message body lives here. Use {{variables}} for personalised values."
    >
      <ul className="space-y-4">
        {(templates.data ?? []).map((template) => (
          <li key={template.id} className="rounded-md border border-border p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{template.trigger_key}</p>
                <p className="text-xs text-muted-foreground">
                  {template.channel} · {template.audience ?? "all account types"}
                </p>
              </div>
              <Switch
                checked={template.is_active}
                aria-label="Active"
                onCheckedChange={(checked) => toggle.mutate({ id: template.id, is_active: checked })}
              />
            </div>
            {template.subject ? (
              <p className="mt-2 text-xs text-muted-foreground">Subject: {template.subject}</p>
            ) : null}
            <Textarea
              className="mt-3"
              rows={3}
              value={drafts[template.id] ?? template.body}
              onChange={(e) => setDrafts({ ...drafts, [template.id]: e.target.value })}
            />
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                disabled={save.isPending || (drafts[template.id] ?? template.body) === template.body}
                onClick={() => save.mutate({ id: template.id, body: drafts[template.id] ?? template.body })}
              >
                {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function AdminSettingsPage() {
  const { hasPermission, loading } = useAuth();

  if (loading) {
    return (
      <PortalShell title="Platform settings">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </PortalShell>
    );
  }

  if (!hasPermission("admin.settings")) {
    return (
      <PortalShell title="Platform settings">
        <div className="card-warm flex items-start gap-3 p-4 md:p-6">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account type doesn't include platform settings permissions.
            </p>
          </div>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      title="Platform settings"
      description="Subjects, curricula, commission rules and notification templates — all stored in the database."
    >
      <Tabs defaultValue="subjects">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="subjects" className="min-h-11">
            Subjects
          </TabsTrigger>
          <TabsTrigger value="curricula" className="min-h-11">
            Curricula
          </TabsTrigger>
          <TabsTrigger value="commission" className="min-h-11">
            Commission
          </TabsTrigger>
          <TabsTrigger value="templates" className="min-h-11">
            Notifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="subjects">
          <SubjectsTab />
        </TabsContent>
        <TabsContent value="curricula">
          <CurriculaTab />
        </TabsContent>
        <TabsContent value="commission">
          <CommissionTab />
        </TabsContent>
        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>
      </Tabs>
    </PortalShell>
  );
}
