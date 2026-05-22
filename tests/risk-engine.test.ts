import { describe, expect, it } from "vitest";
import { analyzeTextMaterials } from "@/lib/risk-engine";
import { seedRiskRules } from "@/lib/risk-rules";

describe("risk engine", () => {
  it("ships at least 25 seed rules with R-PAY-001", () => {
    expect(seedRiskRules.length).toBeGreaterThanOrEqual(25);
    expect(seedRiskRules.some((rule) => rule.ruleId === "R-PAY-001")).toBe(true);
  });

  it("matches R-PAY-001 for Vietnam PO arrival and buyer inspection balance risk", () => {
    const risks = analyzeTextMaterials(
      [
        {
          id: "po-1",
          title: "Vietnam buyer PO",
          content:
            "Payment terms: 30% deposit, 70% balance paid after arrival and buyer inspection. No late payment penalty is agreed."
        }
      ],
      seedRiskRules
    );

    const payRisk = risks.find((risk) => risk.ruleId === "R-PAY-001");
    expect(payRisk?.severity).toBe("RED");
    expect(payRisk?.originalText).toContain("70% balance paid after arrival and buyer inspection");
    expect(payRisk?.requiresHumanReview).toBe(true);
  });

  it("does not match R-PAY-001 when the balance is protected before shipment", () => {
    const risks = analyzeTextMaterials(
      [
        {
          id: "po-1",
          title: "Safer PO",
          content:
            "Payment terms: 30% deposit, 70% balance paid before shipment. Seller may suspend shipment for overdue payment."
        }
      ],
      seedRiskRules
    );

    expect(risks.some((risk) => risk.ruleId === "R-PAY-001")).toBe(false);
  });
});
