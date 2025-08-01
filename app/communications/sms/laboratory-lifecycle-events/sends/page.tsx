'use client'

import React, { FormEvent, ChangeEvent } from "react";
import { RiTestTubeLine, RiCalendarEventLine, RiTimerLine, RiCheckLine, RiCloseLine, RiEdit2Line } from '@remixicon/react';
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Container, Card, Form, Table } from "react-bootstrap";
import OverrideSmsForm from "./OverrideSmsForm";
import SentMessagesTable from "./SentMessagesTable";
import { customFetch } from "../../../../../components/Auth/customFetch";
import styles from '../../../../../styles/SmsTemplateList.module.css'
import PreviewPatientInformation from "../../../../../components/petientsComponent/PreviewPatientInformation";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";


export default function SendLabLifecycleSMS() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const appCtx = useApplication();
	const employeeid = appCtx?.user?.employeeid;
	const tenantid = appCtx?.user?.tenantid;
	const testid: string = searchParams?.get("testid") || "";
	const patientid: string = searchParams?.get("patientid") || "";
	const ascensionid: string = searchParams?.get("ascensionid") || "";
	const billingid: string = searchParams?.get("billingid") || "";

	// Data state for fetched lab results (array)
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

	const [labResults, setLabResults] = React.useState<LabResult[]>([]);
	const [loadingResult, setLoadingResult] = React.useState<boolean>(false);
	const [fetchError, setFetchError] = React.useState<string | null>(null);

	const [smsSentCount, setSmsSentCount] = React.useState<number | null>(null);


	React.useEffect(() => {
		if (!billingid || !patientid) return;
		setLoadingResult(true);
		setFetchError(null);

		(async () => {
			try {
				const [labRes, smsRes] = await Promise.all([
					customFetch(`prime/sms/transaction/result/ready/${billingid}&&employeeid=${employeeid}`),
					customFetch(`sms/events/get/result-ready/result-sent?billingid=${billingid}&patientid=${patientid}&&employeeid=${employeeid}`)
				]);
				if (labRes.success && Array.isArray(labRes.data) && labRes.data.length > 0) {
					setLabResults(labRes.data);
				} else {
					setLabResults([]);
					setFetchError("No lab result found for this billing ID.");
				}
				if (smsRes.success && typeof smsRes.count === 'number') {
					setSmsSentCount(smsRes.count);
				} else {
					setSmsSentCount(null);
				}
			} catch (err: any) {
				setFetchError(err.message || "Unknown error");
				setLabResults([]);
				setSmsSentCount(null);
			} finally {
				setLoadingResult(false);
			}
		})();
	}, [billingid, patientid, employeeid]);

	// Approval status helper for table rendering
	const getApprovalStatus = (result: LabResult) =>
		result.iscustom === 1 ? 'approved' : 'not-approved';

	return (
		<div>
			<Card>
				<Card.Header className="d-flex justify-content-between align-items-center">
						<Button variant="link" className="mt-3 p-0" onClick={() => router.back()}>
						{'←'} Back
					</Button>
				</Card.Header>
				<Card.Body>
					<div className="mb-3 d-flex justify-content-between align-items-center">
						<div className="col-10">
							<PreviewPatientInformation patientid={patientid} />
						</div>
						{smsSentCount !== null && (
							<div className="d-flex flex-column align-items-center mb-4">
								<div style={{
									width: '70px',
									height: '70px',
									borderRadius: '50%',
									background: '#0d6efd',
									color: '#fff',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: '2rem',
									fontWeight: 700,
									boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
								}}>
									{smsSentCount}
								</div>
								<div className="mt-2 fw-bold text-secondary" style={{ fontSize: '1.1rem' }}>Result ready SMS sent</div>
							</div>
						)}
					</div>

					{loadingResult ? (
						<div className="mb-3">Loading lab result details...</div>
					) : fetchError ? (
						<div className="mb-3 text-danger">{fetchError}</div>
					) : labResults.length > 0 ? (
						<>
							<table className={styles.table}>
								<thead className="table-light">
									<tr>
										<th><RiTestTubeLine size={18} className="me-1" />Lab Test</th>
										<th><RiCalendarEventLine size={18} className="me-1" />Ascension Date</th>
										<th><RiTimerLine size={18} className="me-1" />Collection Start</th>
										<th><RiTimerLine size={18} className="me-1" />Collection End</th>
										<th><RiTimerLine size={18} className="me-1" />Processing Start</th>
										<th><RiTimerLine size={18} className="me-1" />Processing End</th>
										<th><RiEdit2Line size={18} className="me-1" />Result Entry Start</th>
										<th><RiEdit2Line size={18} className="me-1" />Result Entry End</th>
										<th>Billing ID</th>
										<th>Status</th>
									</tr>
								</thead>
								<tbody>
									{labResults.map((result, idx) => {
										const approvalStatus = getApprovalStatus(result);
										return (
											<tr key={result.id}>
												<td>{result.name}</td>
												<td>{result.ascension_date ? new Date(result.ascension_date).toLocaleString() : ''}</td>
												<td>{result.collectionStartDate ? new Date(result.collectionStartDate).toLocaleString() : ''}</td>
												<td>{result.collectionEndDate ? new Date(result.collectionEndDate).toLocaleString() : ''}</td>
												<td>{result.processingStartDate ? new Date(result.processingStartDate).toLocaleString() : ''}</td>
												<td>{result.processingEndDate ? new Date(result.processingEndDate).toLocaleString() : ''}</td>
												<td>{result.resultEntryStart ? new Date(result.resultEntryStart).toLocaleString() : ''}</td>
												<td>{result.resultEntryEnd ? new Date(result.resultEntryEnd).toLocaleString() : ''}</td>
												<td>{result.billingid}</td>
												<td>{approvalStatus === 'approved' ? (
													<span className="text-success">Approved</span>
												) : (
													<span className="text-danger">Not Approved</span>
												)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table >
							<div className="mt-2 d-flex justify-content-between">
								<div className="col-8">
									<SentMessagesTable billingid={billingid} patientid={patientid} />
								</div>
								<div className="col-4 mt-5 mx-3">
									<OverrideSmsForm billingid={billingid} patientid={patientid} labResults={labResults} />
								</div>
							</div>
						</>
					) : null}
				</Card.Body>
			</Card>
		</div>
	);
}
