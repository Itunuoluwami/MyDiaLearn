import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My DiaLearn account" },
      {
        name: "description",
        content: "Manage your DiaLearn profile, timezone, currency and account permissions.",
      },
      { property: "og:title", content: "My DiaLearn account" },
      { property: "og:description", content: "Manage your DiaLearn profile and preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  useRedirectToPortalHome();
  const { profile, permissions, refresh, user } = useAuth();
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
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("code, name, symbol")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: permissionCatalog } = useQuery({
    queryKey: ["permission-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("permissions").select("key, label, category");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
          phone: phone || null,
          country_code: countryCode || null,
          timezone,
          preferred_currency: currency,
          onboarding_completed: true,
        })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      await queryClient.invalidateQueries();
      toast.success("Profile updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const timezones =
    typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["UTC"];

  return (
    <PortalShell title="My account" description="Your details, timezone and account permissions.">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="card-warm p-4 md:p-6">
          <h2 className="text-base font-semibold">Profile</h2>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate();
            }}
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="full-name">Full name</Label>
              <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? ""} readOnly disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country code</Label>
              <Input
                id="country"
                placeholder="GB"
                maxLength={2}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Preferred currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
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
            <div className="sm:col-span-2">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save changes
              </Button>
            </div>
          </form>
        </section>

        <section className="card-warm h-fit p-4 md:p-6">
          <h2 className="text-base font-semibold">What you can do</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Permissions come from your account type and are configured by DiaLearn admins.
          </p>
          <ul className="mt-4 space-y-2">
            {permissions.length === 0 ? (
              <li className="text-sm text-muted-foreground">No permissions assigned yet.</li>
            ) : (
              permissions.map((key) => {
                const meta = permissionCatalog?.find((item) => item.key === key);
                return (
                  <li key={key} className="flex items-start justify-between gap-2 text-sm">
                    <span>{meta?.label ?? key}</span>
                    <Badge variant="outline" className="shrink-0 capitalize">
                      {meta?.category ?? "general"}
                    </Badge>
                  </li>
                );
              })
            )}
          </ul>
        </section>
      </div>
    </PortalShell>
  );
}
