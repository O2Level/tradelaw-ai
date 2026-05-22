import { notFound } from "next/navigation";
import { getAiProviderStatus } from "@/lib/ai-provider";
import { getOrderSpace } from "@/lib/order-queries";

export const dynamic = "force-dynamic";

export default async function RiskReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderSpace(id);
  const aiStatus = getAiProviderStatus();
  if (!order) {
    notFound();
  }

  return (
    <div className="stack">
      <h1 className="page-title">风险报告：{order.name}</h1>
      <section className="panel">
        <h2>风险总览</h2>
        <p>分析模式：{aiStatus.mode === "AI_ENHANCED" ? `AI 增强分析（${aiStatus.provider}/${aiStatus.model}）` : "本地规则分析"}</p>
        <p>
          当前风险等级：<span className={`badge ${order.riskLevel}`}>{order.riskLevel}</span>
        </p>
        <p>复核状态：{order.reviewStatus}</p>
      </section>
      <section className="panel">
        <h2>材料列表</h2>
        <ul>
          {order.materials.map((material) => (
            <li key={material.id}>
              {material.type} - {material.title}
            </li>
          ))}
        </ul>
      </section>
      <section className="stack">
        {order.riskItems.map((risk) => (
          <article className={`panel risk-card ${risk.severity}`} key={risk.id}>
            <div className="toolbar">
              <span className={`badge ${risk.severity}`}>{risk.severity}</span>
              <strong>{risk.riskRule.ruleId}</strong>
              <span>{risk.riskType}</span>
            </div>
            <p>
              <strong>原文或命中事实：</strong>
              {risk.originalText}
            </p>
            <p>
              <strong>触发规则：</strong>
              {risk.riskRule.scenario}
            </p>
            <p>
              <strong>规则来源：</strong>
              {risk.ruleSource}
            </p>
            <p>
              <strong>风险解释：</strong>
              {risk.businessExplanation}
            </p>
            <p>
              <strong>修改建议：</strong>
              {risk.suggestedRevision}
            </p>
            <p>
              <strong>需要补充的材料：</strong>
              {JSON.parse(risk.requiredMaterials).join("、")}
            </p>
            <p>
              <strong>是否必须人工复核：</strong>
              {risk.requiresHumanReview ? "是" : "否"}
            </p>
            <p>
              <strong>复核状态：</strong>
              {risk.status}
            </p>
            {risk.reviewDecisions.length > 0 ? (
              <div>
                <strong>人工复核意见：</strong>
                {risk.reviewDecisions.map((decision) => (
                  <p key={decision.id}>
                    v{decision.version} {decision.reviewerRole} {decision.reviewerName}: {decision.comment}
                  </p>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
