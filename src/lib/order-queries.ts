import { prisma } from "./db";

export async function getDashboardStats() {
  const [orders, redRisks, pendingReviews] = await Promise.all([
    prisma.order.count(),
    prisma.riskItem.count({ where: { severity: "RED" } }),
    prisma.riskItem.count({ where: { requiresHumanReview: true, status: { in: ["OPEN", "IN_REVIEW"] } } })
  ]);

  return { orders, redRisks, pendingReviews };
}

export async function listOrders() {
  return prisma.order.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      riskItems: true
    }
  });
}

export async function getOrderSpace(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      materials: { orderBy: { createdAt: "desc" } },
      extractedFields: { orderBy: { createdAt: "desc" } },
      riskItems: {
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        include: { riskRule: true, reviewDecisions: { orderBy: { createdAt: "desc" } } }
      },
      evidenceEvents: { orderBy: { createdAt: "asc" } },
      reportExports: { orderBy: { createdAt: "desc" } }
    }
  });
}

export async function listRules() {
  return prisma.riskRule.findMany({
    orderBy: { ruleId: "asc" }
  });
}

export async function listReviewQueue() {
  return prisma.riskItem.findMany({
    where: {
      OR: [{ severity: "RED" }, { requiresHumanReview: true }, { riskType: { contains: "争议解决" } }]
    },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    include: {
      order: true,
      riskRule: true,
      reviewDecisions: { orderBy: { createdAt: "desc" } }
    }
  });
}
