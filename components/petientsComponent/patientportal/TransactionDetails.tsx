import React, { useEffect, useState } from 'react';
import styles from './TransactionDetails.module.css';
import { customFetch } from '../../Auth/customFetch';
import { RiCloseLine, RiCalendarLine, RiMoneyDollarCircleLine, RiUserLine } from '@remixicon/react';
import { transactionSummaryBilling } from './TransactionsViewOnly';

interface Witness {
    witnessType: string;
    username: string;
    employeeid: number;
}

// Remove duplicate Props interface
interface TransactionDetail {
    serviceid: number;
    billingid: number;
    trackId: number;
    cost: string;
    employeeid: number;
    serviceCategory: string;
    categoryTrackId: number;
    clinicianId: number;
    organizationId: number;
    registrationType: string;
    branchid: number;
    isoutsourced: number;
    outsourceid: null;
    serviceAddedOn: string;
    taxList: null;
    taxValue: string;
    amountIncurredDueTax: string;
    taxIncluded: number;
    discount: string;
    totalcost: string;
    totalpayable: string;
    isNHIS: number;
    isPHIS: number;
    insuranceid: null;
    claimCode: null;
    hasNightAdjustment: number;
    nightAdjustmentValue: string;
    nightAdjustmentMode: string;
    isPackageUsed: number;
    packageid: null;
    isRefundCompleted: number;
    isRefundApproved: number;
    isRefundInitiated: number;
    amountRefunded: string;
    outsourcingOrganization: null;
    name: boolean;
    witnesses: Witness[];
}

// Consolidate interfaces into one
// Update the props interface to include transaction data
interface TransactionDetailsProps {
    billingId: number;
    onClose: () => void;
    tenantId: number;
    summary: Partial<transactionSummaryBilling> | undefined
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ 
    billingId, 
    onClose,
    summary
}) => {
    const [data, setData] = useState<TransactionDetail[]>([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchTransactionDetails = async () => {
            try {
                const response = await customFetch(`billing/information/single?billingid=${billingId}`);
                setData(response.result || []);
            } catch (err) {
                setError('Failed to load transaction details');
                console.error('Error fetching transaction details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [billingId]);

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (data.length === 0) return null;
    const transaction = summary

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sidePanel} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                   {transaction &&  <h3>Transaction #{transaction.billingid} Details</h3>}
                    <button onClick={onClose} className={styles.closeButton}>
                        <RiCloseLine size={24} />
                    </button>
                </div>
                
                {transaction && (
                    <div className={styles.content}>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Billing ID</span>
                                <span className={styles.summaryValue}>#{transaction.billingid}</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Base Cost</span>
                                <span className={styles.summaryValue}>GHS {transaction.totalcost}</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Tax</span>
                                <span className={styles.summaryValue}>
                                    GHS {transaction.amountIncuredDueTax || '0.00'}
                                </span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Discount</span>
                                <span className={styles.summaryValue}>GHS {transaction.discount || '0.00'}</span>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.summaryLabel}>Total Payable</span>
                                <span className={styles.summaryValue}>GHS {transaction.payable}</span>
                            </div>
                        </div>
                    </div>
                )}

                    <div className={styles.section}>
                        <h4><RiMoneyDollarCircleLine size={18} /> Transaction Information</h4>
                        <div className={styles.tableWrapper}>
                            <table className={styles.dataTable}>
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Track ID</th>
                                        <th>Cost</th>
                                        <th>Registration</th>
                                        <th>Added On</th>
                                        <th>Night Adjustment</th>
                                        <th>Tax Value</th>
                                        <th>Discount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        <tr key={item.serviceid}>
                                            <td>{item.serviceCategory}</td>
                                            <td>#{item.trackId}</td>
                                            <td>GHS {item.cost}</td>
                                            <td>{item.registrationType}</td>
                                            <td>{new Date(item.serviceAddedOn).toLocaleString()}</td>
                                            <td>{item.hasNightAdjustment ? `${item.nightAdjustmentValue}%` : 'No'}</td>
                                            <td>GHS {item.taxValue}</td>
                                            <td>GHS {item.discount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default TransactionDetails;