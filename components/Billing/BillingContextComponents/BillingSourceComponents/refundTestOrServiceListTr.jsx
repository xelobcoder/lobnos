import { useState } from "react";
import { currencyFormatter, customPost } from "../../../Auth/customFetch";
import { Spinner } from "react-bootstrap";
import { useApplicationSettings } from "../../../Auth/useApplicationContext";
import { toast } from "react-toastify";
export default function RefundTestOrServiceListTr({ handleRefundList, item, index, refundList }) {
    const [isRequesting, setRequesting] = useState(false);
    const { applicationsettings } = useApplicationSettings();
    const { user } = applicationsettings;
    const employeeid = user?.employeeid;
    const [refundMessage, setRefundMessage] = useState('');
    const witness = item.witnesses;


    const handleRefundItem = async (item) => {
        const { serviceCategory, serviceid, trackId, billingid, categoryTrackId } = item;
        const refundbodyData = { serviceCategory, serviceid, trackId, categoryTrackId, billingid, employeeid };
        const response = await customPost(`billing/previous/request/refund`, 'POST', refundbodyData);
        const { stage } = response;
        if (stage === "UNINITIATED" || stage.toString().trim() === "billing done") {
            handleRefundList(item.trackId);
        } else {
            return alert(`test or service in stage "${stage}"  cannot be refunded`)
        }
    }


    const RequestFunding = async (item) => {
        try {
            setRequesting(true)
            const { billingid, categoryTrackId, employeeid, taxIncluded, serviceid, trackId } = item
            const data = { billingid, categoryTrackId, employeeid, taxIncluded, serviceid, refundMessage, trackId }

            const pushResponse = await customPost(`billing/previous/request/refund/update`, 'POST', data);
            const { status } = pushResponse;
            status === true ? toast.success("Request for refund submitted sucessfully") : toast.error("request for refund failed ")
            setRequesting(false);
        } catch (error) {
            console.log(error)
        }
    }


    const hasAlreadyWitnessed = Array.isArray(witness) && witness.length > 0 && witness.map((item) => item.employeeid).includes(employeeid);



    return (<tr key={index} >
        <td>{item.serviceCategory}
            <br />
            {new Date(item.serviceAddedOn).toLocaleDateString()}
        </td>
        <td>{item.name}</td>
        <td>{item.outsourcingOrganization}</td>
        <td>{currencyFormatter.format(item.cost)}</td>
        <td>
            {Array.isArray(witness) && witness.length > 0 && (
                <div className="list-group m-0 p-0">
                    {
                        witness.map((field, index) => {
                            return (<div className="list-group-item pls-color   bg-body-secondary text-sm text-capitalize" key={index}>
                                {index + 1}.  {field.witnessType}:{field.username.toLowerCase()}
                            </div>)
                        })
                    }
                </div>
            )}
        </td>
        <td>
            <button
                disabled={hasAlreadyWitnessed || item.isRefundApproved == 1 || item.isRefundCompleted == 1}
                onClick={(ev) => { handleRefundItem(item) }}
                className="btn text-capitalize btn-danger btn-sm p-1"
            >
                {refundList.includes(item.testid) ? "refund requested" : "request"}

            </button>
        </td>
        {(refundList.includes(item.trackId)) ? <td>
            <div>
                <textarea value={refundMessage} onChange={(ev) => { setRefundMessage(ev.target.value) }} className="form-control" />
                <br />
                <button className="btn btn-success btn-sm" onClick={(ev) => { RequestFunding(item) }}>
                    {isRequesting && <Spinner size="sm" className="mx-2" />} submit
                </button>
            </div>
        </td> : null}
        <td>
            {item.isRefundApproved == 1 ? 'Approved' : 'Rejected'}
        </td>
        <td>
            {item.isRefundCompleted == 1 ? 'Done' : "No"}
        </td>
    </tr>)
}