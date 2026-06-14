const TEXTBELT_API = process.env.TEXTBELT_API_URL || "https://textbelt.com/text";
const TEXTBELT_KEY = process.env.TEXTBELT_API_KEY || "textbelt";

export async function sendSMS({
  to,
  body,
}: {
  to: string;
  body: string;
}) {
  try {
    const res = await fetch(TEXTBELT_API, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        number: to,
        message: body,
        key: TEXTBELT_KEY,
      }).toString(),
    });

    const data = await res.json();

    if (!data.success) {
      console.error("SMS send error:", data.quotaMessage || data.error || "Unknown error");
      return false;
    }

    return true;
  } catch (error) {
    console.error("SMS send error:", error);
    return false;
  }
}

export function reminderSMSTemplate(
  floristName: string,
  eventName: string,
  eventDate: string,
  contactEmail: string | null,
  contactPhone: string | null,
  websiteUrl: string
): string {
  const contactParts: string[] = [];
  if (contactPhone) contactParts.push(`Call: ${contactPhone}`);
  if (contactEmail) contactParts.push(`Email: ${contactEmail}`);
  const contactStr = contactParts.length > 0 ? ` Reach out: ${contactParts.join(" | ")}.` : "";

  return `🌸 Your "${eventName}" with ${floristName} is on ${eventDate}.${contactStr} Visit: ${websiteUrl}. Your florist will also be in touch! — Note Petal`;
}

export function floristReminderSMSTemplate(
  customerName: string,
  eventName: string,
  eventDate: string,
  dashboardUrl: string
): string {
  return `🌸 Note Petal: ${customerName}'s "${eventName}" is on ${eventDate}. Open dashboard to prepare: ${dashboardUrl}`;
}
