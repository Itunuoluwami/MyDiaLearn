import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock3, KeyRound, Loader2, Save, ShieldCheck, Wallet } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { TutorShell } from "@/components/tutor/TutorShell";
import { SectionCard } from "@/components/parent/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/tutor/settings")({
  head: () => ({
    meta: [
      { title: "Settings — DiaLearn tutor portal" },
      {
        name: "description",
        content:
          "Update your tutor account details, timezone and settlement currency, and manage security, payouts and availability.",
      },
      { property: "og:title", content: "Settings — DiaLearn tutor portal" },
      {
        property: "og:description",
        content: "Manage your DiaLearn tutor account, security and payout preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorSettingsPage,
});

function TutorSettingsPage() {
  const { profile, user, roles, refresh } = useAuth();
  const queryClient = useQueryClient();

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
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Password reset link sent to your email."),
    onError: () => toast.error("We couldn't send the reset link. Please try again."),
  });

  console.log("DBG state", JSON.stringify({ timezone, currency, fullName, p: profile?.timezone, pc: profile?.preferred_currency }));

  return (
    <TutorShell title="Settings" description="Your account, security, payouts and teaching hours.">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <SectionCard title="Account" description="Shown to families on bookings and messages.">
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                save.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="t-name">Full name</Label>
                <Input
                  id="t-name"
                  className="min-h-11"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-email">Email</Label>
                <Input id="t-email" className="min-h-11" value={profile?.email ?? ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-phone">Phone</Label>
                <Input
                  id="t-phone"
                  className="min-h-11"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-country">Country code</Label>
                <Input
                  id="t-country"
                  className="min-h-11"
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="t-timezone" className="min-h-11">
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
                <Label htmlFor="t-currency">Settlement currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="t-currency" className="min-h-11">
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

          <SectionCard title="Security" description="Password resets are sent to your email address.">
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
          <SectionCard title="Teaching setup">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Badge key={role} variant="secondary" className="capitalize">
                    {role}
                  </Badge>
                ))}
              </div>
              <Button asChild variant="outline" className="min-h-11 w-full justify-start">
                <Link to="/tutor/earnings">
                  <Wallet className="size-4" /> Payouts & earnings
                </Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11 w-full justify-start">
                <Link to="/tutor/availability">
                  <Clock3 className="size-4" /> Teaching hours
                </Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11 w-full justify-start">
                <Link to="/tutor/verification">
                  <ShieldCheck className="size-4" /> Verification
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Your timezone and settlement currency shape how class times and payouts are shown to
                you across DiaLearn.
              </p>
            </div>
          </SectionCard>
        </aside>
      </div>
    </TutorShell>
  );
}
