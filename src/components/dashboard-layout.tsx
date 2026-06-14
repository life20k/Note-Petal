"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Toaster } from "react-hot-toast";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
        <Toaster position="top-right" />
      </div>
    </SessionProvider>
  );
}
