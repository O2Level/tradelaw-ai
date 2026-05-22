export type ExtractedOrderFields = {
  buyerName?: string;
  sellerName?: string;
  destinationCountry?: string;
  product?: string;
  quantity?: string;
  amount?: string;
  incoterm?: string;
  paymentTerms?: string;
  deliveryDate?: string;
  inspectionMethod?: string;
  disputeResolution?: string;
};

export type ExtractedFieldRow = {
  fieldKey: keyof ExtractedOrderFields;
  fieldValue: string;
  evidenceText: string;
  confidence: number;
};

const fieldPatterns: Array<[keyof ExtractedOrderFields, RegExp]> = [
  ["buyerName", /(?:buyer|buyer name|purchaser)\s*:\s*(.+)/i],
  ["sellerName", /(?:seller|seller name|supplier)\s*:\s*(.+)/i],
  ["destinationCountry", /(?:destination country|destination|country)\s*:\s*(.+)/i],
  ["product", /(?:product|goods|commodity)\s*:\s*(.+)/i],
  ["quantity", /(?:quantity|qty)\s*:\s*(.+)/i],
  ["amount", /(?:amount|total amount|contract value|order value)\s*:\s*(.+)/i],
  ["incoterm", /(?:incoterm|trade term|trade terms)\s*:\s*(.+)/i],
  ["paymentTerms", /(?:payment terms|payment)\s*:\s*(.+)/i],
  ["deliveryDate", /(?:delivery date|shipment date|delivery)\s*:\s*(.+)/i],
  ["inspectionMethod", /(?:inspection|inspection method|acceptance)\s*:\s*(.+)/i],
  ["disputeResolution", /(?:dispute resolution|jurisdiction|arbitration)\s*:\s*(.+)/i]
];

function cleanValue(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function extractOrderFields(text: string): ExtractedOrderFields {
  const fields: ExtractedOrderFields = {};
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const [key, pattern] of fieldPatterns) {
    const matchedLine = lines.find((line) => pattern.test(line));
    if (!matchedLine) {
      continue;
    }
    const match = matchedLine.match(pattern);
    if (match?.[1]) {
      fields[key] = cleanValue(match[1]);
    }
  }

  return fields;
}

export function toExtractedFieldRows(fields: ExtractedOrderFields): ExtractedFieldRow[] {
  return Object.entries(fields).map(([fieldKey, fieldValue]) => ({
    fieldKey: fieldKey as keyof ExtractedOrderFields,
    fieldValue,
    evidenceText: fieldValue,
    confidence: 0.82
  }));
}
