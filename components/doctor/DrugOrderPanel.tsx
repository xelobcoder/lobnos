"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Form, Button } from "react-bootstrap";
import { RiDeleteBinLine } from "@remixicon/react";
import { customFetch, customFetchMutation, reactSelectCustomStyles } from "../Auth/customFetch";
import AsyncSelect from "react-select/async";
import styles from "../../app/doctor/consultation/[clientid]/ConsultationPanel.module.css";

type PharmacyCatalogueItem = { inventoryItemId: string; name: string; unit: string; availableStock: number };
type DrugOrderLine = {
	inventoryItemId: string | null;
	drugName: string;
	dose: string;
	frequency: string;
	duration: string;
	route: string;
	dosageInstructions: string;
	quantityOrdered: number;
	availableStock: number;
	unit: string;
};

const ROUTE_OPTIONS = ["Oral", "IV", "IM", "SC", "Topical", "Rectal", "Inhalation", "Sublingual", "Other"];
const FREQUENCY_OPTIONS = ["Once daily (OD)", "Twice daily (BD)", "Three times daily (TDS)", "Four times daily (QID)", "Every 6 hours", "Every 8 hours", "Every 12 hours", "At night (Nocte)", "When required (PRN)", "Stat (once)"];

interface Props {
	patientid: number | string;
	consultationid?: number | string | null;
}

export default function DrugOrderPanel({ patientid, consultationid = null }: Props) {
	const [drugOrderLines, setDrugOrderLines] = useState<DrugOrderLine[]>([]);
	const [drugOrderNotes, setDrugOrderNotes] = useState("");
	const [isSubmittingDrugOrder, setIsSubmittingDrugOrder] = useState(false);
	const [drugOrderError, setDrugOrderError] = useState("");

	const loadDrugOptions = async (inputValue: string) => {
		if (!inputValue || inputValue.trim().length === 0) return [];
		try {
			const response = await customFetch(`pharmacy/catalogue?count=20&search=${encodeURIComponent(inputValue.trim())}`);
			if (response?.success && Array.isArray(response?.data?.items)) {
				return response.data.items.map((item: PharmacyCatalogueItem) => ({
					value: item.inventoryItemId,
					label: item.name,
					unit: item.unit,
					availableStock: item.availableStock,
					item,
				}));
			}
			return [];
		} catch {
			return [];
		}
	};

	const addDrugToOrder = (item: PharmacyCatalogueItem) =>
		setDrugOrderLines((current) =>
			current.some((line) => line.inventoryItemId === item.inventoryItemId)
				? current
				: [...current, { inventoryItemId: item.inventoryItemId, drugName: item.name, dose: "", frequency: "", duration: "", route: "Oral", dosageInstructions: "", quantityOrdered: 1, availableStock: Number(item.availableStock ?? 0), unit: item.unit ?? "" }]
		);

	const updateDrugOrderLine = (index: number, updates: Partial<DrugOrderLine>) =>
		setDrugOrderLines((current) => current.map((line, i) => (i === index ? { ...line, ...updates } : line)));

	const removeDrugOrderLine = (index: number) =>
		setDrugOrderLines((current) => current.filter((_, i) => i !== index));

	const resetDrugOrderModal = () => {
		setDrugOrderLines([]);
		setDrugOrderNotes("");
		setDrugOrderError("");
	};

	const submitDrugOrder = async () => {
		if (!drugOrderLines.length) {
			setDrugOrderError("Add at least one drug to the order.");
			return;
		}
		const overStock = drugOrderLines.filter((l) => l.inventoryItemId && l.quantityOrdered > l.availableStock);
		if (overStock.length) {
			const list = overStock.map((l) => `${l.drugName} (ordering ${l.quantityOrdered}, ${l.availableStock} in stock)`).join("\n");
			const proceed = window.confirm(`The following exceed available stock and may be part-dispensed or referred:\n\n${list}\n\nSend anyway?`);
			if (!proceed) return;
		}
		setIsSubmittingDrugOrder(true);
		setDrugOrderError("");
		const response = await customFetchMutation("prescriptions", "POST", {
			patientId: Number(patientid),
			consultationId: consultationid ? Number(consultationid) : null,
			notes: drugOrderNotes || undefined,
			items: drugOrderLines.map((line) => ({
				inventoryItemId: line.inventoryItemId,
				drugName: line.drugName,
				dose: line.dose || undefined,
				frequency: line.frequency || undefined,
				duration: line.duration || undefined,
				route: line.route || undefined,
				dosageInstructions: line.dosageInstructions || undefined,
				quantityOrdered: line.quantityOrdered,
			})),
		});
		setIsSubmittingDrugOrder(false);
		if (response?.success) {
			toast.success("Drug order sent to the pharmacy.");
			resetDrugOrderModal();
		} else {
			setDrugOrderError(response?.error?.message || "Unable to send this drug order to the pharmacy.");
		}
	};

	return (
		<div className={styles.notesPanel}>
			{drugOrderError && <div className="alert alert-danger py-2">{drugOrderError}</div>}
			<div className="mb-2">
				<AsyncSelect
					cacheOptions
					loadOptions={loadDrugOptions}
					placeholder="Type drug name to search pharmacy catalog..."
					styles={reactSelectCustomStyles}
					classNamePrefix="react-select"
					value={null}
					onChange={(selectedOption: any) => {
						if (selectedOption) {
							addDrugToOrder(selectedOption.item);
						}
					}}
					formatOptionLabel={(option: any) => {
						const selected = drugOrderLines.some((line) => line.inventoryItemId === option.value);
						return (
							<div className="d-flex justify-content-between align-items-center">
								<span style={selected ? { fontWeight: "bold", color: "#0f766e" } : {}}>{option.label}</span>
								<span className="d-flex align-items-center gap-2">
									{selected && <span className="badge bg-success-subtle text-success small" style={{ fontSize: "0.65rem" }}>Added</span>}
									<span className="badge bg-light text-muted small" style={{ fontSize: "0.65rem" }}>Stock: {option.availableStock} {option.unit}</span>
								</span>
							</div>
						);
					}}
					noOptionsMessage={({ inputValue }) => inputValue ? "No matching drugs found" : "Type to search..."}
				/>
			</div>

			{drugOrderLines.length === 0 ? (
				<p className="text-muted small">No drugs added yet. Search above and select an item to add it to this request.</p>
			) : (
				<div className="table-responsive">
					<table className="table table-sm align-middle table-bordered mb-0" style={{ borderColor: "var(--bs-border-color-translucent)" }}>
						<thead className="table-light">
							<tr>
								<th style={{ minWidth: 160 }}>Drug</th>
								<th style={{ minWidth: 110 }}>Dose</th>
								<th style={{ minWidth: 150 }}>Frequency</th>
								<th style={{ minWidth: 110 }}>Duration</th>
								<th style={{ minWidth: 120 }}>Route</th>
								<th style={{ minWidth: 110 }}>Qty</th>
								<th style={{ width: 44 }}></th>
							</tr>
						</thead>
						<tbody>
							{drugOrderLines.map((line, index) => (
								<tr key={`${line.inventoryItemId}-${index}`}>
									<td className="small fw-medium">{line.drugName}</td>
									<td>
										<Form.Control size="sm" type="text" placeholder="e.g. 500mg" value={line.dose} onChange={(e) => updateDrugOrderLine(index, { dose: e.target.value })} />
									</td>
									<td>
										<Form.Select size="sm" value={line.frequency} onChange={(e) => updateDrugOrderLine(index, { frequency: e.target.value })}>
											<option value="">Select…</option>
											{FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
										</Form.Select>
									</td>
									<td>
										<Form.Control size="sm" type="text" placeholder="e.g. 5 days" value={line.duration} onChange={(e) => updateDrugOrderLine(index, { duration: e.target.value })} />
									</td>
									<td>
										<Form.Select size="sm" value={line.route} onChange={(e) => updateDrugOrderLine(index, { route: e.target.value })}>
											{ROUTE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
										</Form.Select>
									</td>
									<td>
										<Form.Control size="sm" type="number" min={1} value={line.quantityOrdered} onChange={(e) => updateDrugOrderLine(index, { quantityOrdered: Math.max(1, Number(e.target.value)) })} />
										{line.inventoryItemId && (
											<div className={`small mt-1 ${line.quantityOrdered > line.availableStock ? "text-danger" : "text-muted"}`} style={{ fontSize: "0.68rem" }}>
												{line.availableStock} {line.unit} in stock{line.quantityOrdered > line.availableStock ? " — over stock" : ""}
											</div>
										)}
									</td>
									<td className="text-center">
										<button type="button" className="btn btn-link text-danger p-0" onClick={() => removeDrugOrderLine(index)} aria-label="Remove">
											<RiDeleteBinLine size={16} />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<Form.Group className="mt-2 mb-3">
				<Form.Label className="small text-muted">Notes for the pharmacy (optional)</Form.Label>
				<Form.Control as="textarea" rows={2} value={drugOrderNotes} onChange={(e) => setDrugOrderNotes(e.target.value)} />
			</Form.Group>

			<div className={styles.submitRow}>
				<div className={styles.submitHint}>Sending a request immediately reflects it in the pharmacy's fulfillment queue for this patient.</div>
				<Button variant="primary" disabled={isSubmittingDrugOrder || drugOrderLines.length === 0} onClick={submitDrugOrder}>
					{isSubmittingDrugOrder ? "Sending..." : "Send request to pharmacy"}
				</Button>
			</div>
		</div>
	);
}
