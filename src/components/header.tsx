"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Bell, Search, Calendar, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";

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
  const [events, setEvents] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const title = pageTitles[pathname] || "Dashboard";

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const now = new Date();
          const upcoming = data
            .filter((e: any) => new Date(e.eventDate) >= now)
            .sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
            .slice(0, 5);
          setEvents(upcoming);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <Bell className="h-5 w-5" />
            {events.length > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">Upcoming Events</p>
                <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {events.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <Calendar className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">No upcoming events</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {events.map((event) => (
                    <div key={event.id} className="border-b border-gray-50 px-4 py-3 last:border-0 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">{event.eventName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.eventDate).toLocaleDateString()} — {event.customerName || "No customer"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {events.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-2">
                  <a href="/dashboard/events" className="text-xs font-medium text-purple-600 hover:text-purple-700">
                    View all events →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

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
