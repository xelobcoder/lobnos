


import React, { useEffect, useState } from "react";
import { Table, Form, Spinner } from "react-bootstrap";
import { customFetch } from "../../Auth/customFetch";

// value: { [fieldId]: mappingValue }
type TestField = {
	id: number;
	name: string;
	// ...other properties if needed
};

export default function DeviceInterfaceMappingModal({ show, testid, value = {}, onChange, onClose, onSave }: {show: boolean; testid: string | number; value?: Record<number, string>; onChange: (value: Record<number, string>) => void; onClose: () => void; onSave: (value: string) => void}) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [fields, setFields] = useState<TestField[]>([]);


	useEffect(() => {
		if (typeof value === 'string' && value.trim().startsWith('{')) {
			try {
				const parsed = JSON.parse(value);
				onChange(parsed);
			} catch (e) {
				// ignore parse error, keep as string
			}
		}
	}, [show]);

	useEffect(() => {
		if (show && testid) {
			setLoading(true);
			setError("");
			customFetch(`testpanel/list/customtestrule?testid=${testid}`)
				.then(res => {
					if (res && Array.isArray(res)) {
						setFields(res);
						if (!value || Object.keys(value).length === 0) {
							const initial: Record<number, string> = {};
							res.forEach(f => { initial[f.id] = ""; });
							onChange(initial);
						}
					} else if (res && res.deviceInterfaceMapping) {
						onChange(res.deviceInterfaceMapping);
					}
				})
				.catch(() => setError("Failed to load mapping."))
				.finally(() => setLoading(false));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [show, testid]);

	const handleFieldChange = (fieldId: number, newValue: string) => {
		const updated = { ...value, [fieldId]: newValue };
		onChange(updated);
	};


	const handleSave = () => {
		// Only include fields with non-empty values
		const filtered = Object.fromEntries(
			Object.entries(value).filter(([_, v]) => v && (typeof v === 'object' ? Object.values(v).some(val => val) : v))
		);
		const json = Object.keys(filtered).length > 0 ? JSON.stringify(filtered) : "";
		onSave(json);
	};

	if (!show) return null;
	return (
		<div className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }} tabIndex={-1}>
			<div className="modal-dialog modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">Device Interface Mapping</h5>
						<button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
					</div>
					<div className="modal-body">
						{loading ? (
							<div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 120 }}>
								<Spinner animation="border" role="status" className="mb-2" />
								<div>Loading mapping data...</div>
							</div>
						) : (
							<Table bordered size="sm">
								<thead>
									<tr>
										<th>Field Name</th>
										<th>Device Mapping Value</th>
									</tr>
								</thead>
								<tbody>
									{fields.map(field => (
										<tr key={field.id}>
											<td>{field.name}</td>
											<td>
												<Form.Control
													type="text"
													value={value?.[field.id] || ""}
													onChange={e => handleFieldChange(field.id, e.target.value)}
													placeholder={`Mapping for ${field.name}`}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						)}
						{error && <div className="text-danger mt-2">{error}</div>}
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
						<button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
					</div>
				</div>
			</div>
		</div>
	);
}
