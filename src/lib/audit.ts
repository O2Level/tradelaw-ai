type AuditPrisma = {
  auditLog: {
    create: (args: {
      data: {
        actorRole: string;
        action: string;
        entityType: string;
        entityId: string;
        summary: string;
        metadata?: string;
      };
    }) => Promise<unknown>;
  };
};

export type AuditEventInput = {
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

export async function recordAuditLog(prisma: AuditPrisma, input: AuditEventInput) {
  return prisma.auditLog.create({
    data: {
      actorRole: input.actorRole,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      metadata: input.metadata ? JSON.stringify(input.metadata) : undefined
    }
  });
}
