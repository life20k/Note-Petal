import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia" as any,
  typescript: true,
});

export const PLANS = {
  starter: {
    name: "Starter",
    price: 0,
    notesLimit: 10,
    eventsLimit: 3,
    features: [
      "10 notes per month",
      "3 event reminders",
      "Basic branding",
      "Email support",
    ],
  },
  business: {
    name: "Business",
    price: 29,
    stripePriceId: process.env.STRIPE_PRICE_BUSINESS,
    notesLimit: -1,
    eventsLimit: -1,
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
  },
  enterprise: {
    name: "Enterprise",
    price: 79,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE,
    notesLimit: -1,
    eventsLimit: -1,
    features: [
      "Everything in Business",
      "White-label",
      "API access",
      "Staff accounts",
      "Priority support",
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;
