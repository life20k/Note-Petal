import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    console.error("Stripe webhook: No signature");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Stripe webhook: Invalid signature", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`Stripe webhook: Received event ${event.type}`);

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price.id;

      console.log(`Stripe webhook: ${event.type} - customer: ${customerId}, price: ${priceId}, status: ${subscription.status}`);

      const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!tenant) {
        console.error(`Stripe webhook: No tenant found for stripeCustomerId: ${customerId}`);
        break;
      }

      let plan = "starter";
      if (priceId === process.env.STRIPE_PRICE_BUSINESS) plan = "business";
      if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) plan = "enterprise";

      console.log(`Stripe webhook: Updating tenant ${tenant.id} to plan ${plan}`);

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

      console.log(`Stripe webhook: Tenant ${tenant.id} updated to plan ${plan}`);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      console.log(`Stripe webhook: subscription.deleted - customer: ${customerId}`);

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
        console.log(`Stripe webhook: Tenant ${tenant.id} downgraded to starter`);
      } else {
        console.error(`Stripe webhook: No tenant found for stripeCustomerId: ${customerId}`);
      }
      break;
    }

    default:
      console.log(`Stripe webhook: Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
