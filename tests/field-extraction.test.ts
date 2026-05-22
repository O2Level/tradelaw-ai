import { describe, expect, it } from "vitest";
import { extractOrderFields } from "@/lib/extraction";

describe("extractOrderFields", () => {
  it("extracts key order fields from pasted PO and PI text", () => {
    const fields = extractOrderFields(`
      Buyer: VietHome Trading Co., Ltd.
      Seller: Shenzhen Bright Export Ltd.
      Destination Country: Vietnam
      Product: LED lamps
      Quantity: 1000 pcs
      Amount: USD 48,000
      Incoterm: FOB Shenzhen
      Payment terms: 30% deposit, 70% balance paid after arrival and buyer inspection.
      Delivery date: 2026-07-30
      Inspection: buyer inspection within 7 days after arrival.
      Dispute resolution: arbitration in Singapore, proceedings shall be English.
    `);

    expect(fields).toMatchObject({
      buyerName: "VietHome Trading Co., Ltd.",
      sellerName: "Shenzhen Bright Export Ltd.",
      destinationCountry: "Vietnam",
      product: "LED lamps",
      quantity: "1000 pcs",
      amount: "USD 48,000",
      incoterm: "FOB Shenzhen",
      paymentTerms: "30% deposit, 70% balance paid after arrival and buyer inspection.",
      deliveryDate: "2026-07-30",
      inspectionMethod: "buyer inspection within 7 days after arrival.",
      disputeResolution: "arbitration in Singapore, proceedings shall be English."
    });
  });
});
