"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  MessageSquareHeart,
  Printer,
  Mail,
  Smartphone,
  Check,
  CheckCircle,
  Users,
  Search,
  Calendar,
  FileText,
  ExternalLink,
  Copy,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface Note {
  id: string;
  recipientName: string;
  messageText: string;
  occasion: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  isPrinted: boolean;
  createdAt: string;
}

interface Event {
  id: string;
  eventName: string;
  eventDate: string;
  eventType: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  reminderSent: boolean;
  notes: string | null;
  createdAt: string;
}

interface Customer {
  name: string;
  email: string | null;
  phone: string | null;
  notesCount: number;
  eventsCount: number;
  lastActivity: string;
}

export default function CustomersPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tab, setTab] = useState<"notes" | "events" | "customers">("notes");
  const [search, setSearch] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    fetch("/api/notes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setNotes(d); }).catch(() => {});
    fetch("/api/events").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setEvents(d); }).catch(() => {});
    fetch("/api/dashboard").then((r) => r.json()).then((d) => {
      if (d?.tenant?.slug) setSlug(d.tenant.slug);
    }).catch(() => {});
  }, []);

  const customers: Customer[] = (() => {
    const map = new Map<string, Customer>();

    notes.forEach((n) => {
      const key = n.customerEmail || n.customerName || "Unknown";
      const existing = map.get(key);
      if (existing) {
        existing.notesCount++;
        if (new Date(n.createdAt) > new Date(existing.lastActivity)) {
          existing.lastActivity = n.createdAt;
        }
      } else {
        map.set(key, {
          name: n.customerName || "Unknown",
          email: n.customerEmail,
          phone: n.customerPhone,
          notesCount: 1,
          eventsCount: 0,
          lastActivity: n.createdAt,
        });
      }
    });

    events.forEach((e) => {
      const key = e.customerEmail || e.customerName || "Unknown";
      const existing = map.get(key);
      if (existing) {
        existing.eventsCount++;
        if (new Date(e.createdAt) > new Date(existing.lastActivity)) {
          existing.lastActivity = e.createdAt;
        }
      } else {
        map.set(key, {
          name: e.customerName || "Unknown",
          email: e.customerEmail,
          phone: e.customerPhone,
          notesCount: 0,
          eventsCount: 1,
          lastActivity: e.createdAt,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  })();

  const filteredNotes = notes.filter(
    (n) =>
      n.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      n.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      n.occasion.toLowerCase().includes(search.toLowerCase()) ||
      n.messageText.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEvents = events.filter(
    (e) =>
      e.eventName.toLowerCase().includes(search.toLowerCase()) ||
      e.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      e.eventType.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const unprintedNotes = notes.filter((n) => !n.isPrinted).length;

  const handlePrint = (note: Note) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Flower Card - ${note.recipientName}</title>
        <style>
          body { font-family: Georgia, serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f9f5f0; }
          .card { background: white; padding: 48px; max-width: 500px; width: 100%; box-shadow: 0 2px 20px rgba(0,0,0,0.08); border-radius: 4px; text-align: center; }
          .card h2 { font-size: 14px; color: #999; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 24px 0; }
          .card .message { font-size: 18px; line-height: 1.8; color: #333; margin: 0 0 32px 0; font-style: italic; }
          .card .from { font-size: 14px; color: #666; margin: 0 0 8px 0; }
          .card .occasion { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; }
          .card .divider { width: 60px; height: 1px; background: #ddd; margin: 24px auto; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>For ${note.recipientName}</h2>
          <p class="message">"${note.messageText}"</p>
          <div class="divider"></div>
          ${note.customerName ? `<p class="from">With love, ${note.customerName}</p>` : ""}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleMarkPrinted = async (noteId: string) => {
    await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: noteId, isPrinted: true }),
    });
    setNotes(notes.map((n) => (n.id === noteId ? { ...n, isPrinted: true } : n)));
    toast.success("Marked as printed");
  };

  const handleMarkAllPrinted = async () => {
    const unprinted = notes.filter((n) => !n.isPrinted);
    await Promise.all(
      unprinted.map((n) =>
        fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: n.id, isPrinted: true }),
        })
      )
    );
    setNotes(notes.map((n) => ({ ...n, isPrinted: true })));
    toast.success(`Marked ${unprinted.length} notes as printed`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {slug && (
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Your Customer Site</p>
                  <p className="text-xs text-purple-600">Share this link with customers to collect notes and events</p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="rounded-lg border border-purple-200 bg-white px-3 py-1.5 text-xs text-purple-700">
                    {typeof window !== "undefined" ? window.location.origin : ""}/{slug}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
                      toast.success("Link copied!");
                    }}
                    className="rounded-lg border border-purple-300 bg-white px-2 py-1.5 text-purple-700 hover:bg-purple-100"
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <a
                    href={`/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-purple-300 bg-white px-2 py-1.5 text-purple-700 hover:bg-purple-100"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
            <p className="mt-1 text-sm text-gray-600">
              View notes, events, and your customer database.
            </p>
          </div>
          {tab === "notes" && unprintedNotes > 0 && (
            <button
              onClick={handleMarkAllPrinted}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              <CheckCircle className="h-4 w-4" />
              Mark All Printed ({unprintedNotes})
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes, events, or customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("notes")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "notes"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            Notes ({notes.length})
            {unprintedNotes > 0 && (
              <span className="ml-1 rounded-full bg-white/20 px-1.5 text-xs">
                {unprintedNotes} new
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("events")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "events"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Events ({events.length})
          </button>
          <button
            onClick={() => setTab("customers")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "customers"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Users className="h-4 w-4" />
            Customer DB ({customers.length})
          </button>
        </div>

        {/* Notes Tab */}
        {tab === "notes" && (
          <div className="space-y-3">
            {filteredNotes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquareHeart className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-gray-500">
                    {search ? "No notes match your search" : "No notes yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`transition-all ${
                    note.isPrinted ? "opacity-60" : "border-l-4 border-l-purple-500"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            To: {note.recipientName}
                          </h3>
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                            {note.occasion}
                          </span>
                          {note.isPrinted && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              Printed
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-600 italic">
                          &ldquo;{note.messageText}&rdquo;
                        </p>
                        {note.customerName && (
                          <p className="mt-2 text-xs text-gray-400">
                            From: {note.customerName}
                            {note.customerEmail && ` • ${note.customerEmail}`}
                            {note.customerPhone && ` • ${note.customerPhone}`}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-4">
                        {!note.isPrinted && (
                          <button
                            onClick={() => handleMarkPrinted(note.id)}
                            className="rounded p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                            title="Mark as printed"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handlePrint(note)}
                          className="rounded p-1.5 text-gray-400 hover:bg-purple-50 hover:text-purple-600"
                          title="Print card"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        {note.customerEmail && (
                          <a
                            href={`mailto:${note.customerEmail}?subject=From ${note.recipientName}'s flower card`}
                            className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                            title="Send email"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        {note.customerPhone && (
                          <a
                            href={`sms:${note.customerPhone}`}
                            className="rounded p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                            title="Send SMS"
                          >
                            <Smartphone className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Events Tab */}
        {tab === "events" && (
          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-gray-500">
                    {search ? "No events match your search" : "No events yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {event.eventName}
                          </h3>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {event.eventType}
                          </span>
                          {event.reminderSent && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              Reminder Sent
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          Date: {new Date(event.eventDate).toLocaleDateString()}
                        </p>
                        {event.customerName && (
                          <p className="mt-1 text-xs text-gray-400">
                            Customer: {event.customerName}
                            {event.customerEmail && ` • ${event.customerEmail}`}
                            {event.customerPhone && ` • ${event.customerPhone}`}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {event.customerEmail && (
                          <a
                            href={`mailto:${event.customerEmail}?subject=Upcoming: ${event.eventName}`}
                            className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        {event.customerPhone && (
                          <a
                            href={`sms:${event.customerPhone}`}
                            className="rounded p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <Smartphone className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Customer Database Tab */}
        {tab === "customers" && (
          <div className="space-y-3">
            {filteredCustomers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-gray-500">
                    {search ? "No customers match your search" : "No customers yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredCustomers.map((customer) => (
                <Card key={customer.email || customer.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {customer.name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {customer.email && <span>{customer.email}</span>}
                            {customer.phone && <span>{customer.phone}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {customer.notesCount} notes
                          </p>
                          <p className="text-xs text-gray-500">
                            {customer.eventsCount} events
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {customer.email && (
                            <a
                              href={`mailto:${customer.email}`}
                              className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                          {customer.phone && (
                            <a
                              href={`sms:${customer.phone}`}
                              className="rounded p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                            >
                              <Smartphone className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
