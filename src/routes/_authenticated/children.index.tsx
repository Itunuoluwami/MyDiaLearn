import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, Loader2, Lock, Plus, ShieldCheck, UserRound, Users } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { apiPost, apiPatch, useApiData } from "@/lib/api/data-client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { ParentShell } from "@/components/parent/ParentShell";
import { CardSkeletonList, EmptyPanel, LoadError, SectionCard } from "@/components/parent/ui";
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
import {
  childInitials,
  childName,
  useChildren,
  useCurriculaOptions,
  useLevelOptions,
  type Child,
} from "@/lib/parent-data";

export const Route = createFileRoute("/_authenticated/children/")({
  head: () => ({
    meta: [
      { title: "My children — DiaLearn parent portal" },
      {
        name: "description",
        content:
          "Add learners, keep each child's curriculum and level up to date, and control what they can do on DiaLearn.",
      },
      { property: "og:title", content: "My children — DiaLearn parent portal" },
      {
        property: "og:description",
        content: "One place to manage each child's education profile and permissions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChildrenPage,
});

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  curriculum_id: "",
  education_level_id: "",
  school_name: "",
  learning_goals: "",
};

type FormState = typeof EMPTY_FORM;

function ChildrenPage() {
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  const children = useChildren();
  const canManage = hasPermission("students.manage");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Child | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const curricula = useCurriculaOptions();
  const levels = useLevelOptions(form.curriculum_id || undefined);

  useEffect(() => {
    if (!dialogOpen) return;
    if (editing) {
      setForm({
        first_name: editing.first_name ?? "",
        last_name: editing.last_name ?? "",
        date_of_birth: editing.date_of_birth ?? "",
        curriculum_id: editing.curriculum_id ?? "",
        education_level_id: editing.education_level_id ?? "",
        school_name: editing.school_name ?? "",
        learning_goals: editing.learning_goals ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [dialogOpen, editing]);

  const saveChild = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || null,
        date_of_birth: form.date_of_birth || null,
        curriculum_id: form.curriculum_id || null,
        education_level_id: form.education_level_id || null,
        school_name: form.school_name.trim() || null,
        learning_goals: form.learning_goals.trim() || null,
      };
      if (viaApi) {
        const apiBody = {
          firstName: payload.first_name,
          lastName: payload.last_name ?? undefined,
          dateOfBirth: payload.date_of_birth ?? undefined,
          curriculumId: payload.curriculum_id ?? undefined,
          educationLevelId: payload.education_level_id ?? undefined,
          schoolName: payload.school_name ?? undefined,
          learningGoals: payload.learning_goals ?? undefined,
        };
        if (editing) await apiPatch(`/students/${editing.id}`, apiBody);
        else await apiPost("/students", apiBody);
        return;
      }
      if (editing) {
        const { error } = await supabase.from("students").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("students")
          .insert({ ...payload, parent_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      setDialogOpen(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["parent-children"] });
      await queryClient.invalidateQueries({ queryKey: ["parent-summary"] });
      toast.success(editing ? "Child profile updated" : "Child profile added");
    },
    onError: () => toast.error("We couldn't save this profile. Please try again."),
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
      if (viaApi) {
        await apiPatch(`/students/${id}`, {
          canSelfLogin: patch.can_self_login,
          canBookLessons: patch.can_book_lessons,
          canMessageTutors: patch.can_message_tutors,
        });
        return;
      }
      const { error } = await supabase.from("students").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["parent-children"] });
    },
    onError: () => toast.error("We couldn't update that permission. Please try again."),
  });

  const kids = children.data ?? [];

  return (
    <ParentShell
      title="My children"
      description="Each learner keeps their own education profile. You stay in control of payments and permissions."
      actions={
        canManage ? (
          <Button
            variant="cta"
            className="min-h-11"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" /> Add child
          </Button>
        ) : null
      }
    >
      {children.isLoading ? (
        <CardSkeletonList rows={2} height="h-44" />
      ) : children.isError ? (
        <LoadError
          message="We couldn't load your children right now."
          onRetry={() => void children.refetch()}
        />
      ) : kids.length === 0 ? (
        <EmptyPanel
          icon={Users}
          title="Add your first learner"
          body="Create a profile to start finding tutors and managing their learning journey."
          action={
            canManage ? (
              <Button variant="cta" className="min-h-11" onClick={() => setDialogOpen(true)}>
                <Plus className="size-4" /> Add child
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {kids.map((child) => (
            <article key={child.id} className="card-elevated p-4 md:p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-base font-semibold text-primary-deep">
                  {childInitials(child)}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold">{childName(child)}</h2>
                  <p className="truncate text-sm text-muted-foreground">
                    {child.education_levels?.name ?? "Level not set"} ·{" "}
                    {child.curricula?.name ?? "Curriculum not set"}
                  </p>
                  {child.school_name ? (
                    <p className="truncate text-xs text-muted-foreground">{child.school_name}</p>
                  ) : null}
                </div>
                <Badge variant={child.is_active ? "secondary" : "outline"} className="shrink-0">
                  {child.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {child.learning_goals ? (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {child.learning_goals}
                </p>
              ) : null}

              <div className="mt-4 space-y-2.5 border-t border-border pt-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <ShieldCheck className="size-3.5" aria-hidden="true" /> Permissions you control
                </p>
                {(
                  [
                    ["can_self_login", "Can sign in to their own account"],
                    ["can_book_lessons", "Can request lessons"],
                    ["can_message_tutors", "Can message tutors"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex min-h-11 items-center justify-between gap-3">
                    <Label htmlFor={`${child.id}-${key}`} className="text-sm font-normal">
                      {label}
                    </Label>
                    <Switch
                      id={`${child.id}-${key}`}
                      checked={Boolean(child[key])}
                      disabled={!canManage}
                      onCheckedChange={(checked) =>
                        updatePermission.mutate({ id: child.id, patch: { [key]: checked } })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="min-h-11 sm:min-h-9">
                  <Link to="/children/$studentId" params={{ studentId: child.id }}>
                    <UserRound className="size-4" /> View profile
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
                {canManage ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-11 sm:min-h-9"
                    onClick={() => {
                      setEditing(child);
                      setDialogOpen(true);
                    }}
                  >
                    Edit details
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <SectionCard
        className="mt-6"
        title="Why we ask for a child's details"
        description="DiaLearn serves minors, so we collect only what tutors need to teach well."
      >
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li className="flex gap-2">
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            Date of birth is used to match age-appropriate tutors and permissions.
          </li>
          <li className="flex gap-2">
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            Curriculum and level help tutors prepare the right material.
          </li>
          <li className="flex gap-2">
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            Tutors only see what is needed for a booked lesson.
          </li>
          <li className="flex gap-2">
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            You can withdraw a child's sign-in or messaging access at any time.
          </li>
        </ul>
      </SectionCard>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit child profile" : "Add a child profile"}</DialogTitle>
            <DialogDescription>
              This learner profile is linked to your account. You can grant sign-in access later.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              saveChild.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                required
                value={form.first_name}
                onChange={(event) => setForm({ ...form, first_name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                value={form.last_name}
                onChange={(event) => setForm({ ...form, last_name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of birth</Label>
              <Input
                id="dob"
                type="date"
                value={form.date_of_birth}
                onChange={(event) => setForm({ ...form, date_of_birth: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School (optional)</Label>
              <Input
                id="school"
                value={form.school_name}
                onChange={(event) => setForm({ ...form, school_name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="curriculum">Curriculum</Label>
              <Select
                value={form.curriculum_id}
                onValueChange={(value) =>
                  setForm({ ...form, curriculum_id: value, education_level_id: "" })
                }
              >
                <SelectTrigger id="curriculum">
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
              <Label htmlFor="level">Education level / grade</Label>
              <Select
                value={form.education_level_id}
                onValueChange={(value) => setForm({ ...form, education_level_id: value })}
                disabled={!form.curriculum_id}
              >
                <SelectTrigger id="level">
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
              <Label htmlFor="goals">Learning goals & preferences</Label>
              <Textarea
                id="goals"
                rows={3}
                placeholder="What would you like this child to achieve?"
                value={form.learning_goals}
                onChange={(event) => setForm({ ...form, learning_goals: event.target.value })}
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button
                type="submit"
                variant="cta"
                className="min-h-11"
                disabled={saveChild.isPending}
              >
                {saveChild.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {editing ? "Save changes" : "Save child"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ParentShell>
  );
}
