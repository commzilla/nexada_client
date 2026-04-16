import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await prisma.paymentLink.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const amount = parseInt(data.amount);
  const currency = data.currency || "usd";
  const name = data.name;
  const description = data.description || null;

  // Create a Stripe product + price for this one-time link
  const product = await stripe.products.create({
    name,
    description: description || undefined,
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amount,
    currency,
  });

  // Create a Stripe Payment Link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    after_completion: {
      type: "redirect",
      redirect: { url: `${process.env.NEXTAUTH_URL}/pay/success` },
    },
    metadata: { source: "nexada_admin" },
  });

  // Save to our database
  const link = await prisma.paymentLink.create({
    data: {
      name,
      amount,
      currency,
      description,
      url: paymentLink.url,
      stripePaymentLinkId: paymentLink.id,
      stripePriceId: price.id,
    },
  });

  return NextResponse.json(link);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  const link = await prisma.paymentLink.findUnique({ where: { id } });
  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Deactivate in Stripe if exists
  if (link.stripePaymentLinkId) {
    await stripe.paymentLinks.update(link.stripePaymentLinkId, {
      active: false,
    });
  }

  await prisma.paymentLink.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
