"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type Facility } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  PLATEAU_LGAS,
  STORAGE_TYPES,
  formatNaira,
} from "@/lib/utils";
import { Warehouse, Plus } from "lucide-react";

export default function StoragePage() {
  const { user, token } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [bookingFacility, setBookingFacility] = useState<Facility | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterLga, setFilterLga] = useState("");
  const [error, setError] = useState("");

  const isOperator = ["storage_operator", "admin", "super_admin"].includes(
    user?.role || ""
  );
  const isFarmer = user?.role === "farmer";

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    type: "ambient",
    lga: "",
    address: "",
    totalCapacityKg: "",
    pricePerKgPerDay: "",
  });

  const [bookForm, setBookForm] = useState({
    quantityKg: "",
    startDate: "",
    endDate: "",
    cropType: "",
    notes: "",
  });

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.set("type", filterType);
      if (filterLga) params.set("lga", filterLga);
      const res = await api.getFacilities(params.toString());
      setFacilities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filterType, filterLga]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    try {
      await api.createFacility(token, {
        ...createForm,
        totalCapacityKg: Number(createForm.totalCapacityKg),
        pricePerKgPerDay: Number(createForm.pricePerKgPerDay),
      });
      setShowCreate(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function handleBook(e: FormEvent) {
    e.preventDefault();
    if (!token || !bookingFacility) return;
    setError("");
    try {
      await api.createBooking(token, {
        facilityId: bookingFacility._id,
        quantityKg: Number(bookForm.quantityKg),
        startDate: bookForm.startDate,
        endDate: bookForm.endDate,
        cropType: bookForm.cropType,
        notes: bookForm.notes,
      });
      setBookingFacility(null);
      setBookForm({
        quantityKg: "",
        startDate: "",
        endDate: "",
        cropType: "",
        notes: "",
      });
      load();
      alert("Booking submitted successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Storage
          </h1>
          <p className="text-muted-foreground mt-1">
            {isFarmer
              ? "Book ambient, cold, silo or warehouse space"
              : "Manage storage facilities across Plateau"}
          </p>
        </div>
        {isOperator && (
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus className="w-4 h-4" />
            Add facility
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="h-10 px-3 rounded-xl border border-border bg-card text-sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All types</option>
          {STORAGE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
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

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>New storage facility</CardTitle>
          </CardHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
            <Input
              id="name"
              label="Facility name"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm({ ...createForm, name: e.target.value })
              }
              required
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                id="type"
                label="Type"
                value={createForm.type}
                onChange={(e) =>
                  setCreateForm({ ...createForm, type: e.target.value })
                }
                options={STORAGE_TYPES}
              />
              <Select
                id="lga"
                label="LGA"
                value={createForm.lga}
                onChange={(e) =>
                  setCreateForm({ ...createForm, lga: e.target.value })
                }
                options={PLATEAU_LGAS.map((l) => ({ value: l, label: l }))}
                placeholder="Select LGA"
              />
            </div>
            <Input
              id="address"
              label="Address"
              value={createForm.address}
              onChange={(e) =>
                setCreateForm({ ...createForm, address: e.target.value })
              }
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="capacity"
                label="Total capacity (kg)"
                type="number"
                value={createForm.totalCapacityKg}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    totalCapacityKg: e.target.value,
                  })
                }
                required
              />
              <Input
                id="price"
                label="Price per kg / day (₦)"
                type="number"
                value={createForm.pricePerKgPerDay}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    pricePerKgPerDay: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Description
              </label>
              <textarea
                className="w-full min-h-[80px] px-4 py-3 rounded-xl border border-border bg-card"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit">Create facility</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {bookingFacility && (
        <Card>
          <CardHeader>
            <CardTitle>Book: {bookingFacility.name}</CardTitle>
          </CardHeader>
          <form onSubmit={handleBook} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Available: {bookingFacility.availableCapacityKg.toLocaleString()}{" "}
              kg • {formatNaira(bookingFacility.pricePerKgPerDay)}/kg/day
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="qty"
                label="Quantity (kg)"
                type="number"
                value={bookForm.quantityKg}
                onChange={(e) =>
                  setBookForm({ ...bookForm, quantityKg: e.target.value })
                }
                required
                max={bookingFacility.availableCapacityKg}
              />
              <Input
                id="crop"
                label="Crop type"
                value={bookForm.cropType}
                onChange={(e) =>
                  setBookForm({ ...bookForm, cropType: e.target.value })
                }
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="start"
                label="Start date"
                type="date"
                value={bookForm.startDate}
                onChange={(e) =>
                  setBookForm({ ...bookForm, startDate: e.target.value })
                }
                required
              />
              <Input
                id="end"
                label="End date"
                type="date"
                value={bookForm.endDate}
                onChange={(e) =>
                  setBookForm({ ...bookForm, endDate: e.target.value })
                }
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit">Confirm booking</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBookingFacility(null)}
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
      ) : facilities.length === 0 ? (
        <Card className="p-12 text-center">
          <Warehouse className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No storage facilities found.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {facilities.map((f) => (
            <Card key={f._id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-lg">{f.name}</h3>
                  <p className="text-xs font-semibold uppercase text-primary mt-0.5">
                    {f.type} • {f.lga}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary whitespace-nowrap">
                  {formatNaira(f.pricePerKgPerDay)}/kg/day
                </span>
              </div>
              {f.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {f.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm">
                  <span className="font-semibold">
                    {f.availableCapacityKg.toLocaleString()}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    / {f.totalCapacityKg.toLocaleString()} kg available
                  </span>
                </p>
                {isFarmer && f.availableCapacityKg > 0 && (
                  <Button size="sm" onClick={() => setBookingFacility(f)}>
                    Book
                  </Button>
                )}
              </div>
              {f.operator && (
                <p className="text-xs text-muted-foreground mt-2">
                  Operator: {f.operator.name}
                  {f.operator.organization
                    ? ` (${f.operator.organization})`
                    : ""}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
