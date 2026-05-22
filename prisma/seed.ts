import { prisma } from "../src/lib/db";

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

  await prisma.auditLog.create({
    data: {
      actorRole: "system",
      action: "SEED",
      entityType: "Reviewer",
      entityId: "default-reviewer",
      summary: "Seeded default reviewer"
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
