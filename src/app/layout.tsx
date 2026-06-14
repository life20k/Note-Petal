import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Note Petal - Help Florists Help Their Customers",
  description:
    "A SaaS platform that helps florists help their customers send the perfect message with flowers. Note templates, event reminders, profit calculators, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
