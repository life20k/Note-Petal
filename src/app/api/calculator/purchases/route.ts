import { NextRequest, NextResponse } from "next/server";
import { requirePlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requirePlan("business");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const purchases = await prisma.bulkPurchase.findMany({
    where: { tenantId: authResult.tenant.id },
    include: { ingredient: true },
    orderBy: { purchaseDate: "desc" },
  });

  return NextResponse.json(purchases);
}

export async function POST(request: NextRequest) {
  const authResult = await requirePlan("business");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();

  const purchase = await prisma.bulkPurchase.create({
    data: {
      tenantId: authResult.tenant.id,
      ingredientId: body.ingredientId,
      quantity: body.quantity,
      totalCost: body.totalCost,
    },
    include: { ingredient: true },
  });

  return NextResponse.json(purchase);
}
