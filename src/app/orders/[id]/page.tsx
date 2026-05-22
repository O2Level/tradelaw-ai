import Link from "next/link";
import { notFound } from "next/navigation";
import { addEvidenceEventAction, exportReportAction, importMaterialAction, saveReviewAction, scanOrderAction, updateMaterialAction } from "@/app/actions";
import { getAiProviderStatus } from "@/lib/ai-provider";
import { getOrderSpace } from "@/lib/order-queries";

export const dynamic = "force-dynamic";

export default async function OrderSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderSpace(id);
  const aiStatus = getAiProviderStatus();
  if (!order) {
    notFound();
  }

  return (
    <div className="stack">
      <div className="toolbar">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          {order.name}
        </h1>
        <Link className="button secondary" href={`/orders/${order.id}/risk-report`}>
          风险报告
        </Link>
        <form action={scanOrderAction}>
          <input type="hidden" name="orderId" value={order.id} />
          <button className="button" type="submit">
            风险扫描
          </button>
        </form>
      </div>

      <section className="grid cols-3">
        <div className="panel metric">
          <span>目的国</span>
          <strong>{order.destinationCountry}</strong>
        </div>
        <div className="panel metric">
          <span>风险等级</span>
          <strong className={`badge ${order.riskLevel}`}>{order.riskLevel}</strong>
        </div>
        <div className="panel metric">
          <span>复核状态</span>
          <strong>{order.reviewStatus}</strong>
        </div>
      </section>

      <section className="panel">
        <strong>分析模式：</strong>
        {aiStatus.mode === "AI_ENHANCED" ? `AI 增强分析（${aiStatus.provider}/${aiStatus.model}）` : "本地规则分析"}
      </section>

      <section className="panel">
        <h2>订单信息</h2>
        <table className="table">
          <tbody>
            <tr>
              <th>买方</th>
              <td>{order.buyerName}</td>
              <th>卖方</th>
              <td>{order.sellerName}</td>
            </tr>
            <tr>
              <th>产品</th>
              <td>{order.product}</td>
              <th>金额</th>
              <td>
                {order.currency} {order.amount.toLocaleString()}
              </td>
            </tr>
            <tr>
              <th>贸易术语</th>
              <td>{order.incoterm}</td>
              <th>付款方式</th>
              <td>{order.paymentTerms}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>材料导入</h2>
        <form action={importMaterialAction} className="stack">
          <input type="hidden" name="orderId" value={order.id} />
          <div className="form-grid">
            <div className="field">
              <label htmlFor="type">材料类型</label>
              <select id="type" name="type" defaultValue="PO">
                <option value="CONTRACT">合同</option>
                <option value="PO">PO</option>
                <option value="PI">PI</option>
                <option value="CHAT_SUMMARY">聊天摘要</option>
                <option value="INVOICE">发票</option>
                <option value="PACKING_LIST">装箱单</option>
                <option value="BILL_OF_LADING">提单</option>
                <option value="INSPECTION_REPORT">质检报告</option>
                <option value="RECEIPT_CONFIRMATION">收货确认</option>
                <option value="OTHER">其他</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="title">标题</label>
              <input id="title" name="title" required defaultValue="Vietnam buyer PO" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="content">粘贴材料文本</label>
            <textarea
              id="content"
              name="content"
              required
              defaultValue={`Buyer: VietHome Trading Co., Ltd.
Seller: Shenzhen Bright Export Ltd.
Destination Country: Vietnam
Product: LED lamps
Quantity: 1000 pcs
Amount: USD 48,000
Incoterm: FOB Shenzhen
Payment terms: 30% deposit, 70% balance paid after arrival and buyer inspection.
Delivery date: 2026-07-30
Inspection: buyer inspection after arrival.
Purchase order without governing law or dispute resolution.`}
            />
          </div>
          <p className="muted">脱敏提示：请先删除客户私人联系方式、个人身份信息和非必要商业秘密。</p>
          <button className="button" type="submit">
            保存材料并抽取字段
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>材料区</h2>
        <table className="table">
          <thead>
            <tr>
              <th>类型</th>
              <th>标题</th>
              <th>导入时间</th>
            </tr>
          </thead>
          <tbody>
            {order.materials.map((material) => (
              <tr key={material.id}>
                <td>{material.type}</td>
                <td>{material.title}</td>
                <td>{material.createdAt.toLocaleString("zh-CN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="stack" style={{ marginTop: 16 }}>
          {order.materials.map((material) => (
            <form
              action={updateMaterialAction}
              className="panel stack"
              data-material-title={material.title}
              data-testid="material-edit-form"
              key={`edit-${material.id}`}
            >
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="materialId" value={material.id} />
              <div className="field">
                <label htmlFor={`title-${material.id}`}>编辑材料标题</label>
                <input id={`title-${material.id}`} name="title" defaultValue={material.title} />
              </div>
              <div className="field">
                <label htmlFor={`content-${material.id}`}>编辑材料正文</label>
                <textarea
                  data-testid="material-content-editor"
                  id={`content-${material.id}`}
                  name="content"
                  defaultValue={material.content}
                />
              </div>
              <button className="button secondary" type="submit">
                保存材料修改
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>字段抽取结果</h2>
        <table className="table">
          <tbody>
            {order.extractedFields.map((field) => (
              <tr key={field.id}>
                <th>{field.fieldKey}</th>
                <td>{field.fieldValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel stack">
        <h2>风险扫描结果</h2>
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
              <strong>业务解释：</strong>
              {risk.businessExplanation}
            </p>
            <p>
              <strong>建议修改：</strong>
              {risk.suggestedRevision}
            </p>
            <p>
              <strong>复核状态：</strong>
              {risk.status}
            </p>
            <form action={saveReviewAction} className="stack">
              <input type="hidden" name="riskItemId" value={risk.id} />
              <input type="hidden" name="orderId" value={order.id} />
              <div className="form-grid">
                <div className="field">
                  <label htmlFor={`reviewerName-${risk.id}`}>复核人</label>
                  <input id={`reviewerName-${risk.id}`} name="reviewerName" defaultValue="王法务" />
                </div>
                <div className="field">
                  <label htmlFor={`reviewerRole-${risk.id}`}>角色</label>
                  <input id={`reviewerRole-${risk.id}`} name="reviewerRole" defaultValue="法务" />
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
                <textarea id={`comment-${risk.id}`} name="comment" required defaultValue="要求改为发货前付清尾款或凭提单副本付款。" />
              </div>
              <button className="button" type="submit">
                保存复核意见
              </button>
            </form>
            {risk.reviewDecisions.length > 0 ? (
              <div>
                <h3>复核记录</h3>
                {risk.reviewDecisions.map((decision) => (
                  <p key={decision.id}>
                    v{decision.version} {decision.reviewerRole} {decision.reviewerName}: {decision.comment}
                  </p>
                ))}
              </div>
            ) : null}
          </article>
        ))}
        {order.riskItems.length === 0 ? <p className="muted">导入材料后点击风险扫描。</p> : null}
      </section>

      <section className="panel stack">
        <h2>证据时间线</h2>
        <form action={addEvidenceEventAction} className="stack">
          <input type="hidden" name="orderId" value={order.id} />
          <div className="form-grid">
            <div className="field">
              <label htmlFor="evidenceType">节点</label>
              <select id="evidenceType" name="type" defaultValue="SHIPMENT">
                <option value="SIGNING">签约</option>
                <option value="PRODUCTION">生产</option>
                <option value="INSPECTION">验货</option>
                <option value="SHIPMENT">发货</option>
                <option value="PAYMENT">收款</option>
                <option value="OBJECTION">异议</option>
                <option value="COLLECTION">催款</option>
                <option value="OTHER">其他</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="eventDate">日期</label>
              <input id="eventDate" name="eventDate" type="date" />
            </div>
            <div className="field">
              <label htmlFor="evidenceTitle">标题</label>
              <input id="evidenceTitle" name="title" defaultValue="发货通知与提单待补" required />
            </div>
            <div className="field">
              <label htmlFor="proofTarget">证明对象</label>
              <input id="proofTarget" name="proofTarget" defaultValue="证明卖方已按约发货并提示客户付款" required />
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="uploadedMaterials">已上传材料</label>
              <textarea id="uploadedMaterials" name="uploadedMaterials" defaultValue="PI, PO" />
            </div>
            <div className="field">
              <label htmlFor="missingMaterials">缺失材料</label>
              <textarea id="missingMaterials" name="missingMaterials" defaultValue="提单, 发货通知, 催款记录" />
            </div>
          </div>
          <button className="button" type="submit">
            保存证据节点
          </button>
        </form>
        <table className="table">
          <thead>
            <tr>
              <th>节点</th>
              <th>标题</th>
              <th>证明对象</th>
              <th>缺失材料</th>
            </tr>
          </thead>
          <tbody>
            {order.evidenceEvents.map((event) => (
              <tr key={event.id}>
                <td>{event.type}</td>
                <td>{event.title}</td>
                <td>{event.proofTarget}</td>
                <td>{JSON.parse(event.missingMaterials).join("、")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel stack">
        <h2>报告导出</h2>
        <div className="toolbar">
          {[
            ["SALES", "业务员版"],
            ["OWNER", "负责人版"],
            ["LEGAL", "法务版"],
            ["EVIDENCE", "证据包摘要"]
          ].map(([type, label]) => (
            <form action={exportReportAction} key={type}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="createdBy" value={label} />
              <button className="button secondary" type="submit">
                导出{label}
              </button>
            </form>
          ))}
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>类型</th>
              <th>文件</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {order.reportExports.map((report) => (
              <tr key={report.id}>
                <td>{report.type}</td>
                <td>{report.filePath}</td>
                <td>{report.createdAt.toLocaleString("zh-CN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
