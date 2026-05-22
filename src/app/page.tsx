import Link from "next/link";
import { getDashboardStats } from "@/lib/order-queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <section className="grid cols-3">
        <div className="panel metric">
          <span>订单空间</span>
          <strong>{stats.orders}</strong>
        </div>
        <div className="panel metric">
          <span>红色风险</span>
          <strong>{stats.redRisks}</strong>
        </div>
        <div className="panel metric">
          <span>待复核事项</span>
          <strong>{stats.pendingReviews}</strong>
        </div>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>演示入口</h2>
        <p>从订单建档开始，导入材料后即可执行本地规则扫描。</p>
        <Link className="button" href="/orders">
          查看订单
        </Link>
      </section>
    </>
  );
}
