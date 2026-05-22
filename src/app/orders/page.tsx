import Link from "next/link";

export default function OrdersPage() {
  return (
    <>
      <h1 className="page-title">订单列表</h1>
      <section className="panel">
        <p>订单数据模型将在第 2 轮接入数据库。</p>
        <Link className="button" href="/orders/new">
          新建订单
        </Link>
      </section>
    </>
  );
}
