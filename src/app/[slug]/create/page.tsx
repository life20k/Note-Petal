"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Flower2,
  MessageSquareHeart,
  CalendarClock,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Heart,
  Smile,
  PartyPopper,
  Sun,
  Gift,
  HandHeart,
  Feather,
  Laugh,
  Briefcase,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { messageBank } from "@/lib/messages";

const categories = [
  { id: "birthday", label: "Birthday", icon: PartyPopper, color: "#F59E0B" },
  { id: "anniversary", label: "Anniversary", icon: Heart, color: "#EC4899" },
  { id: "get-well", label: "Get Well", icon: Smile, color: "#10B981" },
  { id: "sympathy", label: "Sympathy", icon: HandHeart, color: "#6366F1" },
  { id: "thank-you", label: "Thank You", icon: Sun, color: "#F97316" },
  { id: "just-because", label: "Just Because", icon: Gift, color: "#8B5CF6" },
  { id: "congratulations", label: "Congratulations", icon: PartyPopper, color: "#14B8A6" },
  { id: "love", label: "Love", icon: Heart, color: "#E11D48" },
  { id: "thinking-of-you", label: "Thinking of You", icon: Smile, color: "#0EA5E9" },
];

const styles = [
  { id: "heartfelt", label: "Heartfelt", description: "Sincere and emotional", icon: Heart, color: "#E11D48" },
  { id: "friendly", label: "Friendly", description: "Warm and cheerful", icon: Smile, color: "#10B981" },
  { id: "funny", label: "Funny", description: "Lighthearted and playful", icon: Laugh, color: "#F59E0B" },
  { id: "formal", label: "Formal", description: "Elegant and proper", icon: Briefcase, color: "#6366F1" },
];

const eventTypes = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Funeral",
  "Holiday",
  "Valentine's Day",
  "Mother's Day",
  "Father's Day",
  "Other",
];

function getThreeRandom(category: string, style: string): string[] {
  const pool = messageBank[category]?.[style] || messageBank["just-because"]["heartfelt"];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export default function CreatePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tenant, setTenant] = useState<any>(null);
  const [step, setStep] = useState<"category" | "messages" | "details" | "events" | "done">("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [events, setEvents] = useState<
    { eventName: string; eventDate: string; eventType: string }[]
  >([]);

  const [submitting, setSubmitting] = useState(false);
  const [regenerated, setRegenerated] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiUsage, setAiUsage] = useState<{ count: number; limit: number | null } | null>(null);
  const [aiAvailable, setAiAvailable] = useState(false);

  useEffect(() => {
    fetch(`/${slug}/api/tenant`)
      .then((r) => r.json())
      .then((data) => {
        setTenant(data);
        if (data.plan === "business" || data.plan === "enterprise") {
          setAiAvailable(true);
        }
      })
      .catch(() => {});
  }, [slug]);

  const goToMessages = useCallback(() => {
    if (!selectedCategory || !selectedStyle) return;
    setMessages(getThreeRandom(selectedCategory, selectedStyle));
    setRegenerated(false);
    setSelectedMessage(null);
    setCustomMessage("");
    setStep("messages");
  }, [selectedCategory, selectedStyle]);

  const generateWithAI = useCallback(async () => {
    if (!selectedCategory || !selectedStyle || !tenant?.id) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          category: selectedCategory,
          style: selectedStyle,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || data.error || "AI generation failed");
        return;
      }
      setMessages(data.messages);
      setAiUsage(data.usage);
      setRegenerated(false);
      setSelectedMessage(null);
      setCustomMessage("");
      toast.success("AI messages generated!");
    } catch {
      toast.error("AI generation failed. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  }, [selectedCategory, selectedStyle, tenant]);

  const regenerate = useCallback(() => {
    if (!selectedCategory || !selectedStyle) return;
    setMessages(getThreeRandom(selectedCategory, selectedStyle));
    setRegenerated(true);
    setSelectedMessage(null);
    setCustomMessage("");
  }, [selectedCategory, selectedStyle]);

  const pickMessage = (msg: string) => {
    setSelectedMessage(msg);
    setCustomMessage(msg);
    const cat = categories.find((c) => c.id === selectedCategory);
    setOccasion(cat?.label || "General");
    setStep("details");
  };

  const addEvent = () => {
    setEvents([
      ...events,
      { eventName: "", eventDate: "", eventType: "Birthday" },
    ]);
  };

  const updateEvent = (index: number, field: string, value: string) => {
    const updated = [...events];
    (updated[index] as any)[field] = value;
    setEvents(updated);
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const noteRes = await fetch("/api/public/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          messageText: customMessage,
          occasion,
          recipientName,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });

      if (!noteRes.ok) throw new Error("Failed to save note");

      for (const event of events) {
        if (event.eventName && event.eventDate) {
          await fetch("/api/public/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantSlug: slug,
              eventName: event.eventName,
              eventDate: event.eventDate,
              eventType: event.eventType,
              customerName,
              customerEmail,
              customerPhone,
            }),
          });
        }
      }

      setStep("done");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!tenant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Flower2 className="mx-auto h-10 w-10 animate-pulse text-purple-600" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const brandColor = tenant.primaryColor || "#7C3AED";
  const brandSecondary = tenant.secondaryColor || "#F3E8FF";

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        ["--brand-primary" as string]: brandColor,
        ["--brand-secondary" as string]: brandSecondary,
      }}
    >
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href={`/${slug}`} className="flex items-center gap-2">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} alt={tenant.businessName} className="h-8 w-auto rounded" />
            ) : (
              <Flower2 className="h-6 w-6" style={{ color: brandColor }} />
            )}
            <span className="font-semibold text-gray-900">{tenant.businessName}</span>
          </Link>
          <div className="flex items-center gap-1.5">
            {["category", "messages", "details", "events"].map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    backgroundColor: brandColor,
                    opacity:
                      (step === "category" && i === 0) ||
                      (step === "messages" && i <= 1) ||
                      (step === "details" && i <= 2) ||
                      (step === "events" || step === "done")
                        ? 1
                        : 0.3,
                  }}
                >
                  {i + 1}
                </div>
                {i < 3 && <div className="h-px w-3 bg-gray-300" />}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Step 1: Category + Style Selection */}
        {step === "category" && (
          <div>
            <div className="text-center">
              <MessageSquareHeart className="mx-auto h-12 w-12" style={{ color: brandColor }} />
              <h1 className="mt-4 text-3xl font-bold text-gray-900">
                What&apos;s the occasion?
              </h1>
              <p className="mt-2 text-gray-600">
                Pick a category and style, and we&apos;ll create the perfect message.
              </p>
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold text-gray-700 mb-3">Category</p>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`group flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all hover:shadow-md ${
                      selectedCategory === cat.id
                        ? "border-gray-900 bg-gray-50 shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                      style={{ backgroundColor: cat.color + "15" }}
                    >
                      <cat.icon className="h-6 w-6" style={{ color: cat.color }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold text-gray-700 mb-3">Style</p>
              <div className="grid grid-cols-2 gap-3">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all hover:shadow-md ${
                      selectedStyle === s.id
                        ? "border-gray-900 bg-gray-50 shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: s.color + "15" }}
                    >
                      <s.icon className="h-5 w-5" style={{ color: s.color }} />
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-700">{s.label}</span>
                      <span className="text-xs text-gray-400">{s.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={goToMessages}
              disabled={!selectedCategory || !selectedStyle}
              className="mt-8 w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: brandColor }}
            >
              Generate Messages
              <ArrowRight className="ml-2 inline h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Message Selection */}
        {step === "messages" && (
          <div>
            <button
              onClick={() => setStep("category")}
              className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Pick a message
              </h1>
              <p className="mt-2 text-gray-600">
                Choose one of these three suggestions for your{" "}
                <span className="font-medium" style={{ color: brandColor }}>
                  {categories.find((c) => c.id === selectedCategory)?.label}
                </span>{" "}
                note in a{" "}
                <span className="font-medium capitalize" style={{ color: brandColor }}>
                  {selectedStyle}
                </span>{" "}
                style.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {messages.map((msg, i) => (
                <button
                  key={`${selectedCategory}-${i}-${msg.slice(0, 20)}`}
                  onClick={() => pickMessage(msg)}
                  className="w-full rounded-2xl border-2 border-gray-200 p-5 text-left transition-all hover:border-gray-400 hover:shadow-md group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      {i + 1}
                    </div>
                    <p className="flex-1 text-sm leading-relaxed text-gray-700 group-hover:text-gray-900">
                      {msg}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {!regenerated ? (
                <button
                  onClick={regenerate}
                  disabled={aiGenerating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3.5 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate 3 new messages
                </button>
              ) : (
                <p className="text-center text-xs text-gray-400">
                  You&apos;ve used your one regeneration. Pick a message above or try AI.
                </p>
              )}

              {aiAvailable && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-gray-400">or</span>
                    </div>
                  </div>
                  <button
                    onClick={generateWithAI}
                    disabled={aiGenerating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-purple-200 bg-purple-50 py-3.5 text-sm font-medium text-purple-700 transition-colors hover:border-purple-300 hover:bg-purple-100 disabled:opacity-50"
                  >
                    {aiGenerating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-300 border-t-purple-700" />
                        AI is writing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate with AI
                      </>
                    )}
                  </button>
                  {aiUsage && aiUsage.limit && (
                    <p className="text-center text-xs text-gray-400">
                      {aiUsage.count}/{aiUsage.limit} free AI generations this month
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === "details" && (
          <div>
            <button
              onClick={() => { setStep("messages"); setSelectedMessage(null); setCustomMessage(""); }}
              className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to messages
            </button>

            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Personalize your note
              </h1>
              <p className="mt-2 text-gray-600">
                Edit the message and add details below.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Message
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm leading-relaxed focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  rows={4}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Feel free to edit this message to make it your own.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Recipient&apos;s Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Who is this for?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Occasion
                  </label>
                  <input
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <hr className="border-gray-200" />

              <p className="text-sm font-medium text-gray-700">
                Your contact info{" "}
                <span className="text-gray-400 font-normal">(so we can follow up)</span>
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={() => setStep("events")}
                className="w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
                style={{ backgroundColor: brandColor }}
              >
                Continue
                <ArrowRight className="ml-2 inline h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Events */}
        {step === "events" && (
          <div>
            <button
              onClick={() => setStep("details")}
              className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="text-center">
              <CalendarClock className="mx-auto h-12 w-12" style={{ color: brandColor }} />
              <div className="mt-4 flex items-center justify-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  Upcoming occasions
                </h1>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: brandSecondary, color: brandColor }}
                >
                  Optional
                </span>
              </div>
              <p className="mt-2 text-gray-600">
                Add any special dates coming up. We&apos;ll remind you 2
                weeks before each one.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {events.map((event, i) => (
                <div key={i} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="Event name (e.g., Mom's Birthday)"
                        value={event.eventName}
                        onChange={(e) => updateEvent(i, "eventName", e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={event.eventDate}
                          onChange={(e) => updateEvent(i, "eventDate", e.target.value)}
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <select
                          value={event.eventType}
                          onChange={(e) => updateEvent(i, "eventType", e.target.value)}
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          {eventTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => removeEvent(i)}
                      className="ml-3 mt-1 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={addEvent}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
              >
                <Plus className="h-4 w-4" />
                Add another occasion
              </button>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 rounded-xl border border-gray-300 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Skip for now"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 rounded-xl py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
                  style={{ backgroundColor: brandColor }}
                >
                  {submitting ? "Sending..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className="text-center py-12">
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: brandSecondary }}
            >
              <Check className="h-10 w-10" style={{ color: brandColor }} />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Thank you!</h1>
            <p className="mt-3 text-lg text-gray-600 max-w-md mx-auto">
              Your note has been sent to <strong>{tenant.businessName}</strong>.
              {events.length > 0 && (
                <>
                  {" "}We&apos;ll remind you about {events.length} upcoming{" "}
                  {events.length === 1 ? "occasion" : "occasions"}.
                </>
              )}
            </p>
            <div className="mt-8 rounded-2xl border border-gray-200 p-6 max-w-md mx-auto text-left">
              <p className="text-sm font-medium text-gray-500">Your note to</p>
              <p className="text-lg font-semibold text-gray-900">{recipientName}</p>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                &ldquo;{customMessage}&rdquo;
              </p>
              {occasion && (
                <span
                  className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: brandSecondary, color: brandColor }}
                >
                  {occasion}
                </span>
              )}
            </div>
            <Link
              href={`/${slug}`}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: brandColor }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {tenant.businessName}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
