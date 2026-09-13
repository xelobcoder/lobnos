"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Container, Form, Button, Modal } from "react-bootstrap";
import { currencyFormatter, customFetch } from "../../../components/Auth/customFetch";
import { customFetchMutation } from "../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import { RiRefreshLine, RiInboxLine, RiUser3Line, RiBuildingLine, RiFileList3Line } from "@remixicon/react";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { stat } from "fs";


type EntityOrder = {
	id: number;
	patient_id: number;
	patientName?: string;
	entity_type: "clinician" | "organization" | "general";
	entity_id: number | null;
	entityName?: string;
	billing_source: number;
	status: string;
	revision: number;
	billing_id: number | null;
	sample_location: "center" | "referrer" | null;
	decision_reason: string | null;
	notes: string | null;
	created_at: string;
	total?: number;
	lines?: Array<{ id: number; test_id: number; test_name: string; unit_price: number | string; quantity: number }>;
};

const STATUS_FILTERS = [
	{ value: "pending", label: "Pending review" },
	{ value: "PENDING", label: "Pending" },
	{ value: "ON_HOLD", label: "On hold" },
	{ value: "APPROVED", label: "Approved (ready to convert)" },
	{ value: "CONVERTED", label: "Converted" },
	{ value: "REJECTED", label: "Rejected" },
	{ value: "all", label: "All orders" },
];

/**
 * Center billing review queue for entity (clinician/organization) lab orders.
 * Any logged-in billing staff member (admin, manager, customer service rep, …)
 * can approve, hold, reject, and convert orders here. The ordering clinician
 * does NOT approve their own orders in the consultation panel.
 */
export default function EntityOrdersReviewPage() {
	const userCtx = useApplicationSettings().applicationsettings?.user;
	const reviewerId = Number(userCtx?.employeeid ?? userCtx?.id ?? 0);
	const reviewerBranch = useApplicationSettings().applicationsettings?.branchid ?? null;

	const [statusFilter, setStatusFilter] = useState("all");
	const [sampleLocation, setSampleLocation] = useState("");
	const [orders, setOrders] = useState<EntityOrder[]>([]);
	const [loading, setLoading] = useState(false);
	const [busyId, setBusyId] = useState<number | null>(null);
	const [viewOrder, setViewOrder] = useState<EntityOrder | null>(null);
	const [page, setPage] = useState(1);
	const [count, setCount] = useState(10);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);

	const fetchOrders = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (statusFilter === "pending") params.set("pendingReview", "1");
			else if (statusFilter !== "all") params.set("status", statusFilter);
			if (sampleLocation) params.set("sampleLocation", sampleLocation);
			params.set("page", String(page));
			params.set("count", String(count));
			const response = await customFetch(`entityorders?${params.toString()}`);
			setOrders(response?.result || []);
			setTotal(Number(response?.total ?? 0));
			setTotalPages(Number(response?.totalPages ?? 1));
		} catch {
			setOrders([]);
			toast.error("Unable to load entity orders.");
		} finally {
			setLoading(false);
		}
	}, [statusFilter, sampleLocation, page, count]);

	useEffect(() => {
		setPage(1);
	}, [statusFilter, sampleLocation]);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	const handleServerSide = async (input: any) => {
		try {
			const { page: p, count: c } = input;
			const params = new URLSearchParams();
			if (statusFilter === "pending") params.set("pendingReview", "1");
			else if (statusFilter !== "all") params.set("status", statusFilter);
			if (sampleLocation) params.set("sampleLocation", sampleLocation);
			params.set("page", String(p));
			params.set("count", String(c));
			const response = await customFetch(`entityorders?${params.toString()}`);
			const { statusCode, result } = response;
			if (response && statusCode === 200 && Array.isArray(result)) {
				return { result, error: false };
			}
			return { result: [], error: false };
		} catch (err) {
			return { result: [], error: true };
		}
	};

	const act = async (orderId: number, actionPath: "submit" | "approve" | "hold" | "reject" | "convert" | "cancel", reason?: string) => {
		setBusyId(orderId);
		const response = await customFetchMutation(`entityorders/${orderId}/${actionPath}`, "POST", {
			employeeid: reviewerId,
			branchId: reviewerBranch ?? undefined,
			...(reason ? { reason } : {}),
		});
		setBusyId(null);
		if (response?.status === "success") {
			toast.success(response?.message || "Order updated.");
			fetchOrders();
		} else {
			toast.error(response?.message || "Unable to update this order.");
		}
	};

	const askReason = (title: string) => {
		const reason = window.prompt(title);
		return reason && reason.trim() ? reason.trim() : null;
	};

	const orderTotal = (order: EntityOrder) =>
		order.total ?? (order.lines || []).reduce((sum, l) => sum + Number(l.unit_price) * Number(l.quantity), 0);

	const columns = useMemo(() => [
		{
			Header: "Patient",
			accessor: "patientName",
			Cell: ({ row }: { row: { original: EntityOrder } }) => {
				return <div className="fw-bold">{row.original.patientName || `Patient #${row.original.patient_id}`}</div>
			}
		},
		{
			Header: "Billed to",
			accessor: "entityName",
			Cell: ({ row }: { row: { original: EntityOrder } }) => {
				const order = row.original;
				return (
					<>
						<span className="d-inline-flex align-items-center gap-1 fw-bold">
							{order.entityName || `${order.entity_type} #${order.entity_id}`}
						</span>
						{order.notes && <div className="text-muted small">{order.notes}</div>}
					</>
				);
			},
		},
		{
			Header: "Tests",
			accessor: "lines",
			Cell: ({ row }: { row: { original: EntityOrder } }) => {
				const lines = row.original.lines || [];
				if (lines.length === 0) return "—";
				return (
					<button
						type="button"
						className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
						onClick={() => setViewOrder(row.original)}
					>
						<RiFileList3Line size={14} />
						<span>View {lines.length} test{lines.length === 1 ? "" : "s"}</span>
					</button>
				);
			},
		},
		{
			Header: "Total",
			id: "total",
			accessor: (row: EntityOrder) => orderTotal(row),
			Cell: ({ value }: { value: number }) => <span className="fw-semibold">{currencyFormatter.format(value)}</span>,
		},
		{
			Header: "Sample",
			accessor: "sample_location",
			Cell: ({ value }: { value: EntityOrder["sample_location"] }) =>
				value === "referrer" ? "Referrer" : "Center",
		},
		{
			Header: "Status",
			accessor: "status",
			Cell: ({ row }: { row: { original: EntityOrder } }) => {
				const order = row.original;
				return (
					<>
						<span className="fw-semibold">{order.status}</span>
						{order.status === "ON_HOLD" && order.decision_reason && (
							<div className="small text-warning-emphasis mt-1">{order.decision_reason}</div>
						)}
						{order.status === "REJECTED" && order.decision_reason && (
							<div className="small text-danger-emphasis mt-1">{order.decision_reason}</div>
						)}
						{order.status === "CONVERTED" && order.billing_id && (
							<div className="small text-muted mt-1">Bill #{order.billing_id}</div>
						)}
					</>
				);
			},
		},
		{
			Header: "Created",
			accessor: "created_at",
			Cell: ({ value }: { value: string }) => <span className="text-muted small">{value ? new Date(value).toLocaleString() : "—"}</span>,
		},
		{
			Header: "Actions",
			id: "actions",
			Cell: ({ row }: { row: { original: EntityOrder } }) => {
				const order = row.original;
				return (
					<div className="text-nowrap">
						{(order.status === "PENDING" || order.status === "ON_HOLD") && (
							<>
								<Button size="sm" variant="success" className="me-1" disabled={busyId === order.id} onClick={() => act(order.id, "approve")}>
									Approve
								</Button>
								<Button size="sm" variant="outline-warning" className="me-1" disabled={busyId === order.id} onClick={() => {
									const reason = askReason("Reason for holding this order?");
									if (reason) act(order.id, "hold", reason);
								}}>
									Hold
								</Button>
								<Button size="sm" variant="outline-danger" disabled={busyId === order.id} onClick={() => {
									const reason = askReason("Reason for rejecting this order?");
									if (reason) act(order.id, "reject", reason);
								}}>
									Reject
								</Button>
							</>
						)}
						{order.status === "APPROVED" && (
							<Button size="sm" variant="primary" disabled={busyId === order.id} onClick={() => act(order.id, "convert")}>
								{busyId === order.id ? "Converting…" : "Convert to bill"}
							</Button>
						)}
						{(order.status === "DRAFT" || order.status === "PENDING" || order.status === "ON_HOLD") && (
							<Button size="sm" variant="outline-danger" disabled={busyId === order.id} onClick={() => {
								const reason = askReason("Reason for cancelling this order?");
								if (reason) act(order.id, "cancel", reason);
							}}>
								Cancel
							</Button>
						)}
					</div>
				);
			},
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
	], [busyId]);

	const viewOrderLines = viewOrder?.lines || [];

	return (
		<Container fluid className="py-3">
			<Modal
				show={!!viewOrder}
				onHide={() => setViewOrder(null)}
				size="lg"
				animation={false}
				dialogClassName="pls-modal-top"
				contentClassName="bg-body border"
			>
				<Modal.Header closeButton className="bg-body-tertiary border-bottom">
					<Modal.Title className="fs-6 fw-semibold">
						{viewOrderLines.length} test{viewOrderLines.length === 1 ? "" : "s"}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="px-3 bg-body">
					{viewOrder && (
						<>
							<div className="mb-3 border rounded-2 bg-body text-body overflow-hidden">
								<div className="bg-body-tertiary py-2 px-3 border-bottom d-flex align-items-center gap-2">
									<RiFileList3Line size={18} className="text-primary" />
									<h6 className="mb-0 fw-semibold">Order Information</h6>
								</div>
								<div className="p-3">
									<div className="row g-3 small">
										<div className="col-12 col-md-6">
											<div className="h-100 border rounded-2 p-3 d-flex align-items-center gap-2">
												<RiUser3Line size={18} className="text-secondary opacity-75" />
												<div>
													<div className="text-body-secondary mb-1">Patient</div>
													<div className="fw-semibold text-capitalize">{viewOrder.patientName || `Patient #${viewOrder.patient_id}`}</div>
												</div>
											</div>
										</div>
										<div className="col-12 col-md-6">
											<div className="h-100 border rounded-2 p-3 d-flex align-items-center gap-2">
												<RiBuildingLine size={18} className="text-secondary opacity-75" />
												<div>
													<div className="text-body-secondary mb-1">Billed To</div>
													<div className="fw-semibold text-capitalize">{viewOrder.entityName || `${viewOrder.entity_type} #${viewOrder.entity_id}`}</div>
												</div>
											</div>
										</div>
										<div className="col-6 col-md-3">
											<div className="h-100 border rounded-2 p-3">
												<div className="text-body-secondary mb-1">Sample Location</div>
												<div className="fw-semibold text-capitalize">{viewOrder.sample_location === "referrer" ? "Referrer" : "Center"}</div>
											</div>
										</div>
										<div className="col-6 col-md-3">
											<div className="h-100 border rounded-2 p-3">
												<div className="text-body-secondary mb-1">Status</div>
												<div className="fw-semibold">{viewOrder.status}</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<table className="table table-sm table-striped align-middle mb-0">
								<thead>
									<tr>
										<th style={{ width: 40 }}>#</th>
										<th>Test</th>
										<th style={{ width: 80 }} className="text-center">Qty</th>
										<th style={{ width: 120 }} className="text-end">Unit price</th>
										<th style={{ width: 120 }} className="text-end">Line total</th>
									</tr>
								</thead>
								<tbody>
									{viewOrderLines.map((line, idx) => (
										<tr key={line.id ?? idx}>
											<td className="text-muted">{idx + 1}.</td>
											<td>{line.test_name}</td>
											<td className="text-center">{line.quantity}</td>
											<td className="text-end">{Number(line.unit_price).toFixed(2)}</td>
											<td className="text-end">{currencyFormatter.format(Number(line.unit_price) * Number(line.quantity))}</td>
										</tr>
									))}
								</tbody>
								<tfoot>
									<tr className="fw-bold border-top">
										<td colSpan={4} className="text-end">Total</td>
										<td className="text-end">{viewOrder ? currencyFormatter.format(orderTotal(viewOrder)) : currencyFormatter.format(0)}</td>
									</tr>
								</tfoot>
							</table>
							{viewOrder.notes && (
								<div className="border rounded-2 bg-body-tertiary text-body px-3 py-2 mt-3 small">
									<strong>Notes:</strong> {viewOrder.notes}
								</div>
							)}
						</>
					)}
				</Modal.Body>
				<Modal.Footer className="bg-body-tertiary border-top">
					<Button variant="secondary" size="sm" onClick={() => setViewOrder(null)}>Close</Button>
				</Modal.Footer>
			</Modal>

			<div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
				<div>
					<strong>Entity Order Review</strong>
					<div className="text-muted small">Approve, hold, reject, and convert clinician / organization lab orders to billing.</div>
				</div>
				<div className="d-flex gap-2 align-items-center flex-wrap">
					<Form.Select size="sm" style={{ width: 210 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
						{STATUS_FILTERS.map((f) => (
							<option key={f.value} value={f.value}>{f.label}</option>
						))}
					</Form.Select>
					<Form.Select size="sm" style={{ width: 200 }} value={sampleLocation} onChange={(e) => setSampleLocation(e.target.value)}>
						<option value="">Sample: any</option>
						<option value="center">Sample: at center</option>
						<option value="referrer">Sample: at referrer</option>
					</Form.Select>
					<Button size="sm" variant="outline-secondary" onClick={fetchOrders} disabled={loading}>
						<RiRefreshLine size={16} />
					</Button>
				</div>
			</div>

			{loading && orders.length === 0 ? (
				<div className="text-muted small p-4 text-center">Loading orders…</div>
			) : orders.length === 0 ? (
				<div className="text-muted small p-5 text-center">
					<RiInboxLine size={28} className="mb-2 d-block mx-auto" />
					No orders match this filter.
				</div>
			) : (
				<>
					<PrimeTable
						column={columns}
						data={orders}
						filtering={false}

						urlparams={{ statusFilter: statusFilter, sampleLocation: sampleLocation }}
						serverSideFiltering={true}
						handleSeverSideProcessing={handleServerSide}
					/>
					<div className="d-flex justify-content-between align-items-center text-muted small mt-2 px-1">
						<span>
							{loading ? "Refreshing…" : `Showing ${orders.length} of ${total} order${total === 1 ? "" : "s"} — page ${page} of ${totalPages}`}
						</span>
					</div>
				</>
			)}
		</Container>
	);
}
