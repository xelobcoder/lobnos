"use client";
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Spinner } from 'react-bootstrap';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { billingSource } from '../../../../../lib/billingLib';
import shared from '../../PatientBilling.module.css';
import s from './BillingSourceSelection.module.css';
import { RiHealthBookLine, RiArrowRightLine, RiListCheck, RiUser3Line, RiBuildingLine, RiAddLine, RiSearchLine } from '@remixicon/react';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import { getFacilityBillingMode, generalBillingUrl } from '../../../../../lib/Multi/billingWorkflow';
import { parseQueueHandoff, withQueueHandoff } from '../../../../../lib/queueHandoff';

interface BillingOption {
	value: number;
	label: string;
}

export default function BillingTypeSelection() {
	const [selectedBillingSource, setSelectedBillingSource] = useState<BillingOption | null>(null);
	const [billingMode, setBillingMode] = useState<'loading' | 'simple' | 'advanced' | 'error'>('loading');
	const [showAddClinicianModal, setShowAddClinicianModal] = useState(false);
	const [showAddOrgModal, setShowAddOrgModal] = useState(false);
	const [showCheckClinicianModal, setShowCheckClinicianModal] = useState(false);
	const [showCheckOrgModal, setShowCheckOrgModal] = useState(false);
	const [clinicianSearch, setClinicianSearch] = useState('');
	const [orgSearch, setOrgSearch] = useState('');
	const [clinicianResults, setClinicianResults] = useState<any[]>([]);
	const [orgResults, setOrgResults] = useState<any[]>([]);
	const [searching, setSearching] = useState(false);
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
		setBillingMode('loading');
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

	const searchClinicians = async () => {
		if (!clinicianSearch.trim()) {
			toast.warning("Please enter a clinician name or ID");
			return;
		}
		try {
			setSearching(true);
			const response = await customFetch(`clinicians?search=${clinicianSearch}&branchid=${branchid}`);
			if (response?.result) {
				setClinicianResults(response.result);
			} else {
				setClinicianResults([]);
				toast.info("No clinicians found matching your search");
			}
		} catch (error) {
			toast.error("Error searching for clinicians");
			console.error(error);
		} finally {
			setSearching(false);
		}
	};

	const searchOrganizations = async () => {
		if (!orgSearch.trim()) {
			toast.warning("Please enter an organization name");
			return;
		}
		try {
			setSearching(true);
			const response = await customFetch(`organizations/details?count=10&page=1&organization=${orgSearch}`);
			if (response?.result) {
				setOrgResults(response.result);
			} else {
				setOrgResults([]);
				toast.info("No organizations found matching your search");
			}
		} catch (error) {
			toast.error("Error searching for organizations");
			console.error(error);
		} finally {
			setSearching(false);
		}
	};

	const handleCheckClinicianNewWindow = () => {
		setShowCheckClinicianModal(false);
		const windowUrl = `/billing/clinician-search`;
		window.open(windowUrl, '_blank');
	};

	const handleCheckOrgNewWindow = () => {
		setShowCheckOrgModal(false);
		const windowUrl = `/billing/organization-search`;
		window.open(windowUrl, '_blank');
	};

	const handleAddClinician = () => {
		window.open('/clinicians?action=new', '_blank');
		setShowAddClinicianModal(false);
	};

	const handleAddOrganization = () => {
		window.open('/organization?action=new', '_blank');
		setShowAddOrgModal(false);
	};


	return (
		<>
            <main className={shared.workspace}>
                <header className={shared.header}><div><span className={shared.eyebrow}>BILLING &amp; SALES</span><h1>Select Billing Source</h1><p>Choose how this patient's tests and services will be billed.</p></div><a href="/billing/patientid" className={shared.savedLink}><RiUser3Line size={18} aria-hidden="true" /> Change patient</a></header>
                <ol className={shared.steps} aria-label="Billing setup steps">
                    <li><span aria-label="Completed">&#10003;</span><div><strong>Patient selected</strong><small>Ready to set up billing</small></div></li>
                    <li aria-current="step"><span>2</span><div><strong>Choose billing source</strong><small>Select the appropriate payer</small></div></li>
                    <li><span>3</span><div><strong>Build the bill</strong><small>Add tests and services</small></div></li>
                </ol>
                {(billingMode === 'loading' || billingMode === 'simple') ? <div className={s.loading} role="status"><Spinner size="sm" className="me-2" />{billingMode === 'simple' ? 'Opening General billing...' : 'Checking billing configuration...'}</div> : <div className={shared.content}>
                    <section className={s.selectionPanel} aria-labelledby="source-title">
                        <div className={s.panelHeading}><span className={shared.icon}><RiHealthBookLine size={24} aria-hidden="true" /></span><div><h2 id="source-title">Who is this bill for?</h2><p>Select one billing source to continue.</p></div></div>
                        {billingMode === 'error' && <Alert variant="danger" className="m-4">Unable to determine the facility billing configuration. No billing source was selected automatically.<button className="btn btn-outline-danger btn-sm ms-2" onClick={() => setConfigurationAttempt(value => value + 1)}>Retry</button></Alert>}
                        {billingMode === 'advanced' && <fieldset className={s.sourceList}><legend className={s.srOnly}>Billing source</legend>{options.map(option => {
                            const descriptions: Record<number, string> = {1: 'Direct patient billing using general prices.', 2: 'Bill through an organization or corporate account.', 3: 'Use a private health insurance scheme.', 4: 'Use the National Health Insurance Scheme.', 6: 'Bill through a special health care provider.'};
                            const SourceIcon = option.value === 2 ? RiBuildingLine : option.value === 3 || option.value === 4 ? RiHealthBookLine : option.value === 6 ? RiUser3Line : RiListCheck;
                            return <label key={option.value} className={s.sourceCard} data-selected={selectedBillingSource?.value === option.value}>
                                <input type="radio" name="billing-source" value={option.value} checked={selectedBillingSource?.value === option.value} onChange={() => setSelectedBillingSource(option)} />
                                <span className={s.sourceIcon}><SourceIcon size={22} aria-hidden="true" /></span><span className={s.sourceText}><strong>{option.label}</strong><small>{descriptions[option.value]}</small></span>
                            </label>;
                        })}</fieldset>}
                        <div className={s.continueBar}><span>{selectedBillingSource ? selectedBillingSource.label : 'Choose a billing source above'}</span><button className={s.continueButton} onClick={handleGenerateBillingId} disabled={billingMode === 'error' || !selectedBillingSource}>Continue <RiArrowRightLine size={18} aria-hidden="true" /></button></div>
                    </section>
                    <aside className={s.toolsPanel} aria-labelledby="billing-tools-title"><h2 id="billing-tools-title">Billing tools</h2><p>Find or add a clinician or organization before continuing.</p>
                        <div className={s.toolGroup}><h3><RiUser3Line size={18} aria-hidden="true" /> Clinicians</h3><button onClick={() => window.open('/billing/clinician-search', '_blank')}><RiSearchLine size={17} aria-hidden="true" /> Find clinician <RiArrowRightLine size={16} aria-hidden="true" /></button><button onClick={() => setShowAddClinicianModal(true)}><RiAddLine size={17} aria-hidden="true" /> Add clinician <RiArrowRightLine size={16} aria-hidden="true" /></button></div>
                        <div className={s.toolGroup}><h3><RiBuildingLine size={18} aria-hidden="true" /> Organizations</h3><button onClick={() => window.open('/billing/organization-search', '_blank')}><RiSearchLine size={17} aria-hidden="true" /> Find organization <RiArrowRightLine size={16} aria-hidden="true" /></button><button onClick={() => setShowAddOrgModal(true)}><RiAddLine size={17} aria-hidden="true" /> Add organization <RiArrowRightLine size={16} aria-hidden="true" /></button></div>
                        <p className={s.toolHelp}>These tools open in a new tab so you can keep your billing setup here.</p>
                    </aside>
                </div>}
            </main>

			{/* Add Clinician Modal */}
			<Modal show={showAddClinicianModal} onHide={() => setShowAddClinicianModal(false)} size="sm" centered>
				<Modal.Header closeButton>
					<Modal.Title>Add New Clinician</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>You will be redirected to the clinicians page to add a new clinician.</p>
				</Modal.Body>
				<Modal.Footer>
					<button className="btn btn-secondary btn-sm" onClick={() => setShowAddClinicianModal(false)}>
						Cancel
					</button>
					<button className="btn btn-primary btn-sm" onClick={handleAddClinician}>
						Proceed
					</button>
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
					<button className="btn btn-secondary btn-sm" onClick={() => setShowAddOrgModal(false)}>
						Cancel
					</button>
					<button className="btn btn-primary btn-sm" onClick={handleAddOrganization}>
						Proceed
					</button>
				</Modal.Footer>
			</Modal>

			{/* Check Clinician Modal */}
			<Modal show={showCheckClinicianModal} onHide={() => setShowCheckClinicianModal(false)} size="lg" centered>
				<Modal.Header closeButton>
					<Modal.Title>Check Clinician Details</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>You will be redirected to the clinician search page in a new window.</p>
				</Modal.Body>
				<Modal.Footer>
					<button className="btn btn-secondary btn-sm" onClick={() => setShowCheckClinicianModal(false)}>
						Close
					</button>
					<button className="btn btn-primary btn-sm" onClick={handleCheckClinicianNewWindow}>
						Open in New Window
					</button>
				</Modal.Footer>
			</Modal>

			{/* Check Organization Modal */}
			<Modal show={showCheckOrgModal} onHide={() => setShowCheckOrgModal(false)} size="lg" centered>
				<Modal.Header closeButton>
					<Modal.Title>Check Organization Details</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>You will be redirected to the organization search page in a new window.</p>
				</Modal.Body>
				<Modal.Footer>
					<button className="btn btn-secondary btn-sm" onClick={() => setShowCheckOrgModal(false)}>
						Close
					</button>
					<button className="btn btn-primary btn-sm" onClick={handleCheckOrgNewWindow}>
						Open in New Window
					</button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
