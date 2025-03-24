import {  useState } from "react";
import { currencyFormatter, customPost } from "../../../Auth/customFetch";
import { Spinner } from "react-bootstrap";
import { useApplicationSettings } from "../../../Auth/useApplicationContext";

export default function RefundTestOrServiceListTr({ handleRefundList, item, index, refundList }) {
    const [isRequesting, setRequesting] = useState(false);
    const { applicationsettings } = useApplicationSettings();
    const { user } = applicationsettings;
    const employeeid = user?.employeeid;
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
        <td>{item.serviceCategory}
            <br />
            {new Date(item.serviceAddedOn).toLocaleDateString()}
        </td>
        <td>{item.name}</td>
        <td>{item.outsourcingOrganization}</td>
        <td>{currencyFormatter.format(item.cost)}</td>
        <td>
            <button
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
                <button className="btn btn-success btn-sm">
                    {isRequesting && <Spinner size="sm" className="mx-2" />} submit
                </button>
            </div>
        </td> : null}
    </tr>)
}