import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create a DiaLearn account" },
      {
        name: "description",
        content:
          "Sign in to DiaLearn or create a parent, student, tutor or agency account, verified by email code.",
      },
      { property: "og:title", content: "Sign in or create a DiaLearn account" },
      {
        property: "og:description",
        content: "Parent, student, tutor and agency accounts for the DiaLearn tutoring marketplace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const ROLE_DESCRIPTIONS: Record<string, string> = {
  parent: "Manage children's learning, bookings and payments",
  student: "Learn one-to-one with a vetted tutor",
  tutor: "Teach students in the diaspora",
  agency: "Manage a roster of tutors",
  admin: "Platform administration",
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading, refresh } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("parent");
  const [otp, setOtp] = useState("");
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [busy, setBusy] = useState(false);

  // Self-serve account types come from admin-editable platform settings.
  const { data: accountTypes } = useQuery({
    queryKey: ["setting", "auth.account_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "auth.account_types")
        .maybeSingle();
      if (error) throw error;
      const value = data?.value;
      return Array.isArray(value) ? (value as AppRole[]) : [];
    },
  });

  if (!authLoading && session && !awaitingOtp) {
    void navigate({ to: "/account", replace: true });
  }

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
    toast.success("Welcome back");
    void navigate({ to: "/account", replace: true });
  }

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
        },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setAwaitingOtp(true);
    toast.success("We sent a 6-digit code to your email");
  }

  async function handleVerifyOtp(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setAwaitingOtp(false);
    await refresh();
    toast.success("Email verified — your account is ready");
    void navigate({ to: "/account", replace: true });
  }

  async function handleResend() {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("A new code is on its way");
  }

  const types = accountTypes?.length ? accountTypes : (["parent", "student", "tutor", "agency"] as AppRole[]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-site flex min-h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src={BRAND.logoUrl} alt="DiaLearn" className="h-10 w-auto md:h-11" />
          </Link>
        </div>
      </header>

      <main className="container-site flex justify-center py-8 md:py-16">
        <div className="w-full max-w-md">
          {awaitingOtp ? (
            <section className="card-warm p-5 md:p-7">
              <MailCheck className="size-8 text-primary" />
              <h1 className="display-section mt-4 text-2xl">Verify your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter the 6-digit code we sent to <span className="font-medium text-foreground">{email}</span>.
              </p>
              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <Button type="submit" className="w-full" disabled={busy || otp.length < 6}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Verify and continue
                </Button>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <Button type="button" variant="ghost" size="sm" onClick={handleResend}>
                    Resend code
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAwaitingOtp(false);
                      setOtp("");
                    }}
                  >
                    Use a different email
                  </Button>
                </div>
              </form>
            </section>
          ) : (
            <section className="card-warm p-5 md:p-7">
              <p className="eyebrow">{BRAND.tagline}</p>
              <h1 className="display-section mt-2 text-2xl">Welcome to DiaLearn</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                One account for parents, students, tutors and agencies.
              </p>

              <Tabs
                value={mode}
                onValueChange={(value) => setMode(value as "signin" | "signup")}
                className="mt-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin" className="min-h-11">
                    Sign in
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="min-h-11">
                    Create account
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                      Sign in
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full name</Label>
                      <Input
                        id="signup-name"
                        required
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account type</Label>
                      <RadioGroup
                        value={role}
                        onValueChange={(value) => setRole(value as AppRole)}
                        className="gap-2"
                      >
                        {types.map((option) => (
                          <label
                            key={option}
                            htmlFor={`role-${option}`}
                            className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-border p-3 has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary-soft/40"
                          >
                            <RadioGroupItem id={`role-${option}`} value={option} className="mt-1" />
                            <span>
                              <span className="block text-sm font-semibold">{titleCase(option)}</span>
                              <span className="block text-xs text-muted-foreground">
                                {ROLE_DESCRIPTIONS[option] ?? "DiaLearn account"}
                              </span>
                            </span>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                      Create account
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      We'll email you a 6-digit code to verify your address.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
