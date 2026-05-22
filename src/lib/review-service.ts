import { recordAuditLog } from "./audit";

export const reviewDecisions = [
  "ACCEPT_RISK",
  "REQUIRE_MODIFICATION",
  "ADD_CLAUSE",
  "PAUSE_TRANSACTION",
  "ESCALATE_TO_LAWYER"
] as const;

export type ReviewDecisionValue = (typeof reviewDecisions)[number];

type RiskStatusValue = "ACCEPTED" | "REQUIRE_MODIFICATION" | "CLAUSE_ADDED" | "PAUSED" | "ESCALATED_TO_LAWYER";

const statusByDecision: Record<ReviewDecisionValue, RiskStatusValue> = {
  ACCEPT_RISK: "ACCEPTED",
  REQUIRE_MODIFICATION: "REQUIRE_MODIFICATION",
  ADD_CLAUSE: "CLAUSE_ADDED",
  PAUSE_TRANSACTION: "PAUSED",
  ESCALATE_TO_LAWYER: "ESCALATED_TO_LAWYER"
};

type ReviewPrisma = {
  reviewDecision: {
    count: (args: { where: { riskItemId: string } }) => Promise<number>;
    create: (args: {
      data: {
        riskItemId: string;
        reviewerName: string;
        reviewerRole: string;
        decision: string;
        comment: string;
        version: number;
      };
    }) => Promise<unknown>;
  };
  riskItem: {
    update: (args: { where: { id: string }; data: { status: RiskStatusValue } }) => Promise<{ id: string; orderId: string }>;
  };
  auditLog: {
    create: Parameters<typeof recordAuditLog>[0]["auditLog"]["create"];
  };
};

export type SaveReviewDecisionInput = {
  riskItemId: string;
  reviewerName: string;
  reviewerRole: string;
  decision: ReviewDecisionValue;
  comment: string;
};

export function toReviewDecision(value: string): ReviewDecisionValue {
  return reviewDecisions.includes(value as ReviewDecisionValue) ? (value as ReviewDecisionValue) : "REQUIRE_MODIFICATION";
}

export async function saveReviewDecision(prisma: ReviewPrisma, input: SaveReviewDecisionInput) {
  const version = (await prisma.reviewDecision.count({ where: { riskItemId: input.riskItemId } })) + 1;
  const status = statusByDecision[input.decision];

  const decision = await prisma.reviewDecision.create({
    data: {
      riskItemId: input.riskItemId,
      reviewerName: input.reviewerName,
      reviewerRole: input.reviewerRole,
      decision: input.decision,
      comment: input.comment,
      version
    }
  });

  const risk = await prisma.riskItem.update({
    where: { id: input.riskItemId },
    data: { status }
  });

  await recordAuditLog(prisma, {
    actorRole: input.reviewerRole,
    action: "REVIEW_DECISION",
    entityType: "RiskItem",
    entityId: input.riskItemId,
    summary: `复核意见：${input.decision}`,
    metadata: {
      orderId: risk.orderId,
      version,
      status
    }
  });

  return decision;
}
