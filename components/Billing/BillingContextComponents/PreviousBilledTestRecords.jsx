import { useState } from "react";
import { Modal, Table } from "react-bootstrap";
import RefundTestOrServiceListTr from "./BillingSourceComponents/refundTestOrServiceListTr";

export default function PreviousBilledTestRecords({ show, closeModal, previousRecords = [] }) {
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
        <Modal show={show} size="fullscreen"   >
            <Modal.Header>
                <h5 className="fw-bold">
                    Remove or Refund Services Or Test Billed
                </h5>
            </Modal.Header>
            <Modal.Body>
                <div>
                    {previousRecords.length > 0 &&
                        (
                            <div>
                                <h5>Previous Records</h5>
                                <Table className="table billing-cart-table pls-color text-sm">
                                    <thead>
                                        <tr>
                                            <th>type</th>
                                            <th style={{ width: '30%' }}>name</th>
                                            <th>outsourced</th>
                                            <th>outsourced To</th>
                                            <th >quantity</th>
                                            <th >price</th>
                                            <th style={{ width: '5%' }}>added on</th>
                                            <th style={{ width: '20%' }}>refund</th>
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
            </Modal.Body>
            <Modal.Footer>
                <button onClick={(ev) => { closeModal() }} className="btn btn-danger">close </button>
            </Modal.Footer>
        </Modal>
    )
}