import React, { useEffect, useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import { customFetch } from "../../../../../components/Auth/customFetch";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";
import { RiMessage2Line, RiCheckDoubleLine, RiInboxArchiveLine } from '@remixicon/react';

interface SentMessagesTableProps {
	billingid: string;
	patientid: string;
}

export default function SentMessagesTable({ billingid, patientid }: SentMessagesTableProps) {
	const appCtx = useApplication();
	const employeeid = appCtx?.user?.employeeid;
	const [sentMessages, setSentMessages] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!billingid || !patientid) return;
		setLoading(true);
		setError(null);
		(async () => {
			try {
				const sentMsgRes = await customFetch(
					`sms/events/get/sent-result-ready-message?patientid=${patientid}&&billingid=${billingid}`
				);
				if (sentMsgRes.success && Array.isArray(sentMsgRes.message)) {
					setSentMessages(sentMsgRes.message.map((m: any) => m.personalizedbody));
				} else {
					setSentMessages([]);
				}
			} catch (err: any) {
				setError(err.message || "Unknown error");
				setSentMessages([]);
			} finally {
				setLoading(false);
			}
		})();
	}, [billingid, patientid]);

	if (!billingid || !patientid) return null;

	return (
		<Card className="border-0 mt-4">
			<Card.Header className="bg-white border-bottom-0 pt-4 px-4">
				<div className="d-flex align-items-center gap-2">
					<div className="bg-primary-subtle p-2 rounded-circle text-primary">
						<RiMessage2Line size={20} />
					</div>
					<h5 className="mb-0 fw-bold text-dark">Sent Messages History</h5>
				</div>
			</Card.Header>
			<Card.Body className="p-4">
				{loading ? (
					<div className="text-center py-5">
						<Spinner animation="border" variant="primary" size="sm" />
						<p className="mt-2 text-muted small">Loading message history...</p>
					</div>
				) : error ? (
					<div className="alert alert-danger border-0 bg-danger-subtle text-danger d-flex align-items-center" role="alert">
						<RiInboxArchiveLine size={20} className="me-2" />
						<div>{error}</div>
					</div>
				) : sentMessages.length > 0 ? (
					<div className="d-flex flex-column gap-3">
						{sentMessages.map((msg, idx) => (
							<div key={idx} className="d-flex gap-3">
								<div className="d-flex flex-column align-items-center">
									<div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-muted" style={{ width: 32, height: 32, fontSize: '0.8rem', fontWeight: 600 }}>
										{sentMessages.length - idx}
									</div>
									{idx !== sentMessages.length - 1 && (
										<div className="bg-light my-1" style={{ width: 2, flex: 1 }}></div>
									)}
								</div>
								<div className="flex-grow-1">
									<div className="bg-light rounded-3 p-3 position-relative">
										<div className="text-dark" style={{ whiteSpace: "pre-line", fontSize: "0.95rem", lineHeight: "1.5" }}>
											{msg}
										</div>
										<div className="d-flex justify-content-end mt-2">
											<span className="badge bg-success-subtle text-success border border-success-subtle d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
												<RiCheckDoubleLine size={12} /> Sent
											</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-5 text-muted">
						<div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
							<RiInboxArchiveLine size={24} className="text-secondary" />
						</div>
						<p className="mb-0">No messages have been sent yet.</p>
					</div>
				)}
			</Card.Body>
		</Card>
	);
}
