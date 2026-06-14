"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, ShoppingCart, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ProfitDashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/calculator/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats ? formatCurrency(stats.totalRevenue) : "—"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Costs
              </CardTitle>
              <ShoppingCart className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats ? formatCurrency(stats.totalCost) : "—"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Net Profit
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  stats?.totalProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats ? formatCurrency(stats.totalProfit) : "—"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Margin
              </CardTitle>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats ? `${stats.avgMargin}%` : "—"}
              </div>
              <p className="text-xs text-gray-500">
                {stats?.totalSales || 0} total sales
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.monthlyData?.length > 0 ? (
                <div className="space-y-3">
                  {stats.monthlyData.map((month: any) => (
                    <div
                      key={month.month}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {month.month}
                        </p>
                        <p className="text-xs text-gray-500">
                          Revenue: {formatCurrency(month.revenue)} | Costs:{" "}
                          {formatCurrency(month.cost)}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          month.profit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(month.profit)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No sales data yet. Start logging sales to see trends.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Arrangements</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.topArrangements?.length > 0 ? (
                <div className="space-y-3">
                  {stats.topArrangements.map((arr: any, i: number) => (
                    <div
                      key={arr.name}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {arr.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {arr.count} sold
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(arr.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No arrangement sales data yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
