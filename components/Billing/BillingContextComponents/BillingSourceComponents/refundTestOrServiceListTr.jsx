import { useContext, useState } from "react";
import { currencyFormatter, customPost } from "../../../Auth/customFetch";
import { Spinner } from "react-bootstrap";
import { useApplicationSettings } from "../../../Auth/useApplicationContext";
import { toast } from "react-toastify";
import { BillingContext } from "../BillingContext";
import RefundServiceShowDetailModal from './RefundServiceShowDetailModal';

export default function RefundTestOrServiceListTr({ handleRefundList, item, index, refundList }) {
    const [isRequesting, setRequesting] = useState(false);
    const { applicationsettings } = useApplicationSettings();
    const [cashIssuedOut, setCashIssuedOut] = useState(false);
    const [refundableAmount, setRefundableAmount] = useState(0);
    const { billingdata } = useContext(BillingContext);
    const { paymentmodeData } = billingdata;
    const { user } = applicationsettings;
    const employeeid = user?.employeeid;
    const [refundMessage, setRefundMessage] = useState('');
    const [showCashOutModal, setShowCashOutModal] = useState(false);
    const [refundAmount, setRefundAmount] = useState(0);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
    const witness = item.witnesses;

    const handleRefundItem = async (item) => {
        const { serviceCategory, serviceid, trackId, billingid, categoryTrackId } = item;
        const refundbodyData = { serviceCategory, serviceid, trackId, categoryTrackId, billingid, employeeid };
        const response = await customPost(`billing/previous/request/refund`, 'POST', refundbodyData);
        const { stage } = response;
        if (stage == null || stage == undefined) {
            return toast.error("Srvice not found for refunding!!!!")
        }
        if (stage === "UNINITIATED" || stage.toString().trim() === "billing done") {
            handleRefundList(item.trackId);
        } else {
            return alert(`test or service in stage "${stage}"  cannot be refunded`);
        }
    };

    const RequestFunding = async (item) => {
        try {
            setRequesting(true);
            const { billingid, categoryTrackId, employeeid, taxIncluded, serviceid, trackId } = item;
            const data = { billingid, categoryTrackId, employeeid, taxIncluded, serviceid, refundMessage, trackId };

            const pushResponse = await customPost(`billing/previous/request/refund/update`, 'POST', data);
            const { status } = pushResponse;
            status === true ? toast.success("Request for refund submitted successfully") : toast.error("request for refund failed ");
            setRequesting(false);
        } catch (error) {
            console.log(error);
        }
    };

    const hasAlreadyWitnessed = Array.isArray(witness) && witness.length > 0 && witness.map((item) => item.employeeid).includes(employeeid);

    const handleCashOutRefund = async (item) => {
        try {
            const { isRefundApproved, serviceid, totalCost } = item;
            if (isRefundApproved !== 1 || item.isRefundCompleted === 1) return;

            setRefundAmount(totalCost);
            setShowCashOutModal(true);
        } catch (err) {
            toast.error('An error occurred while processing the cash-out');
        }
    };

    const handleCashOutConfirmation = async () => {
        try {
            if (!selectedPaymentMode) {
                toast.error('Please select a refund mode.');
                return;
            }

            if (parseFloat(refundAmount) != refundableAmount) {
                toast.error('Please Enter value equal to the refundable Amount');
                return;
            }

            const { serviceid, name, cost, discount, trackId, billingid } = item;

            const RequestData = {
                serviceid,
                name,
                billingid,
                cost,
                discount,
                trackId,
                selectedPaymentMode,
                refundAmount,
                employeeid
            };

            setCashIssuedOut(true);

            const response = await customPost(
                `billing/previous/refund/update/cashout`,
                'POST',
                RequestData
            );

            console.log(response);
            if (response?.status) {
                toast.success(response.message || 'Refund cashed out successfully');
            } else {
                toast.error(response.message || 'Failed to cash out refund');
            }

            setCashIssuedOut(false);
            setShowCashOutModal(false);
        } catch (err) {
            console.log(err)
            toast.error('An error occurred while processing the cash-out');
            setCashIssuedOut(false);
            setShowCashOutModal(false);
        }
    };

    return (
        <>
            <tr key={index}>
                <td>{item.serviceCategory}<br />{new Date(item.serviceAddedOn).toLocaleDateString()}</td>
                <td>{item.name}</td>
                <td>{item.outsourcingOrganization}</td>
                <td>{currencyFormatter.format(item.totalcost || item.cost)}</td>
                <td>
                    <button
                        disabled={hasAlreadyWitnessed || item.isRefundApproved === 1 || item.isRefundCompleted === 1}
                        onClick={(ev) => { handleRefundItem(item); }}
                        className="btn text-capitalize btn-danger btn-sm p-1">
                        {refundList.includes(item.testid) ? "refund requested" : "request"}
                    </button>
                </td>
                <td>
                    {Array.isArray(witness) && witness.length > 0 ? (
                        <div className="m-0 p-0">
                            {witness.map((field, index) => (
                                <div className="list-group-item pls-color bg-body-secondary text-sm text-capitalize" key={index}>
                                    ({index + 1}) {field.username.toLowerCase()}
                                </div>
                            ))}
                        </div>
                    ) : null}
                </td>
                <td>{refundList.includes(item.trackId) ? (
                    <div>
                        <textarea value={refundMessage}  onChange={(ev) => { setRefundMessage(ev.target.value); }} className="form-control" />
                        <br />
                        <button className="btn btn-success btn-sm" onClick={(ev) => { RequestFunding(item); }}>
                            {isRequesting && <Spinner size="sm" className="mx-2" />} submit
                        </button>
                    </div>) : null}
                </td>
                <td>
                    {item.isRefundApproved === 1 && item.isRefundInitiated === 1 ? 'Approved' : 'No'}
                </td>
                <td>
                    {item.isRefundInitiated === 1 && item.isRefundApproved === 1 && (item.isRefundCompleted === 0) && (
                        <button
                            onClick={(ev) => { handleCashOutRefund(item); }}
                            className="btn btn-sm btn-success"
                            disabled={cashIssuedOut}
                        >
                            Cash out
                        </button>
                    )}
                    {item.isRefundInitiated === 1 && item.isRefundApproved === 1 && item.isRefundCompleted === 1 && <div>Done</div>}
                </td>
            </tr>

            {
                showCashOutModal && (
                    <RefundServiceShowDetailModal
                        show={showCashOutModal}
                        onClose={() => setShowCashOutModal(false)}
                        onConfirm={handleCashOutConfirmation}
                        refundAmount={refundAmount}
                        setRefundAmount={setRefundAmount}
                        paymentModes={paymentmodeData}
                        setRefundableAmount={setRefundableAmount}
                        selectedPaymentMode={selectedPaymentMode}
                        setSelectedPaymentMode={setSelectedPaymentMode}
                        item={item}
                        cashIssuedOut={cashIssuedOut}
                    />
                )
            }
        </>
    );
}





// BEGIN
//     DECLARE billingid INT;
//     DECLARE serviceamountIncurredDueTax DECIMAL(6, 2);
//     DECLARE servicetotalcost DECIMAL(6, 2);
//     DECLARE servicetotalpayable DECIMAL(6, 2);
//     DECLARE servicediscount DECIMAL(6, 2);
//     DECLARE current_paid DECIMAL(6, 2);
//     DECLARE current_payable DECIMAL(6, 2);
//     DECLARE outstanding DECIMAL(6, 2);

//     SELECT billingid, amountIncurredDueTax, totalpayable, totalcost, discount
//     INTO billingid, serviceamountIncurredDueTax, servicetotalpayable, servicetotalcost, servicediscount
//     FROM dboservices
//     WHERE serviceid = OLD.serviceid;

//     SELECT paid, payable INTO current_paid, current_payable
//     FROM billing
//     WHERE billingid = billingid;

//     IF current_paid > current_payable THEN
//         SET outstanding = current_payable - current_paid;
// ELSE
//         SET outstanding = current_paid - current_payable;
//     END IF;

// IF(NEW.isRefundCompleted = 1 OR OLD.isRefundCompleted = 1)
//        AND OLD.isRefundInitiated = 1
//        AND OLD.isRefundApproved = 1
// AND(NEW.amountRefunded != 0 OR OLD.amountRefunded != 0) THEN
//         UPDATE billing
// SET
// paid = paid - NEW.amountRefunded,
//     payable = payable - servicetotalpayable,
//     totalcost = totalcost - servicetotalcost,
//     discount = discount - servicediscount,
//     amountIncurredDueTax = amountIncurredDueTax - serviceamountIncurredDueTax,
//     totalRefunded = totalRefunded + NEW.amountRefunded,
//     outstanding = outstanding
//         WHERE billingid = billingid;
//     END IF;
// END