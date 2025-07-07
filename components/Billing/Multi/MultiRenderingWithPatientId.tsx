import { Col } from "react-bootstrap";
import MultiTestBillingTable from "./MultiTestBillingTable";
import MultiPreviousBilledTestRecords from "./MultiPreviousBilledTestRecords";
import React, { useContext } from "react";
import { MultiBillingContext } from "./MultiBillingContext";
import MultiServicesProvidedToPatientBilling from "./MultiServicesProvidedToPatientBilling";

export default function MultiRenderingWithPatientId() {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata } = context;


    if (!billingdata.billingSource) {
        return (
            <div>
                <div className="alert alert-danger text-capitalize border-0 text-sm m-3 p-3">Billing source not selected</div>
            </div>
        );
    }

    return (
        <div  >
            <Col>
                <MultiTestBillingTable />
                <MultiServicesProvidedToPatientBilling />
            </Col>
        </div>
    );
}
