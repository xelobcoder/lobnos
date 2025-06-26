import React, { useEffect, useState } from 'react';
import styles from './TransactionDetails.module.css';
import { currencyFormatter, customFetch } from '../../Auth/customFetch';
import { RiCloseLine, RiCalendarLine, RiMoneyDollarCircleLine, RiUserLine ,RiTestTubeLine} from '@remixicon/react';
import { transactionSummaryBilling } from './TransactionsViewOnly';

interface Witness {
    witnessType: string;
    username: string;
    employeeid: number;
}


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
                        <div className="list-group pls-color ">
                            <div className="list-group-item d-flex justify-content-between p-3 align-items-center">
                                <div className="d-flex align-items-center">
                                    <RiMoneyDollarCircleLine size={25} className=" me-3" />
                                    <span className='text-uppercase'>Base Cost</span>
                                </div>
                                <span className="fw-bold text-uppercase">{currencyFormatter.format(parseFloat(transaction?.totalcost?.toString() ?? '0.00'))}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between p-3 align-items-center">
                                <div className="d-flex align-items-center">
                                    <RiCalendarLine size={25} className=" me-3" />
                                    <span className='text-uppercase'>Tax Amount</span>
                                </div>
                                <span className="fw-bold">{transaction.amountIncuredDueTax || '0.00'}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between p-3 align-items-center">
                                <div className="d-flex align-items-center">
                                    <RiMoneyDollarCircleLine size={25} className=" me-3" />
                                    <span className='text-uppercase'>Discount Applied</span>
                                </div>
                                <span className="fw-bold text-uppercase">{transaction.discount || '0.00'}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between p-3 align-items-center">
                                <div className="d-flex align-items-center">
                                    <RiMoneyDollarCircleLine size={25} className=" me-3" />
                                    <span className='text-uppercase'>Total Payable</span>
                                </div>
                                <span className="fw-bold text-uppercase">{transaction.payable}</span>
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
                                        <th>Service Category</th>
                                        <th>Name</th>
                                        <th>Cost</th>
                                        <th>Registration Type</th>
                                        <th>Outsourced</th>
                                        <th>Service Added On</th>
                                        <th>Tax Value</th>
                                        <th>Tax Amount</th>
                                        <th>Tax Included</th>
                                        <th>Discount</th>
                                        <th>Total Cost</th>
                                        <th>Total Payable</th>
                                        <th>NHIS</th>
                                        <th>PHIS</th>
                                        <th>Night Adjustment</th>
                                        <th>Night Value</th>
                                        <th>Night Mode</th>
                                        <th>Package Used</th>
                                        <th>Refund Status</th>
                                        <th>Amount Refunded</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        <tr key={item.serviceid}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <RiTestTubeLine className="text-primary" size={18} />
                                                    <span>{item.serviceCategory}</span>
                                                </div>
                                            </td>
                                            <td>{item.name}</td>
                                            <td className="fw-semibold text-primary">
                                                {currencyFormatter.format(parseFloat(item.cost))}
                                            </td>
                                            <td>
                                                <span className="badge bg-info-subtle text-info">
                                                    {item.registrationType}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${item.isoutsourced ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'}`}>
                                                    {item.isoutsourced ? 'Outsourced' : 'In-house'}
                                                </span>
                                            </td>
                                            <td>{new Date(item.serviceAddedOn).toLocaleString()}</td>
                                            <td>{item.taxIncluded ? item.taxValue : '0.00'}</td>
                                            <td>{item.taxIncluded ? currencyFormatter.format(parseFloat(item.amountIncurredDueTax)) : '0.00'}</td>
                                            <td>
                                                <span className={`badge ${item.taxIncluded ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                    {item.taxIncluded ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="text-danger fw-semibold">
                                                {currencyFormatter.format(parseFloat(item.discount))}
                                            </td>
                                            <td className="fw-semibold">
                                                {currencyFormatter.format(parseFloat(item.totalcost))}
                                            </td>
                                            <td className="fw-bold text-primary">
                                                {currencyFormatter.format(parseFloat(item.totalpayable))}
                                            </td>
                                            <td>
                                                <span className={`badge ${item.isNHIS ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'}`}>
                                                    {item.isNHIS ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${item.isPHIS ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'}`}>
                                                    {item.isPHIS ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${item.hasNightAdjustment ? 'bg-info-subtle text-info' : 'bg-secondary-subtle text-secondary'}`}>
                                                    {item.hasNightAdjustment ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>{item.nightAdjustmentValue}</td>
                                            <td>{item.nightAdjustmentMode}</td>
                                            <td>
                                                <span className={`badge ${item.isPackageUsed ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                                                    {item.isPackageUsed ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                {item.isRefundCompleted ? (
                                                    <span className="badge bg-success-subtle text-success">Completed</span>
                                                ) : item.isRefundApproved ? (
                                                    <span className="badge bg-info-subtle text-info">Approved</span>
                                                ) : item.isRefundInitiated ? (
                                                    <span className="badge bg-warning-subtle text-warning">Initiated</span>
                                                ) : (
                                                    <span className="badge bg-secondary-subtle text-secondary">None</span>
                                                )}
                                            </td>
                                            <td className="text-danger fw-semibold">
                                                {currencyFormatter.format(parseFloat(item.amountRefunded))}
                                            </td>
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