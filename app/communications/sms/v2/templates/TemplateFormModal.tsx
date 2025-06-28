import React, { useEffect, useState } from 'react';
import { customFetch, customPost } from '../../../../../components/Auth/customFetch';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';

interface TemplateFormProps {
	visible: boolean;
	onCancel: () => void;
	onSubmit: (values: any) => Promise<void>;
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

	const handlePlaceholderSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const ph = e.target.value;
		setSelectedPlaceholder(ph);
		if (ph) {
			setForm((prev) => ({ ...prev, body: prev.body + (prev.body ? ' ' : '') + ph }));
			setUsedPlaceholders((prev) => prev.includes(ph) ? prev : [...prev, ph]);
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
		await customPost('prime/sms-templates','POST', payload);
		onSubmit(payload);
	} catch (err) {
		console.error('Failed to create template', err);
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
						{/* Left column: Form */}
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
							{form.category && (
								<Form.Group className="mb-3">
									<Form.Label>Insert Placeholder</Form.Label>
									<Form.Select
										value={selectedPlaceholder}
										onChange={handlePlaceholderSelect}
										disabled={loading || !canEditBody}
									>
										<option value="">Select placeholder</option>
										{currentPlaceholders.map((ph) => (
											<option key={ph} value={ph}>{ph}</option>
										))}
									</Form.Select>
								</Form.Group>
							)}
							<Form.Group className="mb-3">
								<Form.Label>Body</Form.Label>
								<Form.Control
									as="textarea"
									name="body"
									value={form.body}
									onChange={handleChange}
									rows={4}
									required
									disabled={!canEditBody || loading}
									placeholder={canEditBody ? 'Enter message body. Use placeholders as needed.' : 'Select a category first'}
								/>
							</Form.Group>
						</div>
						{/* Right column: Preview and Used Placeholders */}
						<div className="col-md-6">
							<div className="mb-3">
								<Form.Label>Example Preview</Form.Label>
								<div className="border rounded p-2 bg-light text-secondary" style={{ minHeight: 40 }}>{form.body ? preview : <span className="text-muted">Message preview will appear here</span>}</div>
							</div>
							<div className="mb-3">
								<Form.Label>Used Placeholders</Form.Label>
								<div>
									{usedPlaceholders.length > 0 ? (
										usedPlaceholders.map((ph) => (
											<Badge bg="info" key={ph} className="me-1 mb-1">{ph}</Badge>
										))
									) : (
										<span className="text-muted">No placeholders used yet</span>
									)}
								</div>
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
