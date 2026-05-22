import { importDemoCase } from "../src/lib/demo-cases";
import { prisma } from "../src/lib/db";
import { scanOrderRisks } from "../src/lib/scan-service";

async function main() {
  let order = await prisma.order.findFirst({
    where: { name: { contains: "Vietnam Buyer PO" } }
  });
  if (!order) {
    order = await importDemoCase(prisma, "vietnam-po");
  } else {
    await scanOrderRisks(prisma, order.id, "qa");
  }

  const risk = await prisma.riskItem.findFirst({
    where: {
      orderId: order.id,
      riskRule: { ruleId: "R-PAY-001" }
    },
    include: { riskRule: true }
  });

  if (!risk) {
    throw new Error("Vietnam demo did not hit R-PAY-001.");
  }
  if (!risk.originalText.includes("70% balance paid after arrival and buyer inspection")) {
    throw new Error("R-PAY-001 original text did not include the required clause.");
  }

  console.log(`Vietnam demo passed: ${risk.riskRule.ruleId} ${risk.severity}`);
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
