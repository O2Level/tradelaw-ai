import { describe, expect, it, vi } from "vitest";
import { saveReviewDecision } from "@/lib/review-service";

describe("saveReviewDecision", () => {
  it("stores a versioned review decision, updates risk status and writes audit log", async () => {
    const prisma = {
      reviewDecision: {
        count: vi.fn().mockResolvedValue(1),
        create: vi.fn().mockResolvedValue({ id: "review-2" })
      },
      riskItem: {
        update: vi.fn().mockResolvedValue({ id: "risk-1", orderId: "order-1" })
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: "audit-1" })
      }
    };

    await saveReviewDecision(prisma, {
      riskItemId: "risk-1",
      reviewerName: "王法务",
      reviewerRole: "法务",
      decision: "REQUIRE_MODIFICATION",
      comment: "要求改为发货前付清尾款"
    });

    expect(prisma.reviewDecision.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        riskItemId: "risk-1",
        reviewerName: "王法务",
        reviewerRole: "法务",
        decision: "REQUIRE_MODIFICATION",
        comment: "要求改为发货前付清尾款",
        version: 2
      })
    });
    expect(prisma.riskItem.update).toHaveBeenCalledWith({
      where: { id: "risk-1" },
      data: { status: "REQUIRE_MODIFICATION" }
    });
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });
});
