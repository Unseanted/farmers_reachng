"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type Booking } from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatNaira, formatDate } from "@/lib/utils";
import { CalendarCheck } from "lucide-react";

export default function BookingsPage() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const isOperator = ["storage_operator", "admin", "super_admin"].includes(
    user?.role || ""
  );

  useEffect(() => {
    if (!token) return;
    async function load() {
      setLoading(true);
      try {
        const res = isOperator
          ? await api.operatorBookings(token!)
          : await api.myBookings(token!);
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, isOperator]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {isOperator ? "Facility bookings" : "My bookings"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isOperator
            ? "Bookings for your storage facilities"
            : "Your storage reservations"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No bookings yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b._id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold">
                    {typeof b.facility === "object"
                      ? b.facility.name
                      : "Facility"}
                    {isOperator && b.farmer
                      ? ` — ${b.farmer.name}`
                      : ""}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {b.quantityKg.toLocaleString()} kg
                    {b.cropType ? ` • ${b.cropType}` : ""} • {b.totalDays} days
                    • {formatDate(b.startDate)} → {formatDate(b.endDate)}
                  </p>
                  {isOperator && b.farmer?.phone && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Phone: {b.farmer.phone}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary">
                    {formatNaira(b.totalCost)}
                  </p>
                  <div className="flex gap-2 justify-end mt-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted">
                      {b.status}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted">
                      {b.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
