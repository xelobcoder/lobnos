"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner, Tab, Table, Tabs } from "react-bootstrap";
import { toast } from "react-toastify";
import { customFetch, customPost } from "../../../components/Auth/customFetch";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import { roleAllowed } from "../../../components/Auth/roles";
import { getRequestContext } from "../../../components/serverActions/requestHeaders";
import { companyImageUrl } from "../../../lib/companyImage";
import {
	CURRENCY,
	InvoiceStatus,
	OrganizationInvoiceDetail,
	STATUS_LABELS,
	buildOrganizationInvoicePdf,
	formatDate,
	money,
} from "../../../components/invoices/organizationInvoicePdf";

// Mirrors the backend role lists in organizationInvoiceRoutes.ts; the backend remains the authority.
const READ_ROLES = ["admin", "manager", "accountant", "cashier", "front desk", "frontdesk", "customer service representative", "billing"];
const WRITE_ROLES = ["admin", "manager", "accountant", "cashier", "billing"];
const VOID_ROLES = ["admin", "accountant"];

interface OrganizationSummary {
	id: number;
	name: string;
	uninvoiced_amount: number;
	uninvoiced_services: number;
	open_balance: number;
}

interface EligibleBill {
	billingid: number;
	billedon: string;
	patient_name: string;
	outstanding: number;
	services: Array<{ serviceid: number; service_name: string; totalpayable: number; outstanding: number }>;
}

interface InvoiceRow {
	id: number;
	invoice_number: string;
	organization_name: string | null;
	invoice_date: string;
	due_date: string;
	status: InvoiceStatus;
	amount_due: string;
	amount_paid: string;
	balance_due: string;
}

const STATUS_VARIANTS: Record<InvoiceStatus, string> = {
	unpaid: "danger",
	partially_paid: "warning",
	paid: "success",
	void: "secondary",
};

function todayIso(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function newKey(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function isSuccess(response: any): boolean {
	return !!response && (response.status === "success" || response.statusCode === 200 || response.statusCode === 201);
}

function errorMessage(response: any, fallback: string): string {
	return (response && typeof response.message === "string" && response.message) || (response?.error as string) || fallback;
}

async function loadLogoDataUrl(): Promise<string | null> {
	try {
		const url = companyImageUrl((await getRequestContext())?.tenantId);
		if (!url) return null;
		const res = await fetch(url, { credentials: "include" });
		if (!res.ok) return null;
		const blob = await res.blob();
		if (!blob.size || !blob.type.startsWith("image/")) return null;
		return await new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
	return <Badge bg={STATUS_VARIANTS[status] || "secondary"}>{STATUS_LABELS[status] || status}</Badge>;
}

export default function OrganizationInvoicesPage() {
	const user = useApplication()?.user;
	const router = useRouter();
	const canRead = roleAllowed(user?.role, READ_ROLES);
	const canWrite = roleAllowed(user?.role, WRITE_ROLES);
	const canVoid = roleAllowed(user?.role, VOID_ROLES);

	useEffect(() => {
		if (user && !canRead) router.replace("/unauthorized");
	}, [canRead, router, user]);

	const [activeTab, setActiveTab] = useState<string>("invoices");
	const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
	const [organizationId, setOrganizationId] = useState<string>("");

	// Invoice list
	const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
	const [summary, setSummary] = useState({ amount_due: 0, amount_paid: 0, balance_due: 0 });
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [search, setSearch] = useState<string>("");
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [loadingList, setLoadingList] = useState(false);
	const pageSize = 25;

	// Generation
	const [eligibleBills, setEligibleBills] = useState<EligibleBill[]>([]);
	const [selectedBills, setSelectedBills] = useState<Set<number>>(new Set());
	const [loadingBills, setLoadingBills] = useState(false);
	const [dueDate, setDueDate] = useState("");
	const [paymentTerms, setPaymentTerms] = useState("As agreed in contract");
	const [reference, setReference] = useState("");
	const [notes, setNotes] = useState("");
	const [generating, setGenerating] = useState(false);

	// Invoice view
	const [detail, setDetail] = useState<OrganizationInvoiceDetail | null>(null);
	const [loadingDetail, setLoadingDetail] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [pdfBusy, setPdfBusy] = useState(false);
	const logoRef = useRef<string | null | undefined>(undefined);

	// Payment
	const [paymentModes, setPaymentModes] = useState<Array<{ id: number; name: string }>>([]);
	const [paymentAmount, setPaymentAmount] = useState("");
	const [paymentModeId, setPaymentModeId] = useState("");
	const [paymentDate, setPaymentDate] = useState(todayIso());
	const [paymentReference, setPaymentReference] = useState("");
	const [paymentNotes, setPaymentNotes] = useState("");
	const [paymentKey, setPaymentKey] = useState(newKey());
	const [recording, setRecording] = useState(false);

	// Void
	const [voidReason, setVoidReason] = useState("");
	const [voiding, setVoiding] = useState(false);

	const loadOrganizations = useCallback(async () => {
		const response = await customFetch("organization-invoices/organizations");
		if (isSuccess(response) && Array.isArray(response.result)) setOrganizations(response.result);
		else toast.error(errorMessage(response, "Unable to load organizations"));
	}, []);

	const loadInvoices = useCallback(async () => {
		setLoadingList(true);
		try {
			const params = new URLSearchParams({ page: String(page), count: String(pageSize) });
			if (organizationId) params.set("organizationId", organizationId);
			if (statusFilter) params.set("status", statusFilter);
			if (search.trim()) params.set("search", search.trim());
			const response = await customFetch(`organization-invoices?${params.toString()}`);
			if (isSuccess(response)) {
				setInvoices(response.result?.rows || []);
				setTotal(response.result?.total || 0);
				setSummary(response.result?.summary || { amount_due: 0, amount_paid: 0, balance_due: 0 });
			} else {
				toast.error(errorMessage(response, "Unable to load invoices"));
			}
		} finally {
			setLoadingList(false);
		}
	}, [organizationId, page, search, statusFilter]);

	const loadEligibleBills = useCallback(async () => {
		if (!organizationId) {
			setEligibleBills([]);
			return;
		}
		setLoadingBills(true);
		try {
			const response = await customFetch(`organization-invoices/eligible-bills?organizationId=${encodeURIComponent(organizationId)}`);
			if (isSuccess(response)) {
				setEligibleBills(response.result || []);
				setSelectedBills(new Set());
			} else {
				toast.error(errorMessage(response, "Unable to load credit bills"));
			}
		} finally {
			setLoadingBills(false);
		}
	}, [organizationId]);

	useEffect(() => {
		if (!canRead) return;
		loadOrganizations();
		customFetch("organization-invoices/payment-modes").then((response) => {
			if (isSuccess(response) && Array.isArray(response.result)) setPaymentModes(response.result);
		});
	}, [canRead, loadOrganizations]);

	useEffect(() => {
		if (!canRead) return;
		const timer = setTimeout(() => { loadInvoices(); }, 250);
		return () => clearTimeout(timer);
	}, [canRead, loadInvoices]);

	useEffect(() => {
		if (canRead && activeTab === "generate") loadEligibleBills();
	}, [activeTab, canRead, loadEligibleBills]);

	useEffect(() => () => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
	}, [previewUrl]);

	const selectedTotal = useMemo(
		() => eligibleBills.filter((b) => selectedBills.has(b.billingid)).reduce((sum, b) => sum + Math.round(Number(b.outstanding) * 100), 0) / 100,
		[eligibleBills, selectedBills],
	);

	const toggleBill = (billingid: number) => {
		setSelectedBills((current) => {
			const next = new Set(current);
			if (next.has(billingid)) next.delete(billingid);
			else next.add(billingid);
			return next;
		});
	};

	const getLogo = async () => {
		if (logoRef.current === undefined) logoRef.current = await loadLogoDataUrl();
		return logoRef.current;
	};

	const renderPreview = async (data: OrganizationInvoiceDetail) => {
		const doc = buildOrganizationInvoicePdf(data, await getLogo());
		setPreviewUrl(URL.createObjectURL(doc.output("blob")));
	};

	const openInvoice = async (invoiceId: number) => {
		setLoadingDetail(true);
		setDetail(null);
		setPreviewUrl(null);
		try {
			const response = await customFetch(`organization-invoices/${invoiceId}`);
			if (!isSuccess(response)) {
				toast.error(errorMessage(response, "Unable to load invoice"));
				return;
			}
			setDetail(response.result);
			setPaymentAmount("");
			setPaymentReference("");
			setPaymentNotes("");
			setPaymentDate(todayIso());
			setPaymentKey(newKey());
			setVoidReason("");
			await renderPreview(response.result);
		} finally {
			setLoadingDetail(false);
		}
	};

	const closeInvoice = () => {
		setDetail(null);
		setPreviewUrl(null);
	};

	const generateInvoice = async () => {
		if (!organizationId || selectedBills.size === 0) {
			toast.warning("Select at least one credit bill to invoice");
			return;
		}
		setGenerating(true);
		try {
			const response = await customPost(`organization-invoices`, "POST", {
				organizationId: Number(organizationId),
				billingIds: Array.from(selectedBills),
				dueDate: dueDate || undefined,
				paymentTerms,
				reference,
				notes,
			});
			if (!isSuccess(response)) {
				toast.error(errorMessage(response, "Unable to generate invoice"));
				await loadEligibleBills();
				return;
			}
			toast.success(`Invoice ${response.result.invoice.invoice_number} generated`);
			setReference("");
			setNotes("");
			setDueDate("");
			await Promise.all([loadEligibleBills(), loadInvoices(), loadOrganizations()]);
			setActiveTab("invoices");
			setDetail(response.result);
			setPaymentKey(newKey());
			await renderPreview(response.result);
		} finally {
			setGenerating(false);
		}
	};

	const downloadPdf = async () => {
		if (!detail) return;
		setPdfBusy(true);
		try {
			buildOrganizationInvoicePdf(detail, await getLogo()).save(`${detail.invoice.invoice_number}.pdf`);
		} finally {
			setPdfBusy(false);
		}
	};

	const printPdf = async () => {
		if (!detail) return;
		setPdfBusy(true);
		try {
			const doc = buildOrganizationInvoicePdf(detail, await getLogo());
			doc.autoPrint();
			const url = URL.createObjectURL(doc.output("blob"));
			const frame = document.createElement("iframe");
			frame.style.position = "fixed";
			frame.style.width = "0";
			frame.style.height = "0";
			frame.style.border = "0";
			frame.src = url;
			frame.onload = () => {
				try {
					frame.contentWindow?.focus();
					frame.contentWindow?.print();
				} catch {
					window.open(url, "_blank");
				}
				setTimeout(() => {
					frame.remove();
					URL.revokeObjectURL(url);
				}, 60000);
			};
			document.body.appendChild(frame);
		} finally {
			setPdfBusy(false);
		}
	};

	const recordPayment = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!detail) return;
		const balanceCents = Math.round(Number(detail.invoice.balance_due) * 100);
		const amountText = paymentAmount.trim();
		if (!/^\d+(\.\d{1,2})?$/.test(amountText) || Number(amountText) <= 0) {
			toast.warning("Enter a valid amount (up to two decimal places)");
			return;
		}
		if (Math.round(Number(amountText) * 100) > balanceCents) {
			toast.warning(`Amount exceeds the balance due of ${CURRENCY} ${money(detail.invoice.balance_due)}`);
			return;
		}
		if (!paymentModeId) {
			toast.warning("Select a payment mode");
			return;
		}
		setRecording(true);
		try {
			const response = await customPost(`organization-invoices/${detail.invoice.id}/payments`, "POST", {
				amount: amountText,
				paymentModeId: Number(paymentModeId),
				paymentDate,
				reference: paymentReference,
				notes: paymentNotes,
				idempotencyKey: paymentKey,
			});
			if (!isSuccess(response)) {
				toast.error(errorMessage(response, "Unable to record payment"));
				return;
			}
			toast.success(response.result?.duplicate ? "This payment was already recorded" : "Payment recorded");
			const updated: OrganizationInvoiceDetail = response.result.invoice;
			setDetail(updated);
			setPaymentAmount("");
			setPaymentReference("");
			setPaymentNotes("");
			setPaymentKey(newKey());
			await Promise.all([renderPreview(updated), loadInvoices(), loadOrganizations()]);
		} finally {
			setRecording(false);
		}
	};

	const voidInvoice = async () => {
		if (!detail) return;
		if (voidReason.trim().length < 3) {
			toast.warning("Enter a reason for voiding this invoice");
			return;
		}
		if (!window.confirm(`Void invoice ${detail.invoice.invoice_number}? Its bills will become available for re-invoicing.`)) return;
		setVoiding(true);
		try {
			const response = await customPost(`organization-invoices/${detail.invoice.id}/void`, "POST", { reason: voidReason.trim() });
			if (!isSuccess(response)) {
				toast.error(errorMessage(response, "Unable to void invoice"));
				return;
			}
			toast.success("Invoice voided");
			setDetail(response.result);
			await Promise.all([renderPreview(response.result), loadInvoices(), loadOrganizations()]);
		} finally {
			setVoiding(false);
		}
	};

	if (!user || !canRead) {
		return (
			<div className="d-flex justify-content-center p-5">
				<Spinner animation="border" />
			</div>
		);
	}

	const selectedOrg = organizations.find((o) => String(o.id) === organizationId);
	const invoiceOpen = !!detail && (detail.invoice.status === "unpaid" || detail.invoice.status === "partially_paid");

	return (
		<div className="container-fluid py-3">
			<div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
				<div>
					<h4 className="mb-0">Organization Credit Invoices</h4>
					<small className="text-muted">Invoice contracted organizations for postpaid services and track what they owe.</small>
				</div>
				<Form.Select style={{ maxWidth: 380 }} value={organizationId} onChange={(e) => { setOrganizationId(e.target.value); setPage(1); }}>
					<option value="">All organizations</option>
					{organizations.map((org) => (
						<option key={org.id} value={org.id}>
							{org.name}
							{org.uninvoiced_amount > 0 ? ` — ${CURRENCY} ${money(org.uninvoiced_amount)} uninvoiced` : ""}
						</option>
					))}
				</Form.Select>
			</div>

			<Row className="g-3 mb-3">
				<Col md={4}>
					<Card body className="shadow-sm">
						<small className="text-muted">Invoiced{selectedOrg ? ` — ${selectedOrg.name}` : ""}</small>
						<h5 className="mb-0">{CURRENCY} {money(summary.amount_due)}</h5>
					</Card>
				</Col>
				<Col md={4}>
					<Card body className="shadow-sm">
						<small className="text-muted">Received</small>
						<h5 className="mb-0 text-success">{CURRENCY} {money(summary.amount_paid)}</h5>
					</Card>
				</Col>
				<Col md={4}>
					<Card body className="shadow-sm">
						<small className="text-muted">Outstanding receivable</small>
						<h5 className="mb-0 text-danger">{CURRENCY} {money(summary.balance_due)}</h5>
					</Card>
				</Col>
			</Row>

			<Tabs activeKey={activeTab} onSelect={(key) => setActiveTab(key || "invoices")} className="mb-3">
				<Tab eventKey="invoices" title="Invoices">
					<Row className="g-2 mb-2">
						<Col md={3}>
							<Form.Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
								<option value="">All statuses</option>
								{(Object.keys(STATUS_LABELS) as InvoiceStatus[]).map((s) => (
									<option key={s} value={s}>{STATUS_LABELS[s]}</option>
								))}
							</Form.Select>
						</Col>
						<Col md={5}>
							<Form.Control placeholder="Search invoice no., organization or reference" value={search}
								onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
						</Col>
					</Row>
					<Table responsive hover size="sm" className="align-middle">
						<thead className="table-light">
							<tr>
								<th>Invoice No.</th>
								<th>Organization</th>
								<th>Date</th>
								<th>Due</th>
								<th>Status</th>
								<th className="text-end">Invoiced</th>
								<th className="text-end">Paid</th>
								<th className="text-end">Balance</th>
								<th />
							</tr>
						</thead>
						<tbody>
							{loadingList ? (
								<tr><td colSpan={9} className="text-center py-4"><Spinner size="sm" animation="border" /></td></tr>
							) : invoices.length === 0 ? (
								<tr><td colSpan={9} className="text-center text-muted py-4">No invoices found</td></tr>
							) : invoices.map((inv) => (
								<tr key={inv.id}>
									<td className="fw-semibold">{inv.invoice_number}</td>
									<td>{inv.organization_name}</td>
									<td>{formatDate(inv.invoice_date)}</td>
									<td>{formatDate(inv.due_date)}</td>
									<td><StatusBadge status={inv.status} /></td>
									<td className="text-end">{money(inv.amount_due)}</td>
									<td className="text-end">{money(inv.amount_paid)}</td>
									<td className="text-end fw-semibold">{money(inv.balance_due)}</td>
									<td className="text-end">
										<Button size="sm" variant="outline-primary" onClick={() => openInvoice(inv.id)}>View</Button>
									</td>
								</tr>
							))}
						</tbody>
					</Table>
					<div className="d-flex justify-content-between align-items-center">
						<small className="text-muted">{total} invoice(s)</small>
						<div className="d-flex gap-2">
							<Button size="sm" variant="outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
							<Button size="sm" variant="outline-secondary" disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
						</div>
					</div>
				</Tab>

				{canWrite && (
					<Tab eventKey="generate" title="Generate Invoice">
						{!organizationId ? (
							<div className="text-muted py-4">Select an organization above to see its uninvoiced credit bills.</div>
						) : (
							<Row className="g-3">
								<Col lg={8}>
									<Table responsive size="sm" className="align-middle">
										<thead className="table-light">
											<tr>
												<th style={{ width: 36 }}>
													<Form.Check
														aria-label="Select all"
														checked={eligibleBills.length > 0 && selectedBills.size === eligibleBills.length}
														onChange={(e) => setSelectedBills(e.target.checked ? new Set(eligibleBills.map((b) => b.billingid)) : new Set())}
													/>
												</th>
												<th>Bill</th>
												<th>Date</th>
												<th>Patient</th>
												<th>Services</th>
												<th className="text-end">Outstanding ({CURRENCY})</th>
											</tr>
										</thead>
										<tbody>
											{loadingBills ? (
												<tr><td colSpan={6} className="text-center py-4"><Spinner size="sm" animation="border" /></td></tr>
											) : eligibleBills.length === 0 ? (
												<tr><td colSpan={6} className="text-center text-muted py-4">No uninvoiced credit bills for this organization</td></tr>
											) : eligibleBills.map((bill) => (
												<tr key={bill.billingid} onClick={() => toggleBill(bill.billingid)} style={{ cursor: "pointer" }}>
													<td><Form.Check readOnly checked={selectedBills.has(bill.billingid)} aria-label={`Select bill ${bill.billingid}`} /></td>
													<td>#{bill.billingid}</td>
													<td>{formatDate(bill.billedon)}</td>
													<td>{bill.patient_name}</td>
													<td><small>{bill.services.map((s) => s.service_name).join(", ")}</small></td>
													<td className="text-end">{money(bill.outstanding)}</td>
												</tr>
											))}
										</tbody>
									</Table>
								</Col>
								<Col lg={4}>
									<Card body className="shadow-sm">
										<div className="d-flex justify-content-between mb-2">
											<span className="text-muted">{selectedBills.size} bill(s) selected</span>
											<strong>{CURRENCY} {money(selectedTotal)}</strong>
										</div>
										<Form.Group className="mb-2">
											<Form.Label className="small mb-1">Due date (default: 30 days)</Form.Label>
											<Form.Control type="date" min={todayIso()} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
										</Form.Group>
										<Form.Group className="mb-2">
											<Form.Label className="small mb-1">Payment terms</Form.Label>
											<Form.Control maxLength={255} value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
										</Form.Group>
										<Form.Group className="mb-2">
											<Form.Label className="small mb-1">Organization reference / contract no.</Form.Label>
											<Form.Control maxLength={120} value={reference} onChange={(e) => setReference(e.target.value)} />
										</Form.Group>
										<Form.Group className="mb-3">
											<Form.Label className="small mb-1">Notes</Form.Label>
											<Form.Control as="textarea" rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
										</Form.Group>
										<Button className="w-100" disabled={generating || selectedBills.size === 0} onClick={generateInvoice}>
											{generating ? <Spinner size="sm" animation="border" /> : "Generate Invoice"}
										</Button>
									</Card>
								</Col>
							</Row>
						)}
					</Tab>
				)}
			</Tabs>

			<Modal show={loadingDetail || !!detail} onHide={closeInvoice} size="xl" fullscreen="lg-down">
				<Modal.Header closeButton>
					<Modal.Title>
						{detail ? <>Invoice {detail.invoice.invoice_number} <StatusBadge status={detail.invoice.status} /></> : "Invoice"}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{loadingDetail || !detail ? (
						<div className="text-center py-5"><Spinner animation="border" /></div>
					) : (
						<Row className="g-3">
							<Col lg={8}>
								<div className="d-flex gap-2 mb-2">
									<Button size="sm" variant="primary" disabled={pdfBusy} onClick={printPdf}>Print</Button>
									<Button size="sm" variant="outline-primary" disabled={pdfBusy} onClick={downloadPdf}>Download PDF</Button>
								</div>
								{previewUrl ? (
									<iframe title="Invoice preview" src={previewUrl} style={{ width: "100%", height: "75vh", border: "1px solid #dee2e6" }} />
								) : (
									<div className="text-center py-5"><Spinner animation="border" /></div>
								)}
							</Col>
							<Col lg={4}>
								<Card body className="mb-3">
									<div className="d-flex justify-content-between"><span className="text-muted">Invoiced</span><span>{CURRENCY} {money(detail.invoice.amount_due)}</span></div>
									<div className="d-flex justify-content-between"><span className="text-muted">Paid</span><span>{CURRENCY} {money(detail.invoice.amount_paid)}</span></div>
									<div className="d-flex justify-content-between fw-bold"><span>Balance due</span><span>{CURRENCY} {money(detail.invoice.balance_due)}</span></div>
								</Card>

								{canWrite && invoiceOpen && (
									<Card body className="mb-3">
										<h6>Record organization payment</h6>
										<Form onSubmit={recordPayment}>
											<Form.Group className="mb-2">
												<Form.Label className="small mb-1">Amount ({CURRENCY})</Form.Label>
												<div className="d-flex gap-2">
													<Form.Control inputMode="decimal" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0.00" />
													<Button variant="outline-secondary" size="sm" onClick={() => setPaymentAmount(Number(detail.invoice.balance_due).toFixed(2))}>Full</Button>
												</div>
											</Form.Group>
											<Form.Group className="mb-2">
												<Form.Label className="small mb-1">Payment mode</Form.Label>
												<Form.Select value={paymentModeId} onChange={(e) => setPaymentModeId(e.target.value)}>
													<option value="">Select…</option>
													{paymentModes.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
												</Form.Select>
											</Form.Group>
											<Form.Group className="mb-2">
												<Form.Label className="small mb-1">Payment date</Form.Label>
												<Form.Control type="date" max={todayIso()} value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
											</Form.Group>
											<Form.Group className="mb-2">
												<Form.Label className="small mb-1">Reference (cheque / transfer no.)</Form.Label>
												<Form.Control maxLength={120} value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
											</Form.Group>
											<Form.Group className="mb-2">
												<Form.Label className="small mb-1">Notes</Form.Label>
												<Form.Control maxLength={500} value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} />
											</Form.Group>
											<Button type="submit" variant="success" className="w-100" disabled={recording}>
												{recording ? <Spinner size="sm" animation="border" /> : "Record Payment"}
											</Button>
										</Form>
									</Card>
								)}

								<Card body className="mb-3">
									<h6>Payment history</h6>
									{detail.payments.length === 0 ? (
										<small className="text-muted">No payments recorded yet.</small>
									) : (
										<Table size="sm" className="mb-0">
											<tbody>
												{detail.payments.map((p) => (
													<tr key={p.id}>
														<td><small>{formatDate(p.payment_date)}<br />{p.payment_mode}{p.reference ? ` · ${p.reference}` : ""}</small></td>
														<td className="text-end">{money(p.amount)}</td>
													</tr>
												))}
											</tbody>
										</Table>
									)}
								</Card>

								{canVoid && invoiceOpen && Number(detail.invoice.amount_paid) === 0 && (
									<Card body border="danger">
										<h6 className="text-danger">Void invoice</h6>
										<Form.Control className="mb-2" placeholder="Reason" maxLength={500} value={voidReason} onChange={(e) => setVoidReason(e.target.value)} />
										<Button size="sm" variant="outline-danger" disabled={voiding} onClick={voidInvoice}>Void Invoice</Button>
									</Card>
								)}
							</Col>
						</Row>
					)}
				</Modal.Body>
			</Modal>
		</div>
	);
}
