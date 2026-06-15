"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquareHeart,
  Calendar,
  TrendingUp,
  Flower2,
  ArrowRight,
  ExternalLink,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Notes
              </CardTitle>
              <MessageSquareHeart className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.totalNotes ?? "—"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Upcoming Events
              </CardTitle>
              <Calendar className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.upcomingEvents ?? "—"}
              </div>
              <p className="text-xs text-gray-500">
                {stats?.totalEvents ?? 0} total events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ingredients
              </CardTitle>
              <Flower2 className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.totalIngredients ?? "—"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Arrangements
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.totalArrangements ?? "—"}
              </div>
            </CardContent>
          </Card>
        </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Customer Site</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.tenant?.slug ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Share this link with your customers to create notes and events:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                      {typeof window !== "undefined" ? window.location.origin : ""}/{stats.tenant.slug}
                    </code>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/${stats.tenant.slug}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Link copied!");
                      }}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      title="Copy link"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <a
                      href={`/${stats.tenant.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Loading...</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentNotes?.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentNotes.map((note: any) => (
                    <div
                      key={note.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {note.recipientName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {note.occasion} — {note.messageText.slice(0, 50)}...
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No notes yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link
                  href="/dashboard/customers"
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      View Customers
                    </p>
                    <p className="text-xs text-gray-500">
                      See all customer notes and events
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link
                  href="/dashboard/calculator"
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Profit Calculator
                    </p>
                    <p className="text-xs text-gray-500">
                      Calculate margins and track profitability
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Customize Branding
                    </p>
                    <p className="text-xs text-gray-500">
                      Upload logo and set colors
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
