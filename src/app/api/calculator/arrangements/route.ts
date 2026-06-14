import { NextRequest, NextResponse } from "next/server";
import { requirePlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requirePlan("business");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const arrangements = await prisma.arrangement.findMany({
    where: { tenantId: authResult.tenant.id },
    include: {
      items: {
        include: { ingredient: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(arrangements);
}

export async function POST(request: NextRequest) {
  const authResult = await requirePlan("business");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();

  const arrangement = await prisma.arrangement.create({
    data: {
      tenantId: authResult.tenant.id,
      name: body.name,
      type: body.type,
      isTemplate: body.isTemplate || false,
      description: body.description,
      desiredMargin: body.desiredMargin || 50,
      items: {
        create: (body.items || []).map((item: any) => ({
          ingredientId: item.ingredientId,
          quantity: item.quantity,
          unit: item.unit || "stem",
        })),
      },
    },
    include: {
      items: { include: { ingredient: true } },
    },
  });

  return NextResponse.json(arrangement);
}

export async function PATCH(request: NextRequest) {
  const authResult = await requirePlan("business");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();
  const { id, items, ...data } = body;

  if (items) {
    await prisma.arrangementItem.deleteMany({
      where: { arrangementId: id },
    });

    const arrangement = await prisma.arrangement.update({
      where: { id },
      data: {
        ...data,
        items: {
          create: items.map((item: any) => ({
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unit: item.unit || "stem",
          })),
        },
      },
      include: {
        items: { include: { ingredient: true } },
      },
    });

    return NextResponse.json(arrangement);
  }

  const arrangement = await prisma.arrangement.update({
    where: { id },
    data,
    include: {
      items: { include: { ingredient: true } },
    },
  });

  return NextResponse.json(arrangement);
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

  await prisma.arrangement.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
