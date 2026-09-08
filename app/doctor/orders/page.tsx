"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Container, Form, Button } from "react-bootstrap";
import { RiRefreshLine, RiInboxLine, RiFlaskLine, RiUser3Line } from "@remixicon/react";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import { currencyFormatter, customFetch, customFetchMutation } from "../../../components/Auth/customFetch";
type EntityOrder = {
	id: number;
	patient_id: number;
	patientName?: string;
	entity_type: string;
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
	{ value: "all", label: "All my orders" },
	{ value: "DRAFT", label: "Draft" },
	{ value: "PENDING", label: "Pending review" },
	{ value: "ON_HOLD", label: "On hold" },
	{ value: "APPROVED", label: "Approved" },
	{ value: "CONVERTED", label: "Converted" },
	{ value: "REJECTED", label: "Rejected" },
];

const PrimeTableWithRowStyling = PrimeTable as any;

const rowStyling = {
	type: "custom",
	getRowClassName: (row: EntityOrder) => {
		if (row.status === "APPROVED") return "table-success";
		if (row.status === "PENDING" || row.status === "ON_HOLD") return "table-warning";
		if (row.status === "CONVERTED") return "table-primary";
		if (row.status === "REJECTED") return "table-danger";
		return "table-secondary";
	},
	getRowStyle: (row: EntityOrder) => {
		switch (row.status) {
			case "APPROVED": return { backgroundColor: "#d1e7dd", color: "#0f5132" };
			case "PENDING":
			case "ON_HOLD": return { backgroundColor: "#fff3cd", color: "#664d03" };
			case "CONVERTED": return { backgroundColor: "#cfe2ff", color: "#084298" };
			case "REJECTED": return { backgroundColor: "#f8d7da", color: "#842029" };
			default: return { backgroundColor: "#e2e3e5", color: "#41464b" };
		}
	},
};

export default function ClinicianOrdersPage() {
	const userCtx = useApplicationSettings().applicationsettings?.user;
	const clinicianid = Number(userCtx?.clinicianid ?? userCtx?.id ?? userCtx?.employeeid ?? 0);

	const [statusFilter, setStatusFilter] = useState("all");
	const [orders, setOrders] = useState<EntityOrder[]>([]);
	const [loading, setLoading] = useState(false);
	const [busyId, setBusyId] = useState<number | null>(null);
	const [page, setPage] = useState(1);
	const [count, setCount] = useState(10);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);

	const fetchOrders = useCallback(async () => {
		if (!clinicianid) return;
		setLoading(true);
		try {
			const params = new URLSearchParams();
			params.set("entityType", "clinician");
			params.set("entityId", String(clinicianid));
			if (statusFilter !== "all") params.set("status", statusFilter);
			params.set("page", String(page));
			params.set("count", String(count));
			const response = await customFetch(`entityorders?${params.toString()}`);
			setOrders(response?.result || []);
			setTotal(Number(response?.total ?? 0));
			setTotalPages(Number(response?.totalPages ?? 1));
		} catch {
			setOrders([]);
			toast.error("Unable to load your lab orders.");
		} finally {
			setLoading(false);
		}
	}, [clinicianid, statusFilter, page, count]);

	useEffect(() => {
		setPage(1);
	}, [statusFilter, clinicianid]);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	const handleServerSide = async (input: any) => {
		try {
			const { page: p, count: c } = input;
			const params = new URLSearchParams();
			params.set("entityType", "clinician");
			params.set("entityId", String(clinicianid));
			if (statusFilter !== "all") params.set("status", statusFilter);
			params.set("page", String(p));
			params.set("count", String(c));
			const response = await customFetch(`entityorders?${params.toString()}`);
			if (response && Array.isArray(response?.result)) {
				return { result: response.result, error: false };
			}
			return { result: [], error: false };
		} catch (err) {
			return { result: [], error: true };
		}
	};

	const orderTotal = (order: EntityOrder) =>
		order.total ?? (order.lines || []).reduce((sum, l) => sum + Number(l.unit_price) * Number(l.quantity), 0);

	const submitDraft = async (orderId: number) => {
		setBusyId(orderId);
		const response = await customFetchMutation(`entityorders/${orderId}/submit`, "POST", {
			employeeid: userCtx?.employeeid,
		});
		setBusyId(null);
		if (response?.status === "success") {
			toast.success(response?.message || "Order submitted for review.");
			fetchOrders();
		} else {
			toast.error(response?.message || "Unable to submit this order.");
		}
	};

	const columns = React.useMemo(() => [
		{
			Header: "Patient",
			accessor: "patientName",
			Cell: ({ row }: { row: { original: EntityOrder } }) => (
				<span className="d-inline-flex align-items-center gap-1 fw-bold">
					{row.original.patientName || `Patient #${row.original.patient_id}`}
				</span>
			),
		},
		{
			Header: "Tests",
			accessor: "lines",
			Cell: ({ row }: { row: { original: EntityOrder } }) => {
				const lines = row.original.lines || [];
				return lines.length
					? <span className="small">{lines.map((l) => l.test_name).join(", ")} <span className="text-muted">({lines.length})</span></span>
					: "—";
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
			Cell: ({ value }: { value: EntityOrder["sample_location"] }) => (value === "referrer" ? "Referrer" : "Center"),
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
				if (order.status !== "DRAFT") return null;
				return (
					<Button
						size="sm"
						variant="primary"
						disabled={busyId === order.id}
						onClick={() => submitDraft(order.id)}
					>
						{busyId === order.id ? "Submitting…" : "Submit"}
					</Button>
				);
			},
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
	], [busyId]);

	return (
		<Container fluid className="py-3">
			<div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
				<div>
					<strong className="d-inline-flex align-items-center gap-2"><RiFlaskLine size={18} /> My Lab Orders</strong>
					<div className="text-muted small">Orders you&apos;ve raised and where each one is in the lab review → convert flow.</div>
				</div>
				<div className="d-flex gap-2 align-items-center flex-wrap">
					<Form.Select size="sm" style={{ width: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
						{STATUS_FILTERS.map((f) => (
							<option key={f.value} value={f.value}>{f.label}</option>
						))}
					</Form.Select>
					<Button size="sm" variant="outline-secondary" onClick={fetchOrders} disabled={loading}>
						<RiRefreshLine size={16} />
					</Button>
				</div>
			</div>

			{!clinicianid ? (
				<div className="alert alert-warning small">Your clinician profile could not be identified, so your orders cannot be loaded.</div>
			) : loading && orders.length === 0 ? (
				<div className="text-muted small p-4 text-center">Loading your orders…</div>
			) : orders.length === 0 ? (
				<div className="text-muted small p-5 text-center">
					<RiInboxLine size={28} className="mb-2 d-block mx-auto" />
					No lab orders found. Use “Order Lab Test” to create one.
				</div>
			) : (
				<PrimeTableWithRowStyling
					column={columns}
					data={orders}
					filtering={false}
					serverSideFiltering={true}
					handleSeverSideProcessing={handleServerSide}
					rowStyling={rowStyling}
				/>
			)}
		</Container>
	);
}
