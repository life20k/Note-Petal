"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { MessageSquare, Send, Mail, Smartphone } from "lucide-react";
import toast from "react-hot-toast";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [form, setForm] = useState({
    type: "email",
    recipientEmail: "",
    recipientPhone: "",
    subject: "",
    content: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/messages").then((r) => r.json()).then(setMessages);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Message sent!");
        fetch("/api/messages").then((r) => r.json()).then(setMessages);
        setForm({
          type: "email",
          recipientEmail: "",
          recipientPhone: "",
          subject: "",
          content: "",
        });
      } else {
        toast.error("Failed to send message");
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Send Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "email" })}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                    form.type === "email"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "sms" })}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                    form.type === "sms"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  SMS
                </button>
              </div>

              {form.type === "email" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.recipientEmail}
                    onChange={(e) =>
                      setForm({ ...form, recipientEmail: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Recipient Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.recipientPhone}
                    onChange={(e) =>
                      setForm({ ...form, recipientPhone: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              )}

              {form.type === "email" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  required
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">No messages sent yet</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {msg.type === "email" ? (
                          <Mail className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Smartphone className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {msg.type === "email" ? msg.toEmail : msg.toPhone}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(msg.sentAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
