import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import { recordAuditLog } from "./audit";
import { generateReportPdfBuffer, type ReportData, type ReportTypeValue } from "./report-generator";

function parseJsonList(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function reportFileName(orderName: string, type: ReportTypeValue) {
  return `${orderName}-${type.toLowerCase()}-report.pdf`.replace(/[^\w.-]+/g, "-");
}

export async function buildReportData(prisma: PrismaClient, orderId: string, type: ReportTypeValue): Promise<ReportData> {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      materials: true,
      extractedFields: true,
      evidenceEvents: true,
      riskItems: {
        include: {
          riskRule: true,
          reviewDecisions: { orderBy: { version: "asc" } }
        }
      }
    }
  });

  return {
    type,
    order: {
      name: order.name,
      buyerName: order.buyerName,
      sellerName: order.sellerName,
      destinationCountry: order.destinationCountry,
      amount: order.amount,
      currency: order.currency,
      riskLevel: order.riskLevel
    },
    materials: order.materials.map((material) => ({ type: material.type, title: material.title })),
    fields: order.extractedFields.map((field) => ({ fieldKey: field.fieldKey, fieldValue: field.fieldValue })),
    risks: order.riskItems.map((risk) => ({
      ruleId: risk.riskRule.ruleId,
      severity: risk.severity,
      riskType: risk.riskType,
      originalText: risk.originalText,
      businessExplanation: risk.businessExplanation,
      suggestedRevision: risk.suggestedRevision,
      ruleSource: risk.ruleSource,
      requiredMaterials: parseJsonList(risk.requiredMaterials),
      reviewDecisions: risk.reviewDecisions.map((decision) => ({
        reviewerRole: decision.reviewerRole,
        reviewerName: decision.reviewerName,
        comment: decision.comment,
        version: decision.version
      }))
    })),
    evidenceEvents: order.evidenceEvents.map((event) => ({
      title: event.title,
      proofTarget: event.proofTarget,
      missingMaterials: parseJsonList(event.missingMaterials)
    }))
  };
}

export async function exportOrderReport(
  prisma: PrismaClient,
  input: { orderId: string; type: ReportTypeValue; outputDir?: string; createdBy: string }
) {
  const data = await buildReportData(prisma, input.orderId, input.type);
  const buffer = await generateReportPdfBuffer(data);
  const outputDir = input.outputDir ?? join(process.cwd(), "demo-output");
  mkdirSync(outputDir, { recursive: true });
  const filePath = join(outputDir, reportFileName(data.order.name, input.type));
  writeFileSync(filePath, buffer);

  const exportRecord = await prisma.reportExport.create({
    data: {
      orderId: input.orderId,
      type: input.type,
      filePath,
      createdBy: input.createdBy
    }
  });

  await recordAuditLog(prisma, {
    actorRole: input.createdBy,
    action: "REPORT_EXPORT",
    entityType: "ReportExport",
    entityId: exportRecord.id,
    summary: `导出报告：${input.type}`,
    metadata: {
      orderId: input.orderId,
      filePath
    }
  });

  return { filePath, bufferLength: buffer.length };
}
