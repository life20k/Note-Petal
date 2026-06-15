import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      businessName: true,
      slug: true,
      plan: true,
      trialEndsAt: true,
      stripeSubscriptionId: true,
      primaryColor: true,
      secondaryColor: true,
      logoUrl: true,
      subscriptionStatus: true,
      subscriptionPeriodEnd: true,
    },
  });

  if (tenant && tenant.plan === "business" && tenant.trialEndsAt && new Date() > tenant.trialEndsAt && !tenant.stripeSubscriptionId) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { plan: "starter", trialEndsAt: null },
    });
    tenant.plan = "starter";
  }

  const [
    totalNotes,
    totalEvents,
    upcomingEvents,
    recentNotes,
    totalIngredients,
    totalArrangements,
  ] = await Promise.all([
    prisma.note.count({ where: { tenantId } }),
    prisma.event.count({ where: { tenantId } }),
    prisma.event.count({
      where: {
        tenantId,
        eventDate: { gte: new Date() },
      },
    }),
    prisma.note.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.ingredient.count({ where: { tenantId } }),
    prisma.arrangement.count({ where: { tenantId } }),
  ]);

  return NextResponse.json({
    tenant,
    totalNotes,
    totalEvents,
    upcomingEvents,
    recentNotes,
    totalIngredients,
    totalArrangements,
  });
}
