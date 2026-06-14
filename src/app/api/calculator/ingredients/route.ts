import { NextRequest, NextResponse } from "next/server";
import { requirePlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requirePlan("business");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const ingredients = await prisma.ingredient.findMany({
    where: { tenantId: auth.tenant.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(ingredients);
}

export async function POST(request: NextRequest) {
  const auth = await requirePlan("business");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  const ingredient = await prisma.ingredient.create({
    data: {
      tenantId: auth.tenant.id,
      name: body.name,
      category: body.category,
      unit: body.unit || "stem",
      bulkPrice: body.bulkPrice,
      quantityPerBulk: body.quantityPerBulk,
      supplier: body.supplier,
    },
  });

  return NextResponse.json(ingredient);
}

export async function PATCH(request: NextRequest) {
  const auth = await requirePlan("business");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { id, ...data } = body;

  const ingredient = await prisma.ingredient.update({
    where: { id },
    data,
  });

  return NextResponse.json(ingredient);
}

export async function DELETE(request: NextRequest) {
  const auth = await requirePlan("business");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.ingredient.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
