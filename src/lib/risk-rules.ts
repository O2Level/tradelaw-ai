export type RiskSeverity = "GREEN" | "YELLOW" | "RED";

export type RuleTrigger = {
  includeAny?: string[];
  includeAll?: string[];
  excludeAny?: string[];
};

export type RiskRuleDefinition = {
  ruleId: string;
  riskType: string;
  scenario: string;
  trigger: RuleTrigger;
  severity: RiskSeverity;
  businessExplanation: string;
  suggestedRevision: string;
  requiredMaterials: string[];
  requiresHumanReview: boolean;
  source: string;
  lastUpdated: string;
};

const updated = "2026-05-22";

export const seedRiskRules: RiskRuleDefinition[] = [
  {
    ruleId: "R-PAY-001",
    riskType: "付款风险",
    scenario: "尾款到港、转售或买方验货后支付且缺少付款保护",
    trigger: {
      includeAny: ["balance paid after arrival", "after resale", "after buyer inspection"],
      excludeAny: [
        "letter of credit",
        "l/c at sight",
        "bank guarantee",
        "standby letter of credit",
        "balance paid before shipment",
        "paid before shipment",
        "seller may suspend shipment",
        "bill of lading copy against payment",
        "documents against payment"
      ]
    },
    severity: "RED",
    businessExplanation:
      "货物离境或到港后卖方控制力下降，若尾款依赖买方验货或转售，回款和追偿成本会显著上升。",
    suggestedRevision:
      "建议改为发货前付清尾款、凭提单副本付款、信用证付款，补充逾期付款责任，并保留暂停发货权利。",
    requiredMaterials: ["合同", "PO", "PI", "付款确认", "提单控制安排"],
    requiresHumanReview: true,
    source: "外贸付款保护实务规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-PAY-002",
    riskType: "付款风险",
    scenario: "尾款比例过高",
    trigger: { includeAny: ["70% balance", "80% balance", "90% balance"] },
    severity: "YELLOW",
    businessExplanation: "尾款比例过高会放大买方拒付或拖延付款对现金流的影响。",
    suggestedRevision: "建议提高预付款比例，或设置分阶段付款和单据控制条件。",
    requiredMaterials: ["PO", "PI", "付款计划"],
    requiresHumanReview: false,
    source: "外贸付款节点实务规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-PAY-003",
    riskType: "付款风险",
    scenario: "缺少逾期付款责任",
    trigger: { includeAny: ["payment terms"], excludeAny: ["overdue interest", "late payment interest", "penalty for overdue payment"] },
    severity: "YELLOW",
    businessExplanation: "未约定逾期付款责任时，客户拖延付款的违约成本不清晰。",
    suggestedRevision: "补充逾期利息、催款费用承担和暂停交付权利。",
    requiredMaterials: ["合同", "付款条款"],
    requiresHumanReview: false,
    source: "合同违约责任基础规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-PAY-004",
    riskType: "付款风险",
    scenario: "首次合作客户付款保护不足",
    trigger: { includeAny: ["first order", "new customer", "first cooperation"], excludeAny: ["letter of credit", "full payment before shipment"] },
    severity: "YELLOW",
    businessExplanation: "首次合作客户缺少信用历史，应提高付款保护和单据控制。",
    suggestedRevision: "建议采用更高预付款、信用证、担保或发货前结清尾款。",
    requiredMaterials: ["客户基础资料", "付款条款", "内部审批记录"],
    requiresHumanReview: true,
    source: "外贸客户初次合作风控规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-PAY-005",
    riskType: "付款风险",
    scenario: "客户转售后付款",
    trigger: { includeAny: ["after resale", "after sell-through"] },
    severity: "RED",
    businessExplanation: "付款取决于买方后续转售，卖方承担了不应由自己承担的库存和市场销售风险。",
    suggestedRevision: "删除转售后付款条件，改为明确交货或单据付款节点。",
    requiredMaterials: ["合同", "客户付款承诺"],
    requiresHumanReview: true,
    source: "外贸回款风险实务规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-PAY-006",
    riskType: "付款风险",
    scenario: "客户验收后付款但验收标准不明",
    trigger: { includeAny: ["payment after acceptance", "after buyer acceptance", "after buyer inspection"] },
    severity: "RED",
    businessExplanation: "付款和买方验收绑定时，若验收期限和标准不明，买方可能利用验收拖延付款。",
    suggestedRevision: "明确验收标准、验收期限、逾期默认验收和付款触发条件。",
    requiredMaterials: ["验货标准", "质检报告", "付款条款"],
    requiresHumanReview: true,
    source: "验收付款风险实务规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-TERM-001",
    riskType: "贸易术语风险",
    scenario: "DDP 进口清关责任不清",
    trigger: { includeAny: ["ddp"], excludeAny: ["import clearance by buyer", "buyer shall provide import license"] },
    severity: "RED",
    businessExplanation: "DDP 下卖方可能承担目的国进口清关、税费和合规资料责任，边界不清会引发滞港和罚款。",
    suggestedRevision: "明确进口清关主体、税费承担、资料提供责任和滞港费分担。",
    requiredMaterials: ["合同", "贸易术语说明", "目的国资料清单"],
    requiresHumanReview: true,
    source: "Incoterms 及外贸清关实务规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-TERM-002",
    riskType: "贸易术语风险",
    scenario: "DDP 税费和滞港费承担不明",
    trigger: { includeAny: ["ddp", "demurrage", "port storage"], excludeAny: ["taxes borne by buyer", "demurrage borne by buyer"] },
    severity: "RED",
    businessExplanation: "目的港税费、滞港费和仓储费没有明确承担主体时，卖方可能被动承担额外成本。",
    suggestedRevision: "补充税费、滞港费、仓储费和资料迟延导致费用的承担条款。",
    requiredMaterials: ["合同", "物流条款", "目的港费用说明"],
    requiresHumanReview: true,
    source: "目的港费用实务规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-TERM-003",
    riskType: "贸易术语风险",
    scenario: "FOB/CIF 责任边界不清",
    trigger: { includeAny: ["fob", "cif"], excludeAny: ["risk transfers", "risk shall pass"] },
    severity: "YELLOW",
    businessExplanation: "FOB/CIF 条款未写明风险转移、保险和装运责任，容易产生责任边界争议。",
    suggestedRevision: "明确风险转移节点、保险范围、装船责任和通知义务。",
    requiredMaterials: ["合同", "物流安排", "保险单"],
    requiresHumanReview: false,
    source: "Incoterms 基础规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-TERM-004",
    riskType: "贸易术语风险",
    scenario: "客户指定货代且单据控制不足",
    trigger: { includeAny: ["buyer nominated forwarder", "customer appointed forwarder"], excludeAny: ["seller controls bill of lading"] },
    severity: "YELLOW",
    businessExplanation: "客户指定货代时，若卖方不能控制提单和放货指令，可能出现货权控制不足。",
    suggestedRevision: "保留提单控制权，明确无付款不得放单或电放。",
    requiredMaterials: ["货代信息", "提单草稿", "付款记录"],
    requiresHumanReview: true,
    source: "单据控制实务规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-TERM-005",
    riskType: "贸易术语风险",
    scenario: "EXW 出口清关责任不明",
    trigger: { includeAny: ["exw"], excludeAny: ["export clearance by buyer", "export declaration responsibility"] },
    severity: "YELLOW",
    businessExplanation: "EXW 下出口清关和装货责任若未明确，可能影响报关、装运和责任划分。",
    suggestedRevision: "明确装货、出口清关、报关资料和费用承担。",
    requiredMaterials: ["合同", "报关资料", "物流安排"],
    requiresHumanReview: false,
    source: "Incoterms 基础规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-QA-001",
    riskType: "验货和质量异议风险",
    scenario: "未约定验货期限",
    trigger: { includeAny: ["inspection"], excludeAny: ["inspection within", "inspection period"] },
    severity: "YELLOW",
    businessExplanation: "缺少验货期限会让买方在收货后较长时间提出异议。",
    suggestedRevision: "约定收货后固定天数内完成验货，逾期视为验收。",
    requiredMaterials: ["验货报告", "收货确认"],
    requiresHumanReview: false,
    source: "质量验收实务规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-QA-002",
    riskType: "验货和质量异议风险",
    scenario: "未约定质量异议期限",
    trigger: { includeAny: ["quality claim", "quality objection"], excludeAny: ["within 7 days", "within 10 days", "within 15 days"] },
    severity: "YELLOW",
    businessExplanation: "异议期限不明会增加买方迟延拒付或索赔空间。",
    suggestedRevision: "明确质量异议期限、提出方式、证据要求和逾期后果。",
    requiredMaterials: ["质检报告", "客户异议材料", "收货确认"],
    requiresHumanReview: false,
    source: "质量异议实务规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-QA-003",
    riskType: "验货和质量异议风险",
    scenario: "缺少验货标准",
    trigger: { includeAny: ["inspection"], excludeAny: ["aql", "inspection standard", "technical specification"] },
    severity: "YELLOW",
    businessExplanation: "验货标准不明确时，买方可能以主观标准拒收或压价。",
    suggestedRevision: "写明技术标准、抽检标准、样品确认和检验机构。",
    requiredMaterials: ["规格书", "样品确认", "验货标准"],
    requiresHumanReview: false,
    source: "外贸质量检验实务规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-QA-004",
    riskType: "验货和质量异议风险",
    scenario: "缺少第三方检验机制",
    trigger: { includeAny: ["quality dispute", "inspection dispute"], excludeAny: ["third-party inspection", "sgs", "bureau veritas"] },
    severity: "YELLOW",
    businessExplanation: "争议时缺少独立检验机制会增加举证和谈判成本。",
    suggestedRevision: "约定第三方检验机构、检验地点、费用承担和效力。",
    requiredMaterials: ["质检报告", "第三方检验条款"],
    requiresHumanReview: false,
    source: "第三方检验实务规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-QA-005",
    riskType: "验货和质量异议风险",
    scenario: "缺少逾期默认验收规则",
    trigger: { includeAny: ["acceptance", "inspection"], excludeAny: ["deemed accepted", "deemed acceptance"] },
    severity: "YELLOW",
    businessExplanation: "没有默认验收规则时，验收状态可能长期悬空并影响尾款。",
    suggestedRevision: "约定买方逾期未提出书面异议则视为验收合格。",
    requiredMaterials: ["收货确认", "验货记录"],
    requiresHumanReview: false,
    source: "验收条款实务规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-DISPUTE-001",
    riskType: "争议解决风险",
    scenario: "未约定适用法律",
    trigger: { includeAny: ["contract", "purchase order"], excludeAny: ["governing law", "applicable law"] },
    severity: "YELLOW",
    businessExplanation: "适用法律缺失会增加争议处理的不确定性。",
    suggestedRevision: "补充适用法律条款，并由法务确认是否符合交易策略。",
    requiredMaterials: ["合同", "争议解决条款"],
    requiresHumanReview: true,
    source: "合同争议解决基础规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-DISPUTE-002",
    riskType: "争议解决风险",
    scenario: "未约定争议解决方式",
    trigger: { includeAny: ["contract", "purchase order"], excludeAny: ["arbitration", "court", "jurisdiction"] },
    severity: "RED",
    businessExplanation: "争议解决方式缺失会影响后续追款、索赔和执行路径。",
    suggestedRevision: "补充仲裁或法院管辖、地点、语言和程序规则。",
    requiredMaterials: ["合同", "法务复核意见"],
    requiresHumanReview: true,
    source: "合同争议解决基础规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-DISPUTE-003",
    riskType: "争议解决风险",
    scenario: "仲裁地缺失",
    trigger: { includeAny: ["arbitration"], excludeAny: ["seat of arbitration", "arbitration in singapore", "arbitration in hong kong"] },
    severity: "YELLOW",
    businessExplanation: "仲裁地缺失会影响程序法、临时措施和裁决执行。",
    suggestedRevision: "明确仲裁机构、仲裁地、语言和适用规则。",
    requiredMaterials: ["仲裁条款", "法务复核意见"],
    requiresHumanReview: true,
    source: "仲裁条款规范性规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-DISPUTE-004",
    riskType: "争议解决风险",
    scenario: "争议语言缺失",
    trigger: { includeAny: ["arbitration", "jurisdiction"], excludeAny: ["language of arbitration", "proceedings shall be english"] },
    severity: "GREEN",
    businessExplanation: "语言条款缺失通常不是单独高风险，但会增加争议沟通成本。",
    suggestedRevision: "补充争议处理语言，通常可约定英文。",
    requiredMaterials: ["争议解决条款"],
    requiresHumanReview: false,
    source: "争议条款完整性提示",
    lastUpdated: updated
  },
  {
    ruleId: "R-EVID-001",
    riskType: "单据和证据风险",
    scenario: "缺少提单",
    trigger: { includeAny: ["shipment", "delivery"], excludeAny: ["bill of lading", "b/l"] },
    severity: "YELLOW",
    businessExplanation: "缺少提单会削弱货权、交付和索赔证据。",
    suggestedRevision: "补充提单或等效运输单据，并关联付款节点。",
    requiredMaterials: ["提单", "发货通知"],
    requiresHumanReview: false,
    source: "外贸单据留存规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-EVID-002",
    riskType: "单据和证据风险",
    scenario: "缺少发票或装箱单",
    trigger: { includeAny: ["shipment", "customs"], excludeAny: ["commercial invoice", "packing list"] },
    severity: "YELLOW",
    businessExplanation: "发票和装箱单是报关、交付和付款的重要基础材料。",
    suggestedRevision: "补充商业发票、装箱单并与订单信息保持一致。",
    requiredMaterials: ["发票", "装箱单"],
    requiresHumanReview: false,
    source: "外贸单据留存规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-EVID-003",
    riskType: "单据和证据风险",
    scenario: "缺少质检报告",
    trigger: { includeAny: ["inspection", "quality"], excludeAny: ["inspection report", "quality report"] },
    severity: "YELLOW",
    businessExplanation: "缺少质检报告会削弱质量合格和交付状态证明。",
    suggestedRevision: "在发货前保存内部或第三方质检报告。",
    requiredMaterials: ["质检报告", "验货照片"],
    requiresHumanReview: false,
    source: "质量证据留存规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-EVID-004",
    riskType: "单据和证据风险",
    scenario: "缺少收货确认",
    trigger: { includeAny: ["arrival", "received goods"], excludeAny: ["receipt confirmation", "signed delivery note"] },
    severity: "YELLOW",
    businessExplanation: "收货确认是证明买方已收货和验收节点的重要材料。",
    suggestedRevision: "要求客户签收确认或保存物流签收记录。",
    requiredMaterials: ["收货确认", "物流签收"],
    requiresHumanReview: false,
    source: "履约证据留存规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-EVID-005",
    riskType: "单据和证据风险",
    scenario: "缺少催款记录",
    trigger: { includeAny: ["overdue", "unpaid balance"], excludeAny: ["collection notice", "payment reminder"] },
    severity: "YELLOW",
    businessExplanation: "缺少催款记录会影响证明买方迟延付款和卖方持续主张权利。",
    suggestedRevision: "保存邮件、聊天摘要和正式催款函。",
    requiredMaterials: ["催款记录", "付款承诺"],
    requiresHumanReview: false,
    source: "回款证据留存规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-VERSION-001",
    riskType: "版本一致性风险",
    scenario: "价格版本不一致",
    trigger: { includeAny: ["price discrepancy", "different price", "price changed"] },
    severity: "YELLOW",
    businessExplanation: "合同、PO、PI 或邮件中的价格不一致会影响付款和索赔金额。",
    suggestedRevision: "以最终签署版本为准，要求客户书面确认价格。",
    requiredMaterials: ["合同", "PO", "PI", "邮件确认"],
    requiresHumanReview: false,
    source: "版本一致性规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-VERSION-002",
    riskType: "版本一致性风险",
    scenario: "数量、交期或贸易术语不一致",
    trigger: { includeAny: ["quantity discrepancy", "different delivery date", "incoterm changed"] },
    severity: "YELLOW",
    businessExplanation: "数量、交期和贸易术语不一致会导致交付责任和费用争议。",
    suggestedRevision: "统一合同、PO、PI 和邮件确认中的关键字段。",
    requiredMaterials: ["合同", "PO", "PI", "邮件确认"],
    requiresHumanReview: false,
    source: "版本一致性规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-SEA-001",
    riskType: "东南亚目的国交易注意事项",
    scenario: "越南尾款与验货风险",
    trigger: { includeAll: ["vietnam", "after buyer inspection"] },
    severity: "YELLOW",
    businessExplanation: "越南订单演示场景中，尾款和买方验货绑定时应重点关注回款保护。",
    suggestedRevision: "要求发货前或凭单据付款，并明确验货期限。",
    requiredMaterials: ["PO", "PI", "验货条款"],
    requiresHumanReview: true,
    source: "东南亚外贸演示案例规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-SEA-002",
    riskType: "东南亚目的国交易注意事项",
    scenario: "印尼 DDP 清关和税费风险",
    trigger: { includeAll: ["indonesia", "ddp"] },
    severity: "RED",
    businessExplanation: "印尼 DDP 场景需要特别确认进口清关、税费和目的国资料责任。",
    suggestedRevision: "改用更清晰术语或补充买方资料协助和费用承担条款。",
    requiredMaterials: ["目的国资料清单", "清关责任说明"],
    requiresHumanReview: true,
    source: "东南亚外贸演示案例规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-SEA-003",
    riskType: "东南亚目的国交易注意事项",
    scenario: "马来西亚质量异议和拒付风险",
    trigger: { includeAll: ["malaysia", "quality claim"] },
    severity: "YELLOW",
    businessExplanation: "马来西亚质量争议演示场景应关注收货确认、验货记录和异议期限。",
    suggestedRevision: "补齐验货记录、收货确认和质量异议时限。",
    requiredMaterials: ["质检报告", "收货确认", "客户异议材料"],
    requiresHumanReview: true,
    source: "东南亚外贸演示案例规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-SEA-004",
    riskType: "东南亚目的国交易注意事项",
    scenario: "菲律宾收货确认和尾款风险",
    trigger: { includeAll: ["philippines", "unpaid balance"] },
    severity: "YELLOW",
    businessExplanation: "菲律宾尾款争议演示场景应强化收货确认和催款证据。",
    suggestedRevision: "保存签收记录、催款记录和付款承诺。",
    requiredMaterials: ["收货确认", "催款记录"],
    requiresHumanReview: false,
    source: "东南亚外贸演示案例规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-SEA-005",
    riskType: "东南亚目的国交易注意事项",
    scenario: "泰国目的港费用风险",
    trigger: { includeAll: ["thailand", "destination port charge"] },
    severity: "YELLOW",
    businessExplanation: "泰国目的港费用需明确由谁承担，避免到港后追加费用争议。",
    suggestedRevision: "明确目的港费用、滞港费和仓储费承担。",
    requiredMaterials: ["物流费用清单", "合同"],
    requiresHumanReview: false,
    source: "东南亚外贸演示案例规则",
    lastUpdated: updated
  },
  {
    ruleId: "R-SEA-006",
    riskType: "东南亚目的国交易注意事项",
    scenario: "新加坡争议解决条款规范性提示",
    trigger: { includeAll: ["singapore", "arbitration"] },
    severity: "GREEN",
    businessExplanation: "新加坡仲裁条款通常需要写清机构、规则、仲裁地和语言。",
    suggestedRevision: "补充完整仲裁机构、规则、仲裁地和语言。",
    requiredMaterials: ["争议解决条款"],
    requiresHumanReview: false,
    source: "东南亚外贸演示案例规则",
    lastUpdated: updated
  }
];

export function serializeRuleTrigger(trigger: RuleTrigger) {
  return JSON.stringify(trigger);
}

export function serializeRequiredMaterials(materials: string[]) {
  return JSON.stringify(materials);
}
