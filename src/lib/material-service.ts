import { recordAuditLog } from "./audit";
import { extractOrderFields, toExtractedFieldRows } from "./extraction";

const sensitivityNote = "请先脱敏客户个人信息、私人联系方式和非必要商业秘密。";

export const materialTypes = [
  "CONTRACT",
  "PO",
  "PI",
  "CHAT_SUMMARY",
  "INVOICE",
  "PACKING_LIST",
  "BILL_OF_LADING",
  "INSPECTION_REPORT",
  "RECEIPT_CONFIRMATION",
  "OTHER"
] as const;

export type MaterialTypeValue = (typeof materialTypes)[number];

export function toMaterialType(value: string): MaterialTypeValue {
  return materialTypes.includes(value as MaterialTypeValue) ? (value as MaterialTypeValue) : "OTHER";
}

type MaterialPrisma = {
  material: {
    create: (args: {
      data: {
        orderId: string;
        type: MaterialTypeValue;
        title: string;
        content: string;
        sensitivityNote: string;
      };
    }) => Promise<{ id: string; title: string }>;
    findFirst?: (args: {
      where: { id: string; orderId: string };
      select: { id: true; orderId: true };
    }) => Promise<{ id: string; orderId: string } | null>;
  };
  extractedField: {
    deleteMany?: (args: { where: { sourceMaterialId: string } }) => Promise<unknown>;
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
  type: MaterialTypeValue;
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

type MaterialUpdatePrisma = MaterialPrisma & {
  material: MaterialPrisma["material"] & {
    findFirst: (args: {
      where: { id: string; orderId: string };
      select: { id: true; orderId: true };
    }) => Promise<{ id: string; orderId: string } | null>;
    update: (args: {
      where: { id: string };
      data: { title: string; content: string };
    }) => Promise<{ id: string; orderId: string; title: string }>;
  };
  extractedField: Required<Pick<MaterialPrisma["extractedField"], "deleteMany" | "createMany">>;
};

export async function updateTextMaterial(
  prisma: MaterialUpdatePrisma,
  input: {
    materialId: string;
    orderId: string;
    title: string;
    content: string;
    actorRole: string;
  }
) {
  const existingMaterial = await prisma.material.findFirst({
    where: { id: input.materialId, orderId: input.orderId },
    select: { id: true, orderId: true }
  });
  if (!existingMaterial) {
    throw new Error("Material not found for this order");
  }

  const material = await prisma.material.update({
    where: { id: input.materialId },
    data: {
      title: input.title,
      content: input.content
    }
  });

  await prisma.extractedField.deleteMany({ where: { sourceMaterialId: material.id } });

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
    action: "MATERIAL_UPDATE",
    entityType: "Material",
    entityId: material.id,
    summary: `更新材料：${material.title}`,
    metadata: {
      orderId: material.orderId,
      extractedFields: extractedRows.length
    }
  });

  return {
    material,
    extractedFields: extractedRows
  };
}
