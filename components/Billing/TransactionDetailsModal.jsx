"use client";
import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";
import { toast } from "react-toastify";
import TransactionServicesList from './TransactionServicesList';
import { customPost } from "../Auth/customFetch";

export default function TransactionDetailsModal({ showModal, setShowModal, previousTransactions, employeeid }) {
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [refundReasons, setRefundReasons] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleTransactionCheckboxChange = async (transactionId, item) => {
        const stage = await handleRequestForRefund(item);
        if (!stage) {
            return toast.warning("Determination of test status failed");
        }

        if (stage === "UNINITIATED" || stage.toString().trim() === "billing done") {
            const selectedIndex = selectedTransactions.indexOf(transactionId);
            let newSelected = [];

            if (selectedIndex === -1) {
                newSelected = newSelected.concat(selectedTransactions, transactionId);
            } else if (selectedIndex === 0) {
                newSelected = newSelected.concat(selectedTransactions.slice(1));
            } else if (selectedIndex === selectedTransactions.length - 1) {
                newSelected = newSelected.concat(selectedTransactions.slice(0, -1));
            } else if (selectedIndex > 0) {
                newSelected = newSelected.concat(
                    selectedTransactions.slice(0, selectedIndex),
                    selectedTransactions.slice(selectedIndex + 1)
                );
            }

            setSelectedTransactions(newSelected);
        }
    };

    const handleRefundReasonChange = (transactionId, reason) => {
        setRefundReasons((prev) => ({
            ...prev,
            [transactionId]: reason,
        }));
    };

    const handleRefundSubmit = async () => {
        const refundData = selectedTransactions.map((transactionId) => {
            const refundMessage = refundReasons[transactionId];
            const dataItem = previousTransactions.find((item) => item.serviceid === transactionId);

            if (dataItem && typeof dataItem === "object") {
                const {
                    billingid,
                    categoryTrackId,
                    employeeid,
                    serviceid,
                    taxIncluded,
                    trackId,
                } = dataItem;

                return {
                    refundMessage,
                    billingid,
                    categoryTrackId,
                    employeeid,
                    serviceid,
                    taxIncluded,
                    trackId,
                };
            }
            return null;
        }).filter(Boolean);

        try {
            const responses = await Promise.all(
                refundData.map((data) =>
                    customPost(`billing/previous/request/refund/update`, 'POST', data)
                )
            );

            console.log("Responses:", responses);
            alert("Refund requests submitted successfully!");
        } catch (error) {
            console.error("Error submitting refund requests:", error);
            alert("Failed to submit refund requests. Please try again.");
        }
    };

    const handleRequestForRefund = async (serviceItem) => {
        try {
            const endpoint = `billing/previous/request/refund`;
            const { billingid, categoryTrackId, employeeid, serviceCategory, serviceid } = serviceItem;
            const requestResponse = await customPost(endpoint, 'POST', { billingid, categoryTrackId, employeeid, serviceCategory, serviceid });
            return requestResponse?.stage || null;
        } catch (err) {
            toast.error("An Error Occured Determining stage");
            return null;
        }
    };

    return (
        <Modal show={showModal} backdrop="static" onHide={() => setShowModal(false)} size="fullscreen">
            <Modal.Header closeButton>
                <div className="d-flex justify-content-between col-10">
                    <Modal.Title>Transaction Details</Modal.Title>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleRefundSubmit}
                        disabled={selectedTransactions.length === 0}
                    >
                        Submit Refund
                    </Button>
                </div>
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <div className="text-center">Loading...</div>
                ) : (
                    previousTransactions.length > 0 ? (
                        <>
                            <TransactionServicesList previousTransactions={previousTransactions} employeeid={employeeid} selectedTransactions={selectedTransactions} handleTransactionCheckboxChange={handleTransactionCheckboxChange} />
                            {selectedTransactions.length > 0 && (
                                <div className="mt-3">
                                    {selectedTransactions.map((transactionId) => (
                                        <Form.Group key={transactionId} className="mb-3">
                                            <Form.Label>Refund Reason for Transaction {transactionId}</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Enter refund reason"
                                                value={refundReasons[transactionId] || ""}
                                                onChange={(e) => handleRefundReasonChange(transactionId, e.target.value)}
                                            />
                                        </Form.Group>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center">No previous transactions found.</div>
                    )
                )}
            </Modal.Body>
        </Modal>
    );
}