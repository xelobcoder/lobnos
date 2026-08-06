'use client'

import React from 'react'
import { plsDecryption } from '../../../../../lib/encryption'
import { customFetch } from '../../../../../components/Auth/customFetch'
import PreviewPatientInformation from '../../../../../components/petientsComponent/PreviewPatientInformation'

interface AuditHistoryItem {
	id: number;
	auditid?: string;
	section?: string;
	action_type?: string;
	changed_by_employeeid?: number | null;
	changed_by_username?: string;
	changed_by_role?: string;
	changed_at?: string;
	date?: string;
	created_at?: string;
	updated_at?: string;
	changed_fields?: Array<{
		field: string;
		oldValue: string;
		newValue: string;
	}>;
	previous_data?: Record<string, unknown>;
	new_data?: Record<string, unknown>;
	[key: string]: unknown;
}

export default function Page({ params }: { params: { patientid: string } }) {
	const encrypted = params.patientid;
	const pidNumber = encrypted ? parseInt(plsDecryption(encrypted).toString()) : null;

	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string>('');
	const [auditHistory, setAuditHistory] = React.useState<AuditHistoryItem[]>([]);
	const [expandedAuditId, setExpandedAuditId] = React.useState<number | null>(null);

	const loadAuditHistory = async () => {
		if (!pidNumber) return;
		setLoading(true);
		setError('');
		try {
			const response: any = await customFetch(`register/personalinformation/audit?patientid=${pidNumber}`);
			setAuditHistory(Array.isArray(response?.result) ? response.result : []);
		} catch (err) {
			setAuditHistory([]);
			setError('Failed to load audit history');
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		loadAuditHistory();
	}, [pidNumber]);

	const getWhenLabel = (item: AuditHistoryItem) => {
		const when = item.changed_at || item.updated_at || item.created_at || item.date;
		if (!when) return 'N/A';
		const parsed = new Date(when);
		if (Number.isNaN(parsed.getTime())) return String(when);
		return parsed.toLocaleString();
	};

	const getActorLabel = (item: AuditHistoryItem) => {
		const usernameRaw = typeof item.changed_by_username === 'string' ? item.changed_by_username : '';
		const username = usernameRaw.trim();
		const role = typeof item.changed_by_role === 'string' ? item.changed_by_role.trim() : '';
		if (username && role) return `${username} (${role})`;
		if (username) return username;
		if (role) return role;
		if (item.changed_by_employeeid) return `Employee #${item.changed_by_employeeid}`;
		return 'Unknown user';
	};

	const pickSnapshot = (item: AuditHistoryItem) => {
		const keys = [
			'fullpatientid',
			'designation',
			'firstname',
			'middlename',
			'lastname',
			'gender',
			'dob',
			'age',
			'agetype',
			'email',
			'mobile_country_code',
			'mobile_number',
			'whatsapp_country_code',
			'whatAppcontact',
			'occupation',
			'marital_status',
			'organization',
			'activation_status',
		];
		const snapshot: Record<string, unknown> = {};
		for (const k of keys) {
			if (k in item) snapshot[k] = item[k];
		}
		return snapshot;
	};

	return (
		<div className="container-fluid p-3">
			{pidNumber ? (
				<div className="mb-3">
					<PreviewPatientInformation patientid={pidNumber} compact />
				</div>
			) : null}

			<div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
				<div>
					<h4 className="mb-0">Patient Test Line Information Audit Log</h4>
					<div className="text-muted" style={{ fontSize: '0.9rem' }}>
						Audit history (who changed what and when)
					</div>
				</div>
				<button type="button" className="btn btn-sm btn-outline-secondary" onClick={loadAuditHistory} disabled={loading || !pidNumber}>
					Refresh
				</button>
			</div>

			{loading ? (
				<div className="text-muted">Loading audit history...</div>
			) : error ? (
				<div className="alert alert-danger">{error}</div>
			) : auditHistory.length === 0 ? (
				<div className="alert alert-secondary">No audit history found for this patient.</div>
			) : (
				<div className="d-grid gap-2">
					{auditHistory.map((item) => {
						const isExpanded = expandedAuditId === item.id;
						return (
							<div key={item.id} className="border rounded p-3 bg-white">
								<div className="d-flex justify-content-between align-items-start gap-3">
									<div>
										<div className="fw-semibold">{getActorLabel(item)}</div>
										<div className="text-muted small">{getWhenLabel(item)}</div>
										<div className="small mt-2">
											{Array.isArray(item.changed_fields) && item.changed_fields.length > 0 ? (
												item.changed_fields.map((field, idx) => (
													<div key={`${item.id}-${idx}`}>
														<span className="fw-semibold text-capitalize">{field.field}</span>: {String(field.oldValue || '-')} →{' '}
														{String(field.newValue || '-')}
													</div>
												))
											) : (
												<span className="text-muted">No field-level diff provided.</span>
											)}
										</div>
										<div className="text-muted small mt-2">
											{item.section ? <span className="me-2">Section: <span className="text-capitalize">{String(item.section)}</span></span> : null}
											{item.action_type ? <span>Action: <span className="text-uppercase">{String(item.action_type)}</span></span> : null}
											{item.auditid ? <span className="ms-2">Audit ID: {String(item.auditid)}</span> : null}
										</div>
									</div>
									<button
										type="button"
										className="btn btn-sm btn-outline-secondary"
										onClick={() => setExpandedAuditId(isExpanded ? null : item.id)}
									>
										{isExpanded ? 'Hide Details' : 'View Details'}
									</button>
								</div>

								{isExpanded ? (
									<div className="row g-3 mt-2">
										{item.previous_data || item.new_data ? (
											<>
												<div className="col-md-6">
													<div className="border rounded p-2 h-100">
														<div className="fw-semibold mb-2">Previous Data</div>
														<pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>
															{JSON.stringify(item.previous_data || {}, null, 2)}
														</pre>
													</div>
												</div>
												<div className="col-md-6">
													<div className="border rounded p-2 h-100">
														<div className="fw-semibold mb-2">New Data</div>
														<pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>
															{JSON.stringify(item.new_data || {}, null, 2)}
														</pre>
													</div>
												</div>
											</>
										) : (
											<div className="col-12">
												<div className="border rounded p-2">
													<div className="fw-semibold mb-2">Record Snapshot</div>
													<pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>
														{JSON.stringify(pickSnapshot(item), null, 2)}
													</pre>
												</div>
											</div>
										)}
									</div>
								) : null}
							</div>
						);
					})}
				</div>
			)}
		</div>
	)
}
