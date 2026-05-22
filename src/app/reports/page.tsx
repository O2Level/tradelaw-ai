import { exportReportAction } from "@/app/actions";
import { listOrders } from "@/lib/order-queries";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const orders = await listOrders();

  return (
    <>
      <h1 className="page-title">报告导出</h1>
      <section className="panel stack">
        {orders.map((order) => (
          <div className="toolbar" key={order.id}>
            <strong>{order.name}</strong>
            {[
              ["SALES", "业务员版"],
              ["OWNER", "负责人版"],
              ["LEGAL", "法务版"],
              ["EVIDENCE", "证据包摘要"]
            ].map(([type, label]) => (
              <form action={exportReportAction} key={`${order.id}-${type}`}>
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="type" value={type} />
                <input type="hidden" name="createdBy" value={label} />
                <button className="button secondary" type="submit">
                  导出{label}
                </button>
              </form>
            ))}
          </div>
        ))}
        {orders.length === 0 ? <p className="muted">暂无订单可导出。</p> : null}
      </section>
    </>
  );
}
