"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Container, Form, Button, Modal } from "react-bootstrap";
import { RiRefreshLine, RiInboxLine, RiMedicineBottleLine, RiUser3Line } from "@remixicon/react";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";


type PrescriptionItem = {
	id: string;
	drugName: string;
	dose: string | null;
	frequency: string | null;
	duration: string | null;
	route: string | null;
	dosageInstructions: string | null;
	quantityOrdered: number;
	quantityDispensed: number;
	status: string;
};

type PrescriptionRow = {
	id: string;
	patientId: number;
	patientName: string;
	clinicianId: number;
	clinicianName: string;
	status: string;
	createdAt: string;
};

type PrescriptionDetail = PrescriptionRow & { notes: string | null; items: PrescriptionItem[] };

const STATUS_FILTERS = [
	{ value: "", label: "All statuses" },
	{ value: "pending", label: "Pending" },
	{ value: "partially_fulfilled", label: "Partially fulfilled" },
	{ value: "fulfilled", label: "Fulfilled" },
	{ value: "referred", label: "Referred out" },
	{ value: "cancelled", label: "Cancelled" },
];

const statusTextColor = (status: string): string => {
	switch (status) {
		case "fulfilled": return "var(--bs-success)";
		case "cancelled": return "var(--bs-danger)";
		case "referred": return "var(--bs-danger)";
		default: return "inherit";
	}
};

const statusChip = (status: string) => (
	<span className="text-capitalize" style={{ color: statusTextColor(status) }}>
		{status.replace(/_/g, " ")}
	</span>
);

const regimen = (item: PrescriptionItem) =>
	[item.dose, item.frequency, item.route, item.duration].filter(Boolean).join(" · ");

const PrimeTableWithRowStyling = PrimeTable as any;

const rowStyling = {
	type: "custom",
	getRowClassName: (row: PrescriptionRow) => {
		if (row.status === "fulfilled") return "table-success";
		if (row.status === "pending") return "table-warning";
		if (row.status === "partially_fulfilled") return "table-info";
		if (row.status === "cancelled") return "table-danger";
		if (row.status === "referred") return "table-secondary";
		return "";
	},
	getRowStyle: (row: PrescriptionRow) => {
		if (row.status === "fulfilled") return { backgroundColor: "#d1e7dd", color: "#0f5132" };
		if (row.status === "pending") return { backgroundColor: "#fff3cd", color: "#664d03" };
		if (row.status === "partially_fulfilled") return { backgroundColor: "#cff4fc", color: "#055160" };
		if (row.status === "cancelled") return { backgroundColor: "#f8d7da", color: "#842029" };
		if (row.status === "referred") return { backgroundColor: "#e2e3e5", color: "#41464b" };
		return {};
	},
};

export default function ClinicianDrugOrdersPage() {
	const userCtx = useApplicationSettings().applicationsettings?.user;
	const clinicianid = Number(userCtx?.clinicianid ?? userCtx?.id ?? userCtx?.employeeid ?? 0);

	const [statusFilter, setStatusFilter] = useState("");
	const [orders, setOrders] = useState<PrescriptionRow[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [count, setCount] = useState(10);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [detail, setDetail] = useState<PrescriptionDetail | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);

	const fetchPage = useCallback(async (pageNum: number, countNum: number) => {
		if (!clinicianid) return { result: [], error: true };
		setLoading(true);
		try {
			const params = new URLSearchParams();
			params.set("clinicianId", String(clinicianid));
			if (statusFilter) params.set("status", statusFilter);
			params.set("page", String(pageNum));
			params.set("count", String(countNum));
			const response = await customFetch(`prescriptions?${params.toString()}`);
			const data = response?.data || {};
			setOrders(data.prescriptions || []);
			setTotal(Number(data.total ?? 0));
			setTotalPages(Number(data.totalPages ?? 1));
			return { result: data.prescriptions || [], error: false };
		} catch {
			setOrders([]);
			toast.error("Unable to load your drug orders.");
			return { result: [], error: true };
		} finally {
			setLoading(false);
		}
	}, [clinicianid, statusFilter]);

	const fetchOrders = useCallback(() => fetchPage(page, count), [fetchPage, page, count]);

	useEffect(() => {
		setPage(1);
		fetchPage(1, count);
	}, [statusFilter, clinicianid]);

	const handleServerSide = async (input: any) => {
		try {
			const { page: p, count: c } = input;
			const params = new URLSearchParams();
			params.set("clinicianId", String(clinicianid));
			if (statusFilter) params.set("status", statusFilter);
			params.set("page", String(p));
			params.set("count", String(c));
			const response = await customFetch(`prescriptions?${params.toString()}`);
			const data = response?.data || {};
			if (response?.success && Array.isArray(data.prescriptions)) {
				return { result: data.prescriptions, error: false };
			}
			return { result: [], error: false };
		} catch (err) {
			return { result: [], error: true };
		}
	};

	const openDetail = async (id: string) => {
		setDetailLoading(true);
		setDetail(null);
		try {
			const response = await customFetch(`prescriptions/${id}`);
			if (response?.success && response?.data) setDetail(response.data);
			else toast.error("Unable to load this order.");
		} catch {
			toast.error("Unable to load this order.");
		} finally {
			setDetailLoading(false);
		}
	};

	const columns = React.useMemo(() => [
		{
			Header: "Patient",
			accessor: "patientName",
			Cell: ({ row }: { row: { original: PrescriptionRow } }) => (
				<span className="d-inline-flex align-items-center gap-1 fw-bold">
					{row.original.patientName || `Patient #${row.original.patientId}`}
				</span>
			),
		},
		{
			Header: "Drugs",
			id: "view",
			Cell: ({ row }: { row: { original: PrescriptionRow } }) => (
				<Button size="sm" variant="outline-primary" className="d-inline-flex align-items-center gap-1" onClick={() => openDetail(row.original.id)}>
					<RiMedicineBottleLine size={14} />
					<span>View order</span>
				</Button>
			),
		},
		{
			Header: "Status",
			accessor: "status",
			Cell: ({ value }: { value: string }) => statusChip(value),
		},
		{
			Header: "Created",
			accessor: "createdAt",
			Cell: ({ value }: { value: string }) => <span className="text-muted small">{value ? new Date(value).toLocaleString() : "—"}</span>,
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
	], []);

	return (
		<Container fluid className="py-3">
			<div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
				<div>
					<strong className="d-inline-flex align-items-center gap-2"><RiMedicineBottleLine size={18} /> My Drug Orders</strong>
					<div className="text-muted small">Prescriptions you&apos;ve sent to the pharmacy and their fulfillment status.</div>
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
				<div className="alert alert-warning small">Your clinician profile could not be identified, so your drug orders cannot be loaded.</div>
			) : loading && orders.length === 0 ? (
				<div className="text-muted small p-4 text-center">Loading your drug orders…</div>
			) : orders.length === 0 ? (
				<div className="text-muted small p-5 text-center">
					<RiInboxLine size={28} className="mb-2 d-block mx-auto" />
					No drug orders found. Use “Order Drugs” to create one.
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

			<Modal show={!!detail || detailLoading} onHide={() => setDetail(null)} animation={false} size="lg" style={{ marginTop: "1rem" }} dialogClassName="modal-dialog-scrollable" contentClassName="rounded-4 border-0 shadow">
				<Modal.Header closeButton>
					<Modal.Title className="fs-6">Drug order </Modal.Title>
				</Modal.Header>
				<Modal.Body className="px-3 py-2">
					{detailLoading || !detail ? (
						<div className="text-muted small p-4 text-center">Loading order…</div>
					) : (
						<>
							<div className="px-3 py-2 border-bottom text-muted small d-flex flex-wrap gap-3">
								<span><strong>Patient:</strong> {detail.patientName || `Patient #${detail.patientId}`}</span>
								<span><strong>Status:</strong> {statusChip(detail.status)}</span>
								<span><strong>Created:</strong> {new Date(detail.createdAt).toLocaleString()}</span>
							</div>
							<table className="table table-sm table-striped align-middle mb-0">
								<thead>
									<tr>
										<th style={{ width: 40 }}>#</th>
										<th>Drug</th>
										<th>Regimen</th>
										<th style={{ width: 90 }} className="text-center">Ordered</th>
										<th style={{ width: 90 }} className="text-center">Dispensed</th>
										<th style={{ width: 110 }}>Status</th>
									</tr>
								</thead>
								<tbody>
									{(detail.items || []).map((item, idx) => (
										<tr key={item.id ?? idx}>
											<td className="text-muted">{idx + 1}.</td>
											<td>{item.drugName}</td>
											<td className="small text-muted">
												{regimen(item) || "—"}
												{item.dosageInstructions ? <div className="fst-italic">{item.dosageInstructions}</div> : null}
											</td>
											<td className="text-center">{item.quantityOrdered}</td>
											<td className="text-center">{item.quantityDispensed}</td>
											<td>{statusChip(item.status)}</td>
										</tr>
									))}
								</tbody>
							</table>
							{detail.notes && <div className="px-3 py-2 border-top text-muted small"><strong>Notes:</strong> {detail.notes}</div>}
						</>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" size="sm" onClick={() => setDetail(null)}>Close</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
}
