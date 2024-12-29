import { useContext, useState } from "react";
import { BillingContext } from "./BillingContext";
import { currencyFormatter } from "../../Auth/customFetch";
import BillingPageAdditionalInformation from "./BillingPageAdditionalInformation";
import { useSearchParams } from "next/navigation";

export default function BillingPageSummary({ patientid }) {
	const { billingdata } = useContext(BillingContext);
	const billingid = useSearchParams().get("billingid");
	const [showPrevious, setShowPrevious] = useState(false);

	if (billingdata.outstandingDebt > 0 || !billingdata.billingSource) return null;

	return (
		<div>
			{showPrevious && (
				<div className="card mx-2 text-sm my-2">
					<div className="card-header bg-primary text-white">Previous Billing Details</div>
					<div className="list-group">
						<div className="list-group-item d-flex justify-content-between">
							<span>Previous Tax Amount</span>
							<span>{currencyFormatter.format(billingdata.previousAmountIncurredDueTax || 0)}</span>
						</div>
						<div className="list-group-item d-flex justify-content-between bg-primary-subtle">
							<span>Previous Payable</span>
							<span>{currencyFormatter.format(billingdata.previousPayable || 0)}</span>
						</div>
						<div className="list-group-item d-flex justify-content-between bg-secondary-subtle">
							<span>Previous Paid</span>
							<span>{currencyFormatter.format(billingdata.previousPaid || 0)}</span>
						</div>
						<div className="list-group-item d-flex justify-content-between ">
							<span>Previous Refunded</span>
							<span>{currencyFormatter.format(billingdata.previousRefunded || 0)}</span>
						</div>
						<div className="list-group-item d-flex justify-content-between bg-danger-subtle">
							<span>Previous Outstanding</span>
							<span>{currencyFormatter.format(billingdata.previousOutstanding || 0)}</span>
						</div>
					</div>
				</div>
			)}

			{/* Current Billing Details */}
			<div className="list-group mx-2 text-sm my-2 billing-page-display-child">
				<div className="list-group-item d-flex justify-content-between bg-secondary-subtle"> 
					<span className="mt-2">Current Billing Details</span>
					<button
						className="btn btn-primary  btn-sm"
						onClick={() => setShowPrevious(!showPrevious)}
					>
						{showPrevious ? "Hide Previous " : "Show Previous "}
					</button>
				</div>
				<div className="list-group-item d-flex justify-content-between bg-primary-subtle">
					<span>Total Test Cost</span>
					<span>{currencyFormatter.format(billingdata.testcost)}</span>
				</div>
				<div className="list-group-item d-flex justify-content-between">
					<span>Total Taxes</span>
					<span>{currencyFormatter.format(billingdata.amountIncurredDueTax)}</span>
				</div>
				<div className="list-group-item d-flex justify-content-between bg-primary-subtle">
					<span>Total Service Amount</span>
					<span>{currencyFormatter.format(billingdata.totalCostOfServices)}</span>
				</div>
				<div className="list-group-item d-flex justify-content-between">
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
					<span>Amount Paid</span>
					<span>{currencyFormatter.format(billingdata.paid)}</span>
				</div>
				<div className="list-group-item d-flex justify-content-between bg-danger-subtle">
					<span>Outstanding</span>
					<span>{currencyFormatter.format(billingdata.outstanding)}</span>
				</div>
			</div>


			{billingdata.billingSource && (
				<div>
					<BillingPageAdditionalInformation patientid={patientid} billingid={billingid} />
				</div>
			)}
		</div>
	);
}
