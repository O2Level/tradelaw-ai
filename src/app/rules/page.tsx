import { listRules } from "@/lib/order-queries";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const rules = await listRules();

  return (
    <>
      <h1 className="page-title">规则库</h1>
      <section className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>编号</th>
              <th>类型</th>
              <th>场景</th>
              <th>等级</th>
              <th>来源</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td>{rule.ruleId}</td>
                <td>{rule.riskType}</td>
                <td>{rule.scenario}</td>
                <td>
                  <span className={`badge ${rule.severity}`}>{rule.severity}</span>
                </td>
                <td>{rule.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
