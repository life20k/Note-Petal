import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, PLANS, type PlanType } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  // If no Stripe customer ID, nothing to sync
  if (!tenant.stripeCustomerId) {
    return NextResponse.json({ synced: false, reason: "No Stripe customer" });
  }

  // Check for active subscriptions on this customer
  const subscriptions = await stripe.subscriptions.list({
    customer: tenant.stripeCustomerId,
    status: "active",
    limit: 1,
  });

  if (subscriptions.data.length === 0) {
    // No active subscription — if on paid plan, downgrade
    if (tenant.plan !== "starter") {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          plan: "starter",
          stripeSubscriptionId: null,
          subscriptionStatus: "inactive",
          subscriptionPeriodEnd: null,
        },
      });
      return NextResponse.json({ synced: true, plan: "starter" });
    }
    return NextResponse.json({ synced: false, reason: "No active subscription" });
  }

  const subscription = subscriptions.data[0];
  const priceId = subscription.items.data[0]?.price.id;

  let plan: PlanType = "starter";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) plan = "business";
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) plan = "enterprise";

  // Update tenant if plan changed
  if (tenant.plan !== plan || tenant.stripeSubscriptionId !== subscription.id) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan,
        stripeCustomerId: tenant.stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000
        ),
      },
    });
  }

  return NextResponse.json({ synced: true, plan });
}
