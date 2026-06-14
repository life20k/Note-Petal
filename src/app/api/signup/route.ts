import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, email, password, name, phone } = body;

    if (!businessName || !email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let slug = slugify(businessName);
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const tenant = await prisma.tenant.create({
      data: {
        slug,
        businessName,
        contactEmail: email,
        contactPhone: phone,
        users: {
          create: {
            name,
            email,
            phone,
            password: hashedPassword,
            role: "florist",
          },
        },
      },
      include: { users: true },
    });

    return NextResponse.json({
      success: true,
      tenant: { id: tenant.id, slug: tenant.slug, businessName: tenant.businessName },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
