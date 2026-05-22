import { recordAuditLog } from "./audit";

export const evidenceEventTypes = ["SIGNING", "PRODUCTION", "INSPECTION", "SHIPMENT", "PAYMENT", "OBJECTION", "COLLECTION", "OTHER"] as const;

export type EvidenceEventTypeValue = (typeof evidenceEventTypes)[number];

export function toEvidenceEventType(value: string): EvidenceEventTypeValue {
  return evidenceEventTypes.includes(value as EvidenceEventTypeValue) ? (value as EvidenceEventTypeValue) : "OTHER";
}

type EvidencePrisma = {
  evidenceEvent: {
    create: (args: {
      data: {
        orderId: string;
        type: EvidenceEventTypeValue;
        title: string;
        eventDate?: Date;
        uploadedMaterials: string;
        missingMaterials: string;
        proofTarget: string;
      };
    }) => Promise<{ id: string; orderId: string; title: string }>;
  };
  auditLog: {
    create: Parameters<typeof recordAuditLog>[0]["auditLog"]["create"];
  };
};

export async function addEvidenceEvent(
  prisma: EvidencePrisma,
  input: {
    orderId: string;
    type: EvidenceEventTypeValue;
    title: string;
    eventDate?: string;
    uploadedMaterials: string[];
    missingMaterials: string[];
    proofTarget: string;
    actorRole: string;
  }
) {
  const event = await prisma.evidenceEvent.create({
    data: {
      orderId: input.orderId,
      type: input.type,
      title: input.title,
      eventDate: input.eventDate ? new Date(input.eventDate) : undefined,
      uploadedMaterials: JSON.stringify(input.uploadedMaterials),
      missingMaterials: JSON.stringify(input.missingMaterials),
      proofTarget: input.proofTarget
    }
  });

  await recordAuditLog(prisma, {
    actorRole: input.actorRole,
    action: "EVIDENCE_EVENT_CREATE",
    entityType: "EvidenceEvent",
    entityId: event.id,
    summary: `新增证据节点：${event.title}`,
    metadata: { orderId: event.orderId }
  });

  return event;
}
