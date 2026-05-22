# QA Script

## 自动验收

```bash
npm install
npm run db:reset
npm run seed
npm run demo:import
npm run lint
npm run test
npm run build
npm run e2e
npm run qa
```

## 手工验收路径

1. 启动项目：`npm run dev`
2. 进入 `http://localhost:3000`
3. 点击“导入越南 PO”
4. 打开订单空间
5. 确认材料区包含 `Vietnam buyer PO`、PI 和邮件摘要
6. 确认风险扫描结果包含 `R-PAY-001`
7. 确认风险卡片显示 `70% balance paid after arrival and buyer inspection`
8. 确认风险等级为 `RED`
9. 填写并保存复核意见
10. 打开风险报告，确认复核意见显示
11. 在订单空间导出负责人版和法务版报告
12. 确认 `demo-output` 或页面记录中的 PDF 文件真实存在
13. 编辑 PO 材料，把付款条款改为 `70% balance paid before shipment`
14. 重新点击风险扫描
15. 确认 `R-PAY-001` 不再命中

## 必查文件

- `demo-output/business-report-vietnam.pdf`
- `demo-output/legal-report-vietnam.pdf`
- `demo-output/evidence-summary-malaysia-or-philippines.pdf`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/order-space.png`
- `docs/screenshots/risk-report.png`
- `docs/screenshots/review-workbench.png`
- `docs/screenshots/report-export.png`
