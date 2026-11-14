
"use client";
import AsyncPatientFiltering from '../../../components/accessories/SectorFileringComponents/AsyncCustomerFiltering';
import { plsEncryption } from '../../../lib/encryption';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { Alert, Spinner } from 'react-bootstrap';
import { RiBillFill, RiUserAddLine, RiTimeLine, RiFileList3Line, RiSearchLine, RiArrowRightLine } from '@remixicon/react';
import { getFacilityBillingMode, generalBillingUrl } from '../../../lib/Multi/billingWorkflow';
import { parseQueueHandoff, withQueueHandoff } from '../../../lib/queueHandoff';

const billingSourceLabels = {
	'1': 'General / Cash',
	'2': 'Organization',
	'3': 'Private Insurance',
	'4': 'NHIS',
	'6': 'Clinician',
};

const COLOR_ACCENT = 'var(--pls-primary, var(--bs-success))';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

export default function BillingFiltering() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const queueHandoff = parseQueueHandoff(searchParams);
	const resumeDraftId = searchParams?.get('resumeDraftId');
	const resumeBillingSource = searchParams?.get('resumeBillingSource') || '';
	const [opening, setOpening] = useState(false);
	const [error, setError] = useState('');
	const navigationLock = useRef(false);

	const filteredPatient = async (options) => {
		if (!options || typeof options !== "object" || !options.hasOwnProperty("patientid")) return;
		if (navigationLock.current) return;
		const { patientid } = options;
		const encryptedPatientId = plsEncryption(patientid.toString());
		if (patientid && encryptedPatientId) {
			navigationLock.current = true;
			setOpening(true);
			setError('');
			const params = new URLSearchParams();
			if (resumeDraftId) params.set('suspendedDraftId', resumeDraftId);
			const suffix = params.size ? `?${params.toString()}` : '';
			if (resumeDraftId && resumeBillingSource) {
				router.push(withQueueHandoff(`/billing/patientid/${encryptedPatientId}/multi/${resumeBillingSource}${suffix}`, queueHandoff));
				return;
			}

			try {
				const mode = await getFacilityBillingMode();
				if (mode === 'advanced') {
					router.push(withQueueHandoff(`/billing/patientid/${encryptedPatientId}/multi`, queueHandoff));
				} else {
					router.push(withQueueHandoff(generalBillingUrl(encryptedPatientId, params.toString()), queueHandoff));
				}
			} catch (error) {
				const message = error?.message || 'Unable to start billing. Please try again.';
				setError(message);
				toast.error(message);
				navigationLock.current = false;
				setOpening(false);
			}
		}
	};

	return (
		<div className="container-fluid px-3 px-lg-4 py-3 py-lg-4">
			{/* Page Header */}
			<div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
				<div className="d-flex align-items-center gap-3">
					<div
						className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
						style={{ width: 46, height: 46, background: `color-mix(in srgb, ${COLOR_ACCENT} 8%, transparent)`, color: COLOR_ACCENT }}
					>
						<RiBillFill size={24} />
					</div>

					<div>
						<h4 className="mb-0 fw-bold">Patient Billing</h4>
						<div className="small" style={{ color: COLOR_TEXT_MUTED }}>
							Select a patient to create a bill or continue a saved price quote.
						</div>
					</div>
				</div>

				<Link href="/billing/suspended-transactions" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2">
					<RiTimeLine size={17} />
					Saved transactions
				</Link>
			</div>

			{/* Billing setup steps */}
			<div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '0.75rem' }}>
				<div className="card-body px-3 px-lg-4 py-3 d-flex flex-column flex-md-row align-items-md-center gap-3 gap-lg-4" role="list" aria-label="Billing setup steps">
					<div className="d-flex align-items-center gap-2" role="listitem" aria-current="step">
						<span className="badge rounded-circle bg-success d-inline-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 24, height: 24 }}>
							1
						</span>
						<div>
							<div className="small fw-semibold">Select patient</div>
							<div className="small" style={{ color: COLOR_TEXT_MUTED }}>Find the correct patient record</div>
						</div>
					</div>

					<div className="vr d-none d-md-block" />

					<div className="d-flex align-items-center gap-2" role="listitem" style={{ color: COLOR_TEXT_MUTED }}>
						<span className="badge rounded-circle bg-body-secondary text-body-secondary d-inline-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 24, height: 24 }}>
							2
						</span>
						<div>
							<div className="small fw-semibold">Choose billing source</div>
							<div className="small">Select the appropriate payer</div>
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

			<div className="row g-4">
				<div className="col-12 col-xl-8">
					<div className="card border-0 shadow-sm" style={{ borderRadius: '0.75rem' }}>
						<div className="card-body p-3 p-lg-4" aria-busy={opening}>
							<div className="d-flex align-items-center gap-3 mb-3">
								<div
									className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
									style={{ width: 40, height: 40, background: `color-mix(in srgb, ${COLOR_ACCENT} 8%, transparent)`, color: COLOR_ACCENT }}
								>
									<RiSearchLine size={20} />
								</div>
								<div>
									<h6 className="fw-bold mb-1">
										{resumeDraftId ? 'Find a patient for this quote' : 'Find a patient'}
									</h6>
									<div className="small" style={{ color: COLOR_TEXT_MUTED }}>
										Search existing patient records to get started.
									</div>
								</div>
							</div>

							{resumeDraftId && (
								<Alert variant="info" className="border-0" role="status">
									<div className="fw-semibold">Select a patient to continue this price quote</div>
									<div className="small">
										The saved tests and {billingSourceLabels[resumeBillingSource] || 'billing source'} will be restored before you finalize the sale.
									</div>
								</Alert>
							)}

							<label htmlFor="billing-patient-search" className="form-label small fw-semibold mb-2">
								Patient name, ID or email
							</label>
							<AsyncPatientFiltering
								inputId="billing-patient-search"
								isDisabled={opening}
								placeholder="Type at least 3 characters to search..."
								getSelectedPatient={filteredPatient}
							/>
							<p className="small mt-3 mb-0" style={{ color: COLOR_TEXT_MUTED }}>
								Select a matching patient to open their billing workspace.
							</p>

							{opening && (
								<div className="d-flex align-items-center gap-2 small mt-3" role="status" style={{ color: COLOR_ACCENT }}>
									<Spinner animation="border" size="sm" />
									Opening patient billing...
								</div>
							)}
							{error && (
								<Alert variant="danger" className="border-0 mt-3 mb-0" role="alert">
									{error}
								</Alert>
							)}
						</div>

						<div className="card-footer bg-body border-top d-flex flex-wrap align-items-center justify-content-between gap-2 p-3 p-lg-4">
							<span className="small" style={{ color: COLOR_TEXT_MUTED }}>New patient?</span>
							<Link href="/crm/registration" className="btn btn-outline-success d-inline-flex align-items-center gap-2">
								<RiUserAddLine size={17} />
								Register a patient
								<RiArrowRightLine size={16} />
							</Link>
						</div>
					</div>
				</div>

				<div className="col-12 col-xl-4">
					<div className="card border-0 shadow-sm h-100" style={{ borderRadius: '0.75rem' }}>
						<div className="card-body p-3 p-lg-4">
							<div
								className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 mb-3"
								style={{ width: 46, height: 46, background: `color-mix(in srgb, ${COLOR_ACCENT} 8%, transparent)`, color: COLOR_ACCENT }}
							>
								<RiBillFill size={24} />
							</div>

							<h6 className="fw-bold mb-2">Start with the right patient</h6>
							<p className="small mb-0" style={{ color: COLOR_TEXT_MUTED }}>
								Check the patient&apos;s name and details in the search results before selecting their record.
							</p>

							<hr className="my-3" />

							<h6 className="fw-bold mb-2">Need to check a price?</h6>
							<p className="small" style={{ color: COLOR_TEXT_MUTED }}>
								View service prices before starting a bill.
							</p>
							<Link href="/crm/pricelist" className="btn btn-outline-secondary w-100 d-inline-flex align-items-center justify-content-center gap-2">
								<RiFileList3Line size={17} />
								Test price list
								<RiArrowRightLine size={16} />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
