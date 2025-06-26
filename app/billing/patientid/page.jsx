import AsyncPatientFiltering from '../../../components/accessories/SectorFileringComponents/AsyncCustomerFiltering';
import { plsEncryption } from '../../../lib/encryption';
import { redirect } from 'next/navigation';

export default async function BillingFiltering() {

	const filteredPatient = async (options) => {
		"use server"
		if (!options || typeof options !== "object" || !options.hasOwnProperty("patientid")) return;
		const { patientid } = options;
		const encryptedPatientId = plsEncryption(patientid.toString());
		if (patientid && encryptedPatientId) {
			redirect(`/billing/patientid/${encryptedPatientId}/multi`);
		}

	}

	return (
		<div className="col-sm-12 col-md-6 col-l-4 col-xl-3 my-3 mx-2 mx-sm-0" style={{ height: "50vh" }}>
			<AsyncPatientFiltering getSelectedPatient={filteredPatient} />
		</div>
	);
}
