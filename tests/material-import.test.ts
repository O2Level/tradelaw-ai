import { describe, expect, it, vi } from "vitest";
import { importTextMaterial } from "@/lib/material-service";

describe("importTextMaterial", () => {
  it("saves pasted text material, extracted fields and audit log", async () => {
    const prisma = {
      material: {
        create: vi.fn().mockResolvedValue({ id: "mat-1", title: "PO" })
      },
      extractedField: {
        createMany: vi.fn().mockResolvedValue({ count: 2 })
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: "audit-1" })
      }
    };

    await importTextMaterial(prisma, {
      orderId: "order-1",
      type: "PO",
      title: "PO",
      content: "Buyer: VietHome\nAmount: USD 48,000",
      actorRole: "业务员"
    });

    expect(prisma.material.create).toHaveBeenCalledWith({
      data: {
        orderId: "order-1",
        type: "PO",
        title: "PO",
        content: "Buyer: VietHome\nAmount: USD 48,000",
        sensitivityNote: "请先脱敏客户个人信息、私人联系方式和非必要商业秘密。"
      }
    });
    expect(prisma.extractedField.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ orderId: "order-1", sourceMaterialId: "mat-1", fieldKey: "buyerName" }),
        expect.objectContaining({ orderId: "order-1", sourceMaterialId: "mat-1", fieldKey: "amount" })
      ])
    });
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });
});
