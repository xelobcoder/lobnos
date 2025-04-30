import { Col } from "react-bootstrap"
import TestBillingTable from "./TestBillingTable"
import { toast, ToastContainer } from "react-toastify"
import { useContext } from "react"
import { BillingContext } from "./BillingContext"
import ServicesProvidedToPatientBilling from "./AdditionalServicesProvided"
import PreviousBilledTestRecords from "./PreviousBilledTestRecords"


export default function RenderingWithPatientIdProvided() {
    const { billingdata } = useContext(BillingContext);

    if (billingdata.cantIgnoreDebt && billingdata.outstandingDebt > 0) {
        return null;
    }


    if (!billingdata.billingSource) {
        return (
            <div>
                <div className="alert alert-danger text-capitalize border-0 text-sm m-3 p-3">Billing source not selected</div>
            </div>
        )
    }








    return (
        <div className="billing-page-display-child" >
            {
                billingdata.previewPrevious && billingdata.previousRecords.length > 0 && <PreviousBilledTestRecords previousRecords={billingdata.previousRecords} />
            }

            {!billingdata.billingSource ? <div></div> :
                <div >
                    <ToastContainer theme="colored" position="top-center" className="text-sm fw-bold" autoClose={3000} />
                    <div className="">
                        <div className="mx-2  m-0 p-2 " >
                            <Col >
                                <TestBillingTable toast={toast} />
                                {billingdata.includeServices && <ServicesProvidedToPatientBilling />}
                                {/* <ViewTaxesAppliedToTransaction /> */}
                            </Col>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}



