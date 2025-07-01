import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import { toast } from 'react-toastify';
import { customPost ,customFetch} from '../../../../components/Auth/customFetch';
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
		const response = await customPost('prime/sms-templates','POST', payload);
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
		<Modal show={visible} onHide={onCancel} size="lg" backdrop="static" keyboard={false}>
			<Form onSubmit={handleSubmit}>
				<Modal.Header closeButton>
					<Modal.Title>{initialValues?.id ? 'Edit SMS Template' : 'Create SMS Template'}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="row">
						<div className="col-md-6 border-end">
							<Form.Group className="mb-3">
								<Form.Label>Name</Form.Label>
								<Form.Control
									name="name"
									value={form.name}
									onChange={handleChange}
									required
									disabled={loading}
								/>
							</Form.Group>
							<Form.Group className="mb-3">
								<Form.Label>Category</Form.Label>
								<Form.Select
									name="category"
									value={form.category}
									onChange={handleCategoryChange}
									required
									disabled={loading}
								>
									<option value="">Select category</option>
									<option value="patient">Patient</option>
									<option value="clinician">Clinician</option>
									<option value="organization">Organization</option>
								</Form.Select>
							</Form.Group>
							
							<Form.Group className="mb-3">
								<Form.Label>Body</Form.Label>
								<Form.Control
									as="textarea"
									name="body"
									value={form.body}
									onChange={handleChange}
									rows={6}
									required
									disabled={!canEditBody || loading}
									placeholder={canEditBody ? 'Enter message body. Use placeholders as needed.' : 'Select a category first'}
								/>
							</Form.Group>
						</div>
						<div className="col-md-6">
							<Form.Group className="mb-3">
								<Form.Label>Insert Placeholder (Dropdown)</Form.Label>
								<Form.Select
									value={selectedPlaceholder}
									onChange={handlePlaceholderSelect}
									disabled={loading || !canEditBody}
								>
									<option value="">{!form.category ? 'Select a category first' : 'Select placeholder to insert'}</option>
									{currentPlaceholders.map((ph) => (
										<option key={ph} value={ph}>{ph}</option>
									))}
								</Form.Select>
							</Form.Group>
							
							<Form.Group className="mb-3">
								<Form.Label>Available Placeholders (Click to Add)</Form.Label>
								<div className="border rounded p-2 bg-light" style={{ maxHeight: '120px', overflowY: 'auto' }}>
									{!form.category ? (
										<span className="text-muted">Select a category to see available placeholders</span>
									) : currentPlaceholders.length > 0 ? (
										<div className="d-flex flex-wrap gap-1">
											{currentPlaceholders.map((ph) => (
												<Badge 
													key={ph} 
													bg="primary" 
													className="cursor-pointer user-select-none"
													style={{ cursor: 'pointer' }}
													onClick={() => handlePlaceholderClick(ph)}
													title={`Click to add ${ph} to your message`}
												>
													{ph}
												</Badge>
											))}
										</div>
									) : (
										<span className="text-muted">No placeholders available for this category</span>
									)}
								</div>
								<small className="text-muted">
									{form.category ? 'Click any placeholder above to add it to your message body' : 'Select a category first to see clickable placeholders'}
								</small>
							</Form.Group>
							
							<div className="mb-3">
								<Form.Label>Example Preview</Form.Label>
								<div className="border rounded p-2 bg-light text-secondary" style={{ minHeight: 40 }}>{form.body ? preview : <span className="text-muted">Message preview will appear here</span>}</div>
							</div>
							<div className="mb-3">
								<Form.Label>Used Placeholders (Click to Remove)</Form.Label>
								<div>
									{usedPlaceholders.length > 0 ? (
										usedPlaceholders.map((ph) => (
											<Badge 
												bg="info" 
												key={ph} 
												className="me-1 mb-1 cursor-pointer user-select-none"
												style={{ cursor: 'pointer' }}
												onClick={() => handleRemovePlaceholder(ph)}
												title={`Click to remove ${ph} from your message`}
											>
												{ph} ×
											</Badge>
										))
									) : (
										<span className="text-muted">No placeholders used yet</span>
									)}
								</div>
								<small className="text-muted">
									{usedPlaceholders.length > 0 ? 'Click any placeholder above to remove it from your message' : ''}
								</small>
							</div>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
				   <Button variant="secondary" onClick={onCancel} disabled={loading || saving}>Cancel</Button>
				   <Button variant="primary" type="submit" disabled={loading || !canEditBody || saving}>
					   {saving ? 'Saving...' : (loading ? 'Saving...' : 'Save')}
				   </Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};

export default TemplateFormModal;
