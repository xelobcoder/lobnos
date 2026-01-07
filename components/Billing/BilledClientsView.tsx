"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { RiEdit2Line, RiFileAddLine, RiDeleteBinLine, RiPrinterLine, RiRefund2Line, RiFileList2Line, RiMore2Line, RiEyeLine } from '@remixicon/react';
import { currencyFormatter, customFetch } from "../Auth/customFetch";
import { plsEncryption } from "../../lib/encryption";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal, Button, Form } from "react-bootstrap";
import { handleDatePicker, handleSeverSideProcessing } from "../serverActions/ActionFiltering";
import { useApplication, useApplicationSettings } from "../Auth/useApplicationContext";
import { RiSearchLine, RiCalendarEventLine, RiTableLine, RiBarChartBoxLine } from "@remixicon/react";
import styles from './../../styles/SmsTemplateList.module.css'
import { billingSource } from "../../lib/billingLib";
import AdjustBillingSourceModal from './AdjustBillingSourceModal';
import PrimeTablePivot from '../accessories/Datatables/PrimePivotTable'
import PrimeTable from "../accessories/Datatables/PrimeTable";
import dayjs from "dayjs";

export interface BillingSourceOption {
	value: number;
	label: string;
}

interface BilledClientsViewProps {
	data: any[];
	branchid: number | string;
}

interface DateQuery {
	from: string;
	to: string;
}

interface TableColumn {
	Header: string;
	accessor: string;
	Cell?: ({ value, row }: { value: any, row: any }) => React.ReactElement | string;
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

export default function BilledClientsView({ data, branchid }: BilledClientsViewProps) {
	const [selectedBillingSource, setSelectedBillingSource] = useState<BillingSourceOption | null>(null);
	const [itemToEdit, setItemToEdit] = useState<any>(null);
	const searchParams = useSearchParams();
	const pquery = useMemo(() => {
		const from = searchParams?.get('from') || '';
		const to = searchParams?.get('to') || '';
		return { from, to };
	}, [searchParams]);

	const [datequery, setDatequery] = useState<DateQuery>({
		from: pquery.from || '', to: pquery.to || ''
	});

	const role = useApplication()?.user;
	const isAdmin = role?.role === 'admin' || role?.role === 'superadmin';


	useEffect(() => {
		if (pquery.from || pquery.to) {
			setDatequery({
				from: pquery.from || '',
				to: pquery.to || ''
			});
		}
	}, [pquery]);



	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { employeeid } = useApplicationSettings().applicationsettings.user;
	const router = useRouter();

	const [showModal, setShowModal] = useState<boolean>(false);
	const [modalType, setModalType] = useState<ModalType>(null);
	const [modalBillingId, setModalBillingId] = useState<number | null>(null);
	const [modalPatientId, setModalPatientId] = useState<number | string | null>(null);
	const [modalRandString, setModalRandString] = useState<string>("");
	const [modalUserRandInput, setModalUserRandInput] = useState<string>("");
	const [modalReason, setModalReason] = useState<string>("");
	const [useSimpleView, setUseSimpleView] = useState<boolean>(true);
	const [showViewMore, setShowViewMore] = useState<boolean>(false);
	const [viewMoreData, setViewMoreData] = useState<any>(null);
	const processedData = useMemo(() => {
		if (!data) return [];
		const sorted = [...data].sort((a, b) => {
			const dateA = new Date(a.billedon as string || 0);
			const dateB = new Date(b.billedon as string || 0);
			return dateA.getTime() - dateB.getTime();
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
		const str = generateRandString();
		setModalRandString(str);
		setModalUserRandInput("");
		setModalReason("");
		setShowModal(true);
	}

	function closeModal(): void {
		setShowModal(false);
	}

	function handleModalSubmit(): void {
		setShowModal(false);
		if (!modalBillingId || !modalPatientId || !modalReason) {
			alert("Please fill all fields before proceeding.");
			return;
		}
		const encPatientId = plsEncryption(modalPatientId?.toString());
		const encReason = encodeURIComponent(modalReason);
		const adjustmentType = modalType === 'update' ? 'addition' : 'correction';
		const url = `/billing/patientid/${encPatientId}/multi?billingid=${modalBillingId}&isNewTransaction=0&&isRelatedBilling=1&&adjustmentReason=${encReason}&&adjustmentType=${adjustmentType}&&isAdjustment=1&&employeeid=${employeeid}`;
		if (modalType === 'adjust') {
			router.push(url);
		} else if (modalType === 'update') {
			router.push(`/billing/patientid/${encPatientId}/multi?billingid=${modalBillingId}&isNewTransaction=0&&isRelatedBilling=1&&adjustmentReason=${encReason}&&adjustmentType=addition&&isAdjustment=1&&employeeid=${employeeid}`);
		}
	}


	const coreColumns = [
		{
			Header: "Date", accessor: "billedon", Cell: ({ value, row }) => {
				const formatted = value ? dayjs(value).format('MM/DD/YYYY HH:mm:ss') : '';
				return row.original.isFirstOfDay ? <span style={{ backgroundColor: 'red', color: 'white', padding: '2px 4px', borderRadius: '4px' }}>{formatted}</span> : <span>{formatted}</span>;
			}
		},
		{ Header: "Patient", accessor: "fullname", Cell: ({ row }) => <div className="d-flex justify-content-between align-items-center"><span className="fw-semibold">{row.original.fullname}</span><span className="text-muted small">{row.original.fullpatientid}</span></div> },
		{ Header: "Bill Id", accessor: "billingid" },
		{
			Header: "Billing Source", accessor: "billingSource",
		},
		{ Header: "Amt Payable", accessor: "payable", Cell: ({ value }) => <div>{currencyFormatter.format(Number(value) || 0)}</div> },
		{ Header: "Total Cost", accessor: "totalcost", Cell: ({ value }) => <div>{currencyFormatter.format(Number(value) || 0)}</div> },
		{ Header: "Amount Paid", accessor: "paid", Cell: ({ value }) => <div>{currencyFormatter.format(Number(value) || 0)}</div> },
		{ Header: "Outstanding", accessor: "outstanding", Cell: ({ value }) => (<div><span className={Number(value) > 0 ? "text-danger" : "text-primary"}>{currencyFormatter.format(Number(value) || 0)}</span></div>) },
		{ Header: "Discount", accessor: "discount", Cell: ({ value }) => <div>{currencyFormatter.format(Number(value) || 0)}</div> },
		{ Header: "Amt Refunded", accessor: "totalrefunded", Cell: ({ value }) => <div>{currencyFormatter.format(Number(value) || 0)}</div> },
		{ Header: "Balance", accessor: "balance", Cell: ({ value }) => <div>{currencyFormatter.format(Number(value) || 0)}</div> },
		{ Header: "Status", accessor: "status", Cell: ({ value }) => value ? <span className={value === 'pending' ? 'text-warning' : 'text-success'}>{value}</span> : <span className="text-muted">-</span> },
		{
			Header: "Actions",
			accessor: "actions",
			Cell: ({ row }) => {
				const outstandingBill = Number(row.original?.outstanding);
				return (
					<>
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
									className="d-flex align-items-center gap-2 py-2 px-3"
									href={`/billing/transactions/previous-transaction/${row.original.billingid}`}
								>
									<RiFileList2Line size={16} /> View Transactions Details
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
											href={`/billing/cash-collection?patientid=${plsEncryption(row.original.patientid.toString())}&&billingid=${row.original.billingid}&&paymentstatus=pending`}
										>
											<RiRefund2Line size={16} /> Settle Bill
										</Dropdown.Item>
									</>
								)}
							</Dropdown.Menu>
						</Dropdown>
					</>
				);
			},
		},
	];

	function handleViewMore(rowData: any): void {
		setViewMoreData(rowData);
		setShowViewMore(true);
	}


	const monetaryFields: string[] = [
		'payable', 'paid', 'outstanding', 'discount', 'totalrefunded', 'balance', 'totalcost', 'totalTransactionCost', 'amountIncurredDueTax', 'adjustmentamount', 'promoValue', 'currentPayable', 'previousPaid', 'newPayments', 'totalPaid', 'outstandingToWriteOff'
	];







	return (
		<div>
			<Modal show={showModal && modalType === 'update'} onHide={closeModal} centered>
				<Modal.Header closeButton>
					<Modal.Title>Update Transaction (Add New Service/Test)</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="mb-3">
						<label className="form-label">Type the following code to acknowledge:</label>
						<div className="mb-2"><strong>{modalRandString}</strong></div>
						<Form.Control
							type="text"
							value={modalUserRandInput}
							onChange={e => setModalUserRandInput(e.target.value.toUpperCase())}
							placeholder="Enter the code above"
							autoFocus
						/>
					</div>
					<div className="mb-3">
						<label className="form-label">Reason for update:</label>
						<Form.Control
							as="textarea"
							rows={3}
							value={modalReason}
							onChange={e => setModalReason(e.target.value)}
							placeholder={`Provide a reason...`}
						/>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={closeModal}>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleModalSubmit}
						disabled={modalUserRandInput !== modalRandString || modalReason.trim() === ""}
					>
						Continue
					</Button>
				</Modal.Footer>
			</Modal>

			<AdjustBillingSourceModal
				show={showModal && modalType === 'adjust'}
				onClose={closeModal}
				onContinue={handleModalSubmit}
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
							<RiTableLine size={22} style={{ color: 'oklch(0.646 0.222 41.116)' }} className="me-2 flex-shrink-0" />
							Billed Clients
						</h2>
						<div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
							{isAdmin && <div className="btn-group btn-group-sm" role="group" aria-label="View type">
								<button
									type="button"
									className={`btn ${useSimpleView ? 'btn-outline-secondary' : 'btn-primary'}`}
									onClick={() => setUseSimpleView(false)}
									style={useSimpleView ? {} : { backgroundColor: 'oklch(0.646 0.222 41.116)', borderColor: 'oklch(0.646 0.222 41.116)' }}
								>
									<RiBarChartBoxLine size={16} className="me-1 align-text-bottom" /> Pivot Table
								</button>
								<button
									type="button"
									className={`btn ${useSimpleView ? 'btn-primary' : 'btn-outline-secondary'}`}
									onClick={() => setUseSimpleView(true)}
									style={useSimpleView ? { backgroundColor: 'oklch(0.646 0.222 41.116)', borderColor: 'oklch(0.646 0.222 41.116)' } : {}}
								>
									<RiTableLine size={16} className="me-1 align-text-bottom" /> Simple Table
								</button>
							</div>}
							<div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
								<div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
									<span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--bs-border-color)' }}>
										<RiCalendarEventLine size={16} className="text-muted" />
									</span>
									<input type="date" className="form-control shadow-none border-start-0" value={datequery.from} onChange={(ev) => setDatequery({ ...datequery, from: ev.target.value })} />
								</div>
								<div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
									<span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--bs-border-color)' }}>
										<RiCalendarEventLine size={16} className="text-muted" />
									</span>
									<input type="date" className="form-control shadow-none border-start-0" value={datequery.to} onChange={(ev) => setDatequery({ ...datequery, to: ev.target.value })} min={datequery.from} />
								</div>
								<button
									className="btn btn-outline-secondary btn-sm d-flex align-items-center"
									onClick={() => {
										console.log("Search button clicked with dates:", datequery);
										handleDatePicker({
											branchid,
											date: datequery.from,
											from: datequery.from,
											to: datequery.to
										}, router);
									}}
								>
									<RiSearchLine size={16} className="me-1" /> Search
								</button>
								{isAdmin && datequery.from && datequery.to && (
									<button
										className="btn btn-primary btn-sm"
										onClick={() => router.push(`${plsEncryption(branchid.toString())}/day-transaction-break-down?date=${datequery.from}&&from=${datequery.from}&&end=${datequery.to}`)}
									>
									BreakDown
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
				{isAdmin ? (
					useSimpleView ? <div className="table-responsive">
						<table className="table table-striped table-hover text-nowrap">
							<thead>
								<tr>
									{coreColumns.map(col => <th key={col.accessor}>{col.Header}</th>)}
								</tr>
							</thead>
							<tbody>
								{processedData.map((row, index) => (
									<tr key={index}>
										{coreColumns.map(col => {
											const value = row[col.accessor];
											const cellContent = col.Cell ? col.Cell({ value, row: { original: row } }) : value;
											return <td key={col.accessor}>{cellContent}</td>;
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div> : <PrimeTablePivot
						column={coreColumns}
						urlparams={{ ...datequery, branchid }}
						data={processedData}
						serverSideFiltering={true}
						handleSeverSideProcessing={handleSeverSideProcessing}
					/>
				) : <div className="table-responsive">
					<table className="table table-striped table-hover text-nowrap">
						<thead>
							<tr>
								{coreColumns.map(col => <th key={col.accessor}>{col.Header}</th>)}
							</tr>
						</thead>
						<tbody>
							{processedData.map((row, index) => (
								<tr key={index}>
									{coreColumns.map(col => {
										const value = row[col.accessor];
										const cellContent = col.Cell ? col.Cell({ value, row: { original: row } }) : value;
										return <td key={col.accessor}>{cellContent}</td>;
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>}
			</div>



		</div>
	);
}