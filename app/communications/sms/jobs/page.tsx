'use client';

type OrganizationType = {
	id: number;
	name: string;
	location?: string;
	street?: string;
	mobile?: string | number;
	address?: string;
	email?: string;
	gpsmapping?: string | null;
	region?: string;
	type?: string | null;
	website?: string;
};

type ClinicianType = {
	id: number;
	name: string;
	location?: string;
	address?: string;
	occupation?: string;
	[key: string]: any;
};

type PatientType = {
	patientid?: number | string;
	fullpatientid?: string;
	designation?: string;
	firstname?: string;
	email?: string;
	[key: string]: any;
};
import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import { RiDeleteBinLine, RiDeleteBack2Line, RiDeleteBin2Fill, RiDeleteBin3Fill } from '@remixicon/react';
import Loader from '../../../../components/accessories/Loader';
import ClinicianFiltering from '../../../../components/accessories/SectorFileringComponents/ClinicianFiltering';
import PatientFiltered from '../../../../components/accessories/SectorFileringComponents/CustomerFiltering';
import OrganizationFiltering from '../../../../components/accessories/SectorFileringComponents/OrganizationFiltering';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { useApplication } from '../../../../components/Auth/useApplicationContext';



const categoryOptions = [
	{ label: 'Patient', value: 'patient' },
	{ label: 'Clinician', value: 'clinician' },
	{ label: 'Organization', value: 'organization' },
];

const recipientScopeOptions = [
	{ label: 'Single', value: 'single' },
	{ label: 'Multiple', value: 'multiple' },
	{ label: 'All', value: 'all' },
];

const sendTypeOptions = [
	{ label: 'Send Now', value: 'immediate' },
	{ label: 'Schedule', value: 'scheduled' },
];

const SmsJobPage: React.FC = () => {
	const [form, setForm] = useState({
		templateId: '',
		customBody: '',
		category: '',
		recipientScope: 'all',
		targetIds: '',
		sendType: 'immediate',
		scheduledAt: '',
	});
	const [selectedRecipients, setSelectedRecipients] = useState<{
		category: string,
		recipients: OrganizationType[] | ClinicianType[] | PatientType[]
	}>({
		category: '',
		recipients: [],
	});

	const removeSelectedRecipient = (id: number | string) => {
		setSelectedRecipients((prev) => ({
			...prev,
			recipients: prev.recipients.filter((rec: any) => {
				if (prev.category === 'organization' || prev.category === 'clinician') {
					return rec.id !== id;
				}
				return rec.patientid !== id && rec.fullpatientid !== id;
			}),
		}));
	};

	const [saving, setSaving] = useState(false);
	const [templateOptions, setTemplateOptions] = useState<{ id: string; name: string; category: string }[]>([]);
	const [loading, setLoading] = useState(false);
	const employeeid = useApplication().user?.employeeid;

	React.useEffect(() => {
		setLoading(true);
		customFetch('prime/sms-templates-paginated')
			.then((data) => {
				if (data && Array.isArray(data.templates)) {
					setTemplateOptions(data.templates.map((t: any) => ({ id: String(t.templateid), name: t.name,category:t.category })));
				}
			})
			.finally(() => setLoading(false));
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		// Reset selected recipients if category or recipientScope changes
		if (e.target.name === 'category' || e.target.name === 'recipientScope') {
			setSelectedRecipients({ category: '', recipients: [] });
		}
	};


	// Filtering handlers: support single and multi-select
	const handleOrganizationFiltering = (orgs: OrganizationType | OrganizationType[]) => {
		const newRecipients = Array.isArray(orgs) ? orgs : orgs ? [orgs] : [];
		setSelectedRecipients((prev) => {
			if (form.recipientScope === 'multiple') {
				const existingIds = new Set((prev.category === 'organization' ? (prev.recipients as OrganizationType[]).map(o => o.id) : []));
				const unique = newRecipients.filter(o => !existingIds.has(o.id));
				return {
					category: 'organization',
					recipients: [...(prev.category === 'organization' ? prev.recipients : []), ...unique],
				};
			} else if (form.recipientScope === 'single') {
				const first = newRecipients[0] ?? null;
				return first
					? { category: 'organization', recipients: [first] }
					: { category: 'organization', recipients: [] };
			} else {
				return { category: 'organization', recipients: newRecipients };
			}
		});
	};

	const handleClinicianFiltering = (clins: ClinicianType | ClinicianType[]) => {
		const newRecipients = Array.isArray(clins) ? clins : clins ? [clins] : [];
		setSelectedRecipients((prev) => {
			if (form.recipientScope === 'multiple') {
				const existingIds = new Set((prev.category === 'clinician' ? (prev.recipients as ClinicianType[]).map(c => c.id) : []));
				const unique = newRecipients.filter(c => !existingIds.has(c.id));
				return {
					category: 'clinician',
					recipients: [...(prev.category === 'clinician' ? prev.recipients : []), ...unique],
				};
			} else if (form.recipientScope === 'single') {
				const first = newRecipients[0] ?? null;
				return first
					? { category: 'clinician', recipients: [first] }
					: { category: 'clinician', recipients: [] };
			} else {
				return { category: 'clinician', recipients: newRecipients };
			}
		});
	};

	const handlePatientFiltering = (pats: PatientType | PatientType[]) => {
		const newRecipients = Array.isArray(pats) ? pats : pats ? [pats] : [];
		setSelectedRecipients((prev) => {
			if (form.recipientScope === 'multiple') {
				const existingIds = new Set((prev.category === 'patient' ? (prev.recipients as PatientType[]).map(p => p.patientid || p.fullpatientid) : []));
				const unique = newRecipients.filter(p => {
					const id = p.patientid || p.fullpatientid;
					return !existingIds.has(id);
				});
				return {
					category: 'patient',
					recipients: [...(prev.category === 'patient' ? prev.recipients : []), ...unique],
				};
			} else if (form.recipientScope == "single") {
				const first = newRecipients[0] ?? null;
				return first
					? { category: 'patient', recipients: [first] }
					: { category: 'patient', recipients: [] };
			}
			else {
				return { category: 'patient', recipients: newRecipients };
			}
		});
	};


	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if ((!form.templateId && !form.customBody) || !form.category || !form.recipientScope || !form.sendType) {
			toast.error('Please fill in all required fields. Either select a template or enter a custom message.');
			return;
		}

		// For 'single' scope, ensure exactly one recipient is selected and the auto-filled targetIds is not empty
		if (form.recipientScope === 'single') {
			if (selectedRecipients.recipients.length !== 1) {
				toast.error('Please select exactly one recipient for single scope');
				return;
			}
			// Defensive: ensure the auto-filled targetIds is not empty and matches the selected recipient
			let expectedId: string = '';
			if (selectedRecipients.category === 'organization') {
				const id = (selectedRecipients.recipients[0] as OrganizationType).id;
				expectedId = id !== undefined && id !== null ? String(id) : '';
			} else if (selectedRecipients.category === 'clinician') {
				const id = (selectedRecipients.recipients[0] as ClinicianType).id;
				expectedId = id !== undefined && id !== null ? String(id) : '';
			} else if (selectedRecipients.category === 'patient') {
				const pat = selectedRecipients.recipients[0] as PatientType;
				const id = pat.patientid ?? pat.fullpatientid;
				expectedId = id !== undefined && id !== null ? String(id) : '';
			}
			const targetIdsArr = [expectedId];
			if (!expectedId || !targetIdsArr.includes(expectedId)) {
				toast.error('Target ID does not match the selected recipient');
				return;
			}
		}
		if (form.recipientScope === 'multiple' && selectedRecipients.recipients.length === 0) {
			toast.error('Please select at least one recipient');
			return;
		}
		if (form.sendType === 'scheduled' && !form.scheduledAt) {
			toast.error('Please provide a scheduled date/time');
			return;
		}
		if (form.recipientScope === 'multiple' && form.targetIds) {
			toast.error('Target IDs should not be manually entered when recipient scope is multiple');
			return;
		}
		if (
			form.recipientScope === 'single' &&
			form.targetIds &&
			![...selectedRecipients.recipients].find(recipient => {
				if ('patientid' in recipient || 'fullpatientid' in recipient) {
					return recipient.patientid === form.targetIds || recipient.fullpatientid === form.targetIds;
				}
				if ('id' in recipient) {
					return recipient.id === form.targetIds;
				}
				return false;
			})
		) {
			toast.error('Target ID does not match any selected recipient');
			return;
		}
		if (!employeeid) {
			toast.error('User ID not found');
			return;
		}
		setSaving(true);
		const payload: any = {
			category: form.category,
			recipientScope: form.recipientScope,
			sendType: form.sendType,
			createdBy: employeeid,
		};
		

		const receiptLen = selectedRecipients.recipients.length;
		if (form.recipientScope == 'single' && receiptLen > 1) {
			toast.error('Single recipient scope should only have one recipient');
		}
		if (form.recipientScope === 'multiple' && receiptLen === 0) {
			toast.error('Please select at least one recipient for single or multiple recipient scope');
			return;
		}
		if (form.templateId) payload.templateId = Number(form.templateId);
		if (form.customBody) payload.customBody = form.customBody;
		if (form.recipientScope === 'single' || form.recipientScope === 'multiple') {
			let ids: { id: string | number, phone: string | number | undefined }[] = [];
			if (selectedRecipients.category === 'organization') {
				ids = (selectedRecipients.recipients as OrganizationType[]).map((org) => ({ id: org.id, phone: org.mobile }));
			} else if (selectedRecipients.category === 'clinician') {
				ids = (selectedRecipients.recipients as ClinicianType[]).map((clin) => ({ id: clin.id, phone: clin.mobile || clin.phone || clin.contact || clin.telephone }));
			} else if (selectedRecipients.category === 'patient') {
				ids = (selectedRecipients.recipients as PatientType[])
					.map((pat) => {
						const id = pat.patientid || pat.fullpatientid;
						if (id === undefined || id === null) return null;
						return { id, phone: pat.mobile || pat.phone || pat.mobile_number || pat.telephone };
					})
					.filter((item): item is { id: string | number, phone: string | number | undefined } => !!item);
			}
			// Ensure for 'single' scope, only one item is sent in the array
			if (form.recipientScope === 'single') {
				payload.targetIds = ids.length > 0 ? [ids[0]] : [];
			} else {
				payload.targetIds = ids;
			}
		}
		if (form.sendType === 'scheduled') {
			payload.scheduledAt = form.scheduledAt;
		}
		try {
			const res = await customPost('prime/sms-jobs', 'POST', payload);
			if (res && res.jobId) {
				toast.success('SMS job created!');
				setForm({
					templateId: '',
					customBody: '',
					category: '',
					recipientScope: 'all',
					targetIds: '',
					sendType: 'immediate',
					scheduledAt: '',
				});
				setSelectedRecipients({ category: '', recipients: [] });
			} else {
				throw new Error('No jobId returned');
			}
		} catch (err: any) {
			toast.error(err.message || 'Failed to create SMS job');
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <Loader />;

	return (
		<div className="container mt-4">
			<Card>
				<Card.Header>
					<h4>SMS Communications</h4>
				</Card.Header>
				<Card.Body>
					<div className="row">
								<div className="col-md-7 border-end">
									<Form onSubmit={handleSubmit}>
										<Form.Group className="mb-3">
											<Form.Label>Category</Form.Label>
											<Form.Select name="category" value={form.category} onChange={handleChange} required disabled={saving}>
												<option value="">Select category</option>
												{Array.isArray(categoryOptions) && categoryOptions.length > 0 && categoryOptions.map((c) => (
													<option key={c.value} value={c.value}>{c.label}</option>
												))}
											</Form.Select>
										</Form.Group>
										<Form.Group className="mb-3">
											<Form.Label>Recipient Scope</Form.Label>
											<Form.Select name="recipientScope" value={form.recipientScope} onChange={handleChange} required disabled={saving}>
												{recipientScopeOptions.map((r) => (
													<option key={r.value} value={r.value}>{r.label}</option>
												))}
											</Form.Select>
										</Form.Group>
										<Form.Group className="mb-3">
											<Form.Label>Template</Form.Label>
											<Form.Select name="templateId" value={form.templateId} onChange={handleChange} disabled={saving}>
												<option value="">Select template</option>
												{templateOptions.map((t) => (
													<option key={t.id} value={t.id}>{t.name}({t.category})</option>
												))}
											</Form.Select>
										</Form.Group>
										<div className="text-center mb-2">or</div>
										<Form.Group className="mb-3">
											<Form.Label>Custom Message (optional if template selected)</Form.Label>
											<Form.Control
												as="textarea"
												name="customBody"
												value={form.customBody}
												onChange={handleChange}
												rows={3}
												disabled={saving}
												placeholder="Enter a custom SMS message if not using a template"
											/>
										</Form.Group>
										{(form.recipientScope === 'single' || form.recipientScope === 'multiple') && (
											<Form.Group className="mb-3">
												<Form.Label>Target IDs (auto-filled from selection, or comma separated)</Form.Label>
												<Form.Control
													name="targetIds"
													value={(() => {
														if (selectedRecipients.recipients.length > 0) {
															if (selectedRecipients.category === 'organization') return (selectedRecipients.recipients as OrganizationType[]).map((o) => o.id).join(',');
															if (selectedRecipients.category === 'clinician') return (selectedRecipients.recipients as ClinicianType[]).map((c) => c.id).join(',');
															if (selectedRecipients.category === 'patient') return (selectedRecipients.recipients as PatientType[]).map((p) => p.patientid || p.fullpatientid).filter(Boolean).join(',');
														}
														return form.targetIds;
													})()}
													onChange={handleChange}
													required
													disabled={true}
													placeholder="Auto-filled from filter selection or enter IDs manually"
												/>
											</Form.Group>
										)}
										<Form.Group className="mb-3">
											<Form.Label>Send Type</Form.Label>
											<Form.Select name="sendType" value={form.sendType} onChange={handleChange} required disabled={saving}>
												{sendTypeOptions.map((s) => (
													<option key={s.value} value={s.value}>{s.label}</option>
												))}
											</Form.Select>
										</Form.Group>
										{form.sendType === 'scheduled' && (
											<Form.Group className="mb-3">
												<Form.Label>Scheduled At</Form.Label>
												<Form.Control type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={handleChange} required disabled={saving} />
											</Form.Group>
										)}
										<div className="d-flex justify-content-end">
											<Button variant="primary" type="submit" disabled={saving}>
												{saving ? 'Saving...' : 'Create SMS Job'}
											</Button>
											<Button variant='danger' size='sm' className="ms-2" onClick={() => setSelectedRecipients({ category: '', recipients: [] })} disabled={selectedRecipients.recipients.length === 0}>
												Remove all selected <RiDeleteBinLine />
											</Button>
										</div>
									</Form>
								</div>
								<div className="col-md-5">
									<div className="mb-3">
										<strong>Recipient Filtering</strong>
										<div className="mt-2">
											{form.category === 'organization' && (form.recipientScope === 'single' || form.recipientScope === 'multiple') && (
												<OrganizationFiltering onSelect={handleOrganizationFiltering} showbulk={false} />
											)}
											{form.category === 'clinician' && (form.recipientScope === 'single' || form.recipientScope === 'multiple') && (
												<ClinicianFiltering onSelect={handleClinicianFiltering} isBulk={true} />
											)}
											{form.category === 'patient' && (form.recipientScope === 'single' || form.recipientScope === 'multiple') && (
												<PatientFiltered getSelectedPatient={handlePatientFiltering} isDisabled={false} />
											)}
										</div>
									</div>
									<div className="mb-3">
										<strong>Selected Info</strong>
										<ul className="list-group">
											{selectedRecipients.recipients.length > 0 && selectedRecipients.category === 'organization' && (selectedRecipients.recipients as OrganizationType[]).map((org) => (
												<li key={org.id} className="list-group-item bg-warning-subtle text-sm   d-flex justify-content-between align-items-center">
													<span>
														<b>Name:</b> {org.name} <br />
														<b>Location:</b> {org.location} <br />
														<b>Mobile:</b> {org.mobile}
													</span>
													<RiDeleteBack2Line onClick={() => removeSelectedRecipient(org.id)} />
												</li>
											))}
											{selectedRecipients.recipients.length > 0 && selectedRecipients.category === 'clinician' && (selectedRecipients.recipients as ClinicianType[]).map((clin) => (
												<li key={clin.id} className="list-group-item bg-warning-subtle text-sm  d-flex justify-content-between align-items-center">
													<span>
														<b>Name:</b> {clin.name} <br />
														<b>Location:</b> {clin.location} <br />
														<b>Occupation:</b> {clin.occupation}
													</span>
													<RiDeleteBin2Fill style={{ cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => removeSelectedRecipient(clin.id)} />
												</li>
											))}
											{selectedRecipients.recipients.length > 0 && selectedRecipients.category === 'patient' && (selectedRecipients.recipients as PatientType[]).map((pat) => {
												const patientKey = pat.patientid ?? pat.fullpatientid;
												return (patientKey !== undefined && patientKey !== null) ? (
													<li key={patientKey} className="list-group-item bg-warning-subtle text-sm   d-flex justify-content-between align-items-center">
														<span>
															<b>Name:</b> {pat.firstname} {pat.designation} <br />
															<b>Patient ID:</b> {patientKey} <br />
															<b>Email:</b> {pat.email}
														</span>
														<RiDeleteBin3Fill onClick={() => removeSelectedRecipient(patientKey)} />
													</li>
												) : null;
											})}
											{selectedRecipients.recipients.length === 0 && (
												<li className="list-group-item text-muted">No selection</li>
											)}
										</ul>
									</div>
								</div>
							</div>
				</Card.Body>
			</Card>
		</div>
	);
};

export default SmsJobPage;
