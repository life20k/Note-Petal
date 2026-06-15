"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  X,
  CreditCard,
  ExternalLink,
  Loader2,
  Sparkles,
  MessageSquare,
  Calendar,
  Calculator,
  Palette,
  Globe,
  Mail,
  Smartphone,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    features: [
      { text: "10 notes per month", included: true },
      { text: "3 event reminders", included: true },
      { text: "Basic branding", included: true },
      { text: "Email support", included: true },
      { text: "Unlimited notes", included: false },
      { text: "Profit calculator", included: false },
      { text: "AI message generation", included: false },
      { text: "Custom domain", included: false },
      { text: "Email + SMS messaging", included: false },
      { text: "White-label", included: false },
      { text: "API access", included: false },
      { text: "Staff accounts", included: false },
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 29,
    features: [
      { text: "Unlimited notes", included: true },
      { text: "Unlimited event reminders", included: true },
      { text: "Custom branding", included: true },
      { text: "Priority support", included: true },
      { text: "Profit calculator", included: true },
      { text: "AI message generation", included: true },
      { text: "Custom domain", included: true },
      { text: "Email + SMS messaging", included: true },
      { text: "White-label", included: false },
      { text: "API access", included: false },
      { text: "Staff accounts", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 79,
    features: [
      { text: "Everything in Business", included: true },
      { text: "White-label", included: true },
      { text: "API access", included: true },
      { text: "Staff accounts", included: true },
      { text: "Dedicated support", included: true },
      { text: "Custom integrations", included: true },
    ],
  },
];

function getPlanIndex(id: string) {
  return plans.findIndex((p) => p.id === id);
}

export default function BillingPage() {
  return (
    <Suspense fallback={<DashboardLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-purple-600" /></div></DashboardLayout>}>
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const searchParams = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState<string>("starter");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [isDev, setIsDev] = useState(false);

  const fetchPlan = () => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.tenant?.plan) setCurrentPlan(data.tenant.plan);
        if (data.tenant?.trialEndsAt) setTrialEndsAt(data.tenant.trialEndsAt);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchPlan();
    fetch("/api/billing/dev-switch", { method: "POST", body: JSON.stringify({ plan: "__probe__" }) })
      .then((r) => r.json())
      .then((data) => setIsDev(data.success === false && data.error === "Invalid plan"))
      .catch(() => setIsDev(false));
  }, []);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription updated successfully!");
      fetchPlan();
    }
    if (searchParams.get("canceled") === "true") {
      toast.error("Checkout was canceled.");
    }
  }, [searchParams]);

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to create checkout session");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to open billing portal");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleDevSwitch = async (planId: string) => {
    setSwitching(true);
    try {
      const res = await fetch("/api/billing/dev-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPlan(planId);
        toast.success(`Switched to ${planId} plan`);
      } else {
        toast.error(data.error || "Failed to switch plan");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSwitching(false);
    }
  };

  const handlePlanAction = (planId: string) => {
    if (isDev) {
      handleDevSwitch(planId);
    } else {
      handleUpgrade(planId);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  You are currently on the{" "}
                  <strong className="capitalize">{currentPlan}</strong> plan.
                </p>
                {trialEndsAt && currentPlan !== "starter" && !switching && (
                  <p className="mt-1 text-xs text-amber-600">
                    {(() => {
                      const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      return daysLeft > 0
                        ? `Trial ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""} (${new Date(trialEndsAt).toLocaleDateString()})`
                        : "Trial expired";
                    })()}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Upgrade to unlock premium features like the profit calculator,
                  unlimited notes, and AI messaging.
                </p>
              </div>
              {currentPlan !== "starter" && (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {portalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Manage Subscription
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {isDev && (
          <Card className="border-dashed border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 text-sm">
                <span className="text-amber-500">&#9889;</span>
                Dev Mode — Preview Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-amber-600 mb-3">
                Switch plans instantly to preview features.
              </p>
              <div className="flex gap-2">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleDevSwitch(plan.id)}
                    disabled={switching || currentPlan === plan.id}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      currentPlan === plan.id
                        ? "bg-amber-600 text-white"
                        : "bg-white border border-amber-300 text-amber-700 hover:bg-amber-100"
                    } disabled:opacity-50`}
                  >
                    {currentPlan === plan.id ? `Current: ${plan.name}` : plan.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Compare Plans
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  currentPlan === plan.id
                    ? "border-2 border-purple-600 shadow-lg"
                    : ""
                }`}
              >
                {currentPlan === plan.id && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white">
                    Current Plan
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle className="text-center">{plan.name}</CardTitle>
                  <div className="text-center text-3xl font-bold text-gray-900">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-500">
                      /mo
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.text}
                        className="flex items-center gap-2 text-sm"
                      >
                        {feature.included ? (
                          <Check className="h-4 w-4 flex-shrink-0 text-purple-600" />
                        ) : (
                          <X className="h-4 w-4 flex-shrink-0 text-gray-300" />
                        )}
                        <span
                          className={
                            feature.included ? "text-gray-700" : "text-gray-400"
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {currentPlan !== plan.id && (
                    <button
                      onClick={() => handlePlanAction(plan.id)}
                      disabled={loading || switching}
                      className="mt-6 w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50"
                      style={{
                        backgroundColor:
                          getPlanIndex(plan.id) < getPlanIndex(currentPlan)
                            ? "#6B7280"
                            : "#7C3AED",
                      }}
                    >
                      {loading || switching ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : getPlanIndex(plan.id) < getPlanIndex(currentPlan) ? (
                        `Downgrade to ${plan.name}`
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </button>
                  )}
                  {currentPlan === plan.id && currentPlan !== "starter" && (
                    <button
                      onClick={handlePortal}
                      disabled={portalLoading}
                      className="mt-6 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {portalLoading ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : (
                        "Manage Subscription"
                      )}
                    </button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">What you get with each plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Notes</p>
                  <p className="text-xs text-gray-500">10/mo → Unlimited</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Reminders</p>
                  <p className="text-xs text-gray-500">3 → Unlimited</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">AI Messages</p>
                  <p className="text-xs text-gray-500">5/mo → Unlimited</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calculator className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Calculator</p>
                  <p className="text-xs text-gray-500">Starter → Full</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email/SMS</p>
                  <p className="text-xs text-gray-500">Business+</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Custom Domain</p>
                  <p className="text-xs text-gray-500">Business+</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Palette className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Branding</p>
                  <p className="text-xs text-gray-500">Basic → White-label</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Staff</p>
                  <p className="text-xs text-gray-500">Enterprise</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
