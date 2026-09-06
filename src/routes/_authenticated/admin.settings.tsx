import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, ShieldAlert, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin/AdminShell";
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

type Tier = { min: number; max: number | null; percentage: number };

function TierEditor({ tiers, onChange }: { tiers: Tier[]; onChange: (tiers: Tier[]) => void }) {
  function update(index: number, patch: Partial<Tier>) {
    onChange(tiers.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));
  }
  function remove(index: number) {
    onChange(tiers.filter((_, i) => i !== index));
  }
  function add() {
    const last = tiers[tiers.length - 1];
    onChange([...tiers, { min: last ? (last.max ?? last.min) + 1 : 0, max: null, percentage: 0 }]);
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <Label>Volume tiers</Label>
      <p className="text-xs text-muted-foreground">
        Commission % by completed lessons per tutor in the trailing 30 days. Leave "up to" empty for the top tier.
      </p>
      <div className="space-y-2">
        {tiers.map((tier, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input
                type="number"
                value={tier.min}
                onChange={(e) => update(index, { min: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Up to</Label>
              <Input
                type="number"
                placeholder="No limit"
                value={tier.max ?? ""}
                onChange={(e) => update(index, { max: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Commission %</Label>
              <Input
                type="number"
                step="0.001"
                value={tier.percentage}
                onChange={(e) => update(index, { percentage: Number(e.target.value) })}
              />
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label="Remove tier" onClick={() => remove(index)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="size-4" />
        Add tier
      </Button>
    </div>
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
    tutor_id: "",
    agency_id: "",
  });
  const [tiers, setTiers] = useState<Tier[]>([{ min: 0, max: 10, percentage: 20 }, { min: 11, max: null, percentage: 15 }]);

  const rules = useQuery({
    queryKey: ["admin-commission"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_rules")
        .select(
          "id, name, model, percentage, fixed_amount, platform_fee_percentage, applies_to, priority, is_active, tutor_id, agency_id, tiers",
        )
        .order("priority", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const tutorOptions = useQuery({
    queryKey: ["admin-commission-tutors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tutors")
        .select("id, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const agencyOptions = useQuery({
    queryKey: ["admin-commission-agencies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tutor_agencies").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
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
        tutor_id: form.tutor_id || null,
        agency_id: form.agency_id || null,
        tiers: form.model === "tiered" ? tiers : [],
        priority: (rules.data?.length ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setForm({ ...form, name: "", tutor_id: "", agency_id: "" });
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
              <SelectItem value="tiered">Tiered by volume</SelectItem>
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

        {form.model === "percentage" ? (
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
        ) : null}
        {form.model === "fixed" ? (
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
        ) : null}
        {form.model === "tiered" ? <TierEditor tiers={tiers} onChange={setTiers} /> : null}

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

        <div className="space-y-2 sm:col-span-2">
          <Label>Assign to a specific tutor or agency (optional)</Label>
          <p className="text-xs text-muted-foreground">
            Leave both on "Any" to apply this rule to every tutor matching the category above. A tutor-specific
            assignment always wins over an agency or category-wide rule.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              value={form.tutor_id || "any"}
              onValueChange={(value) => setForm({ ...form, tutor_id: value === "any" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any tutor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any tutor</SelectItem>
                {(tutorOptions.data ?? []).map((tutor) => (
                  <SelectItem key={tutor.id} value={tutor.id}>
                    {tutor.profiles?.full_name ?? "Unnamed tutor"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.agency_id || "any"}
              onValueChange={(value) => setForm({ ...form, agency_id: value === "any" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any agency</SelectItem>
                {(agencyOptions.data ?? []).map((agency) => (
                  <SelectItem key={agency.id} value={agency.id}>
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                    : "Tiered by volume"}{" "}
                · {rule.platform_fee_percentage}% platform fee · {rule.applies_to}
                {rule.tutor_id ? " · specific tutor" : rule.agency_id ? " · specific agency" : ""}
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

function PricingTab() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<{ processing_fee_percentage: string; processing_fee_fixed: string } | null>(
    null,
  );

  const settings = useQuery({
    queryKey: ["admin-pricing-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["payments.processing_fee_percentage", "payments.processing_fee_fixed"]);
      if (error) throw error;
      const byKey = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
      return {
        processing_fee_percentage: String((byKey["payments.processing_fee_percentage"] as number) ?? 0),
        processing_fee_fixed: String((byKey["payments.processing_fee_fixed"] as number) ?? 0),
      };
    },
  });

  const save = useMutation({
    mutationFn: async (values: { processing_fee_percentage: string; processing_fee_fixed: string }) => {
      const { error } = await supabase.from("platform_settings").upsert(
        [
          {
            key: "payments.processing_fee_percentage",
            value: Number(values.processing_fee_percentage || 0),
            label: "Payment processing fee (%)",
            description: "Percentage of the lesson amount charged as a payment processing fee at checkout.",
            group_name: "payments",
            is_public: false,
          },
          {
            key: "payments.processing_fee_fixed",
            value: Number(values.processing_fee_fixed || 0),
            label: "Payment processing fee (fixed)",
            description: "Flat payment processing fee added at checkout, in the tutor's listing currency.",
            group_name: "payments",
            is_public: false,
          },
        ],
        { onConflict: "key" },
      );
      if (error) throw error;
    },
    onSuccess: async () => {
      setDrafts(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-pricing-settings"] });
      toast.success("Pricing updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const values = drafts ?? settings.data;

  return (
    <Panel
      title="Pricing & fees"
      description="The payment processing fee applied at checkout, on top of the lesson price and commission. Per-tutor/agency commission and platform fee live in the Commission tab."
    >
      {settings.isLoading || !values ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(values);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="processing-fee-pct">Processing fee %</Label>
            <Input
              id="processing-fee-pct"
              type="number"
              step="0.001"
              value={values.processing_fee_percentage}
              onChange={(e) =>
                setDrafts({ ...(values as { processing_fee_percentage: string; processing_fee_fixed: string }), processing_fee_percentage: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="processing-fee-fixed">Processing fee (fixed)</Label>
            <Input
              id="processing-fee-fixed"
              type="number"
              step="0.01"
              value={values.processing_fee_fixed}
              onChange={(e) =>
                setDrafts({ ...(values as { processing_fee_percentage: string; processing_fee_fixed: string }), processing_fee_fixed: e.target.value })
              }
            />
          </div>
          <div className="flex items-end sm:col-span-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save pricing
            </Button>
          </div>
        </form>
      )}
    </Panel>
  );
}

function GeneralSettingsPanel() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newRow, setNewRow] = useState({ key: "", label: "", description: "", group_name: "general", value: "" });

  const settings = useQuery({
    queryKey: ["admin-general-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, label, description, group_name, is_public, value")
        .not("key", "ilike", "payments.%")
        .order("group_name")
        .order("key");
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase.from("platform_settings").update({ value: JSON.parse(value) }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: async (_data, { key }) => {
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-general-settings"] });
      toast.success("Setting saved");
    },
    onError: (error: Error) => toast.error(error.message.includes("JSON") ? "Value must be valid JSON, e.g. \"text\", 10, or true" : error.message),
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("platform_settings").insert({
        key: newRow.key,
        label: newRow.label || newRow.key,
        description: newRow.description || null,
        group_name: newRow.group_name || "general",
        value: JSON.parse(newRow.value || "null"),
        is_public: false,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setNewRow({ key: "", label: "", description: "", group_name: "general", value: "" });
      await queryClient.invalidateQueries({ queryKey: ["admin-general-settings"] });
      toast.success("Setting added");
    },
    onError: (error: Error) => toast.error(error.message.includes("JSON") ? "Value must be valid JSON, e.g. \"text\", 10, or true" : error.message),
  });

  return (
    <Panel
      title="General & group class settings"
      description="Every other platform_settings key/value — brand copy, booking rules, and group-class configuration (add booking.group_classes_enabled, booking.group_class_max_participants, etc. here). Values are raw JSON — wrap text in quotes."
    >
      <ul className="space-y-3">
        {(settings.data ?? []).map((row) => (
          <li key={row.key} className="rounded-md border border-border p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-xs text-muted-foreground">
                  {row.key} · {row.group_name}
                  {row.description ? ` — ${row.description}` : ""}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Input
                className="max-w-xs font-mono text-xs"
                value={drafts[row.key] ?? JSON.stringify(row.value)}
                onChange={(e) => setDrafts({ ...drafts, [row.key]: e.target.value })}
              />
              <Button
                size="sm"
                variant="outline"
                disabled={save.isPending || (drafts[row.key] ?? JSON.stringify(row.value)) === JSON.stringify(row.value)}
                onClick={() => save.mutate({ key: row.key, value: drafts[row.key] ?? JSON.stringify(row.value) })}
              >
                {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <form
        className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="setting-key">Key</Label>
          <Input
            id="setting-key"
            required
            placeholder="booking.group_classes_enabled"
            value={newRow.key}
            onChange={(e) => setNewRow({ ...newRow, key: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="setting-label">Label</Label>
          <Input id="setting-label" value={newRow.label} onChange={(e) => setNewRow({ ...newRow, label: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="setting-group">Group</Label>
          <Input id="setting-group" value={newRow.group_name} onChange={(e) => setNewRow({ ...newRow, group_name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="setting-value">Value (JSON)</Label>
          <Input
            id="setting-value"
            required
            placeholder="true"
            className="font-mono"
            value={newRow.value}
            onChange={(e) => setNewRow({ ...newRow, value: e.target.value })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="setting-description">Description</Label>
          <Input
            id="setting-description"
            value={newRow.description}
            onChange={(e) => setNewRow({ ...newRow, description: e.target.value })}
          />
        </div>
        <div className="flex items-end sm:col-span-2">
          <Button type="submit" disabled={create.isPending}>
            <Plus className="size-4" />
            Add setting
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function SystemTab() {
  return (
    <div>
      <GeneralSettingsPanel />
    </div>
  );
}

const CHANNEL_OPTIONS = ["in_app", "email", "sms", "push"] as const;
const AUDIENCE_OPTIONS = ["student", "parent", "tutor", "agency", "admin"] as const;

type TemplateDraft = {
  trigger_key: string;
  channel: (typeof CHANNEL_OPTIONS)[number];
  audience: (typeof AUDIENCE_OPTIONS)[number] | "";
  subject: string;
  body: string;
};

type TemplateRow = {
  id: string;
  trigger_key: string;
  channel: string;
  audience: string | null;
  subject: string | null;
  body: string;
  description: string | null;
  is_active: boolean;
};

function TemplateEditor({
  template,
  onCancel,
  onSave,
  saving,
}: {
  template: TemplateRow;
  onCancel: () => void;
  onSave: (draft: TemplateDraft) => void;
  saving: boolean;
}) {
  const [draft, setDraft] = useState<TemplateDraft>({
    trigger_key: template.trigger_key,
    channel: template.channel as TemplateDraft["channel"],
    audience: (template.audience as TemplateDraft["audience"]) ?? "",
    subject: template.subject ?? "",
    body: template.body,
  });

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Trigger key</Label>
          <Input value={draft.trigger_key} onChange={(e) => setDraft({ ...draft, trigger_key: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Channel</Label>
          <Select value={draft.channel} onValueChange={(value) => setDraft({ ...draft, channel: value as TemplateDraft["channel"] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANNEL_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Audience</Label>
          <Select
            value={draft.audience || "all"}
            onValueChange={(value) => setDraft({ ...draft, audience: value === "all" ? "" : (value as TemplateDraft["audience"]) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All account types</SelectItem>
              {AUDIENCE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Subject (email only)</Label>
          <Input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Body</Label>
        <Textarea rows={3} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" disabled={saving} onClick={() => onSave(draft)}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Save
        </Button>
      </div>
    </div>
  );
}

function NewTemplateForm({ onCreated }: { onCreated: () => void }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TemplateDraft>({
    trigger_key: "",
    channel: "in_app",
    audience: "",
    subject: "",
    body: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notification_templates").insert({
        trigger_key: draft.trigger_key,
        channel: draft.channel,
        audience: draft.audience || null,
        subject: draft.subject || null,
        body: draft.body,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setDraft({ trigger_key: "", channel: "in_app", audience: "", subject: "", body: "" });
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-templates"] });
      toast.success("Template created");
      onCreated();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        New template
      </Button>
    );
  }

  return (
    <div className="rounded-md border border-dashed border-border p-3">
      <p className="mb-3 text-sm font-medium">New template</p>
      <TemplateEditor
        template={{
          id: "new",
          trigger_key: draft.trigger_key,
          channel: draft.channel,
          audience: draft.audience || null,
          subject: draft.subject,
          body: draft.body,
          description: null,
          is_active: true,
        }}
        saving={create.isPending}
        onCancel={() => setOpen(false)}
        onSave={(next) => {
          setDraft(next);
          create.mutate();
        }}
      />
    </div>
  );
}

function TemplatesTab() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

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
    mutationFn: async ({ id, draft }: { id: string; draft: TemplateDraft }) => {
      const { error } = await supabase
        .from("notification_templates")
        .update({
          trigger_key: draft.trigger_key,
          channel: draft.channel,
          audience: draft.audience || null,
          subject: draft.subject || null,
          body: draft.body,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      setEditingId(null);
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
      description="Every trigger, channel, audience and message body lives here. Use {{variables}} for personalised values."
    >
      <div className="mb-4">
        <NewTemplateForm onCreated={() => void templates.refetch()} />
      </div>
      <ul className="space-y-4">
        {(templates.data ?? []).map((template) => (
          <li key={template.id} className="rounded-md border border-border p-3">
            {editingId === template.id ? (
              <TemplateEditor
                template={template}
                saving={save.isPending}
                onCancel={() => setEditingId(null)}
                onSave={(draft) => save.mutate({ id: template.id, draft })}
              />
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{template.trigger_key}</p>
                    <p className="text-xs text-muted-foreground">
                      {template.channel} · {template.audience ?? "all account types"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={template.is_active}
                      aria-label="Active"
                      onCheckedChange={(checked) => toggle.mutate({ id: template.id, is_active: checked })}
                    />
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(template.id)}>
                      Edit
                    </Button>
                  </div>
                </div>
                {template.subject ? (
                  <p className="mt-2 text-xs text-muted-foreground">Subject: {template.subject}</p>
                ) : null}
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{template.body}</p>
              </>
            )}
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
      <AdminShell title="Platform settings">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AdminShell>
    );
  }

  if (!hasPermission("admin.settings")) {
    return (
      <AdminShell title="Platform settings">
        <div className="card-warm flex items-start gap-3 p-4 md:p-6">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <h2 className="text-base font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account type doesn't include platform settings permissions.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Platform settings"
      description="Subjects, curricula, commission rules, pricing and notification templates — all stored in the database and read live by every other portal."
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
          <TabsTrigger value="pricing" className="min-h-11">
            Pricing & fees
          </TabsTrigger>
          <TabsTrigger value="templates" className="min-h-11">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="min-h-11">
            System
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
        <TabsContent value="pricing">
          <PricingTab />
        </TabsContent>
        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>
        <TabsContent value="system">
          <SystemTab />
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}
