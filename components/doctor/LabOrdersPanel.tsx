"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Form, Button } from "react-bootstrap";
import { RiDeleteBinLine } from "@remixicon/react";
import { customFetch, customFetchMutation, reactSelectCustomStyles } from "../Auth/customFetch";
import Select from "react-select";
import { useApplicationSettings } from "../Auth/useApplicationContext";
import styles from "../../app/doctor/consultation/[clientid]/ConsultationPanel.module.css";

type CatalogueTest = { testid: number; name: string; price: number; originalPrice: number; strategyPriced: number };
type OrderLineSelection = { testid: number; name: string; price: number; quantity: number };
type EntityOrder = {
	id: number;
	patient_id: number;
	entity_type: "clinician" | "organization" | "general";
	entity_id: number | null;
	entityName?: string;
	billing_source: number;
	status: string;
	revision: number;
	billing_id: number | null;
	decision_reason: string | null;
	created_at: string;
	total?: number;
	lines?: Array<{ id: number; test_id: number; test_name: string; unit_price: number | string; quantity: number }>;
};

interface Props {
	patientid: number | string;
	consultationid?: number | string | null;
	/**
	 * When true, review actions (approve / reject / convert) are shown — these are
	 * center billing functions. The draft Submit action is always shown to the
	 * ordering clinician regardless of this flag.
	 */
	showReviewActions?: boolean;
	/**
	 * When false, the previous-orders tracking table is hidden (use on the creation
	 * page where only ordering matters; the clinician's order history lives on the
	 * dedicated "My Lab Orders" page). Defaults to true.
	 */
	showTracking?: boolean;
}

/**
 * Clinician-driven laboratory ordering panel. Works with or without a
 * consultation: pass only `patientid` to order standalone, plus `consultationid`
 * to link the order to an in-progress consultation. Prices come from the
 * logged-in clinician's billing strategy (existing billing-strategy endpoints).
 */
export default function LabOrdersPanel({ patientid, consultationid = null, showReviewActions = false, showTracking = true }: Props) {
	const branchid = useApplicationSettings().applicationsettings?.branchid;
	const userCtx = useApplicationSettings().applicationsettings?.user;
	const clinicianid = Number(userCtx?.clinicianid ?? userCtx?.id ?? userCtx?.employeeid ?? 0);

	const [catalogue, setCatalogue] = useState<CatalogueTest[]>([]);
	const [catalogueHasStrategy, setCatalogueHasStrategy] = useState(false);
	const [catalogueLoading, setCatalogueLoading] = useState(false);
	const [selectedTests, setSelectedTests] = useState<OrderLineSelection[]>([]);
	const [orderNotes, setOrderNotes] = useState("");
	const [sampleLocation, setSampleLocation] = useState<"center" | "referrer">("center");
	const [isSavingOrder, setIsSavingOrder] = useState(false);
	const [orderError, setOrderError] = useState("");
	const [entityOrders, setEntityOrders] = useState<EntityOrder[]>([]);
	const [ordersLoading, setOrdersLoading] = useState(false);
	const [showOrderBuilder, setShowOrderBuilder] = useState(false);
	const [convertingOrderId, setConvertingOrderId] = useState<number | null>(null);

	/** Load the logged-in clinician's catalogue via their billing strategy (or general fallback). */
	const loadCatalogue = async () => {
		if (!clinicianid) return;
		setCatalogueLoading(true);
		setOrderError("");
		try {
			const [strategyRes, panelsRes] = await Promise.all([
				customFetch(`billing/strategies/clinician/${clinicianid}/has-strategy`),
				customFetch(`billing/testpanel/strategies/panels/clinician/${clinicianid}?fallbacktodefault=true`),
			]);
			const hasStrategy = Boolean(strategyRes?.hasStrategy);
			const list = Array.isArray(panelsRes) ? panelsRes : panelsRes?.result || panelsRes?.items || [];
			const items: CatalogueTest[] = (list as any[])
				.map((t) => {
					const price = Number(t.discountedValue ?? t.price ?? 0);
					const originalPrice = Number(t.originalPrice ?? t.price ?? 0);
					return {
						testid: t.testid ?? t.id,
						name: t.name,
						price,
						originalPrice,
						strategyPriced: hasStrategy && price !== originalPrice ? 1 : 0,
					};
				})
				.filter((t) => t.testid && t.name);
			setCatalogue(items);
			setCatalogueHasStrategy(hasStrategy);
		} catch {
			setCatalogue([]);
			setOrderError("Unable to load your test catalogue.");
		} finally {
			setCatalogueLoading(false);
		}
	};

	useEffect(() => {
		if (clinicianid) {
			loadCatalogue();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [clinicianid]);

	const toggleTestSelection = (test: CatalogueTest) =>
		setSelectedTests((current) =>
			current.some((t) => t.testid === test.testid)
				? current.filter((t) => t.testid !== test.testid)
				: [...current, { testid: test.testid, name: test.name, price: test.price, quantity: 1 }]
		);

	const updateSelectedQty = (testid: number, quantity: number) =>
		setSelectedTests((current) => current.map((t) => (t.testid === testid ? { ...t, quantity: Math.max(1, quantity) } : t)));

	const resetOrderBuilder = () => {
		setSelectedTests([]);
		setOrderNotes("");
		setSampleLocation("center");
		setOrderError("");
		setShowOrderBuilder(false);
	};

	const fetchEntityOrders = async () => {
		setOrdersLoading(true);
		try {
			const response = await customFetch(`entityorders?patientid=${patientid}`);
			setEntityOrders(response?.result || []);
		} catch {
			setEntityOrders([]);
		} finally {
			setOrdersLoading(false);
		}
	};

	useEffect(() => {
		if (patientid && showTracking) fetchEntityOrders();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [patientid, showTracking]);

	const saveEntityOrder = async () => {
		if (!clinicianid) {
			setOrderError("Your clinician profile could not be identified for this order.");
			return;
		}
		if (!selectedTests.length) {
			setOrderError("Select at least one test for this order.");
			return;
		}
		setIsSavingOrder(true);
		setOrderError("");
		const response = await customFetchMutation("entityorders", "POST", {
			patientId: Number(patientid),
			consultationId: consultationid ? Number(consultationid) : null,
			orderedByEmployeeId: clinicianid,
			branchId: branchid ?? null,
			sampleLocation,
			notes: orderNotes || undefined,
			lines: selectedTests.map((t) => ({ testId: t.testid, quantity: t.quantity })),
		});
		setIsSavingOrder(false);
		if (response?.status === "success" || response?.data) {
			toast.success("Lab order saved. It is now pending lab review.");
			resetOrderBuilder();
			fetchEntityOrders();
		} else {
			setOrderError(response?.message || response?.error?.message || "Unable to save this order.");
		}
	};

	const runOrderAction = async (
		orderId: number,
		actionPath: "submit" | "approve" | "hold" | "reject" | "convert" | "cancel",
		reason?: string
	) => {
		setConvertingOrderId(orderId);
		const response = await customFetchMutation(`entityorders/${orderId}/${actionPath}`, "POST", {
			employeeid: clinicianid,
			...(reason ? { reason } : {}),
		});
		setConvertingOrderId(null);
		if (response?.status === "success") {
			toast.success(response?.message || "Order updated.");
			fetchEntityOrders();
		} else {
			toast.error(response?.message || "Unable to update this order.");
		}
	};

	const orderTotal = (order: EntityOrder) =>
		order.total ?? (order.lines || []).reduce((sum, l) => sum + Number(l.unit_price) * Number(l.quantity), 0);

	return (
		<div className={styles.notesPanel}>
			<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
				<div>
					<div className={styles.panelTitle}>Lab Orders</div>
					<div className={styles.panelSubtitle}>
						Order tests billed to you using your billing strategy. The lab reviews and converts them to billing.
					</div>
				</div>
				<Button size="sm" variant={showOrderBuilder ? "outline-secondary" : "primary"} onClick={() => setShowOrderBuilder((v) => !v)}>
					{showOrderBuilder ? "Close order builder" : "+ New order"}
				</Button>
			</div>

			{showOrderBuilder && (
				<div className={styles.orderBuilder}>
					{orderError && <div className="alert alert-danger py-2">{orderError}</div>}

					{!clinicianid ? (
						<div className="alert alert-warning py-2 small">
							Your clinician profile could not be identified, so a lab order cannot be placed from this account.
						</div>
					) : (
						<>
							<div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
								{catalogueHasStrategy ? (
									<span className="badge bg-success-subtle text-success">Your billing strategy applied</span>
								) : (
									<span className="badge bg-secondary-subtle text-secondary">General pricing (no strategy on your profile)</span>
								)}
							</div>

							<Form.Group className="mb-3">
								<Form.Label className="small text-muted d-block">Where will the sample be taken?</Form.Label>
								<div className="d-flex gap-2 flex-wrap">
									{([
										{ v: "center", label: "At the center / lab" },
										{ v: "referrer", label: "At my end (I collect & dispatch)" },
									] as { v: "center" | "referrer"; label: string }[]).map((opt) => (
										<button
											key={opt.v}
											type="button"
											className={`btn btn-sm ${sampleLocation === opt.v ? "btn-primary" : "btn-outline-secondary"}`}
											onClick={() => setSampleLocation(opt.v)}
										>
											{opt.label}
										</button>
									))}
								</div>
							</Form.Group>

							<div className="mb-2">
								<Select
									options={catalogue.map((test) => ({
										value: test.testid,
										label: test.name,
										price: test.price,
										strategyPriced: test.strategyPriced,
										originalPrice: test.originalPrice,
										test,
									}))}
									placeholder="Search and select tests to add..."
									onChange={(selectedOption: any) => {
										if (selectedOption) {
											toggleTestSelection(selectedOption.test);
										}
									}}
									value={null}
									styles={reactSelectCustomStyles}
									classNamePrefix="react-select"
									isLoading={catalogueLoading}
									formatOptionLabel={(option: any) => {
										const selected = selectedTests.some((t) => t.testid === option.value);
										return (
											<div className="d-flex justify-content-between align-items-center">
												<span style={selected ? { fontWeight: 'bold', color: '#0f766e' } : {}}>{option.label}</span>
												<span className="d-flex align-items-center gap-2">
													{selected && <span className="badge bg-success-subtle text-success small" style={{ fontSize: '0.65rem' }}>Added</span>}
													{option.strategyPriced === 1 && <span className="badge bg-light text-dark small" style={{ fontSize: '0.65rem' }}>strategy</span>}
													<strong>GHS {option.price.toFixed(2)}</strong>
												</span>
											</div>
										);
									}}
								/>
							</div>

							{selectedTests.length > 0 && (
								<table className="table table-sm align-middle">
									<thead>
										<tr>
											<th>Test</th>
											<th style={{ width: 90 }}>Qty</th>
											<th style={{ width: 110 }}>Unit price</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{selectedTests.map((t) => (
											<tr key={t.testid}>
												<td>{t.name}</td>
												<td>
													<Form.Control type="number" min={1} value={t.quantity} onChange={(e) => updateSelectedQty(t.testid, Number(e.target.value))} />
												</td>
												<td>{t.price.toFixed(2)}</td>
												<td>
													<button type="button" className="btn btn-link text-danger p-0" onClick={() => toggleTestSelection({ testid: t.testid } as CatalogueTest)} aria-label="Remove">
														<RiDeleteBinLine size={16} />
													</button>
												</td>
											</tr>
										))}
									</tbody>
									<tfoot>
										<tr>
											<td colSpan={2} className="text-end fw-bold">Total</td>
											<td className="fw-bold" colSpan={2}>{selectedTests.reduce((s, t) => s + t.price * t.quantity, 0).toFixed(2)}</td>
										</tr>
									</tfoot>
								</table>
							)}

							<Form.Group className="mt-2 mb-3">
								<Form.Label className="small text-muted">Order notes (optional)</Form.Label>
								<Form.Control as="textarea" rows={2} value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} />
							</Form.Group>

							<div className={styles.submitRow}>
								<div className={styles.submitHint}>The order is saved as a draft and goes to the lab for review before it becomes a bill.</div>
								<Button variant="primary" disabled={isSavingOrder || selectedTests.length === 0} onClick={saveEntityOrder}>
									{isSavingOrder ? "Saving…" : "Save order"}
								</Button>
							</div>
						</>
					)}
				</div>
			)}

			{/* Tracking table */}
			{showTracking && (
				<div className="mt-4">
					<div className={styles.panelTitle}>Order Tracking</div>
				<div className={styles.panelSubtitle}>
					Orders created from this patient by clinicians and organizations, and where each one is in the review → convert flow.
				</div>
				{ordersLoading ? (
					<div className="text-muted small py-3">Loading orders…</div>
				) : entityOrders.length === 0 ? (
					<div className="text-muted small py-3">No entity orders yet for this patient. Use “New order” to create one.</div>
				) : (
					<table className="table table-sm align-middle mt-2">
						<thead>
							<tr>

								<th>Tests</th>
								<th>Total</th>
								<th>Status</th>
								<th>Created</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{entityOrders.map((order) => (
								<tr key={order.id}>

									<td>
										{(order.lines || []).length > 0 ? (
											<div className="d-flex flex-column gap-1">
												{(order.lines || []).map((l, idx) => (
													<div key={idx} className="small">
														<span className="fw-medium text-primary">{idx + 1}.</span> {l.test_name}
													</div>
												))}
											</div>
										) : "—"}
									</td>
									<td>{orderTotal(order).toFixed(2)}</td>
									<td>
										<span className={`badge ${styles[`orderStatus_${order.status}`] || "bg-secondary-subtle text-secondary"}`}>
											{order.status}
										</span>
										{order.status === "CONVERTED" && order.billing_id && (
											<span className="text-muted small ms-1">Bill #{order.billing_id}</span>
										)}
										{order.status === "ON_HOLD" && order.decision_reason && (
											<div className="small text-warning-emphasis mt-1">{order.decision_reason}</div>
										)}
									</td>
									<td className="text-muted small">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}</td>
									<td className="text-nowrap text-end">
										{order.status === "DRAFT" && (
											<Button size="sm" variant="primary" disabled={convertingOrderId === order.id} onClick={() => runOrderAction(order.id, "submit")}>
												Submit
											</Button>
										)}
										{showReviewActions && (order.status === "PENDING" || order.status === "ON_HOLD") && (
											<>
												<Button size="sm" variant="outline-success" className="me-1" disabled={convertingOrderId === order.id} onClick={() => runOrderAction(order.id, "approve")}>Approve</Button>
												<Button size="sm" variant="outline-danger" disabled={convertingOrderId === order.id} onClick={() => {
													const reason = window.prompt("Reason for rejecting this order?");
													if (reason) runOrderAction(order.id, "reject", reason);
												}}>Reject</Button>
											</>
										)}
										{showReviewActions && order.status === "APPROVED" && (
											<Button size="sm" variant="primary" disabled={convertingOrderId === order.id} onClick={() => runOrderAction(order.id, "convert")}>
												{convertingOrderId === order.id ? "Converting…" : "Convert to bill"}
											</Button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
				</div>
			)}
		</div>
	);
}
