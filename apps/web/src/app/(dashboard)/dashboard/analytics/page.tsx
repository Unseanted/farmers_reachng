"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type DashboardStats } from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Users,
  Megaphone,
  MessageSquare,
  Warehouse,
  CalendarCheck,
  ShoppingBasket,
  BarChart3,
} from "lucide-react";

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .getDashboard(token)
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="p-12 text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Unable to load analytics.</p>
      </Card>
    );
  }

  const cards = [
    {
      label: "Total farmers",
      value: stats.overview.totalFarmers,
      icon: Users,
    },
    {
      label: "Extension officers",
      value: stats.overview.totalOfficers,
      icon: Users,
    },
    {
      label: "Campaigns",
      value: stats.overview.totalCampaigns,
      icon: Megaphone,
    },
    {
      label: "Messages delivered",
      value: stats.overview.messagesSent,
      icon: MessageSquare,
    },
    {
      label: "Storage facilities",
      value: stats.overview.totalFacilities,
      icon: Warehouse,
    },
    {
      label: "Active bookings",
      value: stats.overview.activeBookings,
      icon: CalendarCheck,
    },
    {
      label: "Produce listings",
      value: stats.overview.availableProduce,
      icon: ShoppingBasket,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Platform-wide insights for Plateau State
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {c.label}
                </p>
                <p className="font-display text-3xl font-extrabold mt-1">
                  {c.value.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <c.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Farmers by LGA</CardTitle>
          </CardHeader>
          {stats.farmersByLga.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.farmersByLga.map((item) => {
                const max = Math.max(
                  ...stats.farmersByLga.map((x) => x.count),
                  1
                );
                return (
                  <div key={item._id || "unknown"}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">
                        {item._id || "Unknown"}
                      </span>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(item.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Irrigation status</CardTitle>
          </CardHeader>
          {stats.farmersByIrrigation.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="space-y-4">
              {stats.farmersByIrrigation.map((item) => (
                <div
                  key={item._id || "unknown"}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="font-medium capitalize">
                    {item._id || "Unknown"}
                  </span>
                  <span className="font-display text-xl font-bold text-primary">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
