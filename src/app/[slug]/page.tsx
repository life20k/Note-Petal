import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Flower2, MessageSquareHeart, CalendarClock, ArrowRight } from "lucide-react";

export default async function CustomerLanding({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  });

  if (!tenant) return notFound();

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        ["--brand-primary" as string]: tenant.primaryColor,
        ["--brand-secondary" as string]: tenant.secondaryColor,
      }}
    >
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.businessName}
                className="h-10 w-auto rounded"
              />
            ) : (
              <Flower2 className="h-8 w-8" style={{ color: tenant.primaryColor }} />
            )}
            <span className="text-xl font-bold text-gray-900">
              {tenant.businessName}
            </span>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundColor: tenant.primaryColor }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <Flower2
              className="mx-auto h-16 w-16"
              style={{ color: tenant.primaryColor }}
            />
            <h1 className="mt-6 text-4xl font-bold text-gray-900 sm:text-5xl">
              {tenant.welcomeMessage || "Help us help you find the perfect words"}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              We know choosing the right message for your flowers can be
              tough. Let us help you say exactly what you mean.
            </p>
            <Link
              href={`/${slug}/create`}
              className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              Create Your Note
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            How it works
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: tenant.secondaryColor }}
              >
                <MessageSquareHeart
                  className="h-7 w-7"
                  style={{ color: tenant.primaryColor }}
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Pick a note
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Choose from our beautiful message templates and personalize it
                for your recipient.
              </p>
            </div>
            <div className="text-center">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: tenant.secondaryColor }}
              >
                <CalendarClock
                  className="h-7 w-7"
                  style={{ color: tenant.primaryColor }}
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Add upcoming events
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Let us know about birthdays, anniversaries, and special
                occasions coming up.
              </p>
            </div>
            <div className="text-center">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: tenant.secondaryColor }}
              >
                <Flower2
                  className="h-7 w-7"
                  style={{ color: tenant.primaryColor }}
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                We handle the rest
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Your florist will use your note to prepare the perfect
                arrangement for every occasion.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div
            className="rounded-3xl p-10 text-white shadow-xl"
            style={{ backgroundColor: tenant.primaryColor }}
          >
            <h2 className="text-2xl font-bold">
              Ready to find the perfect words?
            </h2>
            <p className="mt-2 opacity-90">
              It takes less than a minute. No account needed.
            </p>
            <Link
              href={`/${slug}/create`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold shadow-sm transition-all hover:shadow-md"
              style={{ color: tenant.primaryColor }}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="flex items-center justify-center gap-2">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.businessName}
                className="h-6 w-auto"
              />
            ) : (
              <Flower2 className="h-5 w-5" style={{ color: tenant.primaryColor }} />
            )}
            <span className="font-semibold text-gray-900">
              {tenant.businessName}
            </span>
          </div>
          {tenant.contactEmail && (
            <p className="mt-2 text-sm text-gray-500">
              {tenant.contactEmail}
            </p>
          )}
          {tenant.contactPhone && (
            <p className="text-sm text-gray-500">{tenant.contactPhone}</p>
          )}
          <p className="mt-3 text-xs text-gray-400">
            Powered by Note Petal
          </p>
        </div>
      </footer>
    </div>
  );
}
