"use client";
import { BillingPageContextProvider } from "./BillingContext";
import RenderingWithPatientIdProvided from "./RenderingWithPatientIdProvided";
import BillingSourceDeterminer from "./BillingOptionsSource";
import PreviousTransactionSummaryOffCanvasShow from './Lib/PreviousTransactionSummaryOffCanvasShow'
import BillingPageSummary from "./BillingSummary";
import { useApplicationSettings } from "../../Auth/useApplicationContext";

export default function BillingPageLayout({ patientid, initdata, unencryptedid, }) {
	const employeeid = useApplicationSettings().applicationsettings.user.employeeid;

	return (
		<BillingPageContextProvider>
			<div className="">
				<div className="card br-0 border-0">
					<div className="card-header d-flex justify-content-end" style={{marginTop:'-40px'}}>
						<PreviousTransactionSummaryOffCanvasShow patientid={unencryptedid} employeeid={employeeid} />
					</div>
					<div className="card-body p-0 billing-page-display">
						<BillingSourceDeterminer initdata={initdata} patientid={patientid} />
						<>
							<RenderingWithPatientIdProvided patientid={patientid} />
							<BillingPageSummary patientid={patientid} />
						</>
					</div>
				</div>
			</div>
		</BillingPageContextProvider>
	);
}