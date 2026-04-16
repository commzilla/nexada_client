import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId } = await req.json();
  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const plan = await prisma.plan.findUnique({ where: { id: planId } });

  if (!user || !plan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Create or retrieve Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  // Ensure Stripe product/price exist
  let priceId = plan.stripePriceId;
  if (!priceId) {
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description || undefined,
      metadata: { planId: plan.id },
    });

    const priceData: any = {
      product: product.id,
      unit_amount: plan.amount,
      currency: plan.currency,
      metadata: { planId: plan.id },
    };

    if (plan.interval !== "one_time") {
      priceData.recurring = {
        interval: plan.interval as "month" | "year",
        interval_count: plan.intervalCount,
      };
    }

    const price = await stripe.prices.create(priceData);
    priceId = price.id;

    await prisma.plan.update({
      where: { id: plan.id },
      data: {
        stripePriceId: price.id,
        stripeProductId: product.id,
      },
    });
  }

  // Create Stripe Checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: plan.interval === "one_time" ? "payment" : "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: user.id, planId: plan.id },
    success_url: `${process.env.NEXTAUTH_URL}/portal?checkout=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/portal?checkout=canceled`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
