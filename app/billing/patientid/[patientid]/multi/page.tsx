"use client";
import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, Spinner } from 'react-bootstrap';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { billingSource } from '../../../../../lib/billingLib';
import { RiHealthBookLine, RiArrowRightLine, RiListCheck, RiUser3Line, RiBuildingLine, RiAddLine, RiSearchLine, RiCheckLine } from '@remixicon/react';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import { getFacilityBillingMode, generalBillingUrl } from '../../../../../lib/Multi/billingWorkflow';
import { parseQueueHandoff, withQueueHandoff } from '../../../../../lib/queueHandoff';

interface BillingOption {
	value: number;
	label: string;
}

const COLOR_ACCENT = 'var(--pls-primary, var(--bs-success))';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

const SOURCE_DESCRIPTIONS: Record<number, string> = {
	1: 'Direct patient billing using general prices.',
	2: 'Bill through an organization or corporate account.',
	3: 'Use a private health insurance scheme.',
	4: 'Use the National Health Insurance Scheme.',
	6: 'Bill through a special health care provider.',
};

const SOURCE_TONE: Record<number, string> = {
	1: 'success',
	2: 'primary',
	3: 'warning',
	4: 'info',
	6: 'secondary',
};

const sourceIcon = (value: number) => {
	if (value === 2) return RiBuildingLine;
	if (value === 3 || value === 4) return RiHealthBookLine;
	if (value === 6) return RiUser3Line;
	return RiListCheck;
};

export default function BillingTypeSelection() {
	const [selectedBillingSource, setSelectedBillingSource] = useState<BillingOption | null>(null);
	const [billingMode, setBillingMode] = useState<'loading' | 'simple' | 'advanced' | 'error'>('loading');
	const [showAddClinicianModal, setShowAddClinicianModal] = useState(false);
	const [showAddOrgModal, setShowAddOrgModal] = useState(false);
	const [configurationAttempt, setConfigurationAttempt] = useState(0);
	const router = useRouter();
	const patientid = useParams()?.patientid;
	const branchid = useApplication().branchid;
	const employeeid = useApplication().user.employeeid;
	const searchParams = useSearchParams();
	const queueHandoff = parseQueueHandoff(searchParams);
	const getParam = (key: string) => searchParams?.get(key) ?? '';
	const ispricingcheckout = getParam('ispricingcheckout') === '1';
	const query = searchParams?.toString() || '';
	const application = useApplication();

	useEffect(() => {
		let active = true;
		getFacilityBillingMode()
			.then((mode) => {
				if (!active) return;
				setBillingMode(mode);
				if (mode === 'simple' && patientid) {
					router.replace(generalBillingUrl(String(patientid), query));
				}
			})
			.catch(() => {
				if (active) setBillingMode('error');
			});
		return () => { active = false; };
	}, [patientid, query, application?.tenantId, configurationAttempt, router]);


	const options = billingSource.map(source => ({
		value: source.value,
		label: source.label
	}));

	const handleGenerateBillingId = async () => {
		const currentdate = new Date();
		const year = currentdate.getFullYear();
		const day = currentdate.getDate().toString().padStart(2, '0');
		const month = (currentdate.getMonth() + 1).toString().padStart(2, '0');
		const date = `${year}-${month}-${day}`;
		if (!ispricingcheckout) {
			const response: { status: boolean } = await customFetch(`billing/sales/session/verify/session?branchid=${branchid}&&employeeid=${employeeid}&&sessiondate=${date}`);
			const { status } = response;
			if (status && status == true) {
				if (selectedBillingSource?.value && patientid) {
					const billingid = getParam('billingid');
					const isNewTransaction = getParam('isNewTransaction');
					const isRelatedBilling = getParam('isRelatedBilling');
					let url = `/billing/patientid/${patientid}/multi/${selectedBillingSource.value}`;
					const paramsArr: string[] = [];
					if (billingid) paramsArr.push(`billingid=${billingid}`);
					if (isNewTransaction) paramsArr.push(`isNewTransaction=${isNewTransaction}`);
					if (isRelatedBilling) paramsArr.push(`isRelatedBilling=${isRelatedBilling}`);
					const adjustmentReason = getParam('adjustmentReason');
					const adjustmentType = getParam('adjustmentType');
					if (adjustmentReason) paramsArr.push(`adjustmentReason=${adjustmentReason}`);
					if (adjustmentType) paramsArr.push(`adjustmentType=${adjustmentType}`);
					if (paramsArr.length > 0) {
						url += `?${paramsArr.join('&')}`;
					}
					url += url.includes('?') ? '&isOpenSideBarShow=false' : '?isOpenSideBarShow=false';
					router.push(withQueueHandoff(url, queueHandoff));
				}
			} else {
				toast.error("Sales Session Not Found.Kindly Create session to continue ");
			}
		} else {
			if (selectedBillingSource) {
				let url = `/billing/patientid/${patientid}/multi/${selectedBillingSource.value}?ispricingcheckout=1`;
				router.push(url);
			}
		}
	};

	const handleAddClinician = () => {
		window.open('/clinicians?action=new', '_blank');
		setShowAddClinicianModal(false);
	};

	const handleAddOrganization = () => {
		window.open('/organization?action=new', '_blank');
		setShowAddOrgModal(false);
	};

	const openWindow = (url: string) => window.open(url, '_blank');

	return (
		<>
			<div className="container-fluid px-3 px-lg-4 py-3 py-lg-4">
				{/* Page Header */}
				<div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
					<div className="d-flex align-items-center gap-3">
						<div
							className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
							style={{ width: 46, height: 46, background: `color-mix(in srgb, ${COLOR_ACCENT} 8%, transparent)`, color: COLOR_ACCENT }}
						>
							<RiHealthBookLine size={24} />
						</div>

						<div>
							<h4 className="mb-0 fw-bold">Select Billing Source</h4>
							<div className="small" style={{ color: COLOR_TEXT_MUTED }}>
								Choose how this patient&apos;s tests and services will be billed.
							</div>
						</div>
					</div>

					<Link href="/billing/patientid" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2">
						<RiUser3Line size={17} />
						Change patient
					</Link>
				</div>

				{/* Billing setup steps */}
				<div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '0.75rem' }}>
					<div className="card-body px-3 px-lg-4 py-3 d-flex flex-column flex-md-row align-items-md-center gap-3 gap-lg-4" role="list" aria-label="Billing setup steps">
						<div className="d-flex align-items-center gap-2" role="listitem">
							<span className="badge rounded-circle bg-success d-inline-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 24, height: 24 }}>
								<RiCheckLine size={14} />
							</span>
							<div>
								<div className="small fw-semibold">Patient selected</div>
								<div className="small" style={{ color: COLOR_TEXT_MUTED }}>Ready to set up billing</div>
							</div>
						</div>

						<div className="vr d-none d-md-block" />

						<div className="d-flex align-items-center gap-2" role="listitem" aria-current="step">
							<span className="badge rounded-circle bg-success d-inline-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 24, height: 24 }}>
								2
							</span>
							<div>
								<div className="small fw-semibold">Choose billing source</div>
								<div className="small" style={{ color: COLOR_TEXT_MUTED }}>Select the appropriate payer</div>
							</div>
						</div>

						<div className="vr d-none d-md-block" />

						<div className="d-flex align-items-center gap-2" role="listitem" style={{ color: COLOR_TEXT_MUTED }}>
							<span className="badge rounded-circle bg-body-secondary text-body-secondary d-inline-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 24, height: 24 }}>
								3
							</span>
							<div>
								<div className="small fw-semibold">Build the bill</div>
								<div className="small">Add tests and services</div>
							</div>
						</div>
					</div>
				</div>

				{(billingMode === 'loading' || billingMode === 'simple') ? (
					<div className="card border-0 shadow-sm" style={{ borderRadius: '0.75rem' }}>
						<div className="card-body py-5">
							<div className="d-flex flex-column align-items-center justify-content-center text-center">
								<div
									className="rounded-circle d-flex align-items-center justify-content-center mb-3"
									style={{ width: 56, height: 56, background: `color-mix(in srgb, ${COLOR_ACCENT} 8%, transparent)`, color: COLOR_ACCENT }}
								>
									<Spinner animation="border" size="sm" />
								</div>
								<h6 className="fw-semibold mb-1">
									{billingMode === 'simple' ? 'Opening General billing' : 'Checking billing configuration'}
								</h6>
								<p className="small mb-0" style={{ color: COLOR_TEXT_MUTED }}>
									{billingMode === 'simple'
										? 'Redirecting to the general billing workspace...'
										: 'Determining the right billing workspace for this facility...'}
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className="row g-4">
						<div className="col-12 col-xl-8">
							<div className="card border-0 shadow-sm h-100" style={{ borderRadius: '0.75rem' }}>
								<div className="card-body p-3 p-lg-4 d-flex flex-column">
									<div className="d-flex align-items-center gap-3 mb-3">
										<div
											className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
											style={{ width: 40, height: 40, background: `color-mix(in srgb, ${COLOR_ACCENT} 8%, transparent)`, color: COLOR_ACCENT }}
										>
											<RiHealthBookLine size={20} />
										</div>
										<div>
											<h6 className="fw-bold mb-1">Who is this bill for?</h6>
											<div className="small" style={{ color: COLOR_TEXT_MUTED }}>
												Select one billing source to continue.
											</div>
										</div>
									</div>

									{billingMode === 'error' && (
										<Alert variant="danger" className="border-0 d-flex flex-column flex-sm-row align-items-sm-center gap-2">
											<span className="me-sm-auto">
												Unable to determine the facility billing configuration. No billing source was selected automatically.
											</span>
											<Button
												variant="outline-danger"
												size="sm"
												onClick={() => {
													setBillingMode('loading');
													setConfigurationAttempt(value => value + 1);
												}}
											>
												Retry
											</Button>
										</Alert>
									)}

									{billingMode === 'advanced' && (
										<fieldset className="border-0 p-0 m-0">
											<legend className="visually-hidden">Billing source</legend>
											<div className="d-flex flex-column gap-2">
												{options.map(option => {
													const selected = selectedBillingSource?.value === option.value;
													const SourceIcon = sourceIcon(option.value);
													return (
														<label
															key={option.value}
															className={`d-flex align-items-start gap-3 p-3 rounded-3 border mb-0 ${selected ? 'border-success bg-success bg-opacity-10' : ''}`}
															style={{ cursor: 'pointer' }}
														>
															<input
																className="form-check-input mt-1 flex-shrink-0"
																type="radio"
																name="billing-source"
																value={option.value}
																checked={selected}
																onChange={() => setSelectedBillingSource(option)}
																style={{
																	backgroundColor: selected ? 'var(--bs-success)' : undefined,
																	borderColor: selected ? 'var(--bs-success)' : undefined,
																}}
															/>
															<span
																className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 bg-success bg-opacity-10 text-success"
																style={{ width: 40, height: 40 }}
															>
																<SourceIcon size={20} />
															</span>
															<span className="flex-grow-1" style={{ minWidth: 0 }}>
																<strong className="d-block">{option.label}</strong>
																<small className="d-block" style={{ color: COLOR_TEXT_MUTED }}>
																	{SOURCE_DESCRIPTIONS[option.value]}
																</small>
															</span>
														</label>
													);
												})}
											</div>
										</fieldset>
									)}
								</div>

								<div className="card-footer bg-body border-top d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 p-3 p-lg-4">
									<span className="small" style={{ color: COLOR_TEXT_MUTED }}>
										{selectedBillingSource ? selectedBillingSource.label : 'Choose a billing source above'}
									</span>
									<Button
										variant="success"
										className="d-inline-flex align-items-center justify-content-center gap-2"
										style={{ minHeight: 42 }}
										onClick={handleGenerateBillingId}
										disabled={billingMode === 'error' || !selectedBillingSource}
									>
										Continue
										<RiArrowRightLine size={18} />
									</Button>
								</div>
							</div>
						</div>

						<div className="col-12 col-xl-4">
							<div className="card border-0 shadow-sm" style={{ borderRadius: '0.75rem' }}>
								<div className="card-body p-3 p-lg-4">
									<div className="d-flex align-items-center gap-3 mb-2">
										<div
											className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
											style={{ width: 40, height: 40, background: `color-mix(in srgb, ${COLOR_ACCENT} 8%, transparent)`, color: COLOR_ACCENT }}
										>
											<RiSearchLine size={20} />
										</div>
										<div>
											<h6 className="fw-bold mb-1">Billing tools</h6>
											<div className="small" style={{ color: COLOR_TEXT_MUTED }}>
												Find or add a clinician or organization before continuing.
											</div>
										</div>
									</div>

									<div className="border-top pt-3 mt-3">
										<h6 className="small fw-semibold text-uppercase mb-2 d-flex align-items-center gap-2" style={{ color: COLOR_TEXT_MUTED }}>
											<RiUser3Line size={16} />
											Clinicians
										</h6>
										<div className="list-group list-group-flush">
											<button
												type="button"
												className="list-group-item list-group-item-action d-flex align-items-center gap-2 px-0"
												onClick={() => openWindow('/billing/clinician-search')}
											>
												<RiSearchLine size={17} />
												Find clinician
												<RiArrowRightLine size={16} className="ms-auto text-muted" />
											</button>
											<button
												type="button"
												className="list-group-item list-group-item-action d-flex align-items-center gap-2 px-0"
												onClick={() => setShowAddClinicianModal(true)}
											>
												<RiAddLine size={17} />
												Add clinician
												<RiArrowRightLine size={16} className="ms-auto text-muted" />
											</button>
										</div>
									</div>

									<div className="border-top pt-3 mt-3">
										<h6 className="small fw-semibold text-uppercase mb-2 d-flex align-items-center gap-2" style={{ color: COLOR_TEXT_MUTED }}>
											<RiBuildingLine size={16} />
											Organizations
										</h6>
										<div className="list-group list-group-flush">
											<button
												type="button"
												className="list-group-item list-group-item-action d-flex align-items-center gap-2 px-0"
												onClick={() => openWindow('/billing/organization-search')}
											>
												<RiSearchLine size={17} />
												Find organization
												<RiArrowRightLine size={16} className="ms-auto text-muted" />
											</button>
											<button
												type="button"
												className="list-group-item list-group-item-action d-flex align-items-center gap-2 px-0"
												onClick={() => setShowAddOrgModal(true)}
											>
												<RiAddLine size={17} />
												Add organization
												<RiArrowRightLine size={16} className="ms-auto text-muted" />
											</button>
										</div>
									</div>

									<p className="small border-top pt-3 mt-3 mb-0" style={{ color: COLOR_TEXT_MUTED }}>
										These tools open in a new tab so you can keep your billing setup here.
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Add Clinician Modal */}
			<Modal show={showAddClinicianModal} onHide={() => setShowAddClinicianModal(false)} size="sm" centered>
				<Modal.Header closeButton>
					<Modal.Title>Add New Clinician</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>You will be redirected to the clinicians page to add a new clinician.</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" size="sm" onClick={() => setShowAddClinicianModal(false)}>
						Cancel
					</Button>
					<Button variant="primary" size="sm" onClick={handleAddClinician}>
						Proceed
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Add Organization Modal */}
			<Modal show={showAddOrgModal} onHide={() => setShowAddOrgModal(false)} size="sm" centered>
				<Modal.Header closeButton>
					<Modal.Title>Add New Organization</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>You will be redirected to the organizations page to add a new organization.</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" size="sm" onClick={() => setShowAddOrgModal(false)}>
						Cancel
					</Button>
					<Button variant="primary" size="sm" onClick={handleAddOrganization}>
						Proceed
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
