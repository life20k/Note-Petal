import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantSlug, messageText, occasion, recipientName, customerName, customerEmail, customerPhone } = body;

    if (!tenantSlug || !messageText || !recipientName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) {
      return NextResponse.json({ error: "Invalid florist" }, { status: 404 });
    }

    const note = await prisma.note.create({
      data: {
        tenantId: tenant.id,
        userId: (await prisma.user.findFirst({ where: { tenantId: tenant.id } }))?.id || "",
        messageText,
        occasion: occasion || "General",
        recipientName,
        customerName,
        customerEmail,
        customerPhone,
      },
    });

    return NextResponse.json({ success: true, id: note.id });
  } catch (error) {
    console.error("Public note error:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
