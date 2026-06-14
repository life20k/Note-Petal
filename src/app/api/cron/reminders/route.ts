import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendEmail,
  reminderEmailTemplate,
  floristReminderEmailTemplate,
} from "@/lib/email";
import {
  sendSMS,
  reminderSMSTemplate,
  floristReminderSMSTemplate,
} from "@/lib/sms";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const twoWeeksFromNow = new Date(now);
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

  const upcomingEvents = await prisma.event.findMany({
    where: {
      reminderSent: false,
      reminderDate: {
        lte: now,
      },
      eventDate: {
        gte: now,
        lte: twoWeeksFromNow,
      },
    },
    include: {
      tenant: true,
    },
  });

  let sentCount = 0;

  for (const event of upcomingEvents) {
    const tenant = event.tenant;
    const websiteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${tenant.slug}`;
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/events`;

    if (event.customerEmail) {
      await sendEmail({
        to: event.customerEmail,
        subject: `Upcoming Event Reminder: ${event.eventName}`,
        html: reminderEmailTemplate(
          tenant.businessName,
          event.eventName,
          event.eventDate.toLocaleDateString(),
          tenant.contactEmail,
          tenant.contactPhone,
          websiteUrl
        ),
      });
    }

    if (event.customerPhone) {
      await sendSMS({
        to: event.customerPhone,
        body: reminderSMSTemplate(
          tenant.businessName,
          event.eventName,
          event.eventDate.toLocaleDateString(),
          tenant.contactEmail,
          tenant.contactPhone,
          websiteUrl
        ),
      });
    }

    const tenantUsers = await prisma.user.findMany({
      where: { tenantId: tenant.id },
    });

    for (const user of tenantUsers) {
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: `Event Reminder — 2 Weeks Away: ${event.customerName || "Customer"} — ${event.eventName}`,
          html: floristReminderEmailTemplate(
            event.customerName || "Customer",
            event.eventName,
            event.eventDate.toLocaleDateString(),
            event.notes,
            dashboardUrl
          ),
        });
      }

      if (user.phone) {
        await sendSMS({
          to: user.phone,
          body: floristReminderSMSTemplate(
            event.customerName || "Customer",
            event.eventName,
            event.eventDate.toLocaleDateString(),
            dashboardUrl
          ),
        });
      }
    }

    await prisma.event.update({
      where: { id: event.id },
      data: { reminderSent: true },
    });

    sentCount++;
  }

  return NextResponse.json({ success: true, sentCount });
}
