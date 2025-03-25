"use client"
import React, { useState, useEffect } from 'react';
import { RiCalendarLine, RiDownloadLine, RiFileListLine, RiTestTubeLine, 
    RiEyeLine, RiHistoryLine, RiArrowUpSLine, RiArrowDownSLine } from '@remixicon/react';
import { customFetch } from '../../Auth/customFetch';
import styles from './TransactionsViewOnly.module.css';

interface Transaction {
    billingid: number;
    totalTransactionCost: string;
    totalcost: string;
    paid: string;
    payable: string;
    totalrefunded: string;
    discount: string;
    outstanding: string;
    balance: string;
    billedon: string;
    clientstatus: string;
    lastupdated: string;
}

const TransactionsViewOnly = ({ patientid }) => {
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Transaction | null;
        direction: 'ascending' | 'descending';
    }>({
        key: null,
        direction: 'ascending'
    });

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await customFetch(`billing/patient/transactions?patientid=${patientid}`);
                setTransactions(response.data);
            } catch (err) {
                setError('Failed to load transactions');
                console.error('Error fetching transactions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [patientid]);

    const getTransactionStatus = (transaction: Transaction) => {
        if (Number(transaction.totalrefunded) > 0) return 'refunded';
        if (Number(transaction.outstanding) > 0) return 'incomplete';
        if (Number(transaction.paid) >= Number(transaction.payable)) return 'success';
        return 'incomplete';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSort = (key: keyof Transaction) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        setSortConfig({ key, direction });
        
        const sortedData = [...transactions].sort((a, b) => {
            if (key === 'billingid' || key === 'billedon') {
                if (key === 'billedon') {
                    return direction === 'ascending' 
                        ? new Date(a[key]).getTime() - new Date(b[key]).getTime()
                        : new Date(b[key]).getTime() - new Date(a[key]).getTime();
                }
                return direction === 'ascending' 
                    ? Number(a[key]) - Number(b[key])
                    : Number(b[key]) - Number(a[key]);
            }
            
            if (['totalTransactionCost', 'paid', 'totalrefunded'].includes(key)) {
                return direction === 'ascending'
                    ? Number(a[key]) - Number(b[key])
                    : Number(b[key]) - Number(a[key]);
            }
            
            return 0;
        });

        setTransactions(sortedData);
    };

    if (loading) return <div className={styles.loading}><div className="spinner-border spinner-border-sm text-primary" role="status"></div></div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className={styles.header}>
                    <div className={styles.headerTitle}>Transaction History</div>
                </div>
                <div className="d-flex gap-3">
                    <div className={styles.datePickerGroup}>
                        <input
                            type="date"
                            className={styles.datePicker}
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        />
                        <span className={styles.datePickerSeparator}>-</span>
                        <input
                            type="date"
                            className={styles.datePicker}
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        />
                    </div>
                    <button className={`btn btn-outline-primary btn-sm d-flex align-items-center gap-2 ${styles.downloadButton}`}>
                        <RiDownloadLine size={16} />
                        <span>Download</span>
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('billingid')} className={sortConfig.key === 'billingid' ? styles.activeSortColumn : ''}>
                                Transaction ID
                                {sortConfig.key === 'billingid' && (
                                    <span className={styles.sortIcon}>
                                        {sortConfig.direction === 'ascending' ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => handleSort('totalTransactionCost')} className={sortConfig.key === 'totalTransactionCost' ? styles.activeSortColumn : ''}>
                                Amount
                                {sortConfig.key === 'totalTransactionCost' && (
                                    <span className={styles.sortIcon}>
                                        {sortConfig.direction === 'ascending' ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                                    </span>
                                )}
                            </th>
                            <th>Status</th>
                            <th onClick={() => handleSort('paid')} className={sortConfig.key === 'paid' ? styles.activeSortColumn : ''}>
                                Paid
                                {sortConfig.key === 'paid' && (
                                    <span className={styles.sortIcon}>
                                        {sortConfig.direction === 'ascending' ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => handleSort('totalrefunded')} className={sortConfig.key === 'totalrefunded' ? styles.activeSortColumn : ''}>
                                Refunded
                                {sortConfig.key === 'totalrefunded' && (
                                    <span className={styles.sortIcon}>
                                        {sortConfig.direction === 'ascending' ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => handleSort('billedon')} className={sortConfig.key === 'billedon' ? styles.activeSortColumn : ''}>
                                Date
                                {sortConfig.key === 'billedon' && (
                                    <span className={styles.sortIcon}>
                                        {sortConfig.direction === 'ascending' ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                                    </span>
                                )}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => {
                            const status = getTransactionStatus(transaction);
                            return (
                                <tr key={transaction.billingid}>
                                    <td>#{transaction.billingid}</td>
                                    <td>GHS {transaction.totalTransactionCost}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`]}`}>
                                            ●
                                        </span>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </td>
                                    <td>GHS {transaction.paid}</td>
                                    <td>GHS {transaction.totalrefunded}</td>
                                    <td>{formatDate(transaction.billedon)}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button className={styles.actionButton} title="View Details">
                                                <RiEyeLine size={16} />
                                            </button>
                                            <button className={styles.actionButton} title="Billing History">
                                                <RiHistoryLine size={16} />
                                            </button>
                                            <button className={styles.actionButton} title="Test Results">
                                                <RiTestTubeLine size={16} />
                                            </button>
                                            <button className={styles.actionButton} title="Documents">
                                                <RiFileListLine size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionsViewOnly;