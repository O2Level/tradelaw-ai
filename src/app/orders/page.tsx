import Link from "next/link";
import { listOrders } from "@/lib/order-queries";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await listOrders();

  return (
    <>
      <h1 className="page-title">订单列表</h1>
      <section className="panel stack">
        <div className="toolbar">
          <Link className="button" href="/orders/new">
            新建订单
          </Link>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>订单名</th>
              <th>目的国</th>
              <th>金额</th>
              <th>买方</th>
              <th>风险等级</th>
              <th>复核状态</th>
              <th>更新时间</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/orders/${order.id}`}>{order.name}</Link>
                </td>
                <td>{order.destinationCountry}</td>
                <td>
                  {order.currency} {order.amount.toLocaleString()}
                </td>
                <td>{order.buyerName}</td>
                <td>
                  <span className={`badge ${order.riskLevel}`}>{order.riskLevel}</span>
                </td>
                <td>{order.reviewStatus}</td>
                <td>{order.updatedAt.toLocaleString("zh-CN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? <p className="muted">暂无订单，请先新建订单或导入演示案例。</p> : null}
        <Link className="button" href="/orders/new">
          新建订单
        </Link>
      </section>
    </>
  );
}
