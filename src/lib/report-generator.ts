import { existsSync } from "node:fs";
import PDFDocument from "pdfkit";

export type ReportTypeValue = "SALES" | "OWNER" | "LEGAL" | "EVIDENCE";

export type ReportData = {
  type: ReportTypeValue;
  order: {
    name: string;
    buyerName: string;
    sellerName: string;
    destinationCountry: string;
    amount: number;
    currency: string;
    riskLevel: string;
  };
  materials: Array<{ type: string; title: string }>;
  fields: Array<{ fieldKey: string; fieldValue: string }>;
  risks: Array<{
    ruleId: string;
    severity: string;
    riskType: string;
    originalText: string;
    businessExplanation: string;
    suggestedRevision: string;
    ruleSource: string;
    requiredMaterials: string[];
    reviewDecisions: Array<{ reviewerRole: string; reviewerName: string; comment: string; version: number }>;
  }>;
  evidenceEvents: Array<{ title: string; proofTarget: string; missingMaterials: string[] }>;
};

const disclaimer =
  "本系统输出仅供业务风险识别、材料整理和内部辅助决策参考，不构成正式法律意见。重大合同修改、争议解决策略、适用法律选择、目的国强监管事项和复杂争议处理，应由企业法务、外部律师或负责人确认。";

function findChineseFont() {
  const candidates = [
    "C:/Windows/Fonts/NotoSansSC-VF.ttf",
    "C:/Windows/Fonts/simhei.ttf",
    "C:/Windows/Fonts/Deng.ttf",
    "C:/Windows/Fonts/simfang.ttf",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.otf",
    "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"
  ];
  return candidates.find((path) => existsSync(path));
}

function reportTitle(type: ReportTypeValue) {
  const titles: Record<ReportTypeValue, string> = {
    SALES: "业务员版风险报告",
    OWNER: "负责人版风险报告",
    LEGAL: "法务版风险报告",
    EVIDENCE: "证据包摘要"
  };
  return titles[type];
}

function writeSection(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.8).fontSize(15).text(title).moveDown(0.3).fontSize(10);
}

function writeLine(doc: PDFKit.PDFDocument, label: string, value: string | number) {
  doc.text(`${label}: ${value}`);
}

export async function generateReportPdfBuffer(data: ReportData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 48, size: "A4", compress: false });
  const chunks: Buffer[] = [];

  const font = findChineseFont();
  if (font) {
    doc.registerFont("cn", font);
    doc.font("cn");
  }

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(20).text(`TradeLaw AI ${reportTitle(data.type)}`);
  doc.moveDown(0.5).fontSize(10).text(disclaimer);

  writeSection(doc, "订单信息");
  writeLine(doc, "订单", data.order.name);
  writeLine(doc, "买方", data.order.buyerName);
  writeLine(doc, "卖方", data.order.sellerName);
  writeLine(doc, "目的国", data.order.destinationCountry);
  writeLine(doc, "金额", `${data.order.currency} ${data.order.amount.toLocaleString()}`);
  writeLine(doc, "风险等级", data.order.riskLevel);

  writeSection(doc, "材料列表");
  data.materials.forEach((material) => writeLine(doc, material.type, material.title));

  writeSection(doc, "字段抽取结果");
  data.fields.forEach((field) => writeLine(doc, field.fieldKey, field.fieldValue));

  writeSection(doc, "风险卡片");
  data.risks.forEach((risk, index) => {
    doc.moveDown(0.4).fontSize(12).text(`${index + 1}. ${risk.ruleId} ${risk.severity} ${risk.riskType}`).fontSize(10);
    writeLine(doc, "原文或命中事实", risk.originalText);
    writeLine(doc, "规则来源", risk.ruleSource);
    writeLine(doc, "风险解释", risk.businessExplanation);
    writeLine(doc, "修改建议", risk.suggestedRevision);
    writeLine(doc, "需要补充材料", risk.requiredMaterials.join("、"));
    if (risk.reviewDecisions.length > 0) {
      risk.reviewDecisions.forEach((decision) =>
        writeLine(doc, "人工复核意见", `v${decision.version} ${decision.reviewerRole} ${decision.reviewerName}: ${decision.comment}`)
      );
    }
  });

  writeSection(doc, "证据缺口");
  data.evidenceEvents.forEach((event) => {
    writeLine(doc, event.title, `${event.proofTarget}; 缺失：${event.missingMaterials.join("、") || "无"}`);
  });

  doc.end();
  return done;
}
