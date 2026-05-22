import { importAllDemoCases } from "../src/lib/demo-cases";
import { prisma } from "../src/lib/db";

async function main() {
  const imported = await importAllDemoCases(prisma);
  console.log(`Imported ${imported.length} demo cases.`);
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
