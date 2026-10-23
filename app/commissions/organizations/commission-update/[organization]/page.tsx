"use client";
import React, { useCallback, useEffect, useRef, useState, use } from "react";
import { RiEditLine, RiRefreshLine } from "@remixicon/react";
import dayjs from "dayjs";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { customPost, currencyFormatter, customFetch } from "../../../../../components/Auth/customFetch";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";
import { DateToolbar, OrganizationTable, Pagination, ReportState, SummaryMetric, TableCell, reportRecords, useOrganizationReport } from "../../OrganizationUi";
import styles from "../../organizations.module.css";

interface CommissionRecord {
    id: number;
    service_id: number;
    service_amount: string;
    commission_type: string;
    percentage_rate_applied: number | null;
    fixed_amount_applied: number | null;
    tier_id?: number;
    commission_due: string;
    min_cap_adjustment: string;
    max_cap_adjustment: string;
    period_cap_adjustment: string;
    final_commission: string;
    config_id: number;
    assignment_id?: number;
    recipient_type: string;
    recipient_id: number;
    cap_period_reference?: string;
    status: string;
    currency: string;
    calculated_at: string;
    created_at: string;
    updated_at: string;
    totalpayable: string;
    paidamount: string;
    serviceAddedOn: string;
    serviceCategory: string;
    test_name: string;
    recipient_name?: string;
}

export default function OrganizationCommissionUpdatePage(props: { params: Promise<{ organization: string }> }) {
    const params = use(props.params);
    const [startDate, setStartDate] = useState(dayjs().startOf("year").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [dateFilter, setDateFilter] = useState("This Year");
    const [selectedRecord, setSelectedRecord] = useState<CommissionRecord | null>(null);
    const [newRate, setNewRate] = useState("");
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const pending = useRef(false);
    const employeeid = useApplication()?.user?.employeeid;
    useEffect(() => { setSelectedRecord(null); }, [params.organization, startDate, endDate]);
    const fetchPage = useCallback(async ({ page, count }: Pagination) => {
        const response = await customFetch(`commission-payments/detailed/list?page=${page}&&count=${count}&&recipientType=organization&&recipient_id=${encodeURIComponent(params.organization)}&&startDate=${encodeURIComponent(startDate)}&&endDate=${encodeURIComponent(endDate)}`);
        return reportRecords<CommissionRecord>(response, "data");
    }, [params.organization, startDate, endDate]);
    const retrieve = useCallback(() => fetchPage({ page: 1, count: 10 }), [fetchPage]);
    const { data, loading, error, refresh, revision } = useOrganizationReport(retrieve);
    const handleServerSideProcessing = async (pagination: Pagination) => {
        try { return { result: await fetchPage(pagination), error: false as const }; }
        catch (failure) { return { result: [], error: failure instanceof Error ? failure.message : "Unable to load commission records." }; }
    };
    const known = !loading && !error;
    const summary = data.reduce((acc, item) => ({
        service: acc.service + Number(item.service_amount),
        commission: acc.commission + Number(item.final_commission),
        adjustments: acc.adjustments + Number(item.min_cap_adjustment) + Number(item.max_cap_adjustment) + Number(item.period_cap_adjustment),
    }), { service: 0, commission: 0, adjustments: 0 });
    const openUpdateModal = (record: CommissionRecord) => {
        if (pending.current) return;
        setSelectedRecord(record);
        setNewRate(record.final_commission);
        setUpdateError(null);
    };
    const handleUpdateRate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (pending.current || !selectedRecord) return;
        const amount = Number(newRate);
        if (!employeeid || newRate.trim() === "" || !Number.isFinite(amount) || amount < 0) {
            setUpdateError("Enter a valid non-negative commission amount with an authenticated employee.");
            return;
        }
        pending.current = true;
        setUpdating(true);
        setUpdateError(null);
        try {
            const response = await customPost(
                `commission-payments/commission/recipient/update-rates/${selectedRecord.id}?employeeid=${employeeid}`,
                "PUT", {
                    recipientType: selectedRecord.recipient_type,
                    recipientId: selectedRecord.recipient_id,
                    configId: selectedRecord.config_id,
                    serviceId: selectedRecord.service_id,
                    newCommissionAmount: amount,
                }
            );
            if (response?.status === true) {
                toast.success("Commission amount updated successfully.");
                setSelectedRecord(null);
                await refresh();
            } else setUpdateError(response?.message || "Failed to update the commission amount.");
        } catch (failure) {
            setUpdateError(failure instanceof Error ? failure.message : "Unable to update the commission amount.");
        } finally {
            pending.current = false;
            setUpdating(false);
        }
    };
    const columns = [
        { accessor: "service_id", Header: "Service ID" },
        { accessor: "test_name", Header: "Test / category",
            Cell: ({ row }: TableCell<CommissionRecord>) => <div>{row.original.test_name}<div className="small text-muted">{row.original.serviceCategory}</div></div> },
        { accessor: "commission_type", Header: "Commission type" },
        ...(["service_amount", "final_commission", "min_cap_adjustment", "max_cap_adjustment", "period_cap_adjustment"] as const).map((accessor, index) => ({
            accessor, Header: ["Service amount", "Commission", "Min cap adjustment", "Max cap adjustment", "Period cap adjustment"][index],
            Cell: ({ row }: TableCell<CommissionRecord>) => currencyFormatter.format(Number(row.original[accessor])),
        })),
        { accessor: "status", Header: "Status",
            Cell: ({ row }: TableCell<CommissionRecord>) => <span className={row.original.status === "paid" ? "text-success" : row.original.status === "voided" ? "text-danger" : "text-body"}>{row.original.status}</span> },
        { Header: "Actions", id: "actions", disableSortBy: true,
            Cell: ({ row }: TableCell<CommissionRecord>) => <Button variant="outline-primary" size="sm" disabled={updating || !employeeid}
                onClick={() => openUpdateModal(row.original)}><RiEditLine size={16} className="me-1" aria-hidden="true" />Update</Button> },
    ];

    return <section className={`container-fluid p-2 ${styles.page}`} aria-busy={loading}>
        <header className="mb-3">
            <h1 className="h5 fw-bold mb-1">Update organization commissions</h1>
            <p className="small text-muted mb-0">Organization ID: {params.organization} · {startDate} – {endDate}</p>
        </header>
        <ReportState loading={loading} error={error} retry={refresh} />
        <div className="row g-3 mb-3">
            {([
                ["Service amount", summary.service, "secondary"],
                ["Commission", summary.commission, "primary"],
                ["Cap adjustments", summary.adjustments, "info"],
            ] as const).map(([title, value, variant]) => <div className="col-12 col-sm-6 col-xl-4" key={title}>
                <SummaryMetric title={title} value={known ? value : null} financial variant={variant} subtitle="Initial loaded records (up to 10)" />
            </div>)}
        </div>
        <DateToolbar value={dateFilter} onChange={setDateFilter} disabled={loading || updating}
            onDateRangeChange={(start, end) => { setStartDate(start); setEndDate(end); }}>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={refresh} disabled={loading || updating}>
                <RiRefreshLine size={16} className="me-1" aria-hidden="true" />Refresh
            </button>
        </DateToolbar>
        {known && <>
            <p className="small text-muted mb-2">Metrics summarize the initial response only, not subsequent table pages or all commissions.</p>
            {data.length ? <OrganizationTable key={`${startDate}-${endDate}-${revision}`} data={data} column={columns} filtering
                handleSeverSideProcessing={handleServerSideProcessing} />
                : <p className="text-muted py-3">No commission records for this organization in the selected period.</p>}
        </>}
        <Modal show={Boolean(selectedRecord)} backdrop="static" keyboard={!updating}
            onHide={() => { if (!pending.current) setSelectedRecord(null); }}>
            <Modal.Header closeButton={!updating}><Modal.Title className="h6 mb-0">Update commission amount</Modal.Title></Modal.Header>
            <Modal.Body aria-busy={updating}>
                {selectedRecord && <>
                    <dl className="row small">
                        <dt className="col-5">Service</dt><dd className="col-7">{selectedRecord.test_name} (ID: {selectedRecord.service_id})</dd>
                        <dt className="col-5">Commission type</dt><dd className="col-7">{selectedRecord.commission_type}</dd>
                        <dt className="col-5">Service amount</dt><dd className="col-7">{currencyFormatter.format(Number(selectedRecord.service_amount))}</dd>
                        <dt className="col-5">Current commission</dt><dd className="col-7">{currencyFormatter.format(Number(selectedRecord.final_commission))}</dd>
                    </dl>
                    <Form id="organization-commission-update" onSubmit={handleUpdateRate}>
                        <Form.Group className="mb-3" controlId="organization-new-commission">
                            <Form.Label>New commission amount</Form.Label>
                            <Form.Control type="number" size="sm" required min="0" step="0.01" value={newRate}
                                disabled={updating} onChange={event => setNewRate(event.target.value)} />
                        </Form.Group>
                        {updateError && <p className="small text-danger" role="alert">{updateError}</p>}
                        {updating && <p className="small mb-0" role="status">Updating commission amount…</p>}
                    </Form>
                </>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" size="sm" disabled={updating} onClick={() => setSelectedRecord(null)}>Cancel</Button>
                <Button type="submit" form="organization-commission-update" variant="primary" size="sm" disabled={updating || !employeeid}>
                    {updating ? "Updating…" : "Update commission"}
                </Button>
            </Modal.Footer>
        </Modal>
    </section>;
}
