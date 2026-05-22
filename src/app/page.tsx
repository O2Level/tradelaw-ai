import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <section className="grid cols-3">
        <div className="panel metric">
          <span>订单空间</span>
          <strong>0</strong>
        </div>
        <div className="panel metric">
          <span>红色风险</span>
          <strong>0</strong>
        </div>
        <div className="panel metric">
          <span>待复核事项</span>
          <strong>0</strong>
        </div>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>演示入口</h2>
        <p>第 1 轮提供基础工作台骨架，后续轮次接入真实订单、规则扫描、复核和报告导出。</p>
        <Link className="button" href="/orders">
          查看订单
        </Link>
      </section>
    </>
  );
}
