"use client";
import { BillingPageContextProvider } from "./BillingContext";
import RenderingWithPatientIdProvided from "./RenderingWithPatientIdProvided";
import BillingSourceDeterminer from "./BillingOptionsSource";
import BillingPagePatientInformation from "./PersonalInfoView";
import PreviousTransactionSummaryOffCanvasShow from './Lib/PreviousTransactionSummaryOffCanvasShow'
import BillingPageSummary from "./BillingSummary";

export default function BillingPageLayout({ patientid, initdata, unencryptedid }) {

	return (
		<BillingPageContextProvider>
			<div className="">
				<div className="card br-0 border-0">
					<div className="card-header d-flex justify-content-end" style={{marginTop:'-40px'}}>
						<PreviousTransactionSummaryOffCanvasShow patientid={unencryptedid}/>
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
