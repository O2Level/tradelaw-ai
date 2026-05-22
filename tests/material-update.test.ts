import { describe, expect, it, vi } from "vitest";
import { updateTextMaterial } from "@/lib/material-service";

describe("updateTextMaterial", () => {
  it("updates material content, refreshes extracted fields and writes audit log", async () => {
    const prisma = {
      material: {
        findFirst: vi.fn().mockResolvedValue({ id: "mat-1", orderId: "order-1" }),
        update: vi.fn().mockResolvedValue({ id: "mat-1", orderId: "order-1", title: "PO" })
      },
      extractedField: {
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
        createMany: vi.fn().mockResolvedValue({ count: 1 })
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: "audit-1" })
      }
    };

    await updateTextMaterial(prisma, {
      materialId: "mat-1",
      orderId: "order-1",
      title: "PO",
      content: "Payment terms: 70% balance paid before shipment.",
      actorRole: "业务员"
    });

    expect(prisma.material.findFirst).toHaveBeenCalledWith({
      where: { id: "mat-1", orderId: "order-1" },
      select: { id: true, orderId: true }
    });
    expect(prisma.material.update).toHaveBeenCalledWith({
      where: { id: "mat-1" },
      data: { title: "PO", content: "Payment terms: 70% balance paid before shipment." }
    });
    expect(prisma.extractedField.deleteMany).toHaveBeenCalledWith({ where: { sourceMaterialId: "mat-1" } });
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it("refuses to update a material from another order", async () => {
    const prisma = {
      material: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn()
      },
      extractedField: {
        deleteMany: vi.fn(),
        createMany: vi.fn()
      },
      auditLog: {
        create: vi.fn()
      }
    };

    await expect(
      updateTextMaterial(prisma, {
        materialId: "mat-1",
        orderId: "order-2",
        title: "PO",
        content: "Payment terms: 70% balance paid before shipment.",
        actorRole: "业务员"
      })
    ).rejects.toThrow("Material not found for this order");

    expect(prisma.material.update).not.toHaveBeenCalled();
    expect(prisma.extractedField.deleteMany).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
  });
});
