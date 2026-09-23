import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, Loader2, Save, ShieldCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { ParentShell } from "@/components/parent/ParentShell";
import { SectionCard } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — DiaLearn parent portal" },
      {
        name: "description",
        content:
          "Update your parent profile, contact details, timezone and preferred currency, and manage account security.",
      },
      { property: "og:title", content: "Settings — DiaLearn parent portal" },
      {
        property: "og:description",
        content: "Manage your DiaLearn account preferences and security.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, user, roles, refresh, loading } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Tutor-only accounts get the tutor settings surface, not the parent one.
  useEffect(() => {
    if (loading) return;
    if (roles.includes("tutor") && !roles.includes("parent")) {
      void navigate({ to: "/tutor/settings", replace: true });
    }
  }, [loading, roles, navigate]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setCountryCode(profile.country_code ?? "");
    setTimezone(profile.timezone);
    setCurrency(profile.preferred_currency);
  }, [profile]);

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("code, name, symbol")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const timezones =
    typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["UTC"];

  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You need to be signed in.");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
          phone: phone || null,
          country_code: countryCode || null,
          timezone,
          preferred_currency: currency,
        })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      await queryClient.invalidateQueries();
      toast.success("Settings saved");
    },
    onError: () => toast.error("We couldn't save your settings. Please try again."),
  });

  const resetPassword = useMutation({
    mutationFn: async () => {
      if (!profile?.email) throw new Error("No email on this account.");
      const { error } = await authClient.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Password reset link sent to your email."),
    onError: () => toast.error("We couldn't send the reset link. Please try again."),
  });

  return (
    <ParentShell title="Settings" description="Your profile, preferences and account security.">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <SectionCard title="Profile" description="Used on bookings and messages with tutors.">
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                save.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="s-name">Full name</Label>
                <Input
                  id="s-name"
                  className="min-h-11"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-email">Email</Label>
                <Input id="s-email" className="min-h-11" value={profile?.email ?? ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-phone">Phone</Label>
                <Input
                  id="s-phone"
                  className="min-h-11"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-country">Country code</Label>
                <Input
                  id="s-country"
                  className="min-h-11"
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="s-timezone" className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {timezones.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-currency">Preferred currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="s-currency" className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(currencies ?? []).map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.symbol} {item.code} — {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  variant="cta"
                  className="min-h-12 w-full sm:w-auto"
                  disabled={save.isPending}
                >
                  {save.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save changes
                </Button>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            title="Security"
            description="Password resets are sent to your email address."
          >
            <Button
              variant="outline"
              className="min-h-12"
              disabled={resetPassword.isPending}
              onClick={() => resetPassword.mutate()}
            >
              {resetPassword.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <KeyRound className="size-4" />
              )}
              Send password reset link
            </Button>
          </SectionCard>
        </div>

        <aside className="space-y-6">
          <SectionCard title="Account">
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Badge key={role} variant="secondary" className="capitalize">
                    {role}
                  </Badge>
                ))}
              </div>
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                Currency and timezone shape how prices and class times are shown to you across
                DiaLearn.
              </p>
            </div>
          </SectionCard>
        </aside>
      </div>
    </ParentShell>
  );
}
