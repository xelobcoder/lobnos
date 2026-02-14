import { useContext } from "react";
import { MultiBillingContext } from "./MultiBillingContext";
import { currencyFormatter } from "../../Auth/customFetch";
import MultiBillingPageAdditionalInformation from "./MultiBillingPageAdditionalInformation";
import {
    RiTestTubeLine,
    RiPercentLine,
    RiServiceLine,
    RiMoneyDollarCircleLine,
    RiDiscountPercentLine,
    RiWallet3Line,
    RiCheckboxCircleLine,
    RiErrorWarningLine,
} from '@remixicon/react';
import { Button } from "react-bootstrap";
import { MultiBillingData } from "../../../lib/Multi/MultiTypes";

interface MultiSummaryProps {
    summaryData?: any;
    handlesubmit?: (data: MultiBillingData) => void;
}

export default function MultiSummary({ summaryData, handlesubmit }: MultiSummaryProps) {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata, setBillingData } = context;
    const data = summaryData || billingdata;

    if (data.outstandingDebt > 0 || !data.billingSource) return null;
    if (!data.servicesList?.length && !data.cart?.length) {
        return null;
    }

    return (
        <div>
            <div className="list-group mx-2 text-sm my-2 billing-page-display-child">
                <div className="list-group-item d-flex justify-content-between bg-secondary-subtle">
                    <span className="mt-2 fw-bold">Current Billing Details</span>
                </div>
                <div className="list-group-item d-flex justify-content-between">
                    <span className="d-flex align-items-center">
                        <RiPercentLine className="me-2" />
                        Total Taxes
                    </span>
                    <span className="fw-bold">{currencyFormatter.format(data.totalAmountIncurredDueTax ?? data.amountIncurredDueTax)}</span>
                </div>

                <div className="list-group-item d-flex justify-content-between">
                    <span className="d-flex align-items-center">
                        <RiMoneyDollarCircleLine className="me-2" />
                        Total Cost
                    </span>
                    <span className="fw-bold">{currencyFormatter.format(data?.totalcost || data?.subtotal)}</span>
                </div>
                <div className="list-group-item d-flex justify-content-between bg-primary-subtle">
                    <span className="d-flex align-items-center">
                        <RiDiscountPercentLine className="me-2" />
                        Total Surcharge
                    </span>
                    <span className="fw-bold">{currencyFormatter.format(data.totalsurcharge)}</span>
                </div>
                <div className="list-group-item d-flex justify-content-between bg-primary-subtle">
                    <span className="d-flex align-items-center">
                        <RiDiscountPercentLine className="me-2" />
                        Total  Discount
                    </span>
                    <span className="fw-bold">{currencyFormatter.format(data.totaldiscount ?? data.discount)}</span>
                </div>
                 <div className="list-group-item d-flex justify-content-between  border-5 border-primary">
                    <span className="d-flex align-items-center">
                        <RiWallet3Line className="me-2" />
                        Actual Amount 
                    </span>
                    <span className="fw-bold">{currencyFormatter.format(data.actualAmount ? data.actualAmount : 0)}</span>
                </div>
                <div className="list-group-item d-flex justify-content-between  border-5 border-primary">
                    <span className="d-flex align-items-center">
                        <RiWallet3Line className="me-2" />
                        Amt. Payable
                    </span>
                    <span className="fw-bold">{currencyFormatter.format(data.amountPayable ?? data.payable)}</span>
                </div>
                <div className="list-group-item d-flex justify-content-between bg-secondary-subtle">
                    <span className="d-flex align-items-center">
                        <RiCheckboxCircleLine className="me-2" />
                        Amount Paid
                    </span>
                    <span className="fw-bold">{currencyFormatter.format(data.paid ?? 0)}</span>
                </div>
                <div className="list-group-item d-flex justify-content-between bg-danger-subtle">
                    <span className="d-flex align-items-center">
                        <RiErrorWarningLine className="me-2" />
                        Outstanding
                    </span>
                    <span className="fw-bold">{currencyFormatter.format(data.balance ?? data.outstanding)}</span>
                </div>
            </div>

            <MultiBillingPageAdditionalInformation handlesubmit={handlesubmit} />
        </div>
    );
}
