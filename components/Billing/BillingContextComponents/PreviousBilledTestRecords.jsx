import { useEffect, useState } from "react";
import { Modal, Table } from "react-bootstrap";
import { customFetch } from "../../Auth/customFetch";
import RefundTestOrServiceListTr from "./BillingSourceComponents/refundTestOrServiceListTr";
import { useSearchParams } from "next/navigation";

export default function PreviousBilledTestRecords({ show, closeModal }) {
    const [previousRecords, setPreviousRecords] = useState([]);
    const [isLoadingPrev, setIsLoadingPrev] = useState(false);
    const [refundList, setRefundList] = useState([])
    const billingid = useSearchParams().get('billingid');

    const handleRefundList = (item) => {
        if (refundList.includes(item)) {
            const unMatched = refundList.filter((single, index) => single != item);
            setRefundList(unMatched)
        } else {
            setRefundList([...refundList, item]);
        }

    }



    const fetchPreviousBilledRecords = async function (billingid) {
        try {
            if (!billingid) return;
            setIsLoadingPrev(true);
            const { result } = await customFetch(`billing/information/single?billingid=${billingid}`);
            if (Array.isArray(result) && result.length > 0) {
                setPreviousRecords(result)
            }
        } catch (err) {
            setIsLoadingPrev([]);
            setIsLoadingPrev(false);
            alert('something went wrong');
        } finally {
            setIsLoadingPrev(false);
        }
    }


    useEffect(() => {
        fetchPreviousBilledRecords(billingid);
    }, [billingid])

    if (isLoadingPrev) return <div>Loading Previous Billing Record for this same day</div>

    console.log(previousRecords)
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
                                <Table className="billing-cart-table table">
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
                <button onClick={(ev) =>  {closeModal()}} className="btn btn-danger">close </button>
            </Modal.Footer>
        </Modal>
    )
}