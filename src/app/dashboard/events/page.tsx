"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    eventName: "",
    eventDate: "",
    eventType: "birthday",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then(setEvents);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newEvent = await res.json();
      setEvents([...events, newEvent]);
      setShowForm(false);
      setForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        eventName: "",
        eventDate: "",
        eventType: "birthday",
        notes: "",
      });
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    setEvents(events.filter((e) => e.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={form.customerName}
                      onChange={(e) =>
                        setForm({ ...form, customerName: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Event Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.eventName}
                      onChange={(e) =>
                        setForm({ ...form, eventName: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="e.g., Sarah's Birthday"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Event Date
                    </label>
                    <input
                      type="date"
                      required
                      value={form.eventDate}
                      onChange={(e) =>
                        setForm({ ...form, eventDate: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Event Type
                    </label>
                    <select
                      value={form.eventType}
                      onChange={(e) =>
                        setForm({ ...form, eventType: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="birthday">Birthday</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="wedding">Wedding</option>
                      <option value="funeral">Funeral</option>
                      <option value="holiday">Holiday</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) =>
                        setForm({ ...form, customerEmail: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Customer Phone
                    </label>
                    <input
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) =>
                        setForm({ ...form, customerPhone: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    Create Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">No events yet. Add your first event!</p>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => {
              const eventDate = new Date(event.eventDate);
              const daysUntil = Math.ceil(
                (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );

              return (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-14 w-14 flex-col items-center justify-center rounded-lg ${
                            daysUntil <= 14
                              ? "bg-red-50 text-red-600"
                              : "bg-purple-50 text-purple-600"
                          }`}
                        >
                          <span className="text-lg font-bold">
                            {eventDate.getDate()}
                          </span>
                          <span className="-mt-1 text-xs">
                            {eventDate.toLocaleString("default", {
                              month: "short",
                            })}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {event.eventName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                              {event.eventType}
                            </span>
                            <span>
                              {daysUntil > 0
                                ? `In ${daysUntil} days`
                                : "Today"}
                            </span>
                            {event.customerName && (
                              <span>— {event.customerName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
