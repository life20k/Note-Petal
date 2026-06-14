import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (tenant) {
        let plan = "starter";
        const priceId = subscription.items.data[0]?.price.id;
        if (priceId === process.env.STRIPE_PRICE_BUSINESS) plan = "business";
        if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) plan = "enterprise";

        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            plan,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            subscriptionPeriodEnd: new Date(
              (subscription as any).current_period_end * 1000
            ),
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (tenant) {
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            plan: "starter",
            stripeSubscriptionId: null,
            subscriptionStatus: "inactive",
            subscriptionPeriodEnd: null,
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
