import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const plan = await prisma.plan.create({
    data: {
      name: data.name,
      description: data.description || null,
      amount: parseInt(data.amount),
      currency: data.currency || "usd",
      interval: data.interval,
      intervalCount: parseInt(data.intervalCount) || 1,
    },
  });

  return NextResponse.json(plan);
}
