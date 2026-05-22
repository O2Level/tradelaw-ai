"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { importTextMaterial, toMaterialType } from "@/lib/material-service";
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
