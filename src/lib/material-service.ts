import { recordAuditLog } from "./audit";
import { extractOrderFields, toExtractedFieldRows } from "./extraction";

const sensitivityNote = "请先脱敏客户个人信息、私人联系方式和非必要商业秘密。";

type MaterialPrisma = {
  material: {
    create: (args: {
      data: {
        orderId: string;
        type: string;
        title: string;
        content: string;
        sensitivityNote: string;
      };
    }) => Promise<{ id: string; title: string }>;
  };
  extractedField: {
    createMany: (args: {
      data: Array<{
        orderId: string;
        sourceMaterialId: string;
        fieldKey: string;
        fieldValue: string;
        evidenceText: string;
        confidence: number;
      }>;
    }) => Promise<unknown>;
  };
  auditLog: {
    create: Parameters<typeof recordAuditLog>[0]["auditLog"]["create"];
  };
};

export type ImportTextMaterialInput = {
  orderId: string;
  type: string;
  title: string;
  content: string;
  actorRole: string;
};

export async function importTextMaterial(prisma: MaterialPrisma, input: ImportTextMaterialInput) {
  const material = await prisma.material.create({
    data: {
      orderId: input.orderId,
      type: input.type,
      title: input.title,
      content: input.content,
      sensitivityNote
    }
  });

  const extractedRows = toExtractedFieldRows(extractOrderFields(input.content));
  if (extractedRows.length > 0) {
    await prisma.extractedField.createMany({
      data: extractedRows.map((row) => ({
        orderId: input.orderId,
        sourceMaterialId: material.id,
        fieldKey: row.fieldKey,
        fieldValue: row.fieldValue,
        evidenceText: row.evidenceText,
        confidence: row.confidence
      }))
    });
  }

  await recordAuditLog(prisma, {
    actorRole: input.actorRole,
    action: "MATERIAL_IMPORT",
    entityType: "Material",
    entityId: material.id,
    summary: `导入材料：${material.title}`,
    metadata: {
      orderId: input.orderId,
      extractedFields: extractedRows.length
    }
  });

  return {
    material,
    extractedFields: extractedRows
  };
}
