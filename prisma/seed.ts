import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@nexada.io",
      name: "Admin User",
      password: adminPassword,
      role: "admin",
    },
  });

  // Create client users
  const clientPassword = await bcrypt.hash("client123", 10);
  const client1 = await prisma.user.create({
    data: {
      email: "client@nexada.io",
      name: "Jane Cooper",
      password: clientPassword,
      role: "client",
    },
  });

  const client2 = await prisma.user.create({
    data: {
      email: "john@example.com",
      name: "John Smith",
      password: clientPassword,
      role: "client",
    },
  });

  // Create plans
  const basicMonthly = await prisma.plan.create({
    data: {
      name: "Basic Monthly",
      description: "Essential features for individuals",
      amount: 999,
      currency: "usd",
      interval: "month",
      intervalCount: 1,
    },
  });

  const proMonthly = await prisma.plan.create({
    data: {
      name: "Pro Monthly",
      description: "Advanced features for professionals",
      amount: 2999,
      currency: "usd",
      interval: "month",
      intervalCount: 1,
    },
  });

  const quarterly = await prisma.plan.create({
    data: {
      name: "Quarterly Plan",
      description: "Billed every 3 months with a discount",
      amount: 7999,
      currency: "usd",
      interval: "month",
      intervalCount: 3,
    },
  });

  const annual = await prisma.plan.create({
    data: {
      name: "Annual Plan",
      description: "Best value - save 20% with annual billing",
      amount: 28999,
      currency: "usd",
      interval: "year",
      intervalCount: 1,
    },
  });

  const oneTime = await prisma.plan.create({
    data: {
      name: "Setup Fee",
      description: "One-time onboarding and setup",
      amount: 9999,
      currency: "usd",
      interval: "one_time",
      intervalCount: 1,
    },
  });

  // Create sample subscriptions
  const sub1 = await prisma.subscription.create({
    data: {
      userId: client1.id,
      planId: proMonthly.id,
      status: "active",
      currentPeriodStart: new Date("2025-03-01"),
      currentPeriodEnd: new Date("2025-04-01"),
    },
  });

  const sub2 = await prisma.subscription.create({
    data: {
      userId: client2.id,
      planId: basicMonthly.id,
      status: "active",
      currentPeriodStart: new Date("2025-03-15"),
      currentPeriodEnd: new Date("2025-04-15"),
    },
  });

  // Create sample payments
  await prisma.payment.create({
    data: {
      userId: client1.id,
      subscriptionId: sub1.id,
      amount: 2999,
      currency: "usd",
      status: "succeeded",
      description: "Pro Monthly - March 2025",
    },
  });

  await prisma.payment.create({
    data: {
      userId: client2.id,
      subscriptionId: sub2.id,
      amount: 999,
      currency: "usd",
      status: "succeeded",
      description: "Basic Monthly - March 2025",
    },
  });

  console.log("Seed data created successfully!");
  console.log("");
  console.log("Login credentials:");
  console.log("  Admin: admin@nexada.io / admin123");
  console.log("  Client: client@nexada.io / client123");
  console.log("  Client: john@example.com / client123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
