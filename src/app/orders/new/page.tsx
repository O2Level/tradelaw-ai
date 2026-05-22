import { createOrderAction } from "@/app/actions";

export default function NewOrderPage() {
  return (
    <>
      <h1 className="page-title">新建订单</h1>
      <section className="panel">
        <form action={createOrderAction} className="form-grid">
          <div className="field">
            <label htmlFor="name">订单名</label>
            <input id="name" name="name" required defaultValue="越南买方 PO 风险审查" />
          </div>
          <div className="field">
            <label htmlFor="destinationCountry">目的国</label>
            <input id="destinationCountry" name="destinationCountry" required defaultValue="Vietnam" />
          </div>
          <div className="field">
            <label htmlFor="buyerName">买方</label>
            <input id="buyerName" name="buyerName" required defaultValue="VietHome Trading Co., Ltd." />
          </div>
          <div className="field">
            <label htmlFor="sellerName">卖方</label>
            <input id="sellerName" name="sellerName" required defaultValue="Shenzhen Bright Export Ltd." />
          </div>
          <div className="field">
            <label htmlFor="product">产品</label>
            <input id="product" name="product" required defaultValue="LED lamps" />
          </div>
          <div className="field">
            <label htmlFor="amount">金额</label>
            <input id="amount" name="amount" type="number" min="0" step="0.01" required defaultValue="48000" />
          </div>
          <div className="field">
            <label htmlFor="currency">币种</label>
            <input id="currency" name="currency" defaultValue="USD" />
          </div>
          <div className="field">
            <label htmlFor="incoterm">贸易术语</label>
            <input id="incoterm" name="incoterm" defaultValue="FOB Shenzhen" />
          </div>
          <div className="field">
            <label htmlFor="paymentTerms">付款方式</label>
            <input id="paymentTerms" name="paymentTerms" defaultValue="30% deposit, 70% balance after arrival" />
          </div>
          <div className="field">
            <label htmlFor="deliveryDate">交期</label>
            <input id="deliveryDate" name="deliveryDate" defaultValue="2026-07-30" />
          </div>
          <div className="toolbar">
            <button className="button" type="submit">
              保存订单
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
