import React, { useState, ChangeEvent, FormEvent } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { customFetch } from "../../../../../components/Auth/customFetch";
import { RiCheckLine, RiCloseLine } from '@remixicon/react';

interface OverrideSmsFormProps {
	billingid: string;
	patientid: string;
	labResults: Array<{ iscustom: number }>;
	onSuccess?: () => void;
}

export default function OverrideSmsForm({ billingid, patientid, labResults, onSuccess }: OverrideSmsFormProps) {
	const [message, setMessage] = useState("");
	const [sending, setSending] = useState(false);
	const [success, setSuccess] = useState<boolean | null>(null);

	const handleSend = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSending(true);
		setSuccess(null);
		const response = await customFetch(
			`sms/events/trigger/send/result-ready?patientid=${patientid}&&billingid=${billingid}&message=${encodeURIComponent(message || '')}`
		);
		if (response.success) {
			setSending(false);
			setSuccess(true);
			setMessage("");
			if (onSuccess) onSuccess();
		} else {
			setSending(false);
			setSuccess(false);
		}
	};

	const getApprovalStatus = (r: { iscustom: number }) =>
		r.iscustom === 1 ? "approved" : "not-approved";

	return (
		<Form onSubmit={handleSend}>
					<Form.Group className="mb-3" controlId="smsMessage">
						<Form.Label>SMS Message</Form.Label>
						<Form.Control
							as="textarea"
							rows={4}
							value={message}
							onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setMessage(e.target.value)}
							placeholder="Enter SMS message to send to the patient..."
							required
							disabled={labResults.some(r => getApprovalStatus(r) === "not-approved")}
							style={{ fontSize: '1rem', minHeight: 100 }}
						/>
					</Form.Group>
					{labResults.some(r => getApprovalStatus(r) === "not-approved") && (
						<Alert variant="warning" className="mb-2 p-2">
							<RiCloseLine size={18} className="me-1 text-warning" />
							At least one result has not been approved. You cannot send the SMS until all are approved.
						</Alert>
					)}
					<div className="d-flex align-items-center gap-2">
						<Button
							type="submit"
							variant="primary"
							disabled={sending || labResults.some(r => getApprovalStatus(r) === "not-approved")}
							className="px-4"
						>
							{sending ? <><Spinner size="sm" animation="border" className="me-2" />Sending...</> : <>Send SMS</>}
						</Button>
						{success === true && (
							<span className="text-success d-flex align-items-center ms-2"><RiCheckLine size={18} className="me-1" />SMS sent successfully!</span>
						)}
						{success === false && (
							<span className="text-danger d-flex align-items-center ms-2"><RiCloseLine size={18} className="me-1" />Failed to send SMS.</span>
						)}
					</div>
				</Form>
	);
}
