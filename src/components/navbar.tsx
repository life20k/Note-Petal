"use client";

import { Flower2, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Flower2 className="h-8 w-8 text-purple-600" />
          <span className="text-xl font-bold text-gray-900">Note Petal</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-200 px-4 pb-4 md:hidden">
          <Link href="/pricing" className="block py-2 text-sm font-medium text-gray-600">
            Pricing
          </Link>
          <Link href="/login" className="block py-2 text-sm font-medium text-gray-600">
            Login
          </Link>
          <Link
            href="/signup"
            className="mt-2 block rounded-lg bg-purple-600 px-4 py-2 text-center text-sm font-medium text-white"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
