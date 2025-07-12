import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import { customPost } from '../../../../components/Auth/customFetch';
import { useApplication } from '../../../../components/Auth/useApplicationContext';


interface CreateSmsJobModalProps {
	visible: boolean;
	onCancel: () => void;
	onSuccess: (jobId: number) => void;
	templateOptions: { id: string; name: string }[];
	loading: boolean;
}

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

const CreateSmsJobModal: React.FC<CreateSmsJobModalProps> = ({ visible, onCancel, onSuccess, templateOptions, loading }) => {
	const [form, setForm] = useState({
		templateId: '',
		category: '',
		recipientScope: 'all',
		targetIds: '', // comma separated for UI
		sendType: 'immediate',
		scheduledAt: '',
	});
	const [saving, setSaving] = useState(false);
	const employeeid = useApplication().user?.employeeid;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.templateId || !form.category || !form.recipientScope || !form.sendType) {
			toast.error('Please fill in all required fields');
			return;
		}
		if ((form.recipientScope === 'single' || form.recipientScope === 'multiple') && !form.targetIds) {
			toast.error('Please provide target IDs');
			return;
		}
		if (form.sendType === 'scheduled' && !form.scheduledAt) {
			toast.error('Please provide a scheduled date/time');
			return;
		}
		if (!employeeid) {
			toast.error('User ID not found');
			return;
		}
		setSaving(true);
		const payload: any = {
			templateId: form.templateId,
			category: form.category,
			recipientScope: form.recipientScope,
			sendType: form.sendType,
			createdBy: employeeid,
		};
		if (form.recipientScope === 'single' || form.recipientScope === 'multiple') {
			payload.targetIds = form.targetIds.split(',').map((id) => id.trim()).filter(Boolean);
		}
		if (form.sendType === 'scheduled') {
			payload.scheduledAt = form.scheduledAt;
		}
		try {
			const res = await customPost('prime/sms-jobs', 'POST', payload);
			if (res && res.jobId) {
				toast.success('SMS job created!');
				onSuccess(res.jobId);
			} else {
				throw new Error('No jobId returned');
			}
		} catch (err: any) {
			toast.error(err.message || 'Failed to create SMS job');
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal show={visible} onHide={onCancel} size="lg" centered>
			<Form onSubmit={handleSubmit}>
				<Modal.Header closeButton>
					<Modal.Title>Create SMS Job</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Group className="mb-3">
						<Form.Label>Template</Form.Label>
						<Form.Select name="templateId" value={form.templateId} onChange={handleChange} required disabled={loading || saving}>
							<option value="">Select template</option>
							{templateOptions.map((t) => (
								<option key={t.id} value={t.id}>{t.name}</option>
							))}
						</Form.Select>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Category</Form.Label>
						<Form.Select name="category" value={form.category} onChange={handleChange} required disabled={loading || saving}>
							<option value="">Select category</option>
							{categoryOptions.map((c) => (
								<option key={c.value} value={c.value}>{c.label}</option>
							))}
						</Form.Select>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Recipient Scope</Form.Label>
						<Form.Select name="recipientScope" value={form.recipientScope} onChange={handleChange} required disabled={loading || saving}>
							{recipientScopeOptions.map((r) => (
								<option key={r.value} value={r.value}>{r.label}</option>
							))}
						</Form.Select>
					</Form.Group>
					{(form.recipientScope === 'single' || form.recipientScope === 'multiple') && (
						<Form.Group className="mb-3">
							<Form.Label>Target IDs (comma separated)</Form.Label>
							<Form.Control name="targetIds" value={form.targetIds} onChange={handleChange} required disabled={loading || saving} />
						</Form.Group>
					)}
					<Form.Group className="mb-3">
						<Form.Label>Send Type</Form.Label>
						<Form.Select name="sendType" value={form.sendType} onChange={handleChange} required disabled={loading || saving}>
							{sendTypeOptions.map((s) => (
								<option key={s.value} value={s.value}>{s.label}</option>
							))}
						</Form.Select>
					</Form.Group>
					{form.sendType === 'scheduled' && (
						<Form.Group className="mb-3">
							<Form.Label>Scheduled At</Form.Label>
							<Form.Control type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={handleChange} required disabled={loading || saving} />
						</Form.Group>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={onCancel} disabled={loading || saving}>Cancel</Button>
					<Button variant="primary" type="submit" disabled={loading || saving}>
						{saving ? 'Saving...' : 'Create SMS Job'}
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};

export default CreateSmsJobModal;
