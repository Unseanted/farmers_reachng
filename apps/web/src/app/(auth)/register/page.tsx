"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PLATEAU_LGAS, CROPS } from "@/lib/utils";
import { Sprout } from "lucide-react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

function RegisterForm() {
  const { register, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "farmer";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: defaultRole,
    lga: "",
    irrigationStatus: "none",
    organization: "",
    crops: [] as string[],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [user, authLoading, router]);

  function update(field: string, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        ...form,
        crops: form.role === "farmer" ? form.crops : undefined,
        irrigationStatus: form.role === "farmer" ? form.irrigationStatus : undefined,
        organization:
          form.role !== "farmer" ? form.organization || undefined : undefined,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/5 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/40 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="font-display text-2xl font-extrabold">
              FarmerReachNG
            </span>
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold leading-tight">
              Join the network transforming Plateau agriculture.
            </h1>
            <p className="mt-4 text-primary-foreground/80">
              Whether you are a farmer, extension officer or storage
              operator — start in minutes.
            </p>
          </div>
          <p className="text-sm text-primary-foreground/60">
            17 LGAs • SMS + WhatsApp • Storage marketplace
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Sprout className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-extrabold">
              FarmerReach<span className="text-primary">NG</span>
            </span>
          </div>

          <h2 className="font-display text-3xl font-extrabold tracking-tight">
            Create account
          </h2>
          <p className="mt-2 text-muted-foreground">
            Choose your role and get started
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 text-destructive text-sm font-medium px-4 py-3">
                {error}
              </div>
            )}

            <Select
              id="role"
              label="I am a…"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              options={[
                { value: "farmer", label: "Farmer" },
                { value: "extension_officer", label: "Extension Officer" },
                { value: "storage_operator", label: "Storage Operator" },
              ]}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="name"
                label="Full name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
              <Input
                id="phone"
                label="Phone (WhatsApp)"
                placeholder="0803…"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>

            <Input
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              minLength={6}
            />

            <Select
              id="lga"
              label="LGA"
              value={form.lga}
              onChange={(e) => update("lga", e.target.value)}
              placeholder="Select LGA"
              options={PLATEAU_LGAS.map((l) => ({ value: l, label: l }))}
            />

            {form.role === "farmer" && (
              <>
                <Select
                  id="irrigation"
                  label="Irrigation status"
                  value={form.irrigationStatus}
                  onChange={(e) => update("irrigationStatus", e.target.value)}
                  options={[
                    { value: "none", label: "None" },
                    { value: "partial", label: "Partial" },
                    { value: "full", label: "Full irrigation" },
                  ]}
                />
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Main crops
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CROPS.map((c) => {
                      const selected = form.crops.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            update(
                              "crops",
                              selected
                                ? form.crops.filter((x) => x !== c)
                                : [...form.crops, c]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                            selected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:border-primary"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {(form.role === "extension_officer" ||
              form.role === "storage_operator") && (
              <Input
                id="organization"
                label="Organization"
                value={form.organization}
                onChange={(e) => update("organization", e.target.value)}
                placeholder="e.g. ADP Plateau, private warehouse"
              />
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create account
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-medium">or</span>
            </div>
          </div>

          <GoogleSignInButton role={form.role} text="signup_with" />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
