"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { RiEdit2Line, RiFileAddLine, RiDeleteBinLine, RiPrinterLine, RiRefund2Line, RiFileList2Line, RiMore2Line, RiEyeLine, RiMoneyDollarCircleLine } from '@remixicon/react';
import { currencyFormatter, customFetch, customPost } from "../Auth/customFetch";
import { plsEncryption } from "../../lib/encryption";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal, Button, Form } from "react-bootstrap";
import { handleDatePicker, handleSeverSideProcessing } from "../serverActions/ActionFiltering";
import { useApplication, useApplicationSettings } from "../Auth/useApplicationContext";
import { roleAllowed } from "../Auth/roles";
import { RiCalendarEventLine, RiTableLine, RiArrowDownSLine, RiArrowRightSLine } from "@remixicon/react";
import styles from './../../styles/SmsTemplateList.module.css'
import { billingSource } from "../../lib/billingLib";
import AdjustBillingSourceModal from './AdjustBillingSourceModal';
import PrimeTable from "../accessories/Datatables/PrimeTable";
import dayjs from "dayjs";
import ISLOADING from "../isLoading";
import DateFilterReusable from "../operations/Laboratory/ResuableFilter/DateFilterReusable";

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
	Cell?: ({ value, row }: { value: any, row: any }) => React.ReactElement<any> | string;
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

interface TransactionTestItem {
	serviceid?: number;
	name?: string;
	testname?: string;
	cost?: number | string;
	discount?: number | string;
	totalpayable?: number | string;
	isDeleted?: number;
	[key: string]: any;
}

interface TransactionTestsState {
	loading: boolean;
	error?: string;
	items: TransactionTestItem[];
}

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
	const [expandedBillingIds, setExpandedBillingIds] = useState<Set<number>>(new Set());
	const [transactionTests, setTransactionTests] = useState<Record<number, TransactionTestsState>>({});
	const [viewMode, setViewMode] = useState<'sales' | 'expenses'>('sales');
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

	function generateRandString(): string {
		return Math.random().toString(36).substring(2, 8).toUpperCase();
	}

	function openAdjustModal(billingid: number, patientid: number | string): void {
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
		const adjustmentType = modalType === 'update' ? 'addition' : 'correction';
		const url = `/billing/patientid/${encPatientId}/multi?billingid=${modalBillingId}&isNewTransaction=0&&isRelatedBilling=1&&adjustmentReason=${encReason}&&adjustmentType=${adjustmentType}&&isAdjustment=1&&employeeid=${employeeid}`;
		router.push(url);
	}

	const handleVoidTransaction = async (row) => {
		const billingid = row?.billingid;
		if (!billingid) return;
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
			alert(`Failed to void transaction: ${error.message}`);
		}
	}

	const loadTransactionTests = async (billingid: number) => {
		setTransactionTests(prev => ({ ...prev, [billingid]: { loading: true, items: [] } }));
		try {
			const res = await customFetch(`billing/information/single?billingid=${billingid}`);
			const items: TransactionTestItem[] = Array.isArray(res?.result) ? res.result : [];
			setTransactionTests(prev => ({ ...prev, [billingid]: { loading: false, items } }));
		} catch (error) {
			setTransactionTests(prev => ({ ...prev, [billingid]: { loading: false, items: [], error: 'Unable to load tests for this transaction' } }));
		}
	};

	const toggleTransactionTests = (billingid: number) => {
		if (!billingid) return;
		const isExpanded = expandedBillingIds.has(billingid);
		setExpandedBillingIds(prev => {
			const next = new Set(prev);
			if (isExpanded) next.delete(billingid); else next.add(billingid);
			return next;
		});
		const cached = transactionTests[billingid];
		if (!isExpanded && (!cached || cached.error)) {
			loadTransactionTests(billingid);
		}
	};

	const renderTransactionTests = (billingid: number) => {
		const state = transactionTests[billingid];
		if (!state || state.loading) {
			return <div className="text-muted small py-2">Loading tests...</div>;
		}
		if (state.error) {
			return (
				<div className="text-danger small py-2 d-flex align-items-center gap-2">
					{state.error}
					<Button size="sm" variant="outline-secondary" onClick={() => loadTransactionTests(billingid)}>Retry</Button>
				</div>
			);
		}
		if (state.items.length === 0) {
			return <div className="text-muted small py-2">No tests recorded for this transaction.</div>;
		}
		const activeItems = state.items.filter(item => Number(item.isDeleted) !== 1);
		const sum = (key: keyof TransactionTestItem) => activeItems.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
		return (
			<table className="table table-sm table-bordered mb-0 bg-body" style={{ maxWidth: '760px' }}>
				<thead className="table-light">
					<tr>
						<th>#</th>
						<th>Test</th>
						<th className="text-end">Cost</th>
						<th className="text-end">Discount</th>
						<th className="text-end">Payable</th>
					</tr>
				</thead>
				<tbody>
					{state.items.map((item, idx) => {
						const removed = Number(item.isDeleted) === 1;
						return (
							<tr key={item.serviceid ?? idx} className={removed ? 'text-muted text-decoration-line-through' : ''}>
								<td>{idx + 1}</td>
								<td>
									{item.name || item.testname || '-'}
									{removed && <span className="badge bg-secondary ms-2 text-decoration-none">removed</span>}
								</td>
								<td className="text-end">{currencyFormatter.format(Number(item.cost) || 0)}</td>
								<td className="text-end">{currencyFormatter.format(Number(item.discount) || 0)}</td>
								<td className="text-end">{currencyFormatter.format(Number(item.totalpayable) || 0)}</td>
							</tr>
						);
					})}
				</tbody>
				<tfoot>
					<tr className="fw-semibold">
						<td colSpan={2}>{activeItems.length} test{activeItems.length === 1 ? '' : 's'}</td>
						<td className="text-end">{currencyFormatter.format(sum('cost'))}</td>
						<td className="text-end">{currencyFormatter.format(sum('discount'))}</td>
						<td className="text-end">{currencyFormatter.format(sum('totalpayable'))}</td>
					</tr>
				</tfoot>
			</table>
		);
	};

	const coreColumns = [
		{
			Header: "Date", accessor: "billedon", title: "Date of Transaction", Cell: ({ value, row }) => {
				const formatted = value ? dayjs(value).format('MM/DD/YYYY HH:mm:ss') : '';
				return row.original.isFirstOfDay ? <span style={{ backgroundColor: 'red', color: 'white', padding: '2px 4px', borderRadius: '4px' }}>{formatted}	<br />(First of the day)</span> : <span>{formatted}</span>;
			}
		},
		{
			Header: "Billed By",
			accessor: "salesperson",
			title: "Employee who processed the bill",
			Cell: ({ row }) => <div>

				<span>{row.original.salesperson}</span>
				<br />
				<span>{row.original.serviceCategory}	</span>
			</div>
		},
		{
			Header: "Client Name",
			accessor: "fullname",
			title: "Full name of the client",
			Cell: ({ row }) => (
				<div className="d-flex flex-column">
					<span className="fw-semibold">{row.original.fullname}</span>
					<span className="text-muted small">{row.original.fullpatientid}</span>
				</div>
			)
		},

		{ Header: "BID", accessor: "billingid", title: "Billing ID", Cell: ({ value }) => <div className="text-center">{value}</div> },
		{ Header: "TC", accessor: "totalcost", title: "Total Cost", Cell: ({ value }) => <div>{(Number(value) || 0).toFixed(2)}</div> },
		{ Header: "DS", accessor: "discount", title: "Discount Amount", Cell: ({ value }) => <div>{(Number(value) || 0).toFixed(2)}</div> },
		{ Header: "RF", accessor: "totalRefunded", title: "Total Refunded", Cell: ({ value }) => <div>{(Number(value) || 0).toFixed(2)}</div> },
		{ Header: "AP", accessor: "totalpayable", title: "Amount Payable", Cell: ({ value }) => <div>{(Number(value) || 0).toFixed(2)}</div> },
		{ Header: "PD", accessor: "paidamount", title: "Amount Paid", Cell: ({ value }) => <div>{(Number(value) || 0).toFixed(2)}</div> },
		{
			Header: "FOC", accessor: "foc_amount", title: "Staff FOC coverage", Cell: ({ value, row }) => {
				const amount = Number(value) || 0;
				return amount > 0 ? (
					<span className="text-info fw-semibold" title={`Staff FOC transaction #${row.original.foc_transaction_id || 'linked'}`}>
						FOC {amount.toFixed(2)}
					</span>
				) : <span className="text-muted">-</span>;
			}
		},
		{ Header: "OS", accessor: "outstanding", title: "Outstanding Balance", Cell: ({ value }) => (<div><span className={Number(value) > 0 ? "text-danger" : "text-primary"}>{(Number(value) || 0).toFixed(2)}</span></div>) },
		{ Header: "SC", accessor: "surcharge", title: "Surcharge Amount", Cell: ({ value }) => <div>{(Number(value) || 0).toFixed(2)}</div> },
		{ Header: "WO", accessor: "writeoff", title: "Write Off Amount", Cell: ({ value }) => <div>{(Number(value) || 0).toFixed(2)}</div> },
		{ Header: "TS", accessor: "status", title: "Transaction Status", Cell: ({ value }) => value ? <span className={value === 'voided' ? 'text-secondary' : value === 'active' ? 'text-success' : 'text-muted'}>{value}</span> : <span className="text-muted">-</span> },
		{
			Header: "PS", accessor: "paymentstatus", title: "Payment Status", Cell: ({ value, row }) => {
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
				const isTestsExpanded = expandedBillingIds.has(row.original?.billingid);
				return (
					<div className="d-flex align-items-center gap-2">
						<Button
							variant={isTestsExpanded ? "secondary" : "outline-secondary"}
							size="sm"
							className="d-flex align-items-center gap-1"
							onClick={() => toggleTransactionTests(row.original?.billingid)}
							aria-expanded={isTestsExpanded}
							title="Show the tests billed in this transaction"
						>
							{isTestsExpanded ? <RiArrowDownSLine size={16} /> : <RiArrowRightSLine size={16} />} View Tests
						</Button>
						<Dropdown>
							<Dropdown.Toggle variant="outline-secondary" size="sm" className="btn-icon-only">
								<RiMore2Line size={16} />
							</Dropdown.Toggle>
							<Dropdown.Menu className="shadow-sm">
								<Dropdown.Item
									className="d-flex align-items-center gap-2 py-2 px-3"
									onClick={() => openAdjustModal(row.original.billingid, row.original.patientid)}
									as="button"
								>
									<RiEdit2Line size={16} /> Correct Billing Source
								</Dropdown.Item>
								<Dropdown.Item
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
								{outstandingBill > 0 && (
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
		const status = String(row?.paymentstatus ?? row?.status ?? "").trim().toLowerCase();
		if (status === "pending") return "table-danger";
		if (status === "partial" || status === "partail") return "table-warning";
		return "";
	};

	return (
        <div>
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
				onContinue={handleAdjustmentModalContinue}
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
						<div className="px-4 py-2 bg-light border-bottom mb-2 d-flex flex-wrap gap-3 small text-muted">
							<div className="d-flex gap-2"><strong>Amounts in GHS</strong></div>
							<div className="d-flex gap-2"><strong>BID:</strong> Billing ID</div>
							<div className="d-flex gap-2"><strong>TC:</strong> Total Cost</div>
							<div className="d-flex gap-2"><strong>DS:</strong> Discount</div>
							<div className="d-flex gap-2"><strong>RF:</strong> Refunded</div>
							<div className="d-flex gap-2"><strong>AP:</strong> Amt Payable</div>
							<div className="d-flex gap-2"><strong>PD:</strong> Amt Paid</div>
							<div className="d-flex gap-2"><strong>OS:</strong> Outstanding</div>
							<div className="d-flex gap-2"><strong>SC:</strong> Surcharge</div>
							<div className="d-flex gap-2"><strong>WO:</strong> Write Off</div>
							<div className="d-flex gap-2"><strong>TS:</strong> Transaction Status</div>
							<div className="d-flex gap-2"><strong>PS:</strong> Payment Status</div>
						</div>
						<table className="table table-striped table-hover table-bordered text-nowrap">
							<thead>
								<tr>
									{coreColumns.map(col => <th key={col.accessor} className="border-start border-end" title={col.title}>{col.Header}</th>)}
								</tr>
							</thead>
							<tbody>
								{processedData.map((row, index) => (
									<React.Fragment key={row.billingid ?? index}>
										<tr className={getPaymentStatusRowClass(row)}>
											{coreColumns.map(col => {
												const value = row[col.accessor];
												const cellContent = col.Cell ? col.Cell({ value, row: { original: row } }) : value;
												let bgColorClass = '';
												if (col.accessor === 'paid') {
													bgColorClass = 'bg-success-subtle';
												} else if ((col.accessor === 'totalrefunded' || col.accessor === 'outstanding') && Number(value) > 0) {
													bgColorClass = 'bg-danger-subtle';
												}
												return <td key={col.accessor} className={`border-start border-end ${bgColorClass}`} title={col.title}>{cellContent}</td>;
											})}
										</tr>
										{expandedBillingIds.has(row.billingid) && (
											<tr>
												<td colSpan={coreColumns.length} className="bg-body-tertiary px-4">
													<div className="small fw-semibold mb-1">Tests billed in transaction #{row.billingid}</div>
													{renderTransactionTests(row.billingid)}
												</td>
											</tr>
										)}
									</React.Fragment>
								))}
							</tbody>
						</table>
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
