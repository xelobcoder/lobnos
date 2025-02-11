"use client";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { currencyFormatter, customPost } from "../../Auth/customFetch";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import styles from '../../../styles/SmsTemplateList.module.css';

interface BillingUpdateClientPaymentHistoryProps {
    patientid: number;
    outstandingData: OutstandingBill[];
    paymentModes: BillingOption[];
}

interface OutstandingBill {
    date: string;
    billingid: number;
    payable: string;
    paid: string;
    discount: string;
    outstanding: string;
}

interface PaymentInfo {
    amount: number;
    paymentMode: number | null;
}

interface BillingOption {
    KeyID: number;
    PaymentMode: string;
}

export default function BillingUpdateClientPaymentHistoryComponent({
    patientid,
    outstandingData = [],
    paymentModes = [],
}: BillingUpdateClientPaymentHistoryProps) {
    const { user } = useApplicationSettings().applicationsettings;
    const employeeId = parseInt(user?.employeeid || "0");

    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({ amount: 0, paymentMode: null });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


    const parsedOutstandingData = outstandingData.map(bill => ({
        ...bill,
        paid: parseFloat(bill.paid),
        payable: parseFloat(bill.payable),
        discount: parseFloat(bill.discount),
        outstanding: parseFloat(bill.outstanding),
    }));

    const calculateTotalOutstanding = (): number =>
        parsedOutstandingData.reduce((sum, bill) => sum + bill.outstanding, 0);

    const handlePaymentSubmission = async () => {
        // Prevent multiple submissions
        if (isSubmitting) return;

        const { amount, paymentMode } = paymentInfo;
        const amountpaid = parseFloat(amount.toString());

        if (amountpaid <= 0 || amountpaid > calculateTotalOutstanding()) {
            return toast.warning(
                'Amount must be greater than 0 and less than or equal to the outstanding bill',
                { autoClose: 2000, position: 'top-center' }
            );
        }

        if (!paymentMode) {
            return toast.warning('Select a valid payment option', { autoClose: 2000, position: 'top-center' });
        }

        if (patientid && employeeId) {
            setIsSubmitting(true);
            try {
                const response = await customPost('billing/client/clear/outstandingdebt', 'POST', {
                    amountpaid,
                    patientid,
                    paymentmode: paymentMode,
                    employeeid: employeeId,
                });

                const { statusCode, message, status } = response;

                if (statusCode == 200 && status == 'success') {
                    toast.success(message);
                    window.location.reload()
                } else {
                    toast.error(message);
                }
            } catch (error) {
                toast.error('Error processing payment');
            }
            setIsSubmitting(false);
        }
    };

    const renderTransactionHistory = () => {
        const totalOutstanding = calculateTotalOutstanding();
        const isFreeSelected = paymentInfo.paymentMode === 4;

        return (
            <section className="mt-4">
                <h2 className="pls-color bg-secondary-subtle p-3 br-5">
                    Transaction Breakdown
                </h2>

                <div className="alert alert-info mb-4">
                    <p className="mb-0 pls-color">
                        This section displays the detailed breakdown of the patient's outstanding bills.
                        You can review the transactions, update the payment amount, and select a payment mode
                        to clear the outstanding debt. Ensure the payment amount is valid and does not exceed
                        the total outstanding balance.
                    </p>
                </div>
                <table className={`table pls-color table-sm`}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Billing ID</th>
                            <th>Cost Incurred</th>
                            <th>Amount Paid</th>
                            <th>Discount</th>
                            <th>Outstanding</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parsedOutstandingData.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center">No data available</td>
                            </tr>
                        ) : (
                            parsedOutstandingData.map((bill, index) => (
                                <tr key={index}>
                                    <td>
                                        {new Date(bill.date).toLocaleDateString()}{" "}
                                        {new Date(bill.date).toLocaleTimeString()}
                                    </td>
                                    <td>{bill.billingid}</td>
                                    <td>{currencyFormatter.format(bill.payable || 0)}</td>
                                    <td>{currencyFormatter.format(bill.paid || 0)}</td>
                                    <td>{currencyFormatter.format(bill.discount || 0)}</td>
                                    <td className={bill.outstanding > 0 ? 'text-danger' : 'text-primary'}>
                                        {currencyFormatter.format(bill.outstanding || 0)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={5} className="text-end fw-bold">Total Outstanding:</td>
                            <td>{currencyFormatter.format(totalOutstanding || 0)}</td>
                        </tr>
                        <tr>
                            <td colSpan={5} className="text-end">Payment Amount:</td>
                            <td>
                                <input
                                    type="number"
                                    className="custom-input"
                                    placeholder="Enter payment amount"
                                    value={paymentInfo.amount}
                                    onChange={(e) =>
                                        setPaymentInfo({ ...paymentInfo, amount: parseFloat(e.target.value) || 0 })
                                    }
                                />
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={5} className="text-end">Payment Mode:</td>
                            <td>
                                <select
                                    disabled={(Array.isArray(outstandingData) && outstandingData.length == 0) || paymentModes.length == 0}
                                    className="custom-input"
                                    value={paymentInfo.paymentMode || ''}
                                    onChange={(e) =>
                                        setPaymentInfo({ ...paymentInfo, paymentMode: parseInt(e.target.value) || null })
                                    }
                                >
                                    <option value="">Select a payment option</option>
                                    {paymentModes.map((option) => (
                                        <option key={option.KeyID} value={option.KeyID}>
                                            {option.PaymentMode}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={6} className="text-end">
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handlePaymentSubmission}
                                    disabled={isSubmitting || (isFreeSelected && totalOutstanding > 0) || (Array.isArray(outstandingData) && outstandingData.length == 0)}
                                >
                                    {isSubmitting ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        'Update Payment'
                                    )}
                                </button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </section>
        );
    };

    return (
        <div>
            <ToastContainer position="top-center" className="text-sm" theme="colored" />
            {renderTransactionHistory()}
        </div>
    );
}
