"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn, ROLES } from "@/lib/utils";
import {
  LayoutDashboard,
  Megaphone,
  Warehouse,
  ShoppingBasket,
  BarChart3,
  Users,
  UserCircle,
  CalendarCheck,
  LogOut,
  Sprout,
} from "lucide-react";

const navByRole: Record<string, { href: string; label: string; icon: typeof LayoutDashboard }[]> = {
  farmer: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/storage", label: "Book Storage", icon: Warehouse },
    { href: "/dashboard/bookings", label: "My Bookings", icon: CalendarCheck },
    { href: "/dashboard/market", label: "Market", icon: ShoppingBasket },
    { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
  ],
  extension_officer: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
  ],
  storage_operator: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/storage", label: "Facilities", icon: Warehouse },
    { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
  ],
  admin: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/dashboard/storage", label: "Storage", icon: Warehouse },
    { href: "/dashboard/market", label: "Market", icon: ShoppingBasket },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
  ],
  super_admin: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/dashboard/storage", label: "Storage", icon: Warehouse },
    { href: "/dashboard/market", label: "Market", icon: ShoppingBasket },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
  ],
};

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const role = user?.role || "farmer";
  const links = navByRole[role] || navByRole.farmer;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card flex flex-col">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Sprout className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <span className="font-display text-lg font-extrabold tracking-tight">
            FarmerReach<span className="text-primary">NG</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="mb-3 px-1">
          <p className="text-sm font-bold truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground">
            {ROLES[role as keyof typeof ROLES] || role}
          </p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
