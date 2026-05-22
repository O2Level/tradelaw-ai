import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeLaw AI",
  description: "东南亚外贸订单法律风险协作工作台"
};

const disclaimer =
  "本系统输出仅供业务风险识别、材料整理和内部辅助决策参考，不构成正式法律意见。重大合同修改、争议解决策略、适用法律选择、目的国强监管事项和复杂争议处理，应由企业法务、外部律师或负责人确认。";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <div className="brand">TradeLaw AI</div>
            <div className="tagline">面向东南亚外贸订单的法律风险协作工作台</div>
            <nav className="nav" aria-label="主导航">
              <Link href="/">Dashboard</Link>
              <Link href="/orders">订单</Link>
              <Link href="/orders/new">新建订单</Link>
              <Link href="/review">复核工作台</Link>
              <Link href="/rules">规则库</Link>
              <Link href="/reports">报告导出</Link>
            </nav>
          </aside>
          <main className="content">
            <div className="disclaimer">{disclaimer}</div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
