import Link from "next/link";
import { saveReviewAction } from "@/app/actions";
import { listReviewQueue } from "@/lib/order-queries";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const risks = await listReviewQueue();

  return (
    <>
      <h1 className="page-title">复核工作台</h1>
      <section className="stack">
        {risks.map((risk) => (
          <article className={`panel risk-card ${risk.severity}`} key={risk.id}>
            <div className="toolbar">
              <span className={`badge ${risk.severity}`}>{risk.severity}</span>
              <strong>{risk.riskRule.ruleId}</strong>
              <Link href={`/orders/${risk.orderId}`}>{risk.order.name}</Link>
            </div>
            <p>{risk.originalText}</p>
            <p>{risk.businessExplanation}</p>
            <form action={saveReviewAction} className="stack">
              <input type="hidden" name="riskItemId" value={risk.id} />
              <input type="hidden" name="orderId" value={risk.orderId} />
              <div className="form-grid">
                <div className="field">
                  <label htmlFor={`reviewer-${risk.id}`}>复核人</label>
                  <input id={`reviewer-${risk.id}`} name="reviewerName" defaultValue="王法务" />
                </div>
                <div className="field">
                  <label htmlFor={`role-${risk.id}`}>角色</label>
                  <input id={`role-${risk.id}`} name="reviewerRole" defaultValue="法务" />
                </div>
                <div className="field">
                  <label htmlFor={`decision-${risk.id}`}>处理意见</label>
                  <select id={`decision-${risk.id}`} name="decision" defaultValue="REQUIRE_MODIFICATION">
                    <option value="ACCEPT_RISK">接受风险</option>
                    <option value="REQUIRE_MODIFICATION">要求修改</option>
                    <option value="ADD_CLAUSE">补充条款</option>
                    <option value="PAUSE_TRANSACTION">暂停交易</option>
                    <option value="ESCALATE_TO_LAWYER">转律师处理</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor={`comment-${risk.id}`}>复核意见</label>
                <textarea id={`comment-${risk.id}`} name="comment" required defaultValue="要求修改付款和争议解决条款。" />
              </div>
              <button className="button" type="submit">
                保存复核意见
              </button>
            </form>
          </article>
        ))}
        {risks.length === 0 ? <p className="panel muted">暂无待复核风险。</p> : null}
      </section>
    </>
  );
}
