import { Col } from "react-bootstrap"
import BillingPageAdditionalInformation from "./BillingPageAdditionalInformation"
import BillingPageSummary from "./BillingSummary"
import TestBillingTable from "./TestBillingTable"
import { toast, ToastContainer } from "react-toastify"
import { useContext } from "react"
import { BillingContext } from "./BillingContext"
import BillingPageIndicatorsShow from "./Lib/BillingIndicators"
import ServicesProvidedToPatientBilling from "./AdditionalServicesProvided"
import ViewTaxesAppliedToTransaction from "./ViewTaxesAppliedToBillingTransaction"
import PreviousBilledTestRecords from "./PreviousBilledTestRecords"

export default function RenderingWithPatientIdProvided({ patientid }) {
    const { billingdata, updateBilling } = useContext(BillingContext);

    const closModal = () => {
        updateBilling({ ...billingdata, previewPrevious: false });
    }

    return (
        <div >
            {billingdata.cantIgnoreDebt && billingdata.outstandingDebt > 0 ? (<div className="bg-danger-subtle fw-bold br-0 p-3 heightedBorder">Settle outstanding Debt please</div>) : <div></div>}
            {billingdata.previewPrevious && <PreviousBilledTestRecords closeModal={closModal} show={billingdata.previewPrevious} />}
            {!billingdata.billingSource ? <div></div> :
                <div>
                    <ToastContainer theme="colored" position="top-center" className="text-sm fw-bold" autoClose={3000} />
                    <div className="">
                        <div className="mx-3 d-flex justify-content-between">
                            <h4>{billingdata.billingSourceTitle}</h4>
                            <BillingPageIndicatorsShow />
                        </div>
                        <div className="mx-2  m-0 p-0">
                            <Col style={{ height: "inherit", overflowY: "auto", overflowX: "hidden", padding: "10px" }}>
                                <TestBillingTable toast={toast} />
                                <ServicesProvidedToPatientBilling />
                                <ViewTaxesAppliedToTransaction />
                                <div className="card mt-3">
                                    <div className="card-header">
                                        <h6>Payment Information</h6>
                                    </div>
                                    <div className="card-body">
                                        {
                                            billingdata.billingSource && <div>
                                                <BillingPageAdditionalInformation patientid={patientid} />
                                            </div>
                                        }
                                    </div>
                                </div>
                            </Col>
                            <Col className="border">
                                <BillingPageSummary />
                            </Col>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}


