"use client";

import { BillingPageContextProvider } from "./BillingContext";
import PatientFiltered from "../../accessories/SectorFileringComponents/CustomerFiltering";
import RenderingWithPatientIdProvided from "./RenderingWithPatientIdProvided";
import { useSearchParams, useRouter } from "next/navigation";
import BillingSourceDeterminer from "./BillingOptionsSource";
import BillingPagePatientInformation from "./PersonalInfoView";
import BillingPageSummary from "./BillingSummary";
import { useState, useCallback } from "react";
import { plsEncryption } from "../../../lib/encryption";

function NoPatientSelected({ onSelectPatient }) {
	return (
		<div className="col-sm-12 col-md-6 col-l-4 col-xl-3 my-3 mx-2 mx-sm-0" style={{ height: "50vh" }}>
			<PatientFiltered getSelectedPatient={onSelectPatient} />
		</div>
	);
}

export default function BillingPageLayout() {
	const [loadingData, setLoadingData] = useState(false);
	const patientid = useSearchParams().get("patientid")?.trim();
	const router = useRouter();

	const filteredPatient = useCallback((options) => {
		if (!options || typeof options !== "object" || !options.hasOwnProperty("patientid")) return;
		const { patientid } = options;
		const encryptedPatientId = plsEncryption(patientid.toString());
		if (patientid && encryptedPatientId) {
			router.push(`/billing/patientid/${encryptedPatientId}`);
		}

	}, [router]);

	if (!patientid) {
		return <NoPatientSelected onSelectPatient={filteredPatient} />;
	}

	return (
		<BillingPageContextProvider>
			<div className="">
				<div className="card br-0 border-0">
					<div className="card-header">
						<BillingPagePatientInformation />
					</div>
					<div className="card-body p-0 billing-page-display">
						<BillingSourceDeterminer patientid={patientid} onLoadingData={setLoadingData} />
						{loadingData ? (
							<div className="p-2 m-3 bg-secondary-subtle d-flex justify-content-center">
								Loading Data.............
							</div>
						) : (
							<>
								<RenderingWithPatientIdProvided patientid={patientid} />
								<BillingPageSummary patientid={patientid} />
							</>
						)}
					</div>
				</div>
			</div>
		</BillingPageContextProvider>
	);
}
