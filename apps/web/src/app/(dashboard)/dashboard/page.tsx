"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type DashboardStats, type Campaign, type Booking, type Produce } from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatNaira, formatDate, ROLES } from "@/lib/utils";
import {
  Users,
  Megaphone,
  MessageSquare,
  Warehouse,
  CalendarCheck,
  ShoppingBasket,
  Sprout,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [produce, setProduce] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) return;

    async function load() {
      setLoading(true);
      try {
        const role = user!.role;

        if (["admin", "super_admin", "extension_officer"].includes(role)) {
          const [dash, camps] = await Promise.all([
            api.getDashboard(token!),
            api.getCampaigns(token!),
          ]);
          setStats(dash.data);
          setCampaigns(camps.data.slice(0, 5));
        }

        if (role === "farmer") {
          const [b, p] = await Promise.all([
            api.myBookings(token!),
            api.myProduce(token!),
          ]);
          setBookings(b.data.slice(0, 5));
          setProduce(p.data.slice(0, 5));
        }

        if (role === "storage_operator") {
          const b = await api.operatorBookings(token!);
          setBookings(b.data.slice(0, 8));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, user]);

  const role = user?.role || "farmer";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Welcome, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {ROLES[role as keyof typeof ROLES]} •{" "}
          {user?.lga || "Plateau State"}
        </p>
      </div>

      {/* Stats for officers / admins */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Farmers",
              value: stats.overview.totalFarmers,
              icon: Users,
              color: "text-primary",
            },
            {
              label: "Messages sent",
              value: stats.overview.messagesSent,
              icon: MessageSquare,
              color: "text-accent",
            },
            {
              label: "Campaigns",
              value: stats.overview.totalCampaigns,
              icon: Megaphone,
              color: "text-secondary",
            },
            {
              label: "Active bookings",
              value: stats.overview.activeBookings,
              icon: CalendarCheck,
              color: "text-success",
            },
          ].map((s) => (
            <Card key={s.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="font-display text-3xl font-extrabold mt-1">
                    {s.value.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${s.color}`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Farmer quick actions */}
      {role === "farmer" && (
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/dashboard/storage">
            <Card className="p-5 hover:border-primary/50 transition-colors cursor-pointer h-full">
              <Warehouse className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold">Book storage</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ambient, cold, silo & warehouse space
              </p>
            </Card>
          </Link>
          <Link href="/dashboard/market">
            <Card className="p-5 hover:border-primary/50 transition-colors cursor-pointer h-full">
              <ShoppingBasket className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-bold">List produce</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Reach buyers across Plateau
              </p>
            </Card>
          </Link>
          <Link href="/dashboard/bookings">
            <Card className="p-5 hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CalendarCheck className="w-8 h-8 text-success mb-3" />
              <h3 className="font-bold">My bookings</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Track storage reservations
              </p>
            </Card>
          </Link>
        </div>
      )}

      {/* Extension officer CTA */}
      {role === "extension_officer" && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold">
                Send a new campaign
              </h3>
              <p className="text-muted-foreground mt-1">
                Target farmers by LGA, crop or irrigation status via SMS or
                WhatsApp
              </p>
            </div>
            <Link
              href="/dashboard/campaigns"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm shrink-0"
            >
              Create campaign
            </Link>
          </div>
        </Card>
      )}

      {/* Recent campaigns */}
      {campaigns.length > 0 && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent campaigns</CardTitle>
            <Link
              href="/dashboard/campaigns"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.channel.toUpperCase()} • {c.delivered}/{c.totalRecipients}{" "}
                    delivered • {formatDate(c.createdAt)}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    c.status === "completed"
                      ? "bg-success/15 text-success"
                      : c.status === "sending"
                        ? "bg-accent/15 text-accent"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Farmer bookings */}
      {role === "farmer" && bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent bookings</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-semibold">
                    {typeof b.facility === "object"
                      ? b.facility.name
                      : "Facility"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {b.quantityKg} kg • {b.totalDays} days •{" "}
                    {formatNaira(b.totalCost)}
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Operator bookings */}
      {role === "storage_operator" && (
        <Card>
          <CardHeader>
            <CardTitle>Incoming bookings</CardTitle>
          </CardHeader>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-semibold">
                      {b.farmer?.name || "Farmer"} —{" "}
                      {typeof b.facility === "object"
                        ? b.facility.name
                        : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {b.quantityKg} kg • {formatNaira(b.totalCost)} •{" "}
                      {formatDate(b.startDate)}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !stats && role !== "farmer" && role !== "storage_operator" && (
        <Card className="p-8 text-center">
          <Sprout className="w-12 h-12 text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">
            Dashboard data will appear once farmers and campaigns are active.
          </p>
        </Card>
      )}
    </div>
  );
}
