"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/customers": "Customers",
  "/dashboard/events": "Events",
  "/dashboard/messages": "Messages",
  "/dashboard/calculator": "Profit Calculator",
  "/dashboard/calculator/ingredients": "Ingredients",
  "/dashboard/calculator/arrangements": "Arrangements",
  "/dashboard/calculator/bulk": "Bulk Purchases",
  "/dashboard/calculator/profit": "Profit Dashboard",
  "/dashboard/settings": "Settings",
  "/dashboard/billing": "Billing",
};

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const title = pageTitles[pathname] || "Dashboard";

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-sm font-medium text-purple-600">
              {session?.user?.name?.charAt(0) || "F"}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-500">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
