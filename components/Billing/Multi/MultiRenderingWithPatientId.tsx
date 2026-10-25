import { Col } from "react-bootstrap";
import MultiTestBillingTable from "./MultiTestBillingTable";
import React, { useContext } from "react";
import { MultiBillingContext } from "./MultiBillingContext";
import MultiServicesProvidedToPatientBilling from "./MultiServicesProvidedToPatientBilling";



export default function MultiRenderingWithPatientId(canload:{canload:boolean;addFirst?:boolean;entryDraft?:any;setEntryDraft?:any}) {
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
                <MultiTestBillingTable canload={canload.canload} addFirst={canload.addFirst} entryDraft={canload.entryDraft} setEntryDraft={canload.setEntryDraft} />
                <MultiServicesProvidedToPatientBilling />
            </Col>
        </div>
    );
}
