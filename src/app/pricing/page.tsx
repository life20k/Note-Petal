"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Check, Flower2 } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: 0,
    description: "Perfect for trying out Note Petal",
    features: [
      "10 notes per month",
      "3 event reminders",
      "Basic branding",
      "Email support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Business",
    price: 29,
    description: "For growing florist businesses",
    features: [
      "Unlimited notes",
      "Unlimited event reminders",
      "Custom domain",
      "Email + SMS messaging",
      "Profit calculator",
      "Ingredient library",
      "Arrangement templates",
      "Profit dashboard",
    ],
    cta: "Start 14-Day Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 79,
    description: "For multi-location florist operations",
    features: [
      "Everything in Business",
      "White-label branding",
      "API access",
      "Multiple staff accounts",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 bg-white p-8 shadow-sm ${
                plan.popular
                  ? "border-purple-600 shadow-lg"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="text-center">
                <Flower2
                  className={`mx-auto h-10 w-10 ${
                    plan.popular ? "text-purple-600" : "text-gray-400"
                  }`}
                />
                <h3 className="mt-4 text-xl font-bold text-gray-900">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {plan.description}
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href="/signup"
                  className={`block w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
