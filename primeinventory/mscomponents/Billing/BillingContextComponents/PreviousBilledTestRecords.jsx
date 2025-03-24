import { useState } from "react";
import { Table } from "react-bootstrap";
import RefundTestOrServiceListTr from "./BillingSourceComponents/refundTestOrServiceListTr";

export default function PreviousBilledTestRecords({ previousRecords = [] }) {
    const [refundList, setRefundList] = useState([])

    const handleRefundList = (item) => {
        if (refundList.includes(item)) {
            const unMatched = refundList.filter((single, index) => single != item);
            setRefundList(unMatched)
        } else {
            setRefundList([...refundList, item]);
        }

    }



    return (
        <div>
            {previousRecords.length > 0 &&
                (
                    <div>
                        <h6 className="mx-2">Previous Records</h6>
                        <Table className="table ttable billing-cart-table pls-color text-sm">
                            <thead>
                                <tr>
                                    <th>type</th>
                                    <th style={{ width: '30%' }}>name</th>
                                    <th>outsourced To</th>
                                    <th >price</th>
                                    <th style={{ width: '10%' }}>refund</th>
                                    {refundList.length > 0 && <th style={{ width: '20%' }}>Reason</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(previousRecords) && previousRecords.length > 0 && previousRecords.map((item, index) => {
                                    return (<RefundTestOrServiceListTr refundList={refundList} key={index} index={index} item={item} handleRefundList={handleRefundList} />)
                                })}
                            </tbody>
                        </Table>
                    </div>
                )}
        </div>
    )
}