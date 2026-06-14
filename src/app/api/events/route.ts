import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  const events = await prisma.event.findMany({
    where: { tenantId },
    orderBy: { eventDate: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;
  const body = await request.json();

  const eventDate = new Date(body.eventDate);
  const reminderDate = new Date(eventDate);
  reminderDate.setDate(reminderDate.getDate() - 14);

  const event = await prisma.event.create({
    data: {
      tenantId,
      userId: (session.user as any).id,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      eventName: body.eventName,
      eventDate,
      eventType: body.eventType,
      notes: body.notes,
      reminderDate,
    },
  });

  return NextResponse.json(event);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.event.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
