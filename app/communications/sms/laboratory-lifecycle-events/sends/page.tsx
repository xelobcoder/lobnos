'use client'

import React, { FormEvent, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Container, Card, Form, Table } from "react-bootstrap";
import { customFetch } from "../../../../../components/Auth/customFetch";



export default function SendLabLifecycleSMS() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const testid: string = searchParams?.get("testid") || "";
	const patientid: string = searchParams?.get("patientid") || "";
	const ascensionid: string = searchParams?.get("ascensionid") || "";
	const billingid: string = searchParams?.get("billingid") || "";

	// Data state for fetched lab result
	type LabResult = {
		id: number;
		testid: number;
		serviceid: number;
		billingid: number;
		month: number;
		year: number;
		ascension_date: string;
		collectionStartDate: string;
		collectionEndDate: string;
		processingStartDate: string;
		processingEndDate: string;
		resultEntryStart: string;
		resultEntryEnd: string;
		sampleCollectedBy: number;
		sampleProcessedBy: number;
		resultEnteredBy: number;
		prim_key: number;
		name: string;
		category: number;
		price: number;
		created_on: string;
		sample: number;
		description: string | null;
		sample_container: number;
		unit: string;
		qty_required: string;
		shorttext: string;
		iscustom: number;
	};

	const [labResult, setLabResult] = React.useState<LabResult | null>(null);
	const [loadingResult, setLoadingResult] = React.useState<boolean>(false);
	const [fetchError, setFetchError] = React.useState<string | null>(null);

React.useEffect(() => {
	if (!billingid) return;
	setLoadingResult(true);
	setFetchError(null);
	(async () => {
		try {
			const json = await customFetch(`prime/sms/transaction/result/ready/${billingid}`);
			if (json.success && Array.isArray(json.data) && json.data.length > 0) {
				setLabResult(json.data[0]);
			} else {
				setLabResult(null);
				setFetchError("No lab result found for this billing ID.");
			}
		} catch (err: any) {
			setFetchError(err.message || "Unknown error");
			setLabResult(null);
		} finally {
			setLoadingResult(false);
		}
	})();
}, [billingid]);

	// Placeholder for sending SMS logic
	const [message, setMessage] = React.useState<string>("");
	const [sending, setSending] = React.useState<boolean>(false);
	const [success, setSuccess] = React.useState<boolean | null>(null);

	const handleSend = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSending(true);
		setSuccess(null);
		// Simulate sending SMS (replace with real API call)
		setTimeout(() => {
			setSending(false);
			setSuccess(true);
		}, 1200);
	};

	// Determine approval status (for demo, use iscustom: 1 = approved, 0 = not approved)
	let approvalStatus: 'approved' | 'not-approved' | null = null;
	if (labResult) {
		approvalStatus = labResult.iscustom === 1 ? 'approved' : 'not-approved';
	}

	return (
		<Container >
			<Card className="mx-auto" style={{ maxWidth: 600 }}>
				<Card.Body>
					<Card.Title>Send Completed Lab Result SMS</Card.Title>
					<Card.Text>
						<strong>Test ID:</strong> {testid} <br />
						<strong>Patient ID:</strong> {patientid} <br />
						<strong>Ascension ID:</strong> {ascensionid} <br />
						<strong>Billing ID:</strong> {billingid}
					</Card.Text>
					{loadingResult ? (
						<div className="mb-3">Loading lab result details...</div>
					) : fetchError ? (
						<div className="mb-3 text-danger">{fetchError}</div>
					) : labResult ? (
						<Table bordered hover size="sm" className="mb-3 text-center align-middle">
							<thead className="table-light">
								<tr>
									<th>Lab Test</th>
									<th>Short Text</th>
									<th>Price</th>
									<th>Unit</th>
									<th>Qty Required</th>
									<th>Sample</th>
									<th>Result Entry End</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>{labResult.name}</td>
									<td>{labResult.shorttext}</td>
									<td>{labResult.price}</td>
									<td>{labResult.unit}</td>
									<td>{labResult.qty_required}</td>
									<td>{labResult.sample}</td>
									<td>{labResult.resultEntryEnd}</td>
									<td>{approvalStatus === 'approved' ? (
										<span className="text-success">Approved</span>
									) : (
										<span className="text-danger">Not Approved</span>
									)}</td>
								</tr>
							</tbody>
						</Table>
					) : null}
					<Form onSubmit={handleSend}>
						<Form.Group className="mb-3" controlId="smsMessage">
							<Form.Label>SMS Message</Form.Label>
							<Form.Control
								as="textarea"
								rows={3}
								value={message}
								onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setMessage(e.target.value)}
								placeholder="Enter SMS message to send to the patient..."
								required
								disabled={approvalStatus === 'not-approved'}
							/>
						</Form.Group>
						{approvalStatus === 'not-approved' && (
							<div className="mb-2 text-warning">
								This result has not been approved. You cannot send the SMS until approval.
							</div>
						)}
						<Button type="submit" variant="primary" disabled={sending || approvalStatus === 'not-approved'}>
							{sending ? "Sending..." : "Send SMS"}
						</Button>
						{success && <div className="mt-3 text-success">SMS sent successfully!</div>}
					</Form>
					<Button variant="link" className="mt-3 p-0" onClick={() => router.back()}>
						&larr; Back
					</Button>
				</Card.Body>
			</Card>
		</Container>
	);
}
