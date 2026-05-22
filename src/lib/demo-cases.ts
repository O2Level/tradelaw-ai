import { addEvidenceEvent } from "./evidence-service";
import { importTextMaterial } from "./material-service";
import { scanOrderRisks } from "./scan-service";
import { recordAuditLog } from "./audit";
import type { PrismaClient } from "@prisma/client";

export type DemoCaseId = "vietnam-po" | "indonesia-ddp" | "malaysia-quality";

type DemoCase = {
  caseId: DemoCaseId;
  order: {
    name: string;
    destinationCountry: string;
    buyerName: string;
    sellerName: string;
    product: string;
    amount: number;
    currency: string;
    incoterm: string;
    paymentTerms: string;
    deliveryDate: string;
  };
  materials: Array<{ type: "CONTRACT" | "PO" | "PI" | "CHAT_SUMMARY" | "INSPECTION_REPORT" | "BILL_OF_LADING" | "INVOICE" | "RECEIPT_CONFIRMATION"; title: string; content: string }>;
  evidence: Array<{ type: "SIGNING" | "PRODUCTION" | "INSPECTION" | "SHIPMENT" | "PAYMENT" | "OBJECTION" | "COLLECTION"; title: string; uploadedMaterials: string[]; missingMaterials: string[]; proofTarget: string }>;
};

export const demoCases: DemoCase[] = [
  {
    caseId: "vietnam-po",
    order: {
      name: "Vietnam Buyer PO - Arrival Balance Risk",
      destinationCountry: "Vietnam",
      buyerName: "VietHome Trading Co., Ltd.",
      sellerName: "Shenzhen Bright Export Ltd.",
      product: "LED lamps",
      amount: 48000,
      currency: "USD",
      incoterm: "FOB Shenzhen",
      paymentTerms: "30% deposit, 70% balance paid after arrival and buyer inspection",
      deliveryDate: "2026-07-30"
    },
    materials: [
      {
        type: "PO",
        title: "Vietnam buyer PO",
        content: `Buyer: VietHome Trading Co., Ltd.
Seller: Shenzhen Bright Export Ltd.
Destination Country: Vietnam
Product: LED lamps
Quantity: 1000 pcs
Amount: USD 48,000
Incoterm: FOB Shenzhen
Payment terms: 30% deposit, 70% balance paid after arrival and buyer inspection.
Delivery date: 2026-07-30
Inspection: buyer inspection after arrival.
Purchase order without governing law or dispute resolution.`
      },
      {
        type: "PI",
        title: "PI for LED lamps",
        content: "Commercial invoice and PI confirm USD 48,000, 1000 pcs LED lamps, FOB Shenzhen, shipment in July 2026."
      },
      {
        type: "CHAT_SUMMARY",
        title: "Email summary",
        content: "Buyer asks to inspect goods after arrival before paying 70% balance. Seller has not obtained late payment penalty or L/C protection."
      }
    ],
    evidence: [
      {
        type: "SIGNING",
        title: "PO and PI confirmation",
        uploadedMaterials: ["PO", "PI"],
        missingMaterials: ["客户付款保护确认", "争议解决条款确认"],
        proofTarget: "证明订单条款和付款安排"
      }
    ]
  },
  {
    caseId: "indonesia-ddp",
    order: {
      name: "Indonesia Buyer DDP - Clearance Risk",
      destinationCountry: "Indonesia",
      buyerName: "Jakarta Retail Group",
      sellerName: "Ningbo Homeware Export Ltd.",
      product: "Kitchen storage boxes",
      amount: 86000,
      currency: "USD",
      incoterm: "DDP Jakarta",
      paymentTerms: "40% deposit, 60% before delivery",
      deliveryDate: "2026-08-15"
    },
    materials: [
      {
        type: "CONTRACT",
        title: "Sales contract DDP Jakarta",
        content: "Buyer: Jakarta Retail Group\nSeller: Ningbo Homeware Export Ltd.\nDestination Country: Indonesia\nProduct: Kitchen storage boxes\nAmount: USD 86,000\nIncoterm: DDP Jakarta\nThe seller shall deliver under DDP terms. Import clearance, taxes, port storage and demurrage are not further allocated."
      },
      {
        type: "PO",
        title: "Indonesia PO",
        content: "PO requires DDP Jakarta delivery and destination country compliance documents, but buyer has not listed import license materials."
      }
    ],
    evidence: [
      {
        type: "SHIPMENT",
        title: "Destination documents checklist",
        uploadedMaterials: ["合同", "PO"],
        missingMaterials: ["进口许可证", "税费承担确认", "滞港费承担确认"],
        proofTarget: "证明目的国清关资料责任和费用边界"
      }
    ]
  },
  {
    caseId: "malaysia-quality",
    order: {
      name: "Malaysia Quality Objection - Evidence Gap",
      destinationCountry: "Malaysia",
      buyerName: "MY Home Supply Sdn. Bhd.",
      sellerName: "Foshan Fixtures Export Ltd.",
      product: "Bathroom fixtures",
      amount: 62000,
      currency: "USD",
      incoterm: "CIF Port Klang",
      paymentTerms: "30% deposit, unpaid balance after receipt confirmation",
      deliveryDate: "2026-06-20"
    },
    materials: [
      {
        type: "CONTRACT",
        title: "Malaysia sales contract",
        content: "Buyer: MY Home Supply Sdn. Bhd.\nSeller: Foshan Fixtures Export Ltd.\nDestination Country: Malaysia\nProduct: Bathroom fixtures\nAmount: USD 62,000\nIncoterm: CIF Port Klang\nQuality claim can be raised after receipt, but no clear objection period is stated."
      },
      {
        type: "INSPECTION_REPORT",
        title: "Factory inspection report",
        content: "Factory inspection completed before shipment. Some buyer confirmation records are missing."
      },
      {
        type: "RECEIPT_CONFIRMATION",
        title: "Receipt confirmation summary",
        content: "Buyer received goods and raised quality claim much later, leaving unpaid balance unresolved."
      }
    ],
    evidence: [
      {
        type: "OBJECTION",
        title: "Late quality objection",
        uploadedMaterials: ["质检报告", "发票", "收货确认"],
        missingMaterials: ["验货照片", "客户签收原件", "催款记录"],
        proofTarget: "证明客户迟延提出质量异议并拒付尾款"
      }
    ]
  }
];

export function getDemoCase(caseId: DemoCaseId) {
  const demo = demoCases.find((item) => item.caseId === caseId);
  if (!demo) {
    throw new Error(`Unknown demo case: ${caseId}`);
  }
  return demo;
}

export async function importDemoCase(prisma: PrismaClient, caseId: DemoCaseId) {
  const demo = getDemoCase(caseId);
  const order = await prisma.order.create({
    data: demo.order
  });

  await recordAuditLog(prisma, {
    actorRole: "system",
    action: "DEMO_IMPORT",
    entityType: "Order",
    entityId: order.id,
    summary: `导入演示案例：${demo.order.name}`,
    metadata: { caseId }
  });

  for (const material of demo.materials) {
    await importTextMaterial(prisma, {
      orderId: order.id,
      type: material.type,
      title: material.title,
      content: material.content,
      actorRole: "system"
    });
  }

  for (const event of demo.evidence) {
    await addEvidenceEvent(prisma, {
      orderId: order.id,
      type: event.type,
      title: event.title,
      uploadedMaterials: event.uploadedMaterials,
      missingMaterials: event.missingMaterials,
      proofTarget: event.proofTarget,
      actorRole: "system"
    });
  }

  await scanOrderRisks(prisma, order.id, "system");
  return order;
}

export async function importAllDemoCases(prisma: PrismaClient) {
  const imported = [];
  for (const demo of demoCases) {
    imported.push(await importDemoCase(prisma, demo.caseId));
  }
  return imported;
}
