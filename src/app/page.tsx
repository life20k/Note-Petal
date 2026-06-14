"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  Flower2,
  MessageSquareHeart,
  CalendarClock,
  Calculator,
  Palette,
  ArrowRight,
  Star,
  Check,
  Mail,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: MessageSquareHeart,
    title: "Note Templates",
    description:
      "Help your customers find the right words with beautiful pre-written note templates they can customize.",
  },
  {
    icon: CalendarClock,
    title: "Event Reminders",
    description:
      "Automatically remind customers 2 weeks before birthdays, anniversaries, and special occasions.",
  },
  {
    icon: Calculator,
    title: "Profit Calculator",
    description:
      "Break down bulk purchases into individual arrangements with smart pricing and margin tracking.",
  },
  {
    icon: Palette,
    title: "Custom Branding",
    description:
      "Brand the entire experience with your logo, colors, and business information.",
  },
  {
    icon: Mail,
    title: "Email Messaging",
    description:
      "Send messages and reminders directly to customers via email.",
  },
  {
    icon: Smartphone,
    title: "SMS Notifications",
    description:
      "Reach customers instantly with text message reminders and updates.",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    business: "Petal Perfect Florist",
    quote:
      "Note Petal transformed how I interact with my customers. They love the note templates!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    business: "Bloom & Branch",
    quote:
      "The profit calculator alone paid for itself in the first month. Game changer for pricing.",
    rating: 5,
  },
  {
    name: "Maria Garcia",
    business: "Garden of Grace",
    quote:
      "My customers never forget an occasion now. The reminders have increased my repeat business by 40%.",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
              Help your customers
              <br />
              <span className="gradient-text">say it with flowers</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              A complete SaaS platform for florists. Give your customers
              beautiful note templates, automatic event reminders, and smart
              profit tools. All branded to your business.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-purple-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-purple-700 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="ml-2 inline h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            Simple for your customers, powerful for your business
          </p>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-2xl font-bold text-purple-600">
                1
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Customer visits your page
              </h3>
              <p className="mt-2 text-gray-600">
                Share your branded Note Petal link with customers. They see
                your business name, logo, and colors.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-2xl font-bold text-purple-600">
                2
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                They pick a note & add events
              </h3>
              <p className="mt-2 text-gray-600">
                Choose from 3 beautiful templates, customize the message, and
                add upcoming occasions like birthdays and anniversaries.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-2xl font-bold text-purple-600">
                3
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                You manage it all
              </h3>
              <p className="mt-2 text-gray-600">
                See every note, print cards, message customers, and get
                automatic reminders 2 weeks before events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Everything your florist business needs
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-10 w-10 text-purple-600" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Loved by florists
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="mt-4 text-gray-600 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4">
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.business}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl gradient-bg p-12 text-white">
            <Flower2 className="mx-auto h-12 w-12" />
            <h2 className="mt-6 text-3xl font-bold">
              Ready to grow your flower business?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-purple-100">
              Start free today. No credit card required. Upgrade anytime.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-base font-semibold text-purple-600 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Flower2 className="h-6 w-6 text-purple-600" />
              <span className="text-lg font-bold text-gray-900">
                Note Petal
              </span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Note Petal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
