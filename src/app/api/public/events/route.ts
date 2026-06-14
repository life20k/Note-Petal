import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantSlug, eventName, eventDate, eventType, customerName, customerEmail, customerPhone } = body;

    if (!tenantSlug || !eventName || !eventDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) {
      return NextResponse.json({ error: "Invalid florist" }, { status: 404 });
    }

    const eventDateObj = new Date(eventDate);
    const reminderDate = new Date(eventDateObj);
    reminderDate.setDate(reminderDate.getDate() - 14);

    const event = await prisma.event.create({
      data: {
        tenantId: tenant.id,
        userId: (await prisma.user.findFirst({ where: { tenantId: tenant.id } }))?.id || "",
        eventName,
        eventDate: eventDateObj,
        eventType: eventType || "Other",
        customerName,
        customerEmail,
        customerPhone,
        reminderDate,
      },
    });

    return NextResponse.json({ success: true, id: event.id });
  } catch (error) {
    console.error("Public event error:", error);
    return NextResponse.json({ error: "Failed to save event" }, { status: 500 });
  }
}
