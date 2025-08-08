
"use client";
import AsyncPatientFiltering from '../../../components/accessories/SectorFileringComponents/AsyncCustomerFiltering';
import { plsEncryption } from '../../../lib/encryption';
import { useRouter } from 'next/navigation';

export default function BillingFiltering() {
	const router = useRouter();

	const filteredPatient = (options) => {
		if (!options || typeof options !== "object" || !options.hasOwnProperty("patientid")) return;
		const { patientid } = options;
		const encryptedPatientId = plsEncryption(patientid.toString());
		if (patientid && encryptedPatientId) {
			router.push(`/billing/patientid/${encryptedPatientId}/multi`);
		}
	};

	return (
		<div className="col-sm-12 col-md-6 col-l-4 col-xl-3 my-3 mx-2 mx-sm-0" style={{ height: "50vh" }}>
			<AsyncPatientFiltering getSelectedPatient={filteredPatient} />
		</div>
	);
}
