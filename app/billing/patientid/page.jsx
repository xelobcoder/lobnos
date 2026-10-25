
"use client";
import AsyncPatientFiltering from '../../../components/accessories/SectorFileringComponents/AsyncCustomerFiltering';
import { plsEncryption } from '../../../lib/encryption';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { RiBillFill, RiUserAddLine, RiTimeLine, RiFileListLine, RiSearchLine, RiArrowRightLine } from '@remixicon/react';
import s from './PatientBilling.module.css';
import { getFacilityBillingMode, generalBillingUrl } from '../../../lib/Multi/billingWorkflow';
import { parseQueueHandoff, withQueueHandoff } from '../../../lib/queueHandoff';

const billingSourceLabels = {
	'1': 'General / Cash',
	'2': 'Organization',
	'3': 'Private Insurance',
	'4': 'NHIS',
	'6': 'Clinician',
};

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
		<main className={s.workspace}>
			<header className={s.header}>
				<div><span className={s.eyebrow}>BILLING &amp; SALES</span><h1>Patient billing</h1><p>Select a patient to create a bill or continue a saved price quote.</p></div>
				<Link href="/billing/suspended-transactions" className={s.savedLink}><RiTimeLine size={18} aria-hidden="true" /> Saved transactions <RiArrowRightLine size={16} aria-hidden="true" /></Link>
			</header>
			<ol className={s.steps} aria-label="Billing steps">
				<li aria-current="step"><span>1</span><div><strong>Select patient</strong><small>Find the correct patient record</small></div></li>
				<li><span>2</span><div><strong>Build the bill</strong><small>Add services and billing details</small></div></li>
				<li><span>3</span><div><strong>Review &amp; finalize</strong><small>Confirm the bill and payment</small></div></li>
			</ol>
			<div className={s.content}>
			<section className={s.searchCard} aria-labelledby="billing-search-title" aria-busy={opening}>
				<div className={s.cardHeading}><span className={s.icon}><RiSearchLine size={24} aria-hidden="true" /></span><div><h2 id="billing-search-title">{resumeDraftId ? 'Find a patient for this quote' : 'Find a patient'}</h2><p>Search existing patient records to get started.</p></div></div>
			{resumeDraftId && (
				<div className={s.quoteNotice} role="status">
					<div className="fw-semibold">Select a patient to continue this price quote</div>
					<div className="small">The saved tests and {billingSourceLabels[resumeBillingSource] || 'billing source'} will be restored before you finalize the sale.</div>
				</div>
			)}
			<div className={s.search}>
				<label htmlFor="billing-patient-search">Patient name, ID or email</label>
				<AsyncPatientFiltering inputId="billing-patient-search" isDisabled={opening} placeholder="Type at least 3 characters to search..." getSelectedPatient={filteredPatient} />
				<p className={s.searchHelp}>Select a matching patient to open their billing workspace.</p>
			</div>
			{opening && <p role="status" className={s.status}><span className={s.spinner} aria-hidden="true" /> Opening patient billing...</p>}
			{error && <p role="alert" className={s.error}>{error}</p>}
			<div className={s.searchFooter}><span>New patient?</span><Link href="/crm/registration"><RiUserAddLine size={17} aria-hidden="true" /> Register a patient <RiArrowRightLine size={16} aria-hidden="true" /></Link></div>
			</section>
			<aside className={s.sideCard} aria-labelledby="billing-next-title"><span className={s.sideIcon}><RiBillFill size={26} aria-hidden="true" /></span><h2 id="billing-next-title">Start with the right patient</h2><p>Check the patient's name and details in the search results before selecting their record.</p><div className={s.divider} /><h3>Need to check a price?</h3><p>View service prices before starting a bill.</p><Link href="/crm/pricelist" className={s.priceLink}><RiFileListLine size={18} aria-hidden="true" /> Test price list <RiArrowRightLine size={16} aria-hidden="true" /></Link></aside>
			</div>
		</main>
	);
}
