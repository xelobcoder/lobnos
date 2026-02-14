import { useContext } from "react";
import { BillingContext } from "./BillingContext";
import { currencyFormatter } from "../../Auth/customFetch";
import BillingPageAdditionalInformation from "./BillingPageAdditionalInformation";
import { useSearchParams } from "next/navigation";
import {
	TestTubeIcon,
	TaxIcon,
	ServicesIcon,
	TotalCostIcon,
	DiscountIcon,
	PayableIcon,
	PaidIcon,
	OutstandingIcon,
} from './Lib/Icons';

export default function BillingPageSummary({ patientid }) {
	const { billingdata } = useContext(BillingContext);
	const billingid = useSearchParams().get("billingid");

	if (billingdata.outstandingDebt > 0 || !billingdata.billingSource) return null;

	return (
		<div>
			<div className="list-group mx-2 text-sm my-2 billing-page-display-child">
				<div className="list-group-item d-flex justify-content-between bg-secondary-subtle">
					<span className="mt-2 fw-bold">Current Billing Details</span>
				</div>
				<div className="list-group-item d-flex justify-content-between bg-primary-subtle">
					<span className="d-flex align-items-center">
						<TestTubeIcon className="me-2" />
						Total Test Cost
					</span>
					<span className="fw-bold">{currencyFormatter.format(billingdata.testcost)}</span>
				</div>
				<div className="list-group-item d-flex justify-content-between">
					<span className="d-flex align-items-center">
						<TaxIcon className="me-2" />
						Total Taxes
					</span>
					<span className="fw-bold">{currencyFormatter.format(billingdata.amountIncurredDueTax)}</span>
				</div>
				<div className="list-group-item d-flex justify-content-between bg-primary-subtle">
					<span className="d-flex align-items-center">
						<ServicesIcon className="me-2" />
						Total Service Amount
					</span>
					<span className="fw-bold">{currencyFormatter.format(billingdata.totalCostOfServices)}</span>
				</div>
				<div className="list-group-item d-flex justify-content-between">
					<span className="d-flex align-items-center">
						<TotalCostIcon className="me-2" />
						Total Cost
					</span>
					<span className="fw-bold">{currencyFormatter.format(billingdata.cost)}</span>
				</div>
				<div className="list-group-item d-flex justify-content-between bg-primary-subtle">
					<span className="d-flex align-items-center">
						<DiscountIcon className="me-2" />
						Total Surcharge
					</span>
					<span className="fw-bold">{currencyFormatter.format(billingdata.totalsurcharge)}</span>
				</div>
				<div className="list-group-item d-flex justify-content-between bg-primary-subtle">
					<span className="d-flex align-items-center">
						<DiscountIcon className="me-2" />
						Total Discount
					</span>
					<span className="fw-bold">{currencyFormatter.format(billingdata.discount)}</span>
				</div>
				<div className="list-group-item d-flex justify-content-between">
					<span className="d-flex align-items-center">
						<PayableIcon className="me-2" />
						Payable
					</span>
					<span className="fw-bold">{currencyFormatter.format(billingdata.payable)}</span>
				</div>
				<div className="list-group-item d-flex justify-content-between bg-secondary-subtle">
					<span className="d-flex align-items-center">
						<PaidIcon className="me-2" />
						Amount Paid
					</span>
					<span className="fw-bold">{currencyFormatter.format(billingdata.paid)}</span>
				</div>
				<div className="list-group-item d-flex justify-content-between bg-danger-subtle">
					<span className="d-flex align-items-center">
						<OutstandingIcon className="me-2" />
						Outstanding
					</span>
					<span className="fw-bold">{currencyFormatter.format(billingdata.outstanding)}</span>
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