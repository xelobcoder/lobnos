import React, { useState } from 'react';
import { useContext } from 'react';
import { BillingContext } from '../BillingContext';
import { Modal, Button, Alert } from 'react-bootstrap';
import { currencyFormatter } from '../../../Auth/customFetch';
import {
    FileTextIcon,
    ListIcon,
    DollarSignIcon,
    CreditCardIcon,
    CheckCircleIcon,
    RotateCcwIcon,
    AlertCircleIcon,
    InfoIcon,
    HistoryIcon,
    RefreshCwIcon,
    EditIcon,
    SettingsIcon,
} from './Icons';
import Link from 'next/link';


export default function PreviousTransactionSummaryModal({patientid}) {
    const { billingdata } = useContext(BillingContext);
    const [showPrevious, setShowPrevious] = useState(false);
    const { previousRecords } = billingdata;

    const handleRefundAll = () => {
        alert('Refund All clicked');
    };

    const handleWriteOff = () => {
        alert('Write Off clicked');
    };

    const handleOtherAction = () => {
        alert('Other Action clicked');
    };

  
    return (
        <div>
            <div className='d-flex justify-content-between'>
                {billingdata.billingid && <Link className=' btn-sm pls-color btn' href={`/billing/patientid/${patientid}`}>New Transaction</Link>}
                <button
                    disabled={!billingdata.billingSource}
                    onClick={(ev) => { setShowPrevious(!showPrevious) }}
                    className="btn pls-color btn-link d-flex align-items-center"
                >
                    <HistoryIcon className="me-2" />
                    Actions/View Previous Billing Information
                </button>
            </div>
            <Modal
                show={showPrevious}
                onHide={() => setShowPrevious(false)}
                size="fullscreen"
                backdrop="static"
            >
                <Modal.Header closeButton className="bg-secondary-subtle fw-bold">
                    <FileTextIcon />{" "}
                    <Modal.Title className='fs-5'>
                        Previous Transaction Summary
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mx-2 text-sm my-2">
                        <div className="pls-color d-flex align-items-center">
                            <ListIcon />
                            Transaction Summary
                        </div>
                        <div className="list-group">
                            <div className="list-group-item d-flex justify-content-between">
                                <span>
                                    <DollarSignIcon />
                                    Previous Tax Amount
                                </span>
                                <span>{currencyFormatter.format(billingdata.previousAmountIncurredDueTax || 0)}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between bg-primary-subtle">
                                <span>
                                    <CreditCardIcon />
                                    Previous Payable
                                </span>
                                <span>{currencyFormatter.format(billingdata.previousPayable || 0)}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between bg-secondary-subtle">
                                <span>
                                    <CheckCircleIcon />
                                    Previous Paid
                                </span>
                                <span>{currencyFormatter.format(billingdata.previousPaid || 0)}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between">
                                <span>
                                    <RotateCcwIcon />
                                    Previous Refunded
                                </span>
                                <span>{currencyFormatter.format(billingdata.previousRefunded || 0)}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between bg-danger-subtle">
                                <span>
                                    <AlertCircleIcon />
                                    Previous Outstanding
                                </span>
                                <span>{currencyFormatter.format(billingdata.previousOutstanding || 0)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mx-2 mt-4">
                        <h5 className="mb-3 pls-label pls-color d-flex align-items-center">
                            <FileTextIcon />
                            Transaction Detail
                        </h5>
                        {Array.isArray(previousRecords) && previousRecords.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table table-bordered table-striped table-hover pls-color" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Service Name</th>
                                            <th>Cost</th>
                                            <th>Total Payable</th>
                                            <th>Discount</th>
                                            <th>Service Added On</th>
                                            <th>Tax Amount</th>
                                            <th>Tax Included</th>
                                            <th>Tax Value</th>
                                            <th>Service Category</th>
                                            <th>Registration Type</th>
                                            <th>Is Outsourced</th>
                                            <th>Outsource ID</th>
                                            <th>Is NHIS</th>
                                            <th>Is PHIS</th>
                                            <th>Insurance ID</th>
                                            <th>Claim Code</th>
                                            <th>Is Refund Completed</th>
                                            <th>Is Refund Approved</th>
                                            <th>Is Refund Initiated</th>
                                            <th>Amount Refunded</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previousRecords.map((record, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{record.name || 'N/A'}</td>
                                                <td>{currencyFormatter.format(record.cost)}</td>
                                                <td>{currencyFormatter.format(record.totalpayable)}</td>
                                                <td>{currencyFormatter.format(record.discount)}</td>
                                                <td>{new Date(record.serviceAddedOn).toLocaleString()}</td>
                                                <td>{currencyFormatter.format(record.amountIncurredDueTax)}</td>
                                                <td>{record.taxIncluded ? 'Yes' : 'No'}</td>
                                                <td>{record.taxValue}</td>
                                                <td>{record.serviceCategory}</td>
                                                <td>{record.registrationType}</td>
                                                <td>{record.isoutsourced ? 'Yes' : 'No'}</td>
                                                <td>{record.outsourceid}</td>
                                                <td>{record.isNHIS ? 'Yes' : 'No'}</td>
                                                <td>{record.isPHIS ? 'Yes' : 'No'}</td>
                                                <td>{record.insuranceid}</td>
                                                <td>{record.claimCode || 'N/A'}</td>
                                                <td>{record.isRefundCompleted ? 'Yes' : 'No'}</td>
                                                <td>{record.isRefundApproved ? 'Yes' : 'No'}</td>
                                                <td>{record.isRefundInitiated ? 'Yes' : 'No'}</td>
                                                <td>{currencyFormatter.format(record.amountRefunded)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <Alert variant="info" className="d-flex align-items-center">
                                <InfoIcon />
                                No previous records available.
                            </Alert>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="danger" onClick={handleRefundAll}>
                            <RefreshCwIcon /> {" "}
                            Refund All
                        </Button>
                        <Button variant="warning" onClick={handleWriteOff}>
                            <EditIcon />  {" "}
                            Write Off
                        </Button>
                        <Button variant="primary" onClick={handleOtherAction}>
                            <SettingsIcon />  {" "}
                            Other Action
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
}