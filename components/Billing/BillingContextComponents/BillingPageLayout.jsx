import { Col } from "react-bootstrap";
import BillingPageAdditionalInformation from "./BillingPageAdditionalInformation";
import BillingPageSummary from "./BillingSummary";
import TestBillingTable from "./TestBillingTable";
import BillingPagePatientInformation from "./PersonalInfoView";
import { ToastContainer } from "react-toastify";
import { BillingPageContextProvider } from "./BillingContext";

export default function BillingPageLayout() {
  return (
    <BillingPageContextProvider>
      <ToastContainer theme="colored" position="top-center" className="text-sm fw-bold" autoClose={3000} />
      <div>
        <div className="mx-2 card m-0 p-0"
          style={{ display: "grid", gridTemplateColumns: "20% 60% 20%", height: "90vh" }}>
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
    </BillingPageContextProvider>
  );
}
