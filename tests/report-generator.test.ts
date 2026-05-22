import { describe, expect, it } from "vitest";
import { generateReportPdfBuffer } from "@/lib/report-generator";

describe("generateReportPdfBuffer", () => {
  it("creates a real PDF buffer from order, risk, review and evidence data", async () => {
    const buffer = await generateReportPdfBuffer({
      type: "LEGAL",
      order: {
        name: "Vietnam PO",
        buyerName: "VietHome",
        sellerName: "Shenzhen Bright",
        destinationCountry: "Vietnam",
        amount: 48000,
        currency: "USD",
        riskLevel: "RED"
      },
      materials: [{ type: "PO", title: "Vietnam buyer PO" }],
      fields: [{ fieldKey: "paymentTerms", fieldValue: "70% balance paid after arrival and buyer inspection" }],
      risks: [
        {
          ruleId: "R-PAY-001",
          severity: "RED",
          riskType: "付款风险",
          originalText: "70% balance paid after arrival and buyer inspection",
          businessExplanation: "货物离境后卖方控制力下降。",
          suggestedRevision: "建议发货前付清尾款。",
          ruleSource: "外贸付款保护实务规则",
          requiredMaterials: ["合同", "PO"],
          reviewDecisions: [{ reviewerRole: "法务", reviewerName: "王法务", comment: "要求修改付款条款", version: 1 }]
        }
      ],
      evidenceEvents: [{ title: "发货", proofTarget: "证明已发货", missingMaterials: ["提单"] }]
    });

    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(buffer.length).toBeGreaterThan(1000);
  });
});
