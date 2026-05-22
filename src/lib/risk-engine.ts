import type { RiskRuleDefinition, RiskSeverity } from "./risk-rules";

export type TextMaterialInput = {
  id: string;
  title: string;
  content: string;
};

export type RiskMatch = {
  ruleId: string;
  riskType: string;
  severity: RiskSeverity;
  originalText: string;
  businessExplanation: string;
  suggestedRevision: string;
  requiredMaterials: string[];
  requiresHumanReview: boolean;
  ruleSource: string;
  materialId: string;
  materialTitle: string;
};

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function includesAny(text: string, values: string[] | undefined) {
  if (!values?.length) {
    return true;
  }
  return values.some((value) => text.includes(normalize(value)));
}

function includesAll(text: string, values: string[] | undefined) {
  if (!values?.length) {
    return true;
  }
  return values.every((value) => text.includes(normalize(value)));
}

function excludesAny(text: string, values: string[] | undefined) {
  if (!values?.length) {
    return false;
  }
  return values.some((value) => text.includes(normalize(value)));
}

function findMatchedPhrase(text: string, rule: RiskRuleDefinition) {
  return [...(rule.trigger.includeAll ?? []), ...(rule.trigger.includeAny ?? [])].find((phrase) =>
    text.includes(normalize(phrase))
  );
}

function extractOriginalText(content: string, matchedPhrase: string | undefined) {
  if (!matchedPhrase) {
    return content.slice(0, 220);
  }

  const normalizedContent = normalize(content);
  const index = normalizedContent.indexOf(normalize(matchedPhrase));
  if (index < 0) {
    return content.slice(0, 220);
  }

  const start = Math.max(0, index - 40);
  const end = Math.min(content.length, index + matchedPhrase.length + 80);
  return content.slice(start, end).trim();
}

export function analyzeTextMaterials(materials: TextMaterialInput[], rules: RiskRuleDefinition[]) {
  const matches: RiskMatch[] = [];

  for (const material of materials) {
    const text = normalize(`${material.title}\n${material.content}`);
    for (const rule of rules) {
      if (!includesAll(text, rule.trigger.includeAll)) {
        continue;
      }
      if (!includesAny(text, rule.trigger.includeAny)) {
        continue;
      }
      if (excludesAny(text, rule.trigger.excludeAny)) {
        continue;
      }

      matches.push({
        ruleId: rule.ruleId,
        riskType: rule.riskType,
        severity: rule.severity,
        originalText: extractOriginalText(material.content, findMatchedPhrase(text, rule)),
        businessExplanation: rule.businessExplanation,
        suggestedRevision: rule.suggestedRevision,
        requiredMaterials: rule.requiredMaterials,
        requiresHumanReview: rule.requiresHumanReview,
        ruleSource: rule.source,
        materialId: material.id,
        materialTitle: material.title
      });
    }
  }

  return matches;
}
