"use client";
import React from "react";
import dayjs from "dayjs";
import { Modal } from "react-bootstrap";
import { currencyFormatter } from "../../../../../../components/Auth/customFetch";
import PrimeTable from "../../../../../../components/accessories/Datatables/PrimeTable";
import { ErrorState, LoadingState, TableCell } from "../../ClinicianUi";

interface CommissionPayment {
    id: number; batch_payment_id: number; serviceid: number; commission_due: string;
    amount_allocated: string; waived_amount: string; status: string; created_at: string;
    commission_percentage: string; type: string; recipient_id: number;
}
interface ServiceRecord {
    service_date: string; total_services: number; total_payable?: string; total_paid?: string;
    earned_revenue?: string; cash_collected?: string; commission_earned: string;
}
interface Props {
    show: boolean; onHide: () => void; commissionPayments: CommissionPayment[];
    selectedRecord: ServiceRecord | null; loading: boolean; error?: string | null; onRetry?: () => void;
    clinicianId: string; paymentModes: { KeyID: number; PaymentMode: string }[];
    onPaymentSuccess?: () => void;
}

export default function CommissionDetailsModal({ show, onHide, commissionPayments, selectedRecord, loading, error, onRetry }: Props) {
    const money = (value: string | number) => currencyFormatter.format(Number(value));
    const columns = [
        { Header: "Payment ID", accessor: "id" },
        { Header: "Batch ID", accessor: "batch_payment_id" },
        { Header: "Due", accessor: "commission_due", Cell: ({ value }: TableCell<CommissionPayment>) => money(value) },
        { Header: "Allocated", accessor: "amount_allocated", Cell: ({ value }: TableCell<CommissionPayment>) => money(value) },
        { Header: "Waived", accessor: "waived_amount", Cell: ({ value }: TableCell<CommissionPayment>) => money(value) },
        { Header: "Commission rate", accessor: "commission_percentage", Cell: ({ value }: TableCell<CommissionPayment>) => `${value}%` },
        { Header: "Type", accessor: "type" },
        { Header: "Created", accessor: "created_at", Cell: ({ value }: TableCell<CommissionPayment>) => dayjs(value).format("DD/MM/YYYY HH:mm") },
        { Header: "Status", accessor: "status" },
    ];
    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static" aria-labelledby="commission-history-title">
            <Modal.Header closeButton><Modal.Title id="commission-history-title" className="h6">Commission payment details</Modal.Title></Modal.Header>
            <Modal.Body aria-busy={loading}>
                {selectedRecord && <section className="mb-3">
                    <h2 className="h6">Service information</h2>
                    <dl className="row small">
                        <dt className="col-sm-4">Service date</dt><dd className="col-sm-8">{dayjs(selectedRecord.service_date).format("DD/MM/YYYY")}</dd>
                        <dt className="col-sm-4">Services</dt><dd className="col-sm-8">{selectedRecord.total_services.toLocaleString()}</dd>
                        <dt className="col-sm-4">Total payable</dt><dd className="col-sm-8">{money(selectedRecord.earned_revenue ?? selectedRecord.total_payable ?? 0)}</dd>
                        <dt className="col-sm-4">Total paid</dt><dd className="col-sm-8">{money(selectedRecord.cash_collected ?? selectedRecord.total_paid ?? 0)}</dd>
                        <dt className="col-sm-4">Commission earned</dt><dd className="col-sm-8">{money(selectedRecord.commission_earned)}</dd>
                    </dl>
                </section>}
                <h2 className="h6">Payment history</h2>
                {loading ? <LoadingState>Loading commission payment history…</LoadingState> : error ? <ErrorState message={error} onRetry={onRetry} /> : commissionPayments.length ? <>
                    <PrimeTable column={columns} data={commissionPayments} filtering={false} serverSideFiltering={false} handleSeverSideProcessing={undefined} />
                    <p className="small mt-2 mb-0">
                        Total due: {money(commissionPayments.reduce((sum, payment) => sum + Number(payment.commission_due), 0))};
                        {" "}Allocated: {money(commissionPayments.reduce((sum, payment) => sum + Number(payment.amount_allocated), 0))};
                        {" "}Outstanding: {money(commissionPayments.reduce((sum, payment) => sum + Number(payment.commission_due) - Number(payment.amount_allocated), 0))}
                    </p>
                </> : <p className="text-muted mb-0">No payment records found for this service.</p>}
            </Modal.Body>
            <Modal.Footer><button type="button" className="btn btn-outline-secondary btn-sm" onClick={onHide}>Close</button></Modal.Footer>
        </Modal>
    );
}
