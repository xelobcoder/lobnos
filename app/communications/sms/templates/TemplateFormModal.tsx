import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
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
	const employeeid = useApplication().user?.employeeid

	useEffect(() => {
		console.log('TemplateFormModal visible:', visible);
		if (visible) {
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
			});
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
		if (!employeeid || !form.name || !form.body || !form.category) {
			console.error('Missing required fields');
			toast.error('Please fill in all required fields');
			return;
		}
		setSaving(true);
		const payload = {
			name: form.name,
			body: form.body,
			category: form.category,
			createdBy: employeeid,
		};
		try {
			const response = await customPost('prime/sms-templates', 'POST', payload);
			if (response && response.id) {
				toast.success('SMS template saved successfully!');
				onSubmit(true);
			} else {
				toast.error('Failed to save SMS template - Invalid response');
				onSubmit(false);
			}
		} catch (err) {
			console.error('Failed to create template', err);
			toast.error('Failed to save SMS template');
			onSubmit(false);
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
			<Modal show={visible} onHide={onCancel} size="lg" backdrop="static" keyboard={false} centered style={{ zIndex: 9999 }}>
				<Form onSubmit={handleSubmit}>
					<Modal.Header closeButton className="border-bottom">
						<Modal.Title className="fw-bold">
							<RiMailSendLine size={20} className="me-2" style={{ verticalAlign: 'middle' }} />
							{initialValues?.id ? 'Edit SMS Template' : 'Create New SMS Template'}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body className="p-4">
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
										disabled={loading}
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
										disabled={loading}
										className="form-select-sm"
									>
										<option value="">Select a category</option>
										<option value="patient">👥 Patient</option>
										<option value="clinician">👨‍⚕️ Clinician</option>
										<option value="organization">🏢 Organization</option>
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
										disabled={!canEditBody || loading}
										placeholder={canEditBody ? 'Enter your message here. Click placeholders on the right to add them.' : 'Select a category first'}
										className="form-control-sm"
										style={{ fontSize: '0.9rem', minHeight: '120px' }}
									/>
									<small className="text-muted">
										{!canEditBody ? 'Select a category to enable message editing' : `${form.body.length} / 160 characters`}
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
										disabled={loading || !canEditBody}
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
													<Badge
														key={ph}
														bg="primary"
														className="cursor-pointer user-select-none"
														style={{ cursor: 'pointer', fontSize: '0.8rem' }}
														onClick={() => handlePlaceholderClick(ph)}
														title={`Click to add ${ph} to your message`}
													>
														{ph}
													</Badge>
												))}
											</div>
										) : (
											<span className="text-muted small">No placeholders available for this category</span>
										)}
									</div>
								</Form.Group>

								<div className="mb-3">
									<Form.Label className="fw-semibold">Message Preview</Form.Label>
									<div className="border rounded p-3 bg-light" style={{ minHeight: '80px', fontSize: '0.9rem', lineHeight: '1.5', color: '#333' }}>
										{form.body ? preview : <span className="text-muted">Your message preview will appear here</span>}
									</div>
								</div>

								{usedPlaceholders.length > 0 && (
									<div className="mb-3">
										<Form.Label className="fw-semibold">Used Placeholders</Form.Label>
										<div>
											{usedPlaceholders.map((ph) => (
												<Badge
													bg="info"
													key={ph}
													className="me-1 mb-1 cursor-pointer user-select-none"
													style={{ cursor: 'pointer', fontSize: '0.8rem' }}
													onClick={() => handleRemovePlaceholder(ph)}
													title={`Click to remove ${ph}`}
												>
													{ph} ×
												</Badge>
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
