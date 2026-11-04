"use client";
import {errorMessage} from '../../lib/errorMessage';
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Dropdown } from "react-bootstrap";
import { RiEdit2Line, RiFileAddLine, RiDeleteBinLine, RiPrinterLine, RiRefund2Line, RiFileList2Line, RiMore2Line, RiEyeLine, RiMoneyDollarCircleLine } from '@remixicon/react';
import { currencyFormatter, customFetch, customPost } from "../Auth/customFetch";
import { plsEncryption } from "../../lib/encryption";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal, Button, Form, Offcanvas } from "react-bootstrap";
import { handleDatePicker, handleSeverSideProcessing } from "../serverActions/ActionFiltering";
import { useApplication, useApplicationSettings } from "../Auth/useApplicationContext";
import { roleAllowed } from "../Auth/roles";
import { RiCalendarEventLine, RiTableLine, RiArrowDownSLine, RiArrowRightSLine } from "@remixicon/react";
import styles from './../../styles/SmsTemplateList.module.css'
import { billingSource } from "../../lib/billingLib";
import AdjustBillingSourceModal from './AdjustBillingSourceModal';
import dayjs from "dayjs";
import tableLayout from "./BilledClientsLayout.module.css";
import usePageStickyTableHeader from "./usePageStickyTableHeader";
const PreviousTransactionWorkspace = React.lazy(() => import("../../app/billing/transactions/previous-transaction/[billingid]/PreviousTransactionWorkspace"));
import ISLOADING from "../isLoading";
import DateFilterReusable from "../operations/Laboratory/ResuableFilter/DateFilterReusable";
import { fetchSaleClosures, type SaleClosure } from "../../lib/billing/financialControls";

export interface BillingSourceOption {
	value: number;
	label: string;
}

interface BilledClientsViewProps {
	data: any[];
	branchid: number | string;
	expensesPaymentMade?: any[];
	isLoading?: boolean;
	datequery?: DateQuery;
	setDatequery?: React.Dispatch<React.SetStateAction<DateQuery>>;
	showFilters?: boolean;
}

interface DateQuery {
	from: string;
	to: string;
}

interface TableColumn {
	Header: string;
	accessor: string;
    title?: string;
	Cell?: ({ value, row }: { value: any, row: any }) => React.ReactNode;
}

interface RowData {
	original: {
		billingid: number;
		patientid: number;
		fullpatientid: string;
		outstanding: number;
		[key: string]: any;
	};
}

type ModalType = 'adjust' | 'update' | null;


export default function BilledClientsView({
	data,
	branchid,
	expensesPaymentMade,
	isLoading = false,
	datequery: propDatequery,
	setDatequery: propSetDatequery,
	showFilters = true
}: BilledClientsViewProps) {
	const searchParams = useSearchParams();
	const pquery = useMemo(() => {
		const from = searchParams?.get('from') || '';
		const to = searchParams?.get('to') || '';
		return { from, to };
	}, [searchParams]);

	// Use internal state if no props are provided
	const [internalDatequery, setInternalDatequery] = useState<DateQuery>({
		from: pquery.from || '', to: pquery.to || ''
	});
	const datequery = propDatequery || internalDatequery;
	const setDatequery = propSetDatequery || setInternalDatequery;
	const [dateFilter, setDateFilter] = useState<string>(datequery.from && datequery.to ? 'Custom Range' : 'All');

	const user = useApplication()?.user;
	const userRole = user?.role?.toLowerCase();
	const isAdmin = roleAllowed(userRole, ['admin', 'accountant', 'manager']);

	const predefinedReasons = [
		"Add missing service/test",
		"Correct service/test details",
		"Update patient information",
		"Adjust billing amount",
		"Add discount",
		"Apply surcharge",
		"Other"
	];

	const [selectedReason, setSelectedReason] = useState("");
	const [customReason, setCustomReason] = useState("");

	useEffect(() => {
		// Only use this effect only if we're using internal state
		if (!propDatequery || !propSetDatequery) {
			if (pquery.from || pquery.to) {
				setInternalDatequery({
					from: pquery.from || '', to: pquery.to || ''
				});
			}
		}
	}, [pquery.from, pquery.to, propDatequery, propSetDatequery]);

	const { employeeid } = useApplicationSettings().applicationsettings.user;
	const router = useRouter();

	const [showModal, setShowModal] = useState<boolean>(false);
	const [modalType, setModalType] = useState<ModalType>(null);
	const [modalBillingId, setModalBillingId] = useState<number | null>(null);
	const [modalPatientId, setModalPatientId] = useState<number | string | null>(null);
	const [modalRandString, setModalRandString] = useState<string>("");
	const [modalUserRandInput, setModalUserRandInput] = useState<string>("");
	const [modalReason, setModalReason] = useState<string>("");
	const [itemToEdit, setItemToEdit] = useState<any>(null);
	const [viewedBill, setViewedBill] = useState<any>(null);
    const [clientSearch, setClientSearch] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [transactionFilter, setTransactionFilter] = useState('');
	const [viewMode, setViewMode] = useState<'sales' | 'expenses'>('sales');
    const [closures, setClosures] = useState<Map<number, SaleClosure>>(new Map());
    const [closureLoading, setClosureLoading] = useState(true);
    const [closureError, setClosureError] = useState("");
    const closureIds = useMemo(() => [...new Set((data || []).map(row => Number(row.billingid)).filter(id => Number.isSafeInteger(id) && id > 0))].join(","), [data]);
    useEffect(() => {
        let active = true, generation = 0;
        const refresh = async () => {
            const request = ++generation;
            setClosureLoading(true); setClosureError(""); setClosures(new Map());
            try {
                const result = await fetchSaleClosures(closureIds ? closureIds.split(",").map(Number) : []);
                if (active && request === generation) setClosures(result);
            } catch (error) {
                if (active && request === generation) setClosureError(error instanceof Error ? errorMessage(error) : "Sale closure status is unavailable.");
            } finally { if (active && request === generation) setClosureLoading(false); }
        };
        void refresh();
        window.addEventListener("focus", refresh);
        return () => { active = false; generation++; window.removeEventListener("focus", refresh); };
    }, [closureIds, data]);
    const saleIsOpen = (billingid: number) => !closureLoading && !closureError && closures.get(Number(billingid))?.closed_status === "OPEN";
    const requireOpenSale = (billingid: number) => {
        if (saleIsOpen(billingid)) return true;
        alert(closures.get(Number(billingid))?.closed_status === "CLOSED" ? "This sale is closed and read-only. Use an authorized linked correction, not a historical edit." : "Wait until the sale's closure status has been verified.");
        return false;
    };
    const tableViewportRef = useRef<HTMLDivElement>(null);
    usePageStickyTableHeader(tableViewportRef, `${viewMode}:${isLoading}`);
	const [showViewMore, setShowViewMore] = useState<boolean>(false);
	const [viewMoreData, setViewMoreData] = useState<any>(null);
	const processedData = useMemo(() => {
		if (!data) return [];
		const sorted = [...data].sort((a, b) => {
			if (a.billedon && b.billedon) {
				const dateA = new Date(a.billedon as string || 0);
				const dateB = new Date(b.billedon as string || 0);
				return dateA.getTime() - dateB.getTime();
			}
			return (a.billingid || 0) - (b.billingid || 0);
		});
		const seenDates = new Set<string>();
		return sorted.map(item => {
			const dateStr = item.billedon ? dayjs(item.billedon).format('YYYY-MM-DD') : '';
			const isFirstOfDay = dateStr && !seenDates.has(dateStr);
			if (isFirstOfDay) seenDates.add(dateStr);
			return { ...item, isFirstOfDay };
		});
	}, [data]);

    const paymentStatusKey = (value: any) => {
        const status = String(value || '').trim().toLowerCase();
        return status === 'partail' ? 'partial' : status === 'unpaid' ? 'pending' : status;
    };
    const visibleClients = useMemo(() => {
        const query = clientSearch.trim().toLowerCase();
        return processedData.filter(row => (!query || [row.fullname, row.fullpatientid, row.patientid, row.billingid, row.salesperson].some(value => String(value ?? '').toLowerCase().includes(query)))
            && (!paymentFilter || paymentStatusKey(row.paymentstatus) === paymentFilter)
            && (!transactionFilter || String(row.status || '').trim().toLowerCase() === transactionFilter));
    }, [processedData, clientSearch, paymentFilter, transactionFilter]);
    const paymentOptions = Array.from(new Set(processedData.map(row => paymentStatusKey(row.paymentstatus)).filter(Boolean))).sort();
    const transactionOptions = Array.from(new Set(processedData.map(row => String(row.status || '').trim().toLowerCase()).filter(Boolean))).sort();

	function generateRandString(): string {
		return Math.random().toString(36).substring(2, 8).toUpperCase();
	}

	function openAdjustModal(billingid: number, patientid: number | string): void {
        if (!requireOpenSale(billingid)) return;
		setModalType('adjust');
		setModalBillingId(billingid);
		setModalPatientId(patientid);
		const str = generateRandString();
		setModalRandString(str);
		setModalUserRandInput("");
		setModalReason("");
		const foundItem = data.find(item => item.billingid === billingid);
		setItemToEdit(foundItem || null);
		setShowModal(true);
	}

	const options: BillingSourceOption[] = billingSource.map((source: any) => ({
		value: source.value,
		label: source.label
	}));

	const formatOptionLabel = (option: BillingSourceOption) => (
		<span className="d-flex align-items-center gap-2">
			<span>{option.label}</span>
		</span>
	);

	function openUpdateModal(billingid: number, patientid: number | string): void {
        if (!requireOpenSale(billingid)) return;
		setModalType('update');
		setModalBillingId(billingid);
		setModalPatientId(patientid);
		setSelectedReason("");
		setCustomReason("");
		setModalReason("");
		setShowModal(true);
	}

	function closeModal(): void {
		setShowModal(false);
	}

	function handleAdjustmentModalContinue(): void {
        if (!modalBillingId || !requireOpenSale(modalBillingId)) return;
		closeModal();
		window.location.reload();
	}

	function handleModalSubmit(): void {
		if (!modalBillingId || !modalPatientId) {
			alert("Missing required data for this action!");
			return;
		}
		setShowModal(false);
		let finalReason = "";
		if (modalType === 'update') {
			if (!selectedReason) {
				alert("Please select a reason for updating the transaction!");
				setShowModal(true);
				return;
			}
			finalReason = selectedReason;
			if (selectedReason === "Other" && customReason.trim()) {
				finalReason = customReason.trim();
			}
		} else {
			finalReason = modalReason;
		}
		if (!finalReason) {
			alert("Please provide a reason for this action!");
			setShowModal(true);
			return;
		}
		const encPatientId = plsEncryption(modalPatientId.toString());
		const encReason = encodeURIComponent(finalReason);
		const adjustmentType = 'addition';
		const url = `/billing/patientid/${encPatientId}/multi?billingid=${modalBillingId}&isNewTransaction=0&&isRelatedBilling=1&&adjustmentReason=${encReason}&&adjustmentType=${adjustmentType}&&isAdjustment=1&&employeeid=${employeeid}`;
		router.push(url);
	}

	const handleVoidTransaction = async (row: RowData["original"]) => {
		const billingid = row?.billingid;
		if (!billingid) return;
        if (!requireOpenSale(billingid)) return;
		const confirmVoid = window.confirm(`Are you sure you want to void transaction #${billingid}? This action cannot be undone.`);
		if (!confirmVoid) return;
		try {
			const voidTransactionResponse = await customPost(`billing/management/void/${billingid}`, 'POST', {
				employeeid
			});
			const { status, statusCode, message } = voidTransactionResponse

			if (status == true && statusCode == 200) {
				alert(message);
				window.location.reload()
			} else {
				alert(message || 'Voiding transaction failed')
			}
		} catch (error) {
			alert(`Failed to void transaction: ${errorMessage(error)}`);
		}
	}

    const formatBillMoney = (value: any) => {
        const amount = Number(value) || 0;
        return <span className={tableLayout.money} title={currencyFormatter.format(amount)}>{currencyFormatter.format(amount)}</span>;
    };

	const coreColumns: TableColumn[] = [
		{
			Header: "Date", accessor: "billedon", title: "Date of Transaction", Cell: ({ value, row }) => {
				const formatted = value ? dayjs(value).format('MM/DD/YYYY HH:mm:ss') : '';
                return <div>
                    {row.original.isFirstOfDay ? <span style={{ backgroundColor: 'red', color: 'white', padding: '2px 4px', borderRadius: '4px' }}>{formatted}<br />(First of the day)</span> : <span>{formatted}</span>}
                    <small className="d-block text-muted mt-1">Billed by: {row.original.salesperson || '—'}</small>
                </div>;
            }
        },
		{
			Header: "Client Name",
			accessor: "fullname",
			title: "Full name of the client",
			Cell: ({ row }) => (
				<div className="d-flex flex-column" data-client-bill={row.original.billingid}>
					<span className="fw-semibold" title={row.original.fullname}>{row.original.fullname}</span>
					<span className="text-muted small">{row.original.fullpatientid}</span>
                    <span className="text-muted small">Bill ID: {row.original.billingid}</span>
				</div>
			)
		},

		{ Header: "Total Cost", accessor: "totalcost", title: "Total Cost", Cell: ({ value }) => <div>{formatBillMoney(value)}</div> },
		{ Header: "Discount", accessor: "discount", title: "Discount Amount", Cell: ({ value }) => <div>{formatBillMoney(value)}</div> },
		{ Header: "Refunded", accessor: "totalRefunded", title: "Total Refunded", Cell: ({ value }) => <div>{formatBillMoney(value)}</div> },
		{ Header: "Amount Payable", accessor: "totalpayable", title: "Amount Payable", Cell: ({ value }) => <div>{formatBillMoney(value)}</div> },
		{ Header: "Amount Paid", accessor: "paidamount", title: "Amount Paid", Cell: ({ value }) => <div>{formatBillMoney(value)}</div> },
		{
			Header: "Free of Charge", accessor: "foc_amount", title: "Staff FOC coverage", Cell: ({ value, row }) => {
				const amount = Number(value) || 0;
				return amount > 0 ? (
					<span className="text-info fw-semibold" title={`Staff FOC transaction #${row.original.foc_transaction_id || 'linked'}`}>
						{formatBillMoney(amount)}
					</span>
				) : <span className="text-muted">-</span>;
			}
		},
		{ Header: "Outstanding", accessor: "outstanding", title: "Outstanding Balance", Cell: ({ value }) => (<div><span className={Number(value) > 0 ? "text-danger" : "text-primary"}>{formatBillMoney(value)}</span></div>) },
		{ Header: "Surcharge", accessor: "surcharge", title: "Surcharge Amount", Cell: ({ value }) => <div>{formatBillMoney(value)}</div> },
		{ Header: "Write-off", accessor: "writeoff", title: "Write Off Amount", Cell: ({ value }) => <div>{formatBillMoney(value)}</div> },
		{ Header: "Transaction Status", accessor: "status", title: "Transaction Status", Cell: ({ value }) => value ? <span className={value === 'voided' ? 'text-secondary' : value === 'active' ? 'text-success' : 'text-muted'}>{value}</span> : <span className="text-muted">-</span> },
        { Header: "Sales closing", accessor: "closed_status", title: "Administrator-approved sales closing", Cell: ({ row }) => {
            const closure = closures.get(Number(row.original.billingid));
            if (closureLoading) return <span className="text-muted">Verifying...</span>;
            if (!closure || closureError) return <span className="text-danger">Unverified</span>;
            if (closure.closed_status === "OPEN") return <span className="d-flex flex-column"><span>Open</span>{isAdmin && <a href={`/accounting/daily-close?financialDate=${dayjs(row.original.billedon).format("YYYY-MM-DD")}`}>Review day close</a>}</span>;
            const evidence = closure.closure_evidence;
            return <span className="d-flex flex-column"><strong>Closed - read-only</strong>{evidence?.closed_at && <small>{dayjs(evidence.closed_at).format("DD MMM YYYY, HH:mm")}</small>}{evidence?.closure_id && <a href={`/accounting/daily-close?closeId=${evidence.closure_id}`}>View sign-off #{evidence.closure_id}</a>}{evidence?.signed_off && !evidence.closure_id && <small>Administrator signed off</small>}</span>;
        }},
		{
			Header: "Payment Status", accessor: "paymentstatus", title: "Payment Status", Cell: ({ value, row }) => {
				if (row.original?.status === 'voided') {
					return <span className="text-secondary">voided</span>;
				}
				return value ? <span className={value === 'pending' ? 'text-warning' : value === 'partial' ? 'text-warning' : 'text-success'}>{value}</span> : <span className="text-muted">-</span>;
			}
		},
		{
			Header: "Actions",
			accessor: "actions",
			Cell: ({ row }) => {
				const outstandingBill = Number(row.original?.outstanding);
				const isTestsExpanded = viewedBill?.billingid === row.original?.billingid;
				return (
					<div className="d-flex align-items-center gap-2">
						<Button
							variant={isTestsExpanded ? "secondary" : "outline-secondary"}
							size="sm"
							className="d-flex align-items-center gap-1"
							onClick={() => setViewedBill(row.original)}
							aria-expanded={isTestsExpanded}
                            aria-haspopup="dialog"
                            aria-controls="billed-client-tests"
							title="Show the tests billed in this transaction"
						>
							{isTestsExpanded ? <RiArrowDownSLine size={16} /> : <RiArrowRightSLine size={16} />} View Tests
						</Button>
						<Dropdown>
							<Dropdown.Toggle variant="outline-secondary" size="sm" className="btn-icon-only">
								<RiMore2Line size={16} />
							</Dropdown.Toggle>
							<Dropdown.Menu align="end" className="shadow-sm" popperConfig={{strategy: "fixed"}}>
								<Dropdown.Item
                                    disabled={!saleIsOpen(row.original.billingid)}
									className="d-flex align-items-center gap-2 py-2 px-3"
									onClick={() => openAdjustModal(row.original.billingid, row.original.patientid)}
									as="button"
								>
									<RiEdit2Line size={16} /> Correct Billing Source
								</Dropdown.Item>
								<Dropdown.Item
                                    disabled={!saleIsOpen(row.original.billingid)}
									onClick={() => openUpdateModal(row.original.billingid, row.original.patientid)}
									as="button"
									className="d-flex align-items-center gap-2 py-2 px-3"
								>
									<RiFileAddLine size={16} /> Update Transaction (Add New Service/Test)
								</Dropdown.Item>
								<Dropdown.Divider />
								<Dropdown.Item
									href={`/billing/cash-collection/pos-receipt-test?billingid=${row.original.billingid}&&is_pos=false`}
									className="d-flex align-items-center gap-2 py-2 px-3"
								>
									<RiPrinterLine size={16} /> Print Receipt A4 format
								</Dropdown.Item>
								<Dropdown.Item
									href={`/billing/cash-collection/pos-receipt-test?billingid=${row.original.billingid}&&is_pos=true`}
									className="d-flex align-items-center gap-2 py-2 px-3"
								>
									<RiPrinterLine size={16} /> Print Receipt POS format
								</Dropdown.Item>
								<Dropdown.Divider />
								<Dropdown.Item
									onClick={(ev) => { window.open(`/billing/transactions/previous-transaction/${row.original.billingid}?isOpenSideBarShow=false`, '_blank') }}
									className="d-flex align-items-center gap-2 py-2 px-3"
								>
									<RiFileList2Line size={16} /> View Transactions Details
								</Dropdown.Item>
								<Dropdown.Item
                                    disabled={!saleIsOpen(row.original.billingid)}
									className="d-flex align-items-center gap-2 py-2 px-3"
									onClick={(ev) => { handleVoidTransaction(row.original) }}
								>
									<RiFileList2Line size={16} /> Void Transaction
								</Dropdown.Item>
								<Dropdown.Item
									className="d-flex align-items-center gap-2 py-2 px-3"
									onClick={() => handleViewMore(row.original)}
									as="button"
								>
									<RiEyeLine size={16} /> View More
								</Dropdown.Item>
								{outstandingBill > 0 && saleIsOpen(row.original.billingid) && (
									<>
										<Dropdown.Divider />
										<Dropdown.Item
											className="d-flex align-items-center gap-2 py-2 px-3 text-success fw-semibold"
											onClick={() => { window.open(`/billing/cash-collection?patientid=${plsEncryption(row.original.patientid.toString())}&&billingid=${row.original.billingid}&&paymentstatus=pending&&isOpenSideBarShow=false`, '_blank') }}
										>
											<RiRefund2Line size={16} /> Settle Bill
										</Dropdown.Item>
									</>
								)}
							</Dropdown.Menu>
						</Dropdown>
					</div>
				);
			},
		},
	];

	function handleViewMore(rowData: any): void {
		setViewMoreData(rowData);
		setShowViewMore(true);
	}

	const monetaryFields: string[] = [
		'totalpayable', 'paidamount', 'outstanding', 'discount', 'totalRefunded', 'totalcost', 'amountIncurredDueTax', 'surcharge', 'writeoff'
	];

    const getPaymentStatusRowClass = (row: any): string => {
        const outstanding = Number(row?.outstanding);
        return Number.isFinite(outstanding) && outstanding > 0 ? 'table-danger' : '';
    };

	return (
        <div>
            {closureError && <p className="alert alert-danger" role="alert">{closureError} Financial changes are disabled. Refocus or reload this page to retry verification.</p>}
            <p className="small text-muted">Closed sales are read-only; receipts and transaction details remain available. {isAdmin && <a href="/accounting/daily-close">Review and finalize sales closing</a>}</p>
            <Offcanvas id="billed-client-tests" show={!!viewedBill} onHide={() => setViewedBill(null)} placement="end" className={tableLayout.testsOffcanvas} aria-labelledby="billed-client-tests-title">
                <Offcanvas.Header closeButton>
                    <div><Offcanvas.Title id="billed-client-tests-title">Tests &amp; transaction · Bill #{viewedBill?.billingid}</Offcanvas.Title><div className="small text-muted mt-1">{viewedBill?.fullname} · {viewedBill?.fullpatientid}</div></div>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {viewedBill && <React.Suspense fallback={<div role="status" className="p-3 text-muted">Loading transaction...</div>}><PreviousTransactionWorkspace key={viewedBill.billingid} billingid={viewedBill.billingid} embedded/></React.Suspense>}
                </Offcanvas.Body>
            </Offcanvas>
            <Modal show={showModal && modalType === 'update'} onHide={closeModal} centered>
				<Modal.Header closeButton>
					<Modal.Title>Update Transaction (Add New Service/Test)</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="mb-3">
						<label className="form-label">Reason for update:</label>
						<Form.Select
							value={selectedReason}
							onChange={(e) => setSelectedReason(e.target.value)}
							className="mb-2"
						>
							<option value="">Select a reason...</option>
							{predefinedReasons.map((reason, idx) => (
								<option key={idx} value={reason}>{reason}</option>
							))}
						</Form.Select>
						{selectedReason === "Other" && (
							<Form.Control
								as="textarea"
								rows={3}
								placeholder="Enter custom reason..."
								value={customReason}
								onChange={(e) => setCustomReason(e.target.value)}
								autoFocus
							/>
						)}
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={closeModal}>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleModalSubmit}
						disabled={!selectedReason || (selectedReason === "Other" && !customReason.trim())}
					>
						Continue
					</Button>
				</Modal.Footer>
			</Modal>

            <AdjustBillingSourceModal
				show={showModal && modalType === 'adjust'}
				onClose={closeModal}
				onContinue={() => { closeModal(); window.location.reload(); }}
				options={options}
				billingid={modalBillingId}
			/>

            <Modal show={showViewMore} onHide={() => setShowViewMore(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Billing Details</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{viewMoreData && (
						<div>
							<table className={styles.table}>
								<tbody>
									{Object.entries(viewMoreData).map(([key, value]) => (
										!coreColumns.some(col => col.accessor === key) &&
										key !== 'year' && key !== 'month' && key !== 'day' && (
											<tr key={key}>
												<th style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</th>
												<td>{
													value === null || value === undefined
														? 'None'
														: value === 1
															? 'Yes'
															: value === 0
																? 'No'
																: monetaryFields.includes(key)
																	? currencyFormatter.format(Number(value) || 0)
																	: String(value)
												}</td>
											</tr>
										)
									))}
								</tbody>
							</table>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowViewMore(false)}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>

            <div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)' }}>
				<div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
					<div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
						<h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
							{viewMode === 'sales' ? (
								<>
									<RiTableLine size={22} style={{ color: 'oklch(0.646 0.222 41.116)' }} className="me-2 flex-shrink-0" />
									Billed Clients
								</>
							) : (
								<>
									<RiMoneyDollarCircleLine size={22} style={{ color: 'oklch(0.646 0.222 41.116)' }} className="me-2 flex-shrink-0" />
									Expenses Payment Made
								</>
							)}
						</h2>
						<div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
							<div className="btn-group btn-group-sm" role="group" aria-label="Data view">
								<button
									type="button"
									className={`btn ${viewMode === 'sales' ? 'btn-primary' : 'btn-outline-secondary'}`}
									onClick={() => setViewMode('sales')}
									style={viewMode === 'sales' ? { backgroundColor: 'oklch(0.646 0.222 41.116)', borderColor: 'oklch(0.646 0.222 41.116)' } : {}}
								>
									<RiTableLine size={16} className="me-1 align-text-bottom" /> Sales
								</button>
								<button
									type="button"
									className={`btn ${viewMode === 'expenses' ? 'btn-primary' : 'btn-outline-secondary'}`}
									onClick={() => setViewMode('expenses')}
									disabled={!expensesPaymentMade || expensesPaymentMade.length === 0}
									style={viewMode === 'expenses' ? { backgroundColor: 'oklch(0.646 0.222 41.116)', borderColor: 'oklch(0.646 0.222 41.116)' } : {}}
								>
									<RiMoneyDollarCircleLine size={16} className="me-1 align-text-bottom" /> Expenses
								</button>
							</div>
							{isAdmin && showFilters && (
								<div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 mt-2 mt-sm-0">
									<div style={{ minWidth: '240px' }}>
										{/* <DateFilterReusable
											value={dateFilter}
											onChange={setDateFilter}
											onDateRangeChange={(from, to) => setDatequery({ from, to })}
											label="Period"
											className="w-100"
										/> */}
									</div>
									{datequery.from && datequery.to && (
										<button
											className="btn btn-primary btn-sm"
											onClick={() => window.open(`${plsEncryption(branchid.toString())}/day-transaction-break-down?date=${datequery.from}&&from=${datequery.from}&&end=${datequery.to}&isOpenSideBarShow=false`)}
										>
											BreakDown
										</button>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
				{isLoading ? (
					<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
						<ISLOADING />
					</div>
				) : viewMode === 'sales' ? (
					<div className="table-responsive" style={{ minHeight: isAdmin ? '60vh' : '50vh' }}>
                        <div className="px-3 py-2 border-bottom small text-muted">Amounts in {currencyFormatter.resolvedOptions().currency}</div>
                        <div className={tableLayout.filters}>
                            <Form.Group controlId="billed-client-search"><Form.Label>Patient or bill</Form.Label><Form.Control type="search" placeholder="Name, patient ID, bill ID or billed by" value={clientSearch} onChange={event => setClientSearch(event.target.value)}/></Form.Group>
                            <Form.Group controlId="billed-client-payment"><Form.Label>Payment status</Form.Label><Form.Select value={paymentFilter} onChange={event => setPaymentFilter(event.target.value)}><option value="">All payments</option>{paymentOptions.map(status => <option key={status} value={status}>{status}</option>)}</Form.Select></Form.Group>
                            <Form.Group controlId="billed-client-status"><Form.Label>Transaction status</Form.Label><Form.Select value={transactionFilter} onChange={event => setTransactionFilter(event.target.value)}><option value="">All transactions</option>{transactionOptions.map(status => <option key={status} value={status}>{status}</option>)}</Form.Select></Form.Group>
                            <Button variant="outline-secondary" disabled={!clientSearch && !paymentFilter && !transactionFilter} onClick={() => {setClientSearch('');setPaymentFilter('');setTransactionFilter('');}}>Clear filters</Button>
                            <small role="status">{visibleClients.length} of {processedData.length} bills</small>
                        </div>
                        <div ref={tableViewportRef} className={tableLayout.viewport} role="region" aria-label="Billed clients; date and client name stay fixed while financial columns scroll" tabIndex={0}>
                            <table className={tableLayout.fit}>
                                <thead><tr>{coreColumns.map(column => <th key={column.accessor} data-column={column.accessor} title={column.title} scope="col">{column.Header}</th>)}</tr></thead>
                                <tbody>{visibleClients.map(row => <React.Fragment key={row.billingid}>
                                    <tr className={getPaymentStatusRowClass(row)} data-billing-id={row.billingid}>{coreColumns.map(column => <td key={column.accessor} data-column={column.accessor} data-payment-status={column.accessor === "paymentstatus" ? (String(row.status).toLowerCase() === "voided" ? "voided" : paymentStatusKey(row.paymentstatus)) : undefined} title={column.title}>{column.Cell ? column.Cell({value:row[column.accessor],row:{original:row}}) : row[column.accessor]}</td>)}</tr>

                                </React.Fragment>)}</tbody>
                                {!visibleClients.length && <tbody><tr><td colSpan={coreColumns.length} className={tableLayout.empty}>No matching bills. Try a different search or clear the filters.</td></tr></tbody>}
                            </table>
                        </div>
					</div>
				) : (
					expensesPaymentMade && expensesPaymentMade.length > 0 ? (
						<div className="table-responsive" style={{ minHeight: '40vh' }}>
							<table className="table table-striped table-hover text-nowrap">
								<thead className="table-light">
									<tr>
										<th>Status</th>
										<th>Method</th>
										<th>Merchant Name</th>
										<th>Payments Made</th>
										<th>Unique Expenses Reimbursed</th>
										<th>Total Reimbursed Amount</th>
									</tr>
								</thead>
								<tbody>
									{expensesPaymentMade.map((expense, index) => (
										<tr key={index}>
											<td>
												<span className={`badge ${expense.status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
													{expense.status}
												</span>
											</td>
											<td>{expense.method}</td>
											<td>{expense.merchant_name}</td>
											<td>{expense.payments_made}</td>
											<td>{expense.unique_expenses_reimbursed}</td>
											<td>{currencyFormatter.format(Number(expense.total_reimbursed_amount) || 0)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '40vh' }}>
							<RiMoneyDollarCircleLine size={48} className="mb-3 text-muted" />
							<h5 className="fw-medium mb-1">No Expenses Data</h5>
							<p className="text-muted px-3">No expenses payment data available for the selected period.</p>
						</div>
					)
				)}
			</div>
        </div>
    );
}
