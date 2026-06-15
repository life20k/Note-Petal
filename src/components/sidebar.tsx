"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Calculator,
  Settings,
  CreditCard,
  MessageSquare,
  LogOut,
  Flower2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, plan: "starter" },
  { href: "/dashboard/customers", label: "Customers", icon: Users, plan: "starter" },
  { href: "/dashboard/events", label: "Events", icon: Calendar, plan: "starter" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, plan: "business" },
  { href: "/dashboard/calculator", label: "Calculator", icon: Calculator, plan: "business" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, plan: "starter" },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard, plan: "starter" },
];

const PLAN_HIERARCHY: Record<string, number> = {
  starter: 0,
  business: 1,
  enterprise: 2,
};

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("starter");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.tenant?.plan) setCurrentPlan(data.tenant.plan);
      })
      .catch(() => {});
  }, []);

  const userLevel = PLAN_HIERARCHY[currentPlan] ?? 0;
  const navItems = allNavItems.filter((item) => {
    const requiredLevel = PLAN_HIERARCHY[item.plan] ?? 0;
    return userLevel >= requiredLevel;
  });

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-gray-200 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center gap-2 border-b border-gray-200 p-4">
        <Flower2 className="h-6 w-6 text-purple-600 flex-shrink-0" />
        {!collapsed && (
          <span className="text-lg font-bold text-gray-900">Note Petal</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-2">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="border-t border-gray-200 p-2 text-gray-400 hover:text-gray-600"
      >
        {collapsed ? (
          <ChevronRight className="mx-auto h-4 w-4" />
        ) : (
          <ChevronLeft className="mx-auto h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
