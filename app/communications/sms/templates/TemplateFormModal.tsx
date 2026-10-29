import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ui from '../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from './templates.module.css';
import { RiMailSendLine, RiLoader4Line } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customPost, customFetch } from '../../../../components/Auth/customFetch';
import { useApplication } from '../../../../components/Auth/useApplicationContext';

interface TemplateFormProps {
	visible: boolean;
	onCancel: () => void;
	onSubmit: (success: boolean) => Promise<void>;
	initialValues?: Partial<any>;
	loading: boolean;
}

const TemplateFormModal: React.FC<TemplateFormProps> = ({ visible, onCancel, onSubmit, initialValues, loading }) => {
	const [form, setForm] = useState({
		name: initialValues?.name || '',
		body: initialValues?.body || '',
		category: initialValues?.category || '',
	});
	const [placeholders, setPlaceholders] = useState<{ [key: string]: string[] }>({});
	const [selectedPlaceholder, setSelectedPlaceholder] = useState('');
	const [usedPlaceholders, setUsedPlaceholders] = useState<string[]>([]);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState('');
	const employeeid = useApplication().user?.employeeid

	useEffect(() => {
		if (visible) {
			setSaveError('');
			setForm({
				name: initialValues?.name || '',
				body: initialValues?.body || '',
				category: initialValues?.category || '',
			});
			setUsedPlaceholders([]);
			setSelectedPlaceholder('');
			customFetch('prime/sms-category-mappings-with-placeholders').then((data) => {
				if (data && typeof data === 'object' && data.patient) {
					setPlaceholders(data);
				} else {
					setPlaceholders({});
					console.error('Invalid placeholders data from backend:', data);
				}
			}).catch(() => { setPlaceholders({}); toast.error('Unable to load template placeholders. Retry opening the editor.'); });
		}
	}, [visible, initialValues]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handlePlaceholderClick = (placeholder: string) => {
		if (placeholder && canEditBody) {
			setForm((prev) => ({
				...prev,
				body: prev.body + (prev.body && !prev.body.endsWith(' ') ? ' ' : '') + placeholder
			}));
			setUsedPlaceholders((prev) => prev.includes(placeholder) ? prev : [...prev, placeholder]);
		}
	};

	const handleRemovePlaceholder = (placeholderToRemove: string) => {
		if (placeholderToRemove && canEditBody) {
			setForm((prev) => ({
				...prev,
				body: prev.body.replace(placeholderToRemove, '').replace(/\s+/g, ' ').trim()
			}));

			setUsedPlaceholders((prev) => {
				const updatedBody = form.body.replace(placeholderToRemove, '').replace(/\s+/g, ' ').trim();
				const stillExists = updatedBody.includes(placeholderToRemove);
				return stillExists ? prev : prev.filter(ph => ph !== placeholderToRemove);
			});
		}
	};

	const handlePlaceholderSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const ph = e.target.value;
		setSelectedPlaceholder(ph);
		if (ph) {
			handlePlaceholderClick(ph);
			setSelectedPlaceholder('');
		}
	};

	const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setForm({ ...form, category: e.target.value, body: '' });
		setUsedPlaceholders([]);
		setSelectedPlaceholder('');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (saving || loading) return;
		if (!employeeid || !form.name || !form.body || !form.category) {
			console.error('Missing required fields');
			toast.error('Please fill in all required fields');
			return;
		}
		setSaving(true);
		setSaveError('');
		const payload = {
			name: form.name,
			body: form.body,
			category: form.category,
			createdBy: employeeid,
		};
		try {
			const id = initialValues?.id ?? initialValues?.templateid;
			const response = await customPost(id ? `prime/sms-templates/${id}` : 'prime/sms-templates', id ? 'PUT' : 'POST', payload);
			if (response && (id ? Number(response.updated) > 0 : Number(response.id) > 0)) {
				toast.success('SMS template saved successfully!');
				await onSubmit(true);
			} else {
				setSaveError(typeof response?.error === 'string' ? response.error : 'Unable to save this template. Your changes have been kept.');
				toast.error('Unable to save SMS template');
				await onSubmit(false);
			}
		} catch (err) {
			console.error('Failed to create template', err);
			setSaveError('Unable to save this template. Your changes have been kept. Please retry.');
			toast.error('Unable to save SMS template');
			await onSubmit(false);
		} finally {
			setSaving(false);
		}
	};

	const currentPlaceholders = placeholders[form.category] || [];
	const canEditBody = !!form.category;


	const exampleValues: { [key: string]: string } = {
		'{firstname}': 'John', '{lastname}': 'Doe', '{email}': 'john@example.com', '{name}': 'Acme Clinic', '{id}': '123', '{patientid}': 'P001', '{mobile_number}': '1234567890', '{organization}': 'Acme Org', '{dob}': '1990-01-01', '{date}': '2025-06-28', '{gender}': 'Male', '{occupation}': 'Doctor', '{address}': '123 Main St', '{region}': 'Greater Accra', '{website}': 'www.example.com', '{type}': 'Hospital', '{middlename}': 'Smith', '{designation}': 'Mr.', '{location}': 'Accra', '{contactpointer}': 'Jane', '{whatAppcontact}': '1234567890', '{agetype}': 'years', '{marital_status}': 'Single', '{activation_status}': 'Active', '{fullpatientid}': 'P001-2025', '{gpsmapping}': '5.6037, -0.1870', '{created_on}': '2025-06-28', '{updated_on}': '2025-06-28', '{phone}': '1234567890', '{identifier}': 'ID123',
	};
	let preview = form.body;
	Object.entries(exampleValues).forEach(([ph, val]) => {
		preview = preview.split(ph).join(val);
	});

	return (
		<>
			<Modal show={visible} onHide={() => { if (!saving) onCancel(); }} contentClassName={`${ui.workspace} ${styles.editor}`} size="lg" backdrop="static" keyboard={false} centered>
				<Form onSubmit={handleSubmit}>
					<Modal.Header closeButton={!saving} className="border-bottom">
						<Modal.Title className="fw-semibold">
							<RiMailSendLine size={20} className="me-2" style={{ verticalAlign: 'middle' }} />
							{(initialValues?.id ?? initialValues?.templateid) ? 'Edit SMS Template' : 'Create New SMS Template'}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body className="p-3">
                        {saveError && <div role="alert" className="alert alert-danger">{saveError}</div>}
						<div className="row">
							<div className="col-md-6 border-end pe-4">
								<h6 className="fw-semibold mb-3 text-primary">Template Details</h6>
								<Form.Group className="mb-3">
									<Form.Label className="fw-semibold">Template Name <span className="text-danger">*</span></Form.Label>
									<Form.Control
										name="name"
										value={form.name}
										onChange={handleChange}
										required
										disabled={loading || saving}
										placeholder="e.g., Appointment Reminder"
										className="form-control-sm"
									/>
									<small className="text-muted">Give your template a descriptive name</small>
								</Form.Group>
								<Form.Group className="mb-4">
									<Form.Label className="fw-semibold">Category <span className="text-danger">*</span></Form.Label>
									<Form.Select
										name="category"
										value={form.category}
										onChange={handleCategoryChange}
										required
										disabled={loading || saving}
										className="form-select-sm"
									>
										<option value="">Select a category</option>
										<option value="patient">Patient</option>
										<option value="clinician">Practitioner</option>
										<option value="organization">Organization</option>
									</Form.Select>
									<small className="text-muted">Select who will receive this message</small>
								</Form.Group>

								<Form.Group className="mb-3">
									<Form.Label className="fw-semibold">Message Body <span className="text-danger">*</span></Form.Label>
									<Form.Control
										as="textarea"
										name="body"
										value={form.body}
										onChange={handleChange}
										rows={6}
										required
										disabled={!canEditBody || loading || saving}
										placeholder={canEditBody ? 'Enter your message here. Click placeholders on the right to add them.' : 'Select a category first'}
										className="form-control-sm"
										style={{ fontSize: '0.9rem', minHeight: '120px' }}
									/>
									<small className="text-muted">
										{!canEditBody ? 'Select a category to enable message editing' : `${form.body.length} characters before personalization. SMS segments depend on the final text and encoding.`}
									</small>
								</Form.Group>
							</div>
							<div className="col-md-6 ps-4">
								<h6 className="fw-semibold mb-3 text-primary">Placeholders & Preview</h6>
								<Form.Group className="mb-3">
									<Form.Label className="fw-semibold">Insert Placeholder</Form.Label>
									<Form.Select
										value={selectedPlaceholder}
										onChange={handlePlaceholderSelect}
										disabled={loading || saving || !canEditBody}
										className="form-select-sm"
									>
										<option value="">{!form.category ? 'Select category first' : 'Choose placeholder'}</option>
										{currentPlaceholders.map((ph) => (
											<option key={ph} value={ph}>{ph}</option>
										))}
									</Form.Select>
									<small className="text-muted">Or click badges below to add</small>
								</Form.Group>

								<Form.Group className="mb-3">
									<Form.Label className="fw-semibold">Available Placeholders</Form.Label>
									<div className="border rounded p-3 bg-light" style={{ maxHeight: '140px', overflowY: 'auto', minHeight: '80px' }}>
										{!form.category ? (
											<span className="text-muted small">Select a category to see available placeholders</span>
										) : currentPlaceholders.length > 0 ? (
											<div className="d-flex flex-wrap gap-2">
												{currentPlaceholders.map((ph) => (
													<button type="button" disabled={loading || saving || !canEditBody}
														key={ph}

														className={styles.placeholder}
														style={{ cursor: 'pointer', fontSize: '0.8rem' }}
														onClick={() => handlePlaceholderClick(ph)}
														title={`Click to add ${ph} to your message`}
													>
														{ph}
													</button>
												))}
											</div>
										) : (
											<span className="text-muted small">No placeholders available for this category</span>
										)}
									</div>
								</Form.Group>

								<div className="mb-3">
									<Form.Label className="fw-semibold">Message Preview</Form.Label><p className="small text-muted">Sample values for preview only.</p>
									<div className="border rounded p-3 bg-light" style={{ minHeight: '80px', fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--bs-body-color)'  }}>
										{form.body ? preview : <span className="text-muted">Your message preview will appear here</span>}
									</div>
								</div>

								{usedPlaceholders.length > 0 && (
									<div className="mb-3">
										<Form.Label className="fw-semibold">Used Placeholders</Form.Label>
										<div>
											{usedPlaceholders.map((ph) => (
												<button type="button" disabled={loading || saving || !canEditBody}

													key={ph}
													className={styles.placeholder}
													style={{ cursor: 'pointer', fontSize: '0.8rem' }}
													onClick={() => handleRemovePlaceholder(ph)}
													title={`Click to remove ${ph}`}
												>
													{ph} ×
												</button>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					</Modal.Body>
					<Modal.Footer className="border-top">
						<Button variant="secondary" onClick={onCancel} disabled={loading || saving} className="btn-sm">
							Cancel
						</Button>
						<Button variant="primary" type="submit" disabled={loading || !canEditBody || saving} className="btn-sm">
							{saving ? (
								<>
									<RiLoader4Line size={16} className="me-2 animate-spin" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
									Saving...
								</>
							) : (loading ? 'Saving...' : '✓ Save Template')}
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
};

export default TemplateFormModal;
