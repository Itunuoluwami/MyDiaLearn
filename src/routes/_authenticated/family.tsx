import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, UserRound } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { useRedirectToPortalHome } from "@/hooks/use-portal-redirect";

import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/family")({
  head: () => ({
    meta: [
      { title: "Family & student profiles — DiaLearn" },
      {
        name: "description",
        content:
          "Create and manage linked child student profiles, each with its own curriculum, level and learning goals.",
      },
      { property: "og:title", content: "Family & student profiles — DiaLearn" },
      {
        property: "og:description",
        content: "Parents manage every child's education profile and permissions in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FamilyPage,
});

const EMPTY = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  curriculum_id: "",
  education_level_id: "",
  school_name: "",
  learning_goals: "",
};

function FamilyPage() {
  useRedirectToPortalHome();
  const { user, hasPermission } = useAuth();

  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const canManage = hasPermission("students.manage");

  const students = useQuery({
    queryKey: ["students", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(
          "id, first_name, last_name, date_of_birth, school_name, learning_goals, can_self_login, can_book_lessons, can_message_tutors, is_active, curriculum_id, education_level_id, curricula(name), education_levels(name)",
        )
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const curricula = useQuery({
    queryKey: ["curricula"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curricula")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const levels = useQuery({
    queryKey: ["education-levels", form.curriculum_id],
    enabled: Boolean(form.curriculum_id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education_levels")
        .select("id, name")
        .eq("curriculum_id", form.curriculum_id)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const createStudent = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("students").insert({
        parent_id: user.id,
        first_name: form.first_name,
        last_name: form.last_name || null,
        date_of_birth: form.date_of_birth || null,
        curriculum_id: form.curriculum_id || null,
        education_level_id: form.education_level_id || null,
        school_name: form.school_name || null,
        learning_goals: form.learning_goals || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setForm(EMPTY);
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student profile added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updatePermission = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<
        Pick<
          Database["public"]["Tables"]["students"]["Update"],
          "can_self_login" | "can_book_lessons" | "can_message_tutors"
        >
      >;
    }) => {
      const { error } = await supabase.from("students").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeStudent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student profile removed");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <PortalShell
      title="Family & students"
      description="Each child gets their own education profile. You keep control of payments and permissions."
    >
      {canManage ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="size-4" />
              Add a student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add a student profile</DialogTitle>
              <DialogDescription>
                This child profile is linked to your account. You can add sign-in access later.
              </DialogDescription>
            </DialogHeader>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                createStudent.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  required
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={form.school_name}
                  onChange={(e) => setForm({ ...form, school_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Curriculum</Label>
                <Select
                  value={form.curriculum_id}
                  onValueChange={(value) =>
                    setForm({ ...form, curriculum_id: value, education_level_id: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select curriculum" />
                  </SelectTrigger>
                  <SelectContent>
                    {(curricula.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Education level</Label>
                <Select
                  value={form.education_level_id}
                  onValueChange={(value) => setForm({ ...form, education_level_id: value })}
                  disabled={!form.curriculum_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {(levels.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="goals">Learning goals</Label>
                <Textarea
                  id="goals"
                  rows={3}
                  value={form.learning_goals}
                  onChange={(e) => setForm({ ...form, learning_goals: e.target.value })}
                />
              </div>
              <DialogFooter className="sm:col-span-2">
                <Button type="submit" disabled={createStudent.isPending}>
                  {createStudent.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save student
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {students.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading students…</p>
        ) : (students.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No student profiles yet. Add your first child profile to get started.
          </p>
        ) : (
          (students.data ?? []).map((student) => (
            <article key={student.id} className="card-warm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary-deep">
                    <UserRound className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">
                      {student.first_name} {student.last_name ?? ""}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {student.curricula?.name ?? "No curriculum"} ·{" "}
                      {student.education_levels?.name ?? "No level"}
                    </p>
                  </div>
                </div>
                {canManage ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove student"
                    onClick={() => removeStudent.mutate(student.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                ) : null}
              </div>

              {student.learning_goals ? (
                <p className="mt-3 text-sm text-muted-foreground">{student.learning_goals}</p>
              ) : null}

              <div className="mt-4 space-y-3 border-t border-border pt-3">
                {(
                  [
                    ["can_self_login", "Can sign in"],
                    ["can_book_lessons", "Can book lessons"],
                    ["can_message_tutors", "Can message tutors"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex min-h-11 items-center justify-between gap-3">
                    <Label htmlFor={`${student.id}-${key}`} className="text-sm font-normal">
                      {label}
                    </Label>
                    <Switch
                      id={`${student.id}-${key}`}
                      checked={student[key]}
                      disabled={!canManage}
                      onCheckedChange={(checked) =>
                        updatePermission.mutate({ id: student.id, patch: { [key]: checked } })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <Badge variant={student.is_active ? "secondary" : "outline"}>
                  {student.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </article>
          ))
        )}
      </div>
    </PortalShell>
  );
}
