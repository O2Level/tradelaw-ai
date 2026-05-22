import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.reviewer.upsert({
    where: { id: "default-reviewer" },
    update: {},
    create: {
      id: "default-reviewer",
      name: "默认复核人",
      role: "法务"
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
