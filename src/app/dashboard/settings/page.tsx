"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Palette, Upload, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    welcomeMessage: "",
    primaryColor: "#7C3AED",
    secondaryColor: "#F3E8FF",
    logoUrl: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setForm({
          businessName: data.businessName || "",
          contactEmail: data.contactEmail || "",
          contactPhone: data.contactPhone || "",
          address: data.address || "",
          welcomeMessage: data.welcomeMessage || "",
          primaryColor: data.primaryColor || "#7C3AED",
          secondaryColor: data.secondaryColor || "#F3E8FF",
          logoUrl: data.logoUrl || "",
        });
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Settings saved!");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) =>
                  setForm({ ...form, businessName: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm({ ...form, contactEmail: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) =>
                    setForm({ ...form, contactPhone: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welcome Message
              </label>
              <textarea
                value={form.welcomeMessage}
                onChange={(e) =>
                  setForm({ ...form, welcomeMessage: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                rows={3}
                placeholder="Welcome message for your customers..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Logo URL
              </label>
              <input
                type="url"
                value={form.logoUrl}
                onChange={(e) =>
                  setForm({ ...form, logoUrl: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="https://example.com/logo.png"
              />
              {form.logoUrl && (
                <div className="mt-2">
                  <img
                    src={form.logoUrl}
                    alt="Logo preview"
                    className="h-16 w-auto rounded border border-gray-200"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Primary Color
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) =>
                      setForm({ ...form, primaryColor: e.target.value })
                    }
                    className="h-10 w-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={form.primaryColor}
                    onChange={(e) =>
                      setForm({ ...form, primaryColor: e.target.value })
                    }
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Secondary Color
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) =>
                      setForm({ ...form, secondaryColor: e.target.value })
                    }
                    className="h-10 w-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={form.secondaryColor}
                    onChange={(e) =>
                      setForm({ ...form, secondaryColor: e.target.value })
                    }
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700">
                Preview
              </p>
              <div
                className="mt-2 rounded-lg p-4"
                style={{ backgroundColor: form.secondaryColor }}
              >
                <h3
                  className="text-lg font-bold"
                  style={{ color: form.primaryColor }}
                >
                  {form.businessName || "Your Business Name"}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {form.welcomeMessage || "Welcome message preview"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </DashboardLayout>
  );
}
