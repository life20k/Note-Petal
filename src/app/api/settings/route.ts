import { NextRequest, NextResponse } from "next/server";
import { requirePlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requirePlan("starter");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: authResult.tenant.id },
  });

  return NextResponse.json(tenant);
}

export async function PATCH(request: NextRequest) {
  const authResult = await requirePlan("starter");
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();

  const tenant = await prisma.tenant.update({
    where: { id: authResult.tenant.id },
    data: {
      businessName: body.businessName,
      logoUrl: body.logoUrl,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      address: body.address,
      welcomeMessage: body.welcomeMessage,
    },
  });

  return NextResponse.json(tenant);
}
