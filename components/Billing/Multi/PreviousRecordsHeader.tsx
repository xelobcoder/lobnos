import React, { useContext } from "react";
import { Card } from "react-bootstrap";
import { currencyFormatter } from "../../Auth/customFetch";
import { MultiBillingContext } from "./MultiBillingContext";

export default function PreviousRecordsHeader() {
    const context = useContext(MultiBillingContext);
    if (!context) return null;
    const { billingdata } = context;
    const prev = billingdata?.previousRecordsSummary || {};

    return (
        <Card.Header className="bg-secondary-subtle px-2 py-2 d-flex flex-wrap align-items-center gap-2">
            <div className="d-flex flex-wrap align-items-center gap-2 w-100 small" style={{ fontWeight: 500 }}>
                <span>Prev Total: <b>{!billingdata?.previousRecordsSummary ? 'XXXXXX' : currencyFormatter.format(Number(prev.totalTransactionCost || 0))}</b></span>
                <span className="mx-2 d-none d-md-inline">|</span>
                <span>Prev Paid: <b>{!billingdata?.previousRecordsSummary ? 'XXXXXX' : currencyFormatter.format(Number(prev.paid || 0))}</b></span>
                <span className="mx-2 d-none d-md-inline">|</span>
                <span>Prev Refunded: <b style={{ color: '#dc3545' }}>{!billingdata?.previousRecordsSummary ? 'XXXXXX' : currencyFormatter.format(Number(prev.totalrefunded || 0))}</b></span>
                <span className="mx-2 d-none d-md-inline">|</span>
                <span>Prev Outstanding: <b style={{ color: '#dc3545' }}>{!billingdata?.previousRecordsSummary ? 'XXXXXX' : currencyFormatter.format(Number(prev.outstanding || 0))}</b></span>
                <span className="mx-2 d-none d-md-inline">|</span>
                <span>Prev Balance: <b>{!billingdata?.previousRecordsSummary ? 'XXXXXX' : currencyFormatter.format(Number(prev.balance || 0))}</b></span>
                <span className="mx-2 d-none d-md-inline">|</span>
                <span>Prev Tax: <b>{!billingdata?.previousRecordsSummary ? 'XXXXXX' : currencyFormatter.format(Number(prev.amountIncurredDueTax || 0))}</b></span>
                <span className="mx-2 d-none d-md-inline">|</span>
                <span>Prev Payable: <b>{!billingdata?.previousRecordsSummary ? 'XXXXXX' : currencyFormatter.format(Number(prev.payable || 0))}</b></span>
            </div>
        </Card.Header>
    );
}
