import { useContext } from "react";
import { BillingContext } from "./BillingContext";
import { currencyFormatter } from "../../Auth/customFetch";
import BillingPageAdditionalInformation from "./BillingPageAdditionalInformation";
import { useSearchParams } from "next/navigation";

export default function BillingPageSummary({ patientid }) {
  const { billingdata } = useContext(BillingContext);
  const billingid = useSearchParams().get("billingid");
  if (billingdata.outstandingDebt > 0 || !billingdata.billingSource) return null



  return (
    <div>
      <div className="list-group  mx-2 text-sm my-2 billing-page-display-child">
        <div className="list-group-item d-flex justify-content-between bg-primary-subtle">
          <span>Total Test Cost</span>
          <span>{currencyFormatter.format(billingdata.testcost)}</span>
        </div>
        <div className="list-group-item d-flex justify-content-between">
          <span>Total Taxes</span>
          <span>{currencyFormatter.format(billingdata.amountIncurredDueTax)}</span>
        </div>
        <div className="list-group-item d-flex justify-content-between bg-primary-subtle">
          <span> Total Service Amount</span>
          <span>{currencyFormatter.format(billingdata.totalCostOfServices)}</span>
        </div>
        <div className="list-group-item d-flex justify-content-between ">
          <span>Total Cost</span>
          <span>{currencyFormatter.format(billingdata.cost)}</span>
        </div>
        <div className="list-group-item d-flex justify-content-between bg-primary-subtle">
          <span>Discount</span>
          <span>{currencyFormatter.format(billingdata.discount)}</span>
        </div>
        <div className="list-group-item d-flex justify-content-between">
          <span>Payable</span>
          <span>{currencyFormatter.format(billingdata.payable)}</span>
        </div>
        <div className="list-group-item d-flex justify-content-between bg-secondary-subtle">
          <span>Amount paid </span>
          <span>{currencyFormatter.format(billingdata.paid)}</span>
        </div>
        <div className="list-group-item d-flex justify-content-between bg-danger-subtle">
          <span>Outstanding</span>
          <span>{currencyFormatter.format(billingdata.outstanding)}</span>
        </div>
      </div>
      {
        billingdata.billingSource && <div>
          <BillingPageAdditionalInformation patientid={patientid} billingid={billingid} />
        </div>
      }
    </div>
  );
}


