"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAuditLog } from "@/lib/audit";
import { importDemoCase } from "@/lib/demo-cases";
import { prisma } from "@/lib/db";
import { importTextMaterial, toMaterialType } from "@/lib/material-service";
import { addEvidenceEvent, toEvidenceEventType } from "@/lib/evidence-service";
import { saveReviewDecision, toReviewDecision } from "@/lib/review-service";
import { exportOrderReport } from "@/lib/report-service";
import type { ReportTypeValue } from "@/lib/report-generator";
import { scanOrderRisks } from "@/lib/scan-service";

function readString(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? "";
}

export async function createOrderAction(formData: FormData) {
  const order = await prisma.order.create({
    data: {
      name: readString(formData, "name"),
      buyerName: readString(formData, "buyerName"),
      sellerName: readString(formData, "sellerName"),
      destinationCountry: readString(formData, "destinationCountry"),
      product: readString(formData, "product"),
      amount: Number(readString(formData, "amount") || "0"),
      currency: readString(formData, "currency") || "USD",
      incoterm: readString(formData, "incoterm"),
      paymentTerms: readString(formData, "paymentTerms"),
      deliveryDate: readString(formData, "deliveryDate")
    }
  });

  await recordAuditLog(prisma, {
    actorRole: "业务员",
    action: "ORDER_CREATE",
    entityType: "Order",
    entityId: order.id,
    summary: `新建订单：${order.name}`,
    metadata: { destinationCountry: order.destinationCountry, amount: order.amount }
  });

  redirect(`/orders/${order.id}`);
}

export async function importMaterialAction(formData: FormData) {
  const orderId = readString(formData, "orderId");
  await importTextMaterial(prisma, {
    orderId,
    type: toMaterialType(readString(formData, "type")),
    title: readString(formData, "title"),
    content: readString(formData, "content"),
    actorRole: "业务员"
  });

  revalidatePath(`/orders/${orderId}`);
}

export async function scanOrderAction(formData: FormData) {
  const orderId = readString(formData, "orderId");
  await scanOrderRisks(prisma, orderId, "业务员");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}/risk-report`);
}

export async function saveReviewAction(formData: FormData) {
  const riskItemId = readString(formData, "riskItemId");
  const orderId = readString(formData, "orderId");
  await saveReviewDecision(prisma, {
    riskItemId,
    reviewerName: readString(formData, "reviewerName") || "默认复核人",
    reviewerRole: readString(formData, "reviewerRole") || "法务",
    decision: toReviewDecision(readString(formData, "decision")),
    comment: readString(formData, "comment")
  });
  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}/risk-report`);
  revalidatePath("/review");
}

export async function addEvidenceEventAction(formData: FormData) {
  const orderId = readString(formData, "orderId");
  await addEvidenceEvent(prisma, {
    orderId,
    type: toEvidenceEventType(readString(formData, "type")),
    title: readString(formData, "title"),
    eventDate: readString(formData, "eventDate"),
    uploadedMaterials: readString(formData, "uploadedMaterials")
      .split(/\r?\n|,|，/)
      .map((item) => item.trim())
      .filter(Boolean),
    missingMaterials: readString(formData, "missingMaterials")
      .split(/\r?\n|,|，/)
      .map((item) => item.trim())
      .filter(Boolean),
    proofTarget: readString(formData, "proofTarget"),
    actorRole: "跟单"
  });
  revalidatePath(`/orders/${orderId}`);
}

function toReportType(value: string): ReportTypeValue {
  return value === "SALES" || value === "OWNER" || value === "LEGAL" || value === "EVIDENCE" ? value : "OWNER";
}

export async function exportReportAction(formData: FormData) {
  const orderId = readString(formData, "orderId");
  await exportOrderReport(prisma, {
    orderId,
    type: toReportType(readString(formData, "type")),
    createdBy: readString(formData, "createdBy") || "负责人"
  });
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/reports");
}

export async function importDemoCaseAction(formData: FormData) {
  const caseId = readString(formData, "caseId");
  const order = await importDemoCase(
    prisma,
    caseId === "indonesia-ddp" || caseId === "malaysia-quality" ? caseId : "vietnam-po"
  );
  revalidatePath("/");
  revalidatePath("/orders");
  redirect(`/orders/${order.id}`);
}
