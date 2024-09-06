import { Col } from "react-bootstrap"
import BillingPageAdditionalInformation from "./BillingPageAdditionalInformation"
import BillingPageSummary from "./BillingSummary"
import BillingPagePatientInformation from "./PersonalInfoView"
import TestBillingTable from "./TestBillingTable"
import { toast, ToastContainer } from "react-toastify"

export default function RenderingWithPatientIdProvided() {
    return (
        <div>
            <ToastContainer theme="colored" position="top-center" className="text-sm fw-bold" autoClose={3000} />
            <div className="mx-2 card m-0 p-0"
                style={{
                    display: "grid",
                    gridTemplateColumns: "20% 60% 20%",
                    height: "90vh"
                }}>
                <Col className="border">
                    <BillingPagePatientInformation />
                </Col>
                <Col style={{ height: "inherit", overflowY: "auto", overflowX: "hidden", padding: "10px" }}>
                    <TestBillingTable />
                    <hr />
                    <h6>Payment Information</h6>
                    <BillingPageAdditionalInformation />
                </Col>
                <Col className="border">
                    <BillingPageSummary />
                </Col>
            </div>
        </div>
    )
}


