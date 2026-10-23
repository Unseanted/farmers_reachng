"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type Campaign } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PLATEAU_LGAS, CROPS, formatDate } from "@/lib/utils";
import { Megaphone, Send, Plus } from "lucide-react";

export default function CampaignsPage() {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    message: "",
    channel: "sms",
    targetLgas: [] as string[],
    targetCrops: [] as string[],
    targetIrrigation: "all",
  });

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.getCampaigns(token);
      setCampaigns(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    try {
      await api.createCampaign(token, form);
      setShowForm(false);
      setForm({
        title: "",
        message: "",
        channel: "sms",
        targetLgas: [],
        targetCrops: [],
        targetIrrigation: "all",
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function handleSend(id: string) {
    if (!token) return;
    setSending(id);
    try {
      await api.sendCampaign(token, id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(null);
    }
  }

  function toggleArray(field: "targetLgas" | "targetCrops", value: string) {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((x) => x !== value)
          : [...arr, value],
      };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Campaigns
          </h1>
          <p className="text-muted-foreground mt-1">
            Send targeted SMS & WhatsApp advisory to farmers
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          New campaign
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create campaign</CardTitle>
          </CardHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive font-medium">{error}</div>
            )}
            <Input
              id="title"
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. Dry season irrigation tip – Week 3"
            />
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Message
              </label>
              <textarea
                className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                placeholder="Keep under 160 chars for SMS when possible…"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.message.length}/1000
              </p>
            </div>
            <Select
              id="channel"
              label="Channel"
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
              options={[
                { value: "sms", label: "SMS" },
                { value: "whatsapp", label: "WhatsApp" },
                { value: "both", label: "Both" },
              ]}
            />
            <Select
              id="irrigation"
              label="Target irrigation status"
              value={form.targetIrrigation}
              onChange={(e) =>
                setForm({ ...form, targetIrrigation: e.target.value })
              }
              options={[
                { value: "all", label: "All farmers" },
                { value: "none", label: "No irrigation" },
                { value: "partial", label: "Partial" },
                { value: "full", label: "Full irrigation" },
              ]}
            />
            <div>
              <label className="block text-sm font-semibold mb-2">
                Target LGAs (optional – leave empty for all)
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATEAU_LGAS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleArray("targetLgas", l)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      form.targetLgas.includes(l)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Target crops (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {CROPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleArray("targetCrops", c)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      form.targetCrops.includes(c)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">Save campaign</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No campaigns yet. Create your first advisory message.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <Card key={c._id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg">{c.title}</h3>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        c.status === "completed"
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                      {c.channel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {c.message}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {c.delivered}/{c.totalRecipients} delivered •{" "}
                    {formatDate(c.createdAt)}
                    {c.targetLgas?.length
                      ? ` • LGAs: ${c.targetLgas.join(", ")}`
                      : ""}
                  </p>
                </div>
                {c.status === "draft" && (
                  <Button
                    size="sm"
                    loading={sending === c._id}
                    onClick={() => handleSend(c._id)}
                  >
                    <Send className="w-4 h-4" />
                    Send now
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
