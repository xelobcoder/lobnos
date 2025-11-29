'use client'

import React, { FormEvent, ChangeEvent } from "react";
import { RiTestTubeLine, RiCalendarEventLine, RiTimerLine, RiCheckLine, RiCloseLine, RiEdit2Line } from '@remixicon/react';
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Container, Card, Form, Table, Modal } from "react-bootstrap";
import OverrideSmsForm from "./OverrideSmsForm";
import SentMessagesTable from "./SentMessagesTable";
import { customFetch, fetchPatientPersonalInfo } from "../../../../../components/Auth/customFetch";
import styles from '../../../../../styles/SmsTemplateList.module.css'
import PreviewPatientInformation from "../../../../../components/petientsComponent/PreviewPatientInformation";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";
import BillingPagePatientInformation from "../../../../../components/Billing/BillingContextComponents/PersonalInfoView";


export default function SendLabLifecycleSMS() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const appCtx = useApplication();
	const employeeid = appCtx?.user?.employeeid;
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
	const [patientInfo, setPatientInfo] = React.useState<any>(null);
	const [showOverrideModal, setShowOverrideModal] = React.useState<boolean>(false);
	const [sending, setSending] = React.useState<boolean>(false);
	const [sendSuccess, setSendSuccess] = React.useState<boolean | null>(null);


	React.useEffect(() => {
		if (!billingid || !patientid) return;
		setLoadingResult(true);
		setFetchError(null);

		(async () => {
			try {
				const [labRes, smsRes, patientInfoRes] = await Promise.all([
					customFetch(`prime/sms/transaction/result/ready/${billingid}&&employeeid=${employeeid}`),
					customFetch(`sms/events/get/result-ready/result-sent?billingid=${billingid}&patientid=${patientid}&&employeeid=${employeeid}`),
					fetchPatientPersonalInfo(patientid)
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
				if (patientInfoRes && patientInfoRes?.result) {
					setPatientInfo(patientInfoRes?.result);
				} else {
					setPatientInfo(null);
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

	const handleSendSMS = async () => {
		setSending(true);
		setSendSuccess(null);
		const response = await customFetch(
			`sms/events/trigger/send/result-ready?patientid=${patientid}&&billingid=${billingid}&message=`
		);
		if (response.success) {
			setSending(false);
			setSendSuccess(true);
			setTimeout(() => setSendSuccess(null), 3000);
		} else {
			setSending(false);
			setSendSuccess(false);
		}
	};

	return (
		<div className="container-fluid py-3">
			<Card className="border-0 ">
				<Card.Body>
					<div className="row mb-4">
						<div className=" d-flex justify-content-between">
							<BillingPagePatientInformation data={patientInfo} loadingststate={false} />
							<div>{smsSentCount}</div>
						</div>
						<hr />

					</div>

					{loadingResult ? (
						<div className="text-center py-5">
							<div className="spinner-border text-primary" role="status">
								<span className="visually-hidden">Loading...</span>
							</div>
							<p className="mt-3 text-muted">Loading lab result details...</p>
						</div>
					) : fetchError ? (
						<div className="alert alert-danger d-flex align-items-center" role="alert">
							<RiCloseLine size={24} className="me-2" />
							<div>{fetchError}</div>
						</div>
					) : labResults.length > 0 ? (
						<>
							<div className="row g-4 mb-4">
								<div className="col-12">
									<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
										<h5 className="mb-0 fw-semibold text-dark">Laboratory Test Details</h5>
										<div className="d-flex gap-2">
											<Button
												variant="success"
												size="sm"
												className="d-flex align-items-center gap-2"
												onClick={handleSendSMS}
												disabled={sending || labResults.some(r => getApprovalStatus(r) === "not-approved")}
											>
												{sending ? (
													<>
														<span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
														Sending...
													</>
												) : (
													<>
														<RiCheckLine size={16} />
														Send SMS
													</>
												)}
											</Button>
											<Button
												variant="outline-primary"
												size="sm"
												className="d-flex align-items-center gap-2"
												onClick={() => setShowOverrideModal(true)}
												disabled={labResults.some(r => getApprovalStatus(r) === "not-approved")}
											>
												<RiEdit2Line size={16} />
												Override Message
											</Button>
										</div>
									</div>
									{sendSuccess === true && (
										<div className="alert alert-success d-flex align-items-center mb-3" role="alert">
											<RiCheckLine size={20} className="me-2" />
											<div>SMS sent successfully!</div>
										</div>
									)}
									{sendSuccess === false && (
										<div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
											<RiCloseLine size={20} className="me-2" />
											<div>Failed to send SMS. Please try again.</div>
										</div>
									)}
								</div>
							</div>
							<div className="row g-4">
								<div className="col-12">
									{/* Desktop Table View */}
									<div className="mb-4 d-none d-md-block">
										<div className="table-responsive">
											<table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
												<thead className="bg-light">
													<tr>
														<th className="py-3 text-dark" style={{ fontWeight: 600 }}>
															<RiTestTubeLine size={18} className="me-2" />Lab Test
														</th>
														<th className="py-3 text-dark" style={{ fontWeight: 600 }}>
															<RiCalendarEventLine size={18} className="me-2" />Ascension Date
														</th>
														<th className="py-3 text-dark" style={{ fontWeight: 600 }}>
															<RiTimerLine size={18} className="me-2" />Collection Phase
														</th>
														<th className="py-3 text-dark" style={{ fontWeight: 600 }}>
															<RiTimerLine size={18} className="me-2" />Processing Phase
														</th>
														<th className="py-3 text-dark" style={{ fontWeight: 600 }}>
															<RiEdit2Line size={18} className="me-2" />Result Entry Phase
														</th>
														<th className="py-3 text-dark" style={{ fontWeight: 600 }}>Status</th>
													</tr>
												</thead>
												<tbody>
													{labResults.map((result) => {
														const approvalStatus = getApprovalStatus(result);
														return (
															<tr key={result.id}>
																<td className="fw-semibold">{result.name}({result.billingid})</td>
																<td className="text-muted">{result.ascension_date ? new Date(result.ascension_date).toLocaleString() : '-'}</td>
																<td>
																	<div className="d-flex flex-column gap-1 bg-success-subtle p-2 br-5" style={{ fontSize: '0.85rem' }}>
																		<div className="text-muted">
																			<strong>Start:</strong> {result.collectionStartDate ? new Date(result.collectionStartDate).toLocaleString() : '-'}
																		</div>
																		<div className="text-muted">
																			<strong>End:</strong> {result.collectionEndDate ? new Date(result.collectionEndDate).toLocaleString() : '-'}
																		</div>
																	</div>
																</td>
																<td>
																	<div className="d-flex bg-success-subtle p-2 br-5 flex-column gap-1" style={{ fontSize: '0.85rem' }}>
																		<div className="text-muted">
																			<strong>Start:</strong> {result.processingStartDate ? new Date(result.processingStartDate).toLocaleString() : '-'}
																		</div>
																		<div className="text-muted">
																			<strong>End:</strong> {result.processingEndDate ? new Date(result.processingEndDate).toLocaleString() : '-'}
																		</div>
																	</div>
																</td>
																<td>
																	<div className="d-flex flex-column p-2 br-5 bg-success-subtle gap-1" style={{ fontSize: '0.85rem' }}>
																		<div className="text-muted">
																			<strong>Start:</strong> {result.resultEntryStart ? new Date(result.resultEntryStart).toLocaleString() : '-'}
																		</div>
																		<div className="text-muted">
																			<strong>End:</strong> {result.resultEntryEnd ? new Date(result.resultEntryEnd).toLocaleString() : '-'}
																		</div>
																	</div>
																</td>

																<td>
																	{approvalStatus === 'approved' ? (
																		<span className="badge bg-success-subtle text-success border border-success d-inline-flex align-items-center gap-1">
																			<RiCheckLine size={14} />
																			Approved
																		</span>
																	) : (
																		<span className="badge bg-danger-subtle text-danger border border-danger d-inline-flex align-items-center gap-1">
																			<RiCloseLine size={14} />
																			Not Approved
																		</span>
																	)}
																</td>
															</tr>
														);
													})}
												</tbody>
											</table>
										</div>
									</div>

									{/* Mobile List Group View */}
									<div className="d-md-none">
										<div className="d-flex flex-column gap-3">
											{labResults.map((result) => {
												const approvalStatus = getApprovalStatus(result);
												return (
													<Card key={result.id} className="border-0">
														<Card.Body className="p-3">
															<div className="d-flex justify-content-between align-items-start mb-3">
																<div>
																	<h6 className="fw-bold mb-1 text-dark">
																		<RiTestTubeLine size={18} className="me-2 text-primary" />
																		{result.name}
																	</h6>
																	<small className="text-muted">ID: {result.billingid}</small>
																</div>
																{approvalStatus === 'approved' ? (
																	<span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 d-flex align-items-center gap-1">
																		<RiCheckLine size={12} /> Approved
																	</span>
																) : (
																	<span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1 d-flex align-items-center gap-1">
																		<RiCloseLine size={12} /> Not Approved
																	</span>
																)}
															</div>

															<div className="mb-3">
																<div className="d-flex align-items-center text-muted mb-1" style={{ fontSize: '0.85rem' }}>
																	<RiCalendarEventLine size={14} className="me-2" />
																	<span>Ascension Date</span>
																</div>
																<div className="fw-medium ps-4" style={{ fontSize: '0.9rem' }}>
																	{result.ascension_date ? new Date(result.ascension_date).toLocaleString() : '-'}
																</div>
															</div>

															<div className="bg-light rounded p-3">
																<h6 className="text-uppercase text-muted mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Timeline</h6>

																{/* Timeline Item: Collection */}
																<div className="d-flex gap-3 mb-3 position-relative">
																	<div className="d-flex flex-column align-items-center">
																		<div className="bg-white border border-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, zIndex: 1 }}>
																			<RiTimerLine size={12} className="text-primary" />
																		</div>
																		<div className="bg-primary-subtle" style={{ width: 2, flex: 1, minHeight: 20 }}></div>
																	</div>
																	<div className="flex-grow-1 pb-2">
																		<div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Collection</div>
																		<div className="d-flex flex-column gap-1 mt-1" style={{ fontSize: '0.8rem' }}>
																			<div className="d-flex justify-content-between text-muted">
																				<span>Start:</span>
																				<span>{result.collectionStartDate ? new Date(result.collectionStartDate).toLocaleString() : '-'}</span>
																			</div>
																			<div className="d-flex justify-content-between text-muted">
																				<span>End:</span>
																				<span>{result.collectionEndDate ? new Date(result.collectionEndDate).toLocaleString() : '-'}</span>
																			</div>
																		</div>
																	</div>
																</div>

																{/* Timeline Item: Processing */}
																<div className="d-flex gap-3 mb-3 position-relative">
																	<div className="d-flex flex-column align-items-center">
																		<div className="bg-white border border-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, zIndex: 1 }}>
																			<RiTimerLine size={12} className="text-info" />
																		</div>
																		<div className="bg-info-subtle" style={{ width: 2, flex: 1, minHeight: 20 }}></div>
																	</div>
																	<div className="flex-grow-1 pb-2">
																		<div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Processing</div>
																		<div className="d-flex flex-column gap-1 mt-1" style={{ fontSize: '0.8rem' }}>
																			<div className="d-flex justify-content-between text-muted">
																				<span>Start:</span>
																				<span>{result.processingStartDate ? new Date(result.processingStartDate).toLocaleString() : '-'}</span>
																			</div>
																			<div className="d-flex justify-content-between text-muted">
																				<span>End:</span>
																				<span>{result.processingEndDate ? new Date(result.processingEndDate).toLocaleString() : '-'}</span>
																			</div>
																		</div>
																	</div>
																</div>

																{/* Timeline Item: Result Entry */}
																<div className="d-flex gap-3 position-relative">
																	<div className="d-flex flex-column align-items-center">
																		<div className="bg-white border border-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, zIndex: 1 }}>
																			<RiEdit2Line size={12} className="text-success" />
																		</div>
																	</div>
																	<div className="flex-grow-1">
																		<div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Result Entry</div>
																		<div className="d-flex flex-column gap-1 mt-1" style={{ fontSize: '0.8rem' }}>
																			<div className="d-flex justify-content-between text-muted">
																				<span>Start:</span>
																				<span>{result.resultEntryStart ? new Date(result.resultEntryStart).toLocaleString() : '-'}</span>
																			</div>
																			<div className="d-flex justify-content-between text-muted">
																				<span>End:</span>
																				<span>{result.resultEntryEnd ? new Date(result.resultEntryEnd).toLocaleString() : '-'}</span>
																			</div>
																		</div>
																	</div>
																</div>

															</div>
														</Card.Body>
													</Card>
												);
											})}
										</div>
									</div>
								</div>
								<div className="col-12">
									<SentMessagesTable billingid={billingid} patientid={patientid} />
								</div>
							</div>
							<Modal show={showOverrideModal} onHide={() => setShowOverrideModal(false)}>
								<Modal.Header closeButton>
									<Modal.Title className="d-flex align-items-center gap-2">
										<RiEdit2Line size={22} className="text-primary" />
										Override Custom Message
									</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									<OverrideSmsForm
										billingid={billingid}
										patientid={patientid}
										labResults={labResults}
										onSuccess={() => setShowOverrideModal(false)}
									/>
								</Modal.Body>
							</Modal>
						</>
					) : null}
				</Card.Body>
			</Card>
		</div>
	);
}
