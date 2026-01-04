import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.subscription.createMany({
    data: [
      {
        name: "Netflix",
        price: 15.99,
        cycle: "monthly",
        startDate: new Date("2023-01-01"),
      },
      {
        name: "Spotify",
        price: 9.99,
        cycle: "monthly",
        startDate: new Date("2023-02-01"),
      },
      {
        name: "iCloud",
        price: 0.99,
        cycle: "monthly",
        startDate: new Date("2023-03-01"),
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });