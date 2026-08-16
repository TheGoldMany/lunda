import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { Role, Trade, VerificationStatus } from "../generated/prisma/client";

const CITY = "Budapest";

async function upsertUser(opts: {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: Role;
}) {
  const passwordHash = await bcrypt.hash(opts.password, 10);
  return prisma.user.upsert({
    where: { phone: opts.phone },
    update: {},
    create: {
      name: opts.name,
      phone: opts.phone,
      email: opts.email,
      passwordHash,
      role: opts.role,
      city: CITY,
    },
  });
}

async function main() {
  const admin = await upsertUser({
    name: "Admin",
    phone: "+36200000000",
    email: "admin@lunda.dev",
    password: "adminpass123",
    role: Role.ADMIN,
  });

  const customer = await upsertUser({
    name: "Kovács Éva",
    phone: "+36201111111",
    email: "customer@lunda.dev",
    password: "customerpass123",
    role: Role.CUSTOMER,
  });

  const providerSeeds = [
    {
      name: "Nagy Péter",
      phone: "+36202222221",
      trades: [Trade.WATER, Trade.GAS],
      lat: 47.4979,
      lng: 19.0402,
      calloutFee: 5000,
      hourlyRate: 8000,
    },
    {
      name: "Szabó János",
      phone: "+36202222222",
      trades: [Trade.ELECTRICITY],
      lat: 47.5108,
      lng: 19.0827,
      calloutFee: 6000,
      hourlyRate: 9000,
    },
    {
      name: "Tóth Gábor",
      phone: "+36202222223",
      trades: [Trade.WATER],
      lat: 47.4813,
      lng: 19.0567,
      calloutFee: 4500,
      hourlyRate: 7500,
    },
  ];

  for (const p of providerSeeds) {
    const user = await upsertUser({
      name: p.name,
      phone: p.phone,
      email: `${p.phone.slice(-4)}@lunda.dev`,
      password: "providerpass123",
      role: Role.PROVIDER,
    });

    await prisma.serviceProvider.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        trades: p.trades,
        calloutFee: p.calloutFee,
        hourlyRate: p.hourlyRate,
        latitude: p.lat,
        longitude: p.lng,
        verificationStatus: VerificationStatus.APPROVED,
        isAvailable: true,
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login:    ${admin.phone} / adminpass123`);
  console.log(`Customer login: ${customer.phone} / customerpass123`);
  console.log(`Provider logins: ${providerSeeds.map((p) => p.phone).join(", ")} / providerpass123`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
