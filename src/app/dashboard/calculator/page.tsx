"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Flower2,
  Package,
  LayoutGrid,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  DollarSign,
} from "lucide-react";

const calculatorSections = [
  {
    title: "Ingredients Library",
    description: "Add and manage flowers, supplies, and materials with bulk pricing",
    icon: Flower2,
    href: "/dashboard/calculator/ingredients",
    color: "bg-pink-50 text-pink-600",
  },
  {
    title: "Arrangements",
    description: "Create bouquets, baskets, and custom arrangements with templates",
    icon: LayoutGrid,
    href: "/dashboard/calculator/arrangements",
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Log Sales",
    description: "Record sales of arrangements to track revenue and profit",
    icon: DollarSign,
    href: "/dashboard/calculator/sales",
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Bulk Purchases",
    description: "Log bulk purchases and track your supply costs over time",
    icon: ShoppingCart,
    href: "/dashboard/calculator/bulk",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Profit Dashboard",
    description: "View revenue, costs, margins, and profitability trends",
    icon: TrendingUp,
    href: "/dashboard/calculator/profit",
    color: "bg-green-50 text-green-600",
  },
];

export default function CalculatorPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Profit Calculator
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your ingredients, build arrangements, and track profitability.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {calculatorSections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${section.color}`}
                    >
                      <section.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {section.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-300 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickCalculator />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function QuickCalculator() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Quickly calculate the cost and suggested price for an arrangement.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total Ingredient Cost
          </label>
          <input
            type="number"
            id="cost"
            step="0.01"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Desired Margin %
          </label>
          <input
            type="number"
            id="margin"
            defaultValue={50}
            step="1"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Suggested Price
          </label>
          <div className="mt-1 block w-full rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
            $0.00
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Enter your ingredient costs and desired margin to see the suggested
        retail price.
      </p>
    </div>
  );
}
