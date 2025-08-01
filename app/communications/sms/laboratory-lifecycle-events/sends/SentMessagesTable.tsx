import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { customFetch } from "../../../../../components/Auth/customFetch";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";
import styles from '../../../../../styles/SmsTemplateList.module.css';

interface SentMessagesTableProps {
	billingid: string;
	patientid: string;
}

export default function SentMessagesTable({ billingid, patientid }: SentMessagesTableProps) {
	const appCtx = useApplication();
	const employeeid = appCtx?.user?.employeeid;
	// tenantid is not used in the endpoint per your latest code
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
		<div className="mt-4">
			<div className="fw-bold mb-2 text-center">Sent Messages</div>
			{loading ? (
				<div>Loading sent messages...</div>
			) : error ? (
				<div className="text-danger">{error}</div>
			) : sentMessages.length > 0 ? (
				<div >
					<table className={styles.table}>
						<thead className="table-light">
							<tr>
								<th style={{ width: "60px" }}>#</th>
								<th>Message</th>
							</tr>
						</thead>
						<tbody>
							{sentMessages.map((msg, idx) => (
								<tr key={idx}>
									<td className="align-top text-center" style={{ fontWeight: 600 }}>{idx + 1}</td>
									<td style={{ whiteSpace: "pre-line", fontSize: "0.97rem" }}>{msg}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<div className="text-muted text-center">No sent messages found.</div>
			)}
		</div>
	);
}
