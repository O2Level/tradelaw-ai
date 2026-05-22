import { prisma } from "../src/lib/db";
import { seedRiskRules, serializeRequiredMaterials, serializeRuleTrigger } from "../src/lib/risk-rules";

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

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
