import type { PrismaClient } from "@prisma/client";
import { recordAuditLog } from "./audit";
import { analyzeTextMaterials } from "./risk-engine";
import { seedRiskRules, serializeRequiredMaterials, serializeRuleTrigger, type RiskRuleDefinition } from "./risk-rules";

type PrismaLike = PrismaClient;

function maxSeverity(values: Array<"GREEN" | "YELLOW" | "RED">) {
  if (values.includes("RED")) {
    return "RED";
  }
  if (values.includes("YELLOW")) {
    return "YELLOW";
  }
  return "GREEN";
}

function parseDbRule(rule: {
  ruleId: string;
  riskType: string;
  scenario: string;
  trigger: string;
  severity: "GREEN" | "YELLOW" | "RED";
  businessExplanation: string;
  suggestedRevision: string;
  requiredMaterials: string;
  requiresHumanReview: boolean;
  source: string;
  lastUpdated: Date;
}): RiskRuleDefinition {
  return {
    ruleId: rule.ruleId,
    riskType: rule.riskType,
    scenario: rule.scenario,
    trigger: JSON.parse(rule.trigger),
    severity: rule.severity,
    businessExplanation: rule.businessExplanation,
    suggestedRevision: rule.suggestedRevision,
    requiredMaterials: JSON.parse(rule.requiredMaterials),
    requiresHumanReview: rule.requiresHumanReview,
    source: rule.source,
    lastUpdated: rule.lastUpdated.toISOString().slice(0, 10)
  };
}

export async function ensureSeedRiskRules(prisma: PrismaLike) {
  const existing = await prisma.riskRule.count();
  if (existing >= seedRiskRules.length) {
    return;
  }

  for (const rule of seedRiskRules) {
    await prisma.riskRule.upsert({
      where: { ruleId: rule.ruleId },
      update: {
        riskType: rule.riskType,
        scenario: rule.scenario,
        trigger: serializeRuleTrigger(rule.trigger),
        severity: rule.severity,
        businessExplanation: rule.businessExplanation,
        suggestedRevision: rule.suggestedRevision,
        requiredMaterials: serializeRequiredMaterials(rule.requiredMaterials),
        requiresHumanReview: rule.requiresHumanReview,
        source: rule.source,
        lastUpdated: new Date(rule.lastUpdated)
      },
      create: {
        ruleId: rule.ruleId,
        riskType: rule.riskType,
        scenario: rule.scenario,
        trigger: serializeRuleTrigger(rule.trigger),
        severity: rule.severity,
        businessExplanation: rule.businessExplanation,
        suggestedRevision: rule.suggestedRevision,
        requiredMaterials: serializeRequiredMaterials(rule.requiredMaterials),
        requiresHumanReview: rule.requiresHumanReview,
        source: rule.source,
        lastUpdated: new Date(rule.lastUpdated)
      }
    });
  }
}

export async function scanOrderRisks(prisma: PrismaLike, orderId: string, actorRole = "system") {
  await ensureSeedRiskRules(prisma);

  const [materials, dbRules] = await Promise.all([
    prisma.material.findMany({ where: { orderId } }),
    prisma.riskRule.findMany()
  ]);

  await prisma.riskItem.deleteMany({ where: { orderId } });

  const rules = dbRules.map(parseDbRule);
  const risks = analyzeTextMaterials(
    materials.map((material) => ({
      id: material.id,
      title: material.title,
      content: material.content
    })),
    rules
  );

  const ruleByRuleId = new Map(dbRules.map((rule) => [rule.ruleId, rule]));
  for (const risk of risks) {
    const dbRule = ruleByRuleId.get(risk.ruleId);
    if (!dbRule) {
      continue;
    }
    await prisma.riskItem.create({
      data: {
        orderId,
        riskRuleId: dbRule.id,
        materialId: risk.materialId,
        originalText: risk.originalText,
        riskType: risk.riskType,
        severity: risk.severity,
        businessExplanation: risk.businessExplanation,
        suggestedRevision: risk.suggestedRevision,
        requiredMaterials: JSON.stringify(risk.requiredMaterials),
        requiresHumanReview: risk.requiresHumanReview,
        ruleSource: risk.ruleSource,
        status: risk.requiresHumanReview ? "IN_REVIEW" : "OPEN"
      }
    });
  }

  const riskLevel = maxSeverity(risks.map((risk) => risk.severity));
  const needsReview = risks.some((risk) => risk.severity === "RED" || risk.requiresHumanReview);
  await prisma.order.update({
    where: { id: orderId },
    data: {
      riskLevel,
      reviewStatus: needsReview ? "PENDING" : "NONE"
    }
  });

  await recordAuditLog(prisma, {
    actorRole,
    action: "RISK_SCAN",
    entityType: "Order",
    entityId: orderId,
    summary: "完成订单风险扫描",
    metadata: {
      riskItems: risks.length,
      riskLevel,
      needsReview
    }
  });

  return { risks, riskLevel, needsReview };
}
