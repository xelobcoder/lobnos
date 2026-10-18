"use client";
import React, { useEffect, useState } from 'react';
import { Alert, Container, Card, Modal, Spinner } from 'react-bootstrap';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { billingSource } from '../../../../../lib/billingLib';
import Select from 'react-select';
import { RiHealthBookLine, RiArrowRightLine, RiListCheck, RiUser3Line, RiBuildingLine, RiAddLine, RiSearchLine } from '@remixicon/react';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import { getFacilityBillingMode, generalBillingUrl } from '../../../../../lib/Multi/billingWorkflow';

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

	// Custom label rendering for react-select (icon + label)
	const formatOptionLabel = (option: BillingOption) => (
		<span className="d-flex align-items-center gap-2">
			{option.label.toLowerCase().includes('corporate') ? <RiBuildingLine size={18} className="text-info" /> :
				option.label.toLowerCase().includes('private') ? <RiUser3Line size={18} className="text-success" /> :
					<RiListCheck size={18} className="text-primary" />}
			<span>{option.label}</span>
		</span>
	);

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
					router.push(url);
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

	const customStyles = {
		control: (base: any) => ({
			...base,
			minHeight: 42,
			borderColor: 'var(--bs-border-color)',
			backgroundColor: 'var(--theme-card-bg)',
			color: 'var(--bs-body-color)',
			boxShadow: 'none',
			'&:hover': {
				borderColor: '#0d6efd'
			}
		}),
		option: (base: any, state: { isSelected: boolean; isFocused: boolean }) => ({
			...base,
			backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? 'var(--bs-secondary-bg)' : 'var(--theme-card-bg)',
			color: state.isSelected ? 'white' : 'var(--bs-body-color)',
			fontSize: 14,
			padding: '8px 12px'
		}),
		singleValue: (base: any) => ({
			...base,
			color: 'var(--bs-body-color)'
		}),
		menu: (base: any) => ({
			...base,
			backgroundColor: 'var(--theme-card-bg)',
			borderColor: 'var(--bs-border-color)'
		}),
		placeholder: (base: any) => ({
			...base,
			fontSize: 14,
			color: 'var(--bs-secondary-color)'
		})
	};

	return (
		<>
			{(billingMode === 'loading' || billingMode === 'simple') ? (
				<div className="text-center py-5" role="status">
					<Spinner size="sm" className="me-2" />
					{billingMode === 'simple' ? 'Opening General billing...' : 'Checking billing configuration...'}
				</div>
			) : (
			<Container className="py-5 d-flex flex-column align-items-center justify-content-center" style={{ maxWidth: 480 }}>
				<Card className="border border-light border-2 w-100" style={{ maxWidth: 420 }}>
					<Card.Body className="p-4">
						<div className="text-center mb-4">
							<RiHealthBookLine size={32} className="text-primary mb-2" />
							<h5 className="fw-bold mb-1">Select Billing Source</h5>
							<div className="text-secondary small">Choose the type of billing you want to initiate for this patient.</div>
						</div>
						{billingMode === 'error' && <Alert variant="danger">
							Unable to determine the facility billing configuration. No billing source was selected automatically.
							<button className="btn btn-outline-danger btn-sm ms-2" onClick={() => setConfigurationAttempt(value => value + 1)}>Retry</button>
						</Alert>}
						{billingMode === 'advanced' && <div className="mb-4">
							<Select
								options={options}
								value={selectedBillingSource}
								onChange={(option) => setSelectedBillingSource(option)}
								styles={customStyles}
								placeholder="Choose billing source..."
								isSearchable={false}
								className="mb-2"
								formatOptionLabel={formatOptionLabel}
							/>
						</div>}
						<button
							className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center shadow-sm"
							onClick={handleGenerateBillingId}
							disabled={billingMode === 'error' || !selectedBillingSource}
							style={{ fontSize: 15, padding: '0.75rem', borderRadius: 6, fontWeight: 600 }}
						>
							Continue
							<RiArrowRightLine size={18} className="ms-2" />
						</button>
					</Card.Body>
				</Card>

				{/* Quick Links Section */}
				<div className="mt-4 w-100" style={{ maxWidth: 420 }}>
					<div className="text-center mb-3">
						<h6 className="fw-bold text-muted small">Quick Links</h6>
					</div>
					<div className="d-grid gap-2">
						<div className="d-grid grid-cols-2 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
							<button
								className="btn btn-outline-info btn-sm d-flex align-items-center justify-content-center"
								onClick={() => setShowAddClinicianModal(true)}
								style={{ padding: '0.5rem', fontSize: '12px' }}
							>
								<RiAddLine size={16} className="me-1" />
								Add Clinician
							</button>
							<button
								className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-center"
								onClick={() => setShowAddOrgModal(true)}
								style={{ padding: '0.5rem', fontSize: '12px' }}
							>
								<RiAddLine size={16} className="me-1" />
								Add Organization
							</button>
							<button
								className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-center"
								onClick={() => window.open('/billing/clinician-search', '_blank')}
								style={{ padding: '0.5rem', fontSize: '12px' }}
							>
								<RiSearchLine size={16} className="me-1" />
								Check Clinician
							</button>
							<button
								className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
								onClick={() => window.open('/billing/organization-search', '_blank')}
								style={{ padding: '0.5rem', fontSize: '12px' }}
							>
								<RiSearchLine size={16} className="me-1" />
								Check Organization
							</button>
						</div>
					</div>
				</div>
			</Container>
			)}

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
