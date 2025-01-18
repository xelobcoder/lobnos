"use client"
import { BillingPageContextProvider } from "./BillingContext";
import PatientFiltered from "../../accessories/SectorFileringComponents/CustomerFiltering";
import RenderingWithPatientIdProvided from "./RenderingWithPatientIdProvided";
import { useSearchParams, useRouter } from "next/navigation";
import BillingSourceDeterminer from "./BillingOptionsSource";
import BillingPagePatientInformation from "./PersonalInfoView";
import BillingPageSummary from "./BillingSummary";


export default function BillingPageLayout() {
	const patientid = useSearchParams().get('patientid');
	const router = useRouter();

	const filteredPatient = (options) => {
		const hasPatientid = typeof options == "object" && options.hasOwnProperty('patientid');
		if (!hasPatientid) return;
		const { patientid } = options;
		router.push(`/billing/patientid?patientid=${patientid}`)
	}

	if (!patientid) {
		return (
			<div className="col-sm-12 col-md-6 col-l-4 col-xl-3 my-3 mx-2 mx-sm-0" style={{ height: '50vh' }}>
				<PatientFiltered getSelectedPatient={filteredPatient} />
			</div>
		)
	}


	return (
		<BillingPageContextProvider>
			<div className="">
				<div className="card br-0 border-0">
					<div className="card-header">
						<BillingPagePatientInformation />
					</div>
					<div className="card-body p-0 billing-page-display" >
						<BillingSourceDeterminer patientid={patientid} />
						<RenderingWithPatientIdProvided patientid={patientid} />
						<BillingPageSummary patientid={patientid} />
					</div>
				</div>
			</div>
		</BillingPageContextProvider>
	);
}

