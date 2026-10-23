"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type Produce } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { CROPS, PLATEAU_LGAS, formatNaira, formatDate } from "@/lib/utils";
import { ShoppingBasket, Plus } from "lucide-react";

export default function MarketPage() {
  const { user, token } = useAuth();
  const [listings, setListings] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCrop, setFilterCrop] = useState("");
  const [filterLga, setFilterLga] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    crop: "",
    quantityKg: "",
    unitPrice: "",
    quality: "standard",
    description: "",
  });

  const isFarmer = user?.role === "farmer";

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCrop) params.set("crop", filterCrop);
      if (filterLga) params.set("lga", filterLga);
      const res = await api.getProduce(params.toString());
      setListings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filterCrop, filterLga]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    try {
      await api.createProduce(token, {
        crop: form.crop,
        quantityKg: Number(form.quantityKg),
        unitPrice: form.unitPrice ? Number(form.unitPrice) : undefined,
        quality: form.quality,
        description: form.description,
      });
      setShowForm(false);
      setForm({
        crop: "",
        quantityKg: "",
        unitPrice: "",
        quality: "standard",
        description: "",
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Market
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover produce listings across Plateau State
          </p>
        </div>
        {isFarmer && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" />
            List produce
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="h-10 px-3 rounded-xl border border-border bg-card text-sm"
          value={filterCrop}
          onChange={(e) => setFilterCrop(e.target.value)}
        >
          <option value="">All crops</option>
          {CROPS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="h-10 px-3 rounded-xl border border-border bg-card text-sm"
          value={filterLga}
          onChange={(e) => setFilterLga(e.target.value)}
        >
          <option value="">All LGAs</option>
          {PLATEAU_LGAS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>List your produce</CardTitle>
          </CardHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                id="crop"
                label="Crop"
                value={form.crop}
                onChange={(e) => setForm({ ...form, crop: e.target.value })}
                options={CROPS.map((c) => ({ value: c, label: c }))}
                placeholder="Select crop"
              />
              <Select
                id="quality"
                label="Quality"
                value={form.quality}
                onChange={(e) => setForm({ ...form, quality: e.target.value })}
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "premium", label: "Premium" },
                  { value: "organic", label: "Organic" },
                ]}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="qty"
                label="Quantity (kg)"
                type="number"
                value={form.quantityKg}
                onChange={(e) =>
                  setForm({ ...form, quantityKg: e.target.value })
                }
                required
              />
              <Input
                id="price"
                label="Unit price (₦/kg)"
                type="number"
                value={form.unitPrice}
                onChange={(e) =>
                  setForm({ ...form, unitPrice: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Description
              </label>
              <textarea
                className="w-full min-h-[80px] px-4 py-3 rounded-xl border border-border bg-card"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit">Publish listing</Button>
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
      ) : listings.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingBasket className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No produce listings available yet.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((p) => (
            <Card key={p._id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">{p.crop}</h3>
                  <p className="text-xs font-semibold uppercase text-primary">
                    {p.quality} • {p.lga || "Plateau"}
                  </p>
                </div>
                {p.unitPrice != null && (
                  <span className="font-bold text-primary">
                    {formatNaira(p.unitPrice)}/kg
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm">
                <span className="font-semibold">
                  {p.quantityKg.toLocaleString()} kg
                </span>{" "}
                available
              </p>
              {p.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {p.description}
                </p>
              )}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.farmer?.name || "Farmer"}</span>
                <span>{formatDate(p.createdAt)}</span>
              </div>
              {p.contactPhone && (
                <a
                  href={`tel:${p.contactPhone}`}
                  className="mt-3 block text-center text-sm font-semibold text-primary hover:underline"
                >
                  Call {p.contactPhone}
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
