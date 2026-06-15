import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, PLANS, type PlanType } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await request.json();

  if (!plan || !["business", "enterprise"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const tenantId = (session.user as any).tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const selectedPlan = PLANS[plan as PlanType];
  if (!selectedPlan || plan === "starter" || !("stripePriceId" in selectedPlan)) {
    return NextResponse.json({ error: "Plan not available" }, { status: 400 });
  }

  const priceId = (selectedPlan as any).stripePriceId;
  if (!priceId) {
    return NextResponse.json({ error: "Plan price not configured" }, { status: 400 });
  }

  let stripeCustomerId = tenant.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: tenant.businessName,
      metadata: { tenantId: tenant.id },
    });
    stripeCustomerId = customer.id;

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { stripeCustomerId },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const origin = request.headers.get("origin") || baseUrl;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${origin}/dashboard/billing?success=true`,
    cancel_url: `${origin}/dashboard/billing?canceled=true`,
    metadata: {
      tenantId: tenant.id,
      plan,
    },
    subscription_data: {
      metadata: {
        tenantId: tenant.id,
        plan,
      },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
