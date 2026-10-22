
"use client";
import AsyncPatientFiltering from '../../../components/accessories/SectorFileringComponents/AsyncCustomerFiltering';
import { plsEncryption } from '../../../lib/encryption';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
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

	const filteredPatient = async (options) => {
		if (!options || typeof options !== "object" || !options.hasOwnProperty("patientid")) return;
		const { patientid } = options;
		const encryptedPatientId = plsEncryption(patientid.toString());
		if (patientid && encryptedPatientId) {
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
				toast.error(error?.message || 'Unable to start billing. Please try again.');
			}
		}
	};

	return (
		<div className="col-sm-12 col-md-6 col-l-4 col-xl-3 my-3 mx-2 mx-sm-0">
			{resumeDraftId && (
				<div className="alert alert-info mb-3" role="status">
					<div className="fw-semibold">Select a patient to continue this price quote</div>
					<div className="small">The saved tests and {billingSourceLabels[resumeBillingSource] || 'billing source'} will be restored before you finalize the sale.</div>
				</div>
			)}
			<AsyncPatientFiltering getSelectedPatient={filteredPatient} />
		</div>
	);
}
