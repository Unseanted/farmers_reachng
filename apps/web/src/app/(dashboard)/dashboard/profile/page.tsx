"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PLATEAU_LGAS, CROPS, ROLES } from "@/lib/utils";

export default function ProfilePage() {
  const { user, token, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    lga: user?.lga || "",
    irrigationStatus: user?.irrigationStatus || "none",
    organization: user?.organization || "",
    crops: user?.crops || [],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setMessage("");
    try {
      await api.updateProfile(token, form);
      await refreshUser();
      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          {ROLES[(user?.role || "farmer") as keyof typeof ROLES]} •{" "}
          {user?.email}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <p
              className={`text-sm font-medium ${
                message.includes("success")
                  ? "text-success"
                  : "text-destructive"
              }`}
            >
              {message}
            </p>
          )}
          <Input
            id="name"
            label="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            id="phone"
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Select
            id="lga"
            label="LGA"
            value={form.lga}
            onChange={(e) => setForm({ ...form, lga: e.target.value })}
            options={PLATEAU_LGAS.map((l) => ({ value: l, label: l }))}
            placeholder="Select LGA"
          />
          {user?.role === "farmer" && (
            <>
              <Select
                id="irrigation"
                label="Irrigation status"
                value={form.irrigationStatus}
                onChange={(e) =>
                  setForm({ ...form, irrigationStatus: e.target.value })
                }
                options={[
                  { value: "none", label: "None" },
                  { value: "partial", label: "Partial" },
                  { value: "full", label: "Full" },
                ]}
              />
              <div>
                <label className="block text-sm font-semibold mb-2">Crops</label>
                <div className="flex flex-wrap gap-2">
                  {CROPS.map((c) => {
                    const selected = form.crops.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            crops: selected
                              ? form.crops.filter((x) => x !== c)
                              : [...form.crops, c],
                          })
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground"
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
          {(user?.role === "extension_officer" ||
            user?.role === "storage_operator") && (
            <Input
              id="org"
              label="Organization"
              value={form.organization}
              onChange={(e) =>
                setForm({ ...form, organization: e.target.value })
              }
            />
          )}
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
