import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requirePlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";

export async function POST(request: NextRequest) {
  const authResult = await requirePlan("business");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const session = await auth();
  const body = await request.json();
  const { type, recipientEmail, recipientPhone, content, subject } = body;

  let sent = false;

  if (type === "email" && recipientEmail) {
    sent = await sendEmail({
      to: recipientEmail,
      subject: subject || "Message from your florist",
      html: `<div style="font-family:Arial,sans-serif;padding:20px;"><p>${content}</p></div>`,
    });
  }

  if (type === "sms" && recipientPhone) {
    sent = await sendSMS({
      to: recipientPhone,
      body: content,
    });
  }

  if (sent) {
    await prisma.message.create({
      data: {
        tenantId: authResult.tenant.id,
        fromName: (session?.user as any)?.name || "Florist",
        toEmail: recipientEmail,
        toPhone: recipientPhone,
        content,
        type,
      },
    });
  }

  return NextResponse.json({ success: sent });
}

export async function GET() {
  const authResult = await requirePlan("business");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const messages = await prisma.message.findMany({
    where: { tenantId: authResult.tenant.id },
    orderBy: { sentAt: "desc" },
  });

  return NextResponse.json(messages);
}
