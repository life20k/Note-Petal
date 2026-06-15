"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
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

      </div>
    </DashboardLayout>
  );
}
