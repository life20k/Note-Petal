import { NextRequest, NextResponse } from "next/server";
import { requirePlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requirePlan("business");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const sales = await prisma.salesRecord.findMany({
    where: { tenantId: authResult.tenant.id },
    include: { arrangement: true },
    orderBy: { saleDate: "desc" },
    take: 50,
  });

  return NextResponse.json(sales);
}

export async function POST(request: NextRequest) {
  const authResult = await requirePlan("business");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();
  const { arrangementId, quantity, salePrice, saleDate } = body;

  if (!arrangementId || !quantity || !salePrice) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const arrangement = await prisma.arrangement.findUnique({
    where: { id: arrangementId },
    include: { items: { include: { ingredient: true } } },
  });

  if (!arrangement) {
    return NextResponse.json({ error: "Arrangement not found" }, { status: 404 });
  }

  const costPrice = arrangement.items.reduce((total, item) => {
    const unitCost = item.ingredient.bulkPrice / item.ingredient.quantityPerBulk;
    return total + unitCost * item.quantity;
  }, 0);

  const sale = await prisma.salesRecord.create({
    data: {
      tenantId: authResult.tenant.id,
      arrangementId,
      quantity: parseInt(quantity),
      salePrice: parseFloat(salePrice),
      costPrice,
      saleDate: saleDate ? new Date(saleDate) : new Date(),
    },
    include: { arrangement: true },
  });

  return NextResponse.json(sale);
}

export async function DELETE(request: NextRequest) {
  const authResult = await requirePlan("business");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.salesRecord.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
