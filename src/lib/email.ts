import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await resend.emails.send({
      from: "Note Petal <notifications@notepetal.com>",
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

export function reminderEmailTemplate(
  floristName: string,
  eventName: string,
  eventDate: string,
  contactEmail: string | null,
  contactPhone: string | null,
  websiteUrl: string
): string {
  const contactSection = `
    <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0 0 8px 0;font-weight:bold;color:#374151;">Want to start the conversation? Reach out anytime:</p>
      ${contactPhone ? `<p style="margin:4px 0;color:#555;">📞 ${contactPhone}</p>` : ""}
      ${contactEmail ? `<p style="margin:4px 0;color:#555;">📧 ${contactEmail}</p>` : ""}
      <p style="margin:4px 0;color:#555;">🌐 <a href="${websiteUrl}" style="color:#7C3AED;">${websiteUrl}</a></p>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head><style>body{font-family:Arial,sans-serif;padding:20px;}h1{color:#7C3AED;}.card{background:#F3E8FF;padding:20px;border-radius:8px;margin:20px 0;}</style></head>
    <body>
      <h1>🌸 Upcoming Event Reminder</h1>
      <div class="card">
        <p>Your event with <strong>${floristName}</strong> is coming up soon:</p>
        <h2>${eventName}</h2>
        <p>Date: <strong>${eventDate}</strong></p>
      </div>
      ${contactSection}
      <p style="color:#666;">Your florist will also be reaching out shortly to help you prepare the perfect arrangement.</p>
      <p>— Note Petal</p>
    </body>
    </html>
  `;
}

export function floristReminderEmailTemplate(
  customerName: string,
  eventName: string,
  eventDate: string,
  eventNotes: string | null,
  dashboardUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><style>body{font-family:Arial,sans-serif;padding:20px;}h1{color:#7C3AED;}.card{background:#F3E8FF;padding:20px;border-radius:8px;margin:20px 0;}.btn{display:inline-block;background:#7C3AED;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;}</style></head>
    <body>
      <h1>🌸 Event Reminder — 2 Weeks Away</h1>
      <div class="card">
        <p>You have an upcoming event to prepare for:</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Event:</strong> ${eventName}</p>
        <p><strong>Date:</strong> ${eventDate}</p>
        ${eventNotes ? `<p><strong>Note:</strong> "${eventNotes}"</p>` : ""}
      </div>
      <a href="${dashboardUrl}" class="btn">View in Dashboard</a>
      <p style="color:#666;">Start preparing your arrangement today!</p>
      <p>— Note Petal</p>
    </body>
    </html>
  `;
}
