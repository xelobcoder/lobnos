import { useContext, useState } from "react";
import { currencyFormatter, customPost } from "../../../Auth/customFetch";
import AuthContext from "../../../Auth/useAuthentification";
import { Spinner } from "react-bootstrap";

export default function RefundTestOrServiceListTr({ handleRefundList, item, index, refundList }) {
    const [isRequesting, setRequesting] = useState(false);
    const { auth } = useContext(AuthContext);
    const employeeid = auth?.employeeid;
    const [refundMessage, setRefundMessage] = useState('');


    const handleRefundItem = async (item) => {
        setRequesting(true);
        const { serviceCategory, serviceid, trackId, billingid, categoryTrackId } = item;
        const refundbodyData = { serviceCategory, serviceid, trackId, categoryTrackId, billingid, employeeid };
        const response = await customPost(`billing/previous/request/refund`, 'POST', refundbodyData);
        handleRefundList(item.trackId);
        setRequesting(true);
    }


    return (<tr key={index} >
        <td>{item.serviceCategory}</td>
        <td>{item.name}</td>
        <td>{item.isoutsourced == 0 ? 'No' : 'Yes'}</td>
        <td>{item.outsourcingOrganization}</td>
        <td>1</td>
        <td>{currencyFormatter.format(item.cost)}</td>
        <td>{new Date(item.serviceAddedOn).toLocaleDateString()}</td>
        <td>
            <button
                onClick={(ev) => { handleRefundItem(item) }}
                className="btn text-capitalize btn-danger btn-sm p-1"
            >
                {refundList.includes(item.testid) ? "refund requested" : "request for refund"}

            </button>
        </td>
        {(refundList.includes(item.trackId)) ? <td>
            <div>
                <textarea value={refundMessage} onChange={(ev) => { setRefundMessage(ev.target.value) }} className="form-control" />
                <br />
                <button className="btn btn-success btn-sm">
                    {isRequesting && <Spinner size="sm" className="mx-2" />} submit
                </button>
            </div>
        </td> : null}
    </tr>)
}