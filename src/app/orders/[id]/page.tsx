import Link from "next/link";
import { notFound } from "next/navigation";
import { importMaterialAction, scanOrderAction } from "@/app/actions";
import { getOrderSpace } from "@/lib/order-queries";

export const dynamic = "force-dynamic";

export default async function OrderSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderSpace(id);
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
          </article>
        ))}
        {order.riskItems.length === 0 ? <p className="muted">导入材料后点击风险扫描。</p> : null}
      </section>
    </div>
  );
}
