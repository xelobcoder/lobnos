"use client";
import React, { useCallback, useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { RiRefreshLine } from "@remixicon/react";
import { customPost, currencyFormatter, customFetch } from "../../../../../components/Auth/customFetch";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";
import CommissionLineChart from "../../../clinicians/commissions-information/CommissionLineChart";
import { DateToolbar, OrganizationTable, ReportState, SummaryMetric, TableCell, reportRecords, useOrganizationReport } from "../../OrganizationUi";
import styles from "../../organizations.module.css";

interface CommissionData {
    service_date: string;
    organization_id: number;
    organization_name: string;
    serviceid: number;
    organization_phone: string;
    organization_type: string;
    organization_location: string;
    total_services: number;
    total_payable: string;
    total_paid: string;
    commission_earned: string;
}
interface PaymentMode { KeyID: number; PaymentMode: string }
interface OrganizationInfo { name: string; mobile: string }

export default function OrganizationCommissionDetails(props: { params: Promise<{ organization: string }> }) {
    const params = use(props.params);
    const defaultStartDate = dayjs().startOf("year").format("YYYY-MM-DD");
    const defaultEndDate = dayjs().format("YYYY-MM-DD");
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [dateFilter, setDateFilter] = useState("This Year");
    const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
    const [showBulkPayModal, setShowBulkPayModal] = useState(false);
    const [settlementMode,setSettlementMode]=useState<'partial'|'full'|'waiver'>('partial');
    const [waiverReason,setWaiverReason]=useState('');
    const [bulkPayAmount, setBulkPayAmount] = useState("");
    const [bulkPayMethod, setBulkPayMethod] = useState<number | null>(null);
    const [bulkPayLoading, setBulkPayLoading] = useState(false);
    const [bulkPayError, setBulkPayError] = useState<string | null>(null);
    const paymentPending = useRef(false);
    const application = useApplication();
    const employeeid = application?.user?.employeeid;
    const branchid = application?.branchid;
    useEffect(() => {
        setSelectedRecords(new Set());
        setShowBulkPayModal(false);
        setBulkPayAmount("");
        setBulkPayMethod(null);
        setBulkPayError(null);
    }, [params.organization]);

    const retrieve = useCallback(async () => {
        const response = await customFetch(`organization/commission?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&organizationid=${encodeURIComponent(params.organization)}`);
        return reportRecords<CommissionData>(response, Array.isArray(response?.result) ? "result" : "data");
    }, [params.organization, startDate, endDate]);
    const { data, loading, error, refresh } = useOrganizationReport(retrieve);
    const retrieveOrganization = useCallback(async () => reportRecords<OrganizationInfo>(
        await customFetch(`organization/basic?id=${Number(params.organization)}`), "result"
    ), [params.organization]);
    const organization = useOrganizationReport(retrieveOrganization);
    const retrievePaymentModes = useCallback(async () => reportRecords<PaymentMode>(await customFetch("paymentmodes"), "data"), []);
    const modes = useOrganizationReport(retrievePaymentModes);
    const known = !loading && !error;
    const summary = data.reduce((acc, item) => ({
        services: acc.services + Number(item.total_services),
        payable: acc.payable + Number(item.total_payable),
        paid: acc.paid + Number(item.total_paid),
        earned: acc.earned + Number(item.commission_earned),
    }), { services: 0, payable: 0, paid: 0, earned: 0 });
    const selectedCommissionDue = data.reduce((sum, record) =>
        selectedRecords.has(record.serviceid) ? sum + Number(record.commission_earned) : sum, 0);
    const clearSelectionAndRefresh = () => { setSelectedRecords(new Set()); void refresh(); };
    const handleDateRangeChange = (start: string, end: string) => {
        setSelectedRecords(new Set());
        setStartDate(start);
        setEndDate(end);
    };
    const handleSelectRecord = (serviceId: number) => setSelectedRecords(previous => {
        const next = new Set(previous);
        if (next.has(serviceId)) next.delete(serviceId);
        else next.add(serviceId);
        return next;
    });
    const allSelected = data.length > 0 && data.every(record => selectedRecords.has(record.serviceid));
    const handleSelectAll = () => setSelectedRecords(allSelected ? new Set() : new Set(data.map(record => record.serviceid)));

    const handleBulkPay = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (paymentPending.current) return;
        setBulkPayError(null);
        const amount = settlementMode==='full'?Number(selectedCommissionDue.toFixed(2)):Number(bulkPayAmount);
        if(settlementMode==='waiver'&&(waiverReason.trim().length<3||!window.confirm('Waive the unpaid balance of GHS '+(selectedCommissionDue-amount).toFixed(2)+'? This explicitly writes off that commission.'))){setBulkPayError('A waiver needs an administrator and a reason of at least 3 characters.');return;}
        if (!known || !selectedRecords.size || !employeeid || !branchid) {
            setBulkPayError("Load the records and select services before processing a payment with an authenticated employee and branch.");
            return;
        }
        if (!Number.isFinite(amount) || !Number.isFinite(selectedCommissionDue) ||
            (settlementMode!=='waiver'?amount<=0:amount<0) || amount > Number(selectedCommissionDue.toFixed(2))) {
            setBulkPayError("Enter a positive amount no greater than the selected commission earned.");
            return;
        }
        if (!bulkPayMethod || !modes.data.some(mode => mode.KeyID === bulkPayMethod)) {
            setBulkPayError("Select an available payment method.");
            return;
        }
        paymentPending.current = true;
        setBulkPayLoading(true);
        try {
            const payload = {
                startDate, endDate, commissionDue: Number(selectedCommissionDue.toFixed(2)), settlementMode, waiverReason,
                amountPaid: amount, commissionType: "paid", paymentMethod: bulkPayMethod,
                employeeid, recipient_type: "organization", branchid,
                recipientid: params.organization, services: Array.from(selectedRecords),
            };
            const response = await customPost(
                `commission-payments/commission/batch/process-services?employeeid=${employeeid}&branchid=${branchid}`, "POST", payload
            );
            if (response && (response.success === true || response.status === true || response.status === "success")) {
                toast.success(response.data?.requiresApproval?'Commission request submitted for expense approval.':'Commission waiver recorded.');
                setShowBulkPayModal(false);
                setBulkPayAmount("");
                setBulkPayMethod(null);
                setSelectedRecords(new Set());
                await refresh();
            } else setBulkPayError(response?.message || "Failed to process the commission payment.");
        } catch (failure) {
            setBulkPayError(failure instanceof Error ? failure.message : "Unable to process the commission payment.");
        } finally {
            paymentPending.current = false;
            setBulkPayLoading(false);
        }
    };
    const columns = [
        { id: "selection", disableSortBy: true,
            Header: () => <input type="checkbox" className="form-check-input" aria-label="Select all loaded services"
                checked={allSelected} onChange={handleSelectAll} disabled={loading || bulkPayLoading} />,
            Cell: ({ row }: TableCell<CommissionData>) => <input type="checkbox" className="form-check-input"
                aria-label={`Select service ${row.original.serviceid}`} checked={selectedRecords.has(row.original.serviceid)}
                onChange={() => handleSelectRecord(row.original.serviceid)} disabled={loading || bulkPayLoading} />,
        },
        { Header: "Service date", accessor: "service_date", Cell: ({ row }: TableCell<CommissionData>) => dayjs(row.original.service_date).format("DD MMM YYYY") },
        { Header: "Service ID", accessor: "serviceid" },
        { Header: "Services", accessor: "total_services", Cell: ({ row }: TableCell<CommissionData>) => Number(row.original.total_services).toLocaleString() },
        ...(["total_payable", "total_paid", "commission_earned"] as const).map((accessor, index) => ({
            Header: ["Service payable", "Service paid", "Commission earned"][index], accessor,
            Cell: ({ row }: TableCell<CommissionData>) => currencyFormatter.format(Number(row.original[accessor])),
        })),
    ];
    const info = data[0];

    return <section className={`container-fluid p-2 ${styles.page}`} aria-busy={loading}>
        <header className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
                <h1 className="h5 fw-bold mb-1">Organization commission details</h1>
                <p className="small text-muted mb-0">
                    {organization.data[0]?.name || `Organization ID: ${params.organization}`}
                    {organization.data[0]?.mobile && ` · ${organization.data[0].mobile}`} · {startDate} – {endDate}
                </p>
            </div>
            <div className={`d-flex flex-wrap gap-2 ${styles.actions}`}>
                <Link href={`/commissions/organizations/commission-update/${params.organization}`}
                    className="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer">Update commission records</Link>
                <Link href={`/commissions/organizations/commissions-paid/${params.organization}`}
                    className="btn btn-outline-success btn-sm" target="_blank" rel="noopener noreferrer">View paid commissions</Link>
            </div>
        </header>
        {organization.error && <p className="small text-danger" role="alert">
            Organization contact details could not be loaded. <button className="btn btn-sm btn-outline-secondary" onClick={organization.refresh}>Retry details</button>
        </p>}
        <ReportState loading={loading} error={error} retry={clearSelectionAndRefresh} />
        <div className="row g-3 mb-3">
            {([
                ["Commission earned", summary.earned, "primary", true],
                ["Service payable", summary.payable, "secondary", true],
                ["Service paid", summary.paid, "success", true],
                ["Services", summary.services, "info", false],
            ] as const).map(([title, value, variant, financial]) => <div className="col-12 col-sm-6 col-xl-3" key={title}>
                <SummaryMetric title={title} value={known ? value : null} variant={variant} financial={financial} subtitle="In returned records for this period" />
            </div>)}
        </div>
        <DateToolbar value={dateFilter} onChange={setDateFilter} onDateRangeChange={handleDateRangeChange} disabled={loading || bulkPayLoading}>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearSelectionAndRefresh} disabled={loading || bulkPayLoading}>
                <RiRefreshLine size={16} className="me-1" aria-hidden="true" />Refresh
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading || bulkPayLoading}
                onClick={() => { setDateFilter("This Year"); handleDateRangeChange(defaultStartDate, defaultEndDate); }}>Reset</button>
        </DateToolbar>
        {known && <>
            {info && <dl className="row small mb-3">
                <dt className="col-4 col-md-1">Phone</dt><dd className="col-8 col-md-3">{info.organization_phone || "Not provided"}</dd>
                <dt className="col-4 col-md-1">Location</dt><dd className="col-8 col-md-3">{info.organization_location || "Not provided"}</dd>
                <dt className="col-4 col-md-1">Type</dt><dd className="col-8 col-md-3">{info.organization_type || "Not provided"}</dd>
            </dl>}
            {data.length > 0 ? <>
                <section className={`mb-3 ${styles.trend}`} aria-labelledby="commission-trend">
                    <h2 id="commission-trend" className="h6 fw-semibold mb-2">Commission earned by service date</h2>
                    <CommissionLineChart data={data} view="line" />
                </section>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <h2 className="h6 fw-semibold mb-0">Commission records</h2>
                    <span className="small text-muted">{selectedRecords.size.toLocaleString()} selected · {currencyFormatter.format(selectedCommissionDue)} earned</span>
                    <Button variant="success" size="sm" disabled={!selectedRecords.size || !employeeid || !branchid || bulkPayLoading ||
                        !Number.isFinite(selectedCommissionDue) || selectedCommissionDue <= 0}
                        onClick={() => { setBulkPayError(null); setShowBulkPayModal(true); }}>Pay selected commissions</Button>
                </div>
                <p className="small text-muted mb-2">Service paid is the amount paid for services, not a commission payment. Commission payments are listed under View paid commissions.</p>
                <OrganizationTable data={data} column={columns} filtering rowStyling={{
                    type: "custom", getRowClassName: (record: CommissionData) => selectedRecords.has(record.serviceid) ? "table-active" : "",
                }} />
            </> : <p className="text-muted py-3">No commission records for this organization in the selected period.</p>}
        </>}
        <Modal show={showBulkPayModal} backdrop="static" keyboard={!bulkPayLoading}
            onHide={() => { if (!paymentPending.current) setShowBulkPayModal(false); }}>
            <Modal.Header closeButton={!bulkPayLoading}>
                <Modal.Title className="h6 mb-0">Pay selected organization commissions</Modal.Title>
            </Modal.Header>
            <Modal.Body aria-busy={bulkPayLoading}>
                <p className="small">Organization ID: {params.organization} · {startDate} – {endDate}</p>
                <p className="small">{selectedRecords.size.toLocaleString()} selected records · Commission earned: {currencyFormatter.format(selectedCommissionDue)}</p>
                <ReportState loading={modes.loading} error={modes.error} retry={modes.refresh} />
                {!modes.loading && !modes.error && !modes.data.length && <p role="alert" className="text-danger small">No payment methods are available. Payment cannot be processed.</p>}
                <Form id="organization-commission-payment" onSubmit={handleBulkPay}>
                    <fieldset disabled={bulkPayLoading}>
                        <legend className="h6">Payment information</legend>
                        <div className="alert alert-info small">This creates an expense payment request. Approval and payment happen separately under Expenses. Partial payments keep the remaining balance outstanding. <a href="/billing/expenses/awaiting-approval">Review expense requests</a></div><Form.Group className="mb-3"><Form.Label>Settlement choice</Form.Label><Form.Select value={settlementMode} disabled={bulkPayLoading} onChange={event=>{const mode=event.target.value as typeof settlementMode;setSettlementMode(mode);if(mode==='full')setBulkPayAmount(selectedCommissionDue.toFixed(2));}}><option value="partial">Partial payment — retain the balance</option><option value="full">Full payment</option><option value="waiver">Settle with explicit waiver (administrator)</option></Form.Select></Form.Group>{settlementMode==='waiver'&&<Form.Group className="mb-3"><Form.Label>Reason for waiver</Form.Label><Form.Control as="textarea" minLength={3} required value={waiverReason} onChange={event=>setWaiverReason(event.target.value)}/><Form.Text>The difference between commission due and the requested payment is written off.</Form.Text></Form.Group>}<Form.Group className="mb-3" controlId="organization-payment-method">
                            <Form.Label>Payment method</Form.Label>
                            <Form.Select size="sm" required value={bulkPayMethod ?? ""} disabled={modes.loading || Boolean(modes.error)}
                                onChange={event => setBulkPayMethod(event.target.value ? Number(event.target.value) : null)}>
                                <option value="">Select payment method</option>
                                {modes.data.map(mode => <option key={mode.KeyID} value={mode.KeyID}>{mode.PaymentMode}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="organization-payment-amount">
                            <Form.Label>Requested payment amount</Form.Label>
                            <Form.Control type="number" size="sm" min="0.01" step="0.01" max={selectedCommissionDue} required
                                value={bulkPayAmount} onChange={event => setBulkPayAmount(event.target.value)}
                                aria-describedby="organization-payment-help" />
                            <Form.Text id="organization-payment-help">Enter a positive amount no greater than the selected commission earned.</Form.Text>
                        </Form.Group>
                    </fieldset>
                    {bulkPayError && <p role="alert" className="text-danger small">{bulkPayError}</p>}
                    {bulkPayLoading && <p role="status" className="small mb-0">Processing commission payment…</p>}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" size="sm" disabled={bulkPayLoading} onClick={() => setShowBulkPayModal(false)}>Cancel</Button>
                <Button type="submit" form="organization-commission-payment" variant="primary" size="sm"
                    disabled={bulkPayLoading || modes.loading || Boolean(modes.error) || !modes.data.length || !bulkPayAmount}>
                    {bulkPayLoading ? "Processing…" : "Submit payment request"}
                </Button>
            </Modal.Footer>
        </Modal>
    </section>;
}
