import React, { useState, ChangeEvent, FormEvent } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { customFetch } from "../../../../../components/Auth/customFetch";
import { RiCheckLine, RiCloseLine } from '@remixicon/react';
import { isResultSmsReady, type ResultSmsApproval } from "../../../../../lib/resultSmsReadiness";

interface OverrideSmsFormProps {
	billingid: string;
	patientid: string;
	labResults: ResultSmsApproval[];
	onSuccess?: () => void;
}

export default function OverrideSmsForm({ billingid, patientid, labResults, onSuccess }: OverrideSmsFormProps) {
	const [message, setMessage] = useState("");
	const [sending, setSending] = useState(false);
	const [success, setSuccess] = useState<boolean | null>(null);
	const [sendError, setSendError] = useState("");

	const handleSend = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (sending || !labResults.length || labResults.some(r => !isResultSmsReady(r))) return;
		setSending(true);
		setSuccess(null);
		setSendError("");
		try {
			const response = await customFetch(
				`sms/events/trigger/send/result-ready?patientid=${patientid}&&billingid=${billingid}&message=${encodeURIComponent(message || '')}`
			);
			if (response?.success === true) {
				setSuccess(true);
				setMessage("");
				if (onSuccess) onSuccess();
			} else {
				setSendError(response?.error || "Failed to queue SMS.");
				setSuccess(false);
			}
		} catch (error) {
			console.error("Unable to request result-ready SMS:", error);
			setSendError("SMS could not be confirmed. Check message history before retrying.");
			setSuccess(false);
		} finally {
			setSending(false);
		}
	};

	const blocked = !labResults.length || labResults.some(r => !isResultSmsReady(r));

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
							disabled={sending || blocked}
							style={{ fontSize: '1rem', minHeight: 100 }}
						/>
					</Form.Group>
					{blocked && (
						<Alert variant="warning" className="mb-2 p-2">
							<RiCloseLine size={18} className="me-1 text-warning" />
							At least one result has not been approved. You cannot send the SMS until all are approved.
						</Alert>
					)}
					<div className="d-flex align-items-center gap-2">
						<Button
							type="submit"
							variant="primary"
							disabled={sending || blocked}
							className="px-4"
						>
							{sending ? <><Spinner as="span" size="sm" animation="border" className="me-2" />Sending...</> : <>Send SMS</>}
						</Button>
						{success === true && (
							<span className="text-success d-flex align-items-center ms-2"><RiCheckLine size={18} className="me-1" />SMS queued successfully.</span>
						)}
						{success === false && (
							<span className="text-danger d-flex align-items-center ms-2"><RiCloseLine size={18} className="me-1" />{sendError}</span>
						)}
					</div>
				</Form>
	);
}
