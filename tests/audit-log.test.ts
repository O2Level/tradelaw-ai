import { describe, expect, it, vi } from "vitest";
import { recordAuditLog } from "@/lib/audit";

describe("recordAuditLog", () => {
  it("writes a structured audit event with actor, action, entity and metadata", async () => {
    const create = vi.fn().mockResolvedValue({ id: "audit-1" });
    const prisma = {
      auditLog: {
        create
      }
    };

    await recordAuditLog(prisma, {
      actorRole: "法务",
      action: "RISK_SCAN",
      entityType: "Order",
      entityId: "order-1",
      summary: "完成风险扫描",
      metadata: { riskItems: 3 }
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        actorRole: "法务",
        action: "RISK_SCAN",
        entityType: "Order",
        entityId: "order-1",
        summary: "完成风险扫描",
        metadata: JSON.stringify({ riskItems: 3 })
      }
    });
  });
});
