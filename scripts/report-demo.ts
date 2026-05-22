import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { importDemoCase } from "../src/lib/demo-cases";
import { prisma } from "../src/lib/db";
import { buildReportData } from "../src/lib/report-service";
import { generateReportPdfBuffer } from "../src/lib/report-generator";

async function ensureOrder(namePart: string, caseId: "vietnam-po" | "malaysia-quality") {
  const existing = await prisma.order.findFirst({ where: { name: { contains: namePart } } });
  return existing ?? importDemoCase(prisma, caseId);
}

async function writeDemoReport(orderId: string, type: "SALES" | "LEGAL" | "EVIDENCE", filename: string) {
  const data = await buildReportData(prisma, orderId, type);
  const buffer = await generateReportPdfBuffer(data);
  const outputDir = join(process.cwd(), "demo-output");
  mkdirSync(outputDir, { recursive: true });
  const filePath = join(outputDir, filename);
  writeFileSync(filePath, buffer);
  await prisma.reportExport.create({
    data: {
      orderId,
      type,
      filePath,
      createdBy: "report:demo"
    }
  });
  return filePath;
}

async function main() {
  const vietnam = await ensureOrder("Vietnam Buyer PO", "vietnam-po");
  const malaysia = await ensureOrder("Malaysia Quality", "malaysia-quality");
  const files = [
    await writeDemoReport(vietnam.id, "SALES", "business-report-vietnam.pdf"),
    await writeDemoReport(vietnam.id, "LEGAL", "legal-report-vietnam.pdf"),
    await writeDemoReport(malaysia.id, "EVIDENCE", "evidence-summary-malaysia-or-philippines.pdf")
  ];
  console.log(`Generated demo reports:\n${files.join("\n")}`);
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
