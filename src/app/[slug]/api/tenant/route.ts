import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      businessName: true,
      logoUrl: true,
      primaryColor: true,
      secondaryColor: true,
      welcomeMessage: true,
      contactEmail: true,
      contactPhone: true,
      plan: true,
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(tenant);
}
