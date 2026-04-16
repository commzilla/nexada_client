import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;

      if (!userId || !planId) break;

      if (session.mode === "subscription") {
        await prisma.subscription.create({
          data: {
            userId,
            planId,
            stripeSubscriptionId: session.subscription as string,
            status: "active",
            currentPeriodStart: new Date(),
          },
        });
      } else {
        // One-time payment
        await prisma.subscription.create({
          data: {
            userId,
            planId,
            status: "active",
          },
        });
      }

      // Record payment
      await prisma.payment.create({
        data: {
          userId,
          amount: session.amount_total || 0,
          currency: session.currency || "usd",
          status: "succeeded",
          stripePaymentIntentId: session.payment_intent as string,
          description: `Payment for checkout session`,
        },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (sub) {
          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: "active",
              currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            },
          });

          await prisma.payment.create({
            data: {
              userId: sub.userId,
              subscriptionId: sub.id,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: "succeeded",
              stripePaymentIntentId: invoice.payment_intent as string,
              description: `Recurring payment`,
            },
          });
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: "past_due" },
          });

          await prisma.payment.create({
            data: {
              userId: sub.userId,
              subscriptionId: sub.id,
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: "failed",
              description: `Failed payment`,
            },
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: "canceled" },
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const sub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
