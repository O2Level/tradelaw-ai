# TradeLaw AI

面向中国中小外贸企业出口东南亚订单的法律风险协作工作台。

## 本地启动

```bash
npm install
npm run db:reset
npm run seed
npm run demo:import
npm run dev
```

访问：`http://localhost:3000`

## 环境变量

复制 `.env.example` 为 `.env`，本地默认可使用：

```env
DATABASE_URL="file:./dev.db"
AI_PROVIDER="local"
OPENCLAW_BASE_URL=""
OPENCLAW_API_KEY=""
OPENCLAW_MODEL="gpt-5.5"
```

OpenClaw 只通过 `.env` 接入。项目不会读取、复制或提交本机 `~/.openclaw/openclaw.json`。

## 演示流程

1. 进入 Dashboard。
2. 点击“导入越南 PO”。
3. 打开订单空间，查看 PO、PI、邮件摘要材料。
4. 风险扫描结果会命中 `R-PAY-001`。
5. 保存复核意见。
6. 打开风险报告，查看复核意见。
7. 在订单空间导出业务员版、负责人版、法务版或证据包摘要。

## 验证命令

```bash
npm run lint
npm run test
npm run build
npm run e2e
npm run qa
```

## Demo 输出

```bash
npm run report:demo
```

生成：

- `demo-output/business-report-vietnam.pdf`
- `demo-output/legal-report-vietnam.pdf`
- `demo-output/evidence-summary-malaysia-or-philippines.pdf`

## 合规边界

本系统输出仅供业务风险识别、材料整理和内部辅助决策参考，不构成正式法律意见。重大合同修改、争议解决策略、适用法律选择、目的国强监管事项和复杂争议处理，应由企业法务、外部律师或负责人确认。
