import { useContext, useState } from "react";
import { Table } from "react-bootstrap";
import { MultiBillingContext } from "./MultiBillingContext";
import RefundTestOrServiceListTr from "../BillingContextComponents/BillingSourceComponents/refundTestOrServiceListTr";
import styles from  '../../../styles/SmsTemplateList.module.css';

export default function MultiPreviousBilledTestRecords() {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata } = context;
    const previousRecords = billingdata.previousRecords || [];
    const [refundList, setRefundList] = useState<any[]>([]);

    const handleRefundList = (item: any) => {
        if (refundList.includes(item)) {
            const unMatched = refundList.filter((single) => single != item);
            setRefundList(unMatched)
        } else {
            setRefundList([...refundList, item]);
        }
    }

    return (
        <div>
            {previousRecords.length > 0 &&
                (
                    <div className="tablewrapper">
                        <h6 className="mx-2">Previous Records</h6>
                        <Table className={`${styles.table} table-sm`}  responsive>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Service</th>
                                    <th>Outsourced To</th>
                                    <th >Service cost</th>
                                    <th >Refund</th>
                                    <th>Refund Witnesses</th>
                                    <th >Reason</th>
                                    <th>Approved</th>
                                    <th>Refunded</th>
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
