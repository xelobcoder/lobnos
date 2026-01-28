"use client";

import React, { useState, useEffect } from "react";
import {
    RiCalendarLine,
    RiDownloadLine,
    RiFileListLine,
    RiTestTubeLine,
    RiEyeLine,
    RiHistoryLine,
    RiArrowUpSLine,
    RiArrowDownSLine,
    RiMoreFill
} from "@remixicon/react";
import { customFetch } from "../../Auth/customFetch";
import { Dropdown } from "react-bootstrap";
import TransactionDetails from "./TransactionDetails";
import styles from "./TransactionsViewOnly.module.css";
import dayjs from "dayjs";

export interface transactionSummaryBilling {
    billingid: number;
    totalcost: string;
    paid: string;
    payable: string;
    totalrefunded: string;
    discount: string;
    outstanding: string;
    balance: string;
    billedon: string;
    amountIncuredDueTax: number;
    clientstatus: string;
    lastupdated: string;
}

interface Props {
    patientid: number;
}

const TransactionsViewOnly = ({ patientid }: Props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedBillingId, setSelectedBillingId] = useState<number | null>(null);

    const [dateRange, setDateRange] = useState({
        start: "",
        end: ""
    });

    const [transactions, setTransactions] = useState<transactionSummaryBilling[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [sortConfig, setSortConfig] = useState<{
        key: keyof transactionSummaryBilling | null;
        direction: "ascending" | "descending";
    }>({
        key: null,
        direction: "ascending"
    });

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await customFetch(
                    `billing/patient/transactions?patientid=${patientid}`
                );
                setTransactions(response.data);
            } catch (err) {
                setError("Failed to load transactions");
                console.error("Error fetching transactions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [patientid]);

    const getTransactionStatus = (transaction: transactionSummaryBilling) => {
        if (Number(transaction.totalrefunded) > 0)
            return { status: "Refunded", variant: "warning" };

        if (Number(transaction.outstanding) > 0)
            return { status: "Incomplete", variant: "danger" };

        if (Number(transaction.paid) >= Number(transaction.payable))
            return { status: "Success", variant: "success" };

        return { status: "Incomplete", variant: "danger" };
    };

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format("DD-MM-YYYY HH:mm:ss");
    };

    const handleSort = (key: keyof transactionSummaryBilling) => {
        let direction: "ascending" | "descending" = "ascending";

        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }

        setSortConfig({ key, direction });

        const sortedData = [...transactions].sort((a, b) => {
            if (key === "billingid") {
                return direction === "ascending"
                    ? a[key] - b[key]
                    : b[key] - a[key];
            }

            if (key === "billedon") {
                return direction === "ascending"
                    ? new Date(a[key]).getTime() - new Date(b[key]).getTime()
                    : new Date(b[key]).getTime() - new Date(a[key]).getTime();
            }

            if (
                [
                    "totalcost",
                    "paid",
                    "payable",
                    "totalrefunded",
                    "discount",
                    "outstanding",
                    "balance"
                ].includes(key)
            ) {
                return direction === "ascending"
                    ? parseFloat(String(a[key])) - parseFloat(String(b[key]))
                    : parseFloat(String(b[key])) - parseFloat(String(a[key]));
            }

            return 0;
        });

        setTransactions(sortedData);
    };

    if (loading)
        return (
            <div className="text-center py-3">
                <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                ></div>
            </div>
        );

    if (error) return <div className="alert alert-danger">{error}</div>;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = transactions.slice(
        indexOfFirstItem,
        indexOfLastItem
    );
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    return (
        <div className='border rounded p-4 bg-white '>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className={styles.header}>
                    <div className='fw-bold'>Transaction History</div>
                </div>

                <div className="d-flex gap-2">
                    <div className={styles.datePickerGroup}>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={dateRange.start}
                            onChange={(e) =>
                                setDateRange((prev) => ({ ...prev, start: e.target.value }))
                            }
                        />
                        <span className={styles.datePickerSeparator}>-</span>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={dateRange.end}
                            onChange={(e) =>
                                setDateRange((prev) => ({ ...prev, end: e.target.value }))
                            }
                        />
                    </div>

                    <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2">
                        <RiDownloadLine size={16} />
                        <span>Download</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table className="table table-sm table-striped table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th role="button" onClick={() => handleSort("billingid")}>
                                ID{" "}
                                {sortConfig.key === "billingid" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <RiArrowUpSLine />
                                    ) : (
                                        <RiArrowDownSLine />
                                    ))}
                            </th>

                            <th role="button" onClick={() => handleSort("totalcost")}>
                                Total Cost{" "}
                                {sortConfig.key === "totalcost" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <RiArrowUpSLine />
                                    ) : (
                                        <RiArrowDownSLine />
                                    ))}
                            </th>

                            <th role="button" onClick={() => handleSort("paid")}>
                                Paid{" "}
                                {sortConfig.key === "paid" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <RiArrowUpSLine />
                                    ) : (
                                        <RiArrowDownSLine />
                                    ))}
                            </th>

                            <th role="button" onClick={() => handleSort("payable")}>
                                Payable{" "}
                                {sortConfig.key === "payable" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <RiArrowUpSLine />
                                    ) : (
                                        <RiArrowDownSLine />
                                    ))}
                            </th>

                            <th role="button" onClick={() => handleSort("totalrefunded")}>
                                Refunded{" "}
                                {sortConfig.key === "totalrefunded" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <RiArrowUpSLine />
                                    ) : (
                                        <RiArrowDownSLine />
                                    ))}
                            </th>

                            <th role="button" onClick={() => handleSort("discount")}>
                                Discount{" "}
                                {sortConfig.key === "discount" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <RiArrowUpSLine />
                                    ) : (
                                        <RiArrowDownSLine />
                                    ))}
                            </th>

                            <th role="button" onClick={() => handleSort("outstanding")}>
                                Outstanding{" "}
                                {sortConfig.key === "outstanding" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <RiArrowUpSLine />
                                    ) : (
                                        <RiArrowDownSLine />
                                    ))}
                            </th>

                            <th role="button" onClick={() => handleSort("balance")}>
                                Balance{" "}
                                {sortConfig.key === "balance" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <RiArrowUpSLine />
                                    ) : (
                                        <RiArrowDownSLine />
                                    ))}
                            </th>

                            <th role="button" onClick={() => handleSort("billedon")}>
                                Time{" "}
                                {sortConfig.key === "billedon" &&
                                    (sortConfig.direction === "ascending" ? (
                                        <RiArrowUpSLine />
                                    ) : (
                                        <RiArrowDownSLine />
                                    ))}
                            </th>

                            <th>Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentTransactions.map((transaction) => {
                            const status = getTransactionStatus(transaction);

                            return (
                                <tr key={transaction.billingid}>
                                    <td>#{transaction.billingid}</td>
                                    <td>GHS {transaction.totalcost}</td>
                                    <td>GHS {transaction.paid}</td>
                                    <td>GHS {transaction.payable}</td>
                                    <td>GHS {transaction.totalrefunded}</td>
                                    <td>GHS {transaction.discount}</td>
                                    <td>GHS {transaction.outstanding}</td>
                                    <td>GHS {transaction.balance}</td>
                                    <td>{formatDate(transaction.billedon)}</td>

                                    <td>
                                        <span className={`badge bg-${status.variant}`}>
                                            {status.status}
                                        </span>
                                    </td>

                                    <td className="text-center">
                                        <Dropdown>
                                            <Dropdown.Toggle
                                                id="dropdown"
                                                variant="light"
                                                size="sm"
                                            >
                                                <RiMoreFill size={16} />
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item
                                                    className="d-flex align-items-center gap-2"
                                                    onClick={() => {
                                                        setSelectedBillingId(transaction.billingid);
                                                        setShowDetails(true);
                                                    }}
                                                >
                                                    <RiEyeLine size={16} /> View Transaction Details
                                                </Dropdown.Item>

                                                <Dropdown.Item className="d-flex align-items-center gap-2">
                                                    <RiHistoryLine size={16} /> Transaction Payment History
                                                </Dropdown.Item>

                                                <Dropdown.Item className="d-flex align-items-center gap-2">
                                                    <RiTestTubeLine size={16} /> Test Results
                                                </Dropdown.Item>

                                                <Dropdown.Item className="d-flex align-items-center gap-2">
                                                    <RiFileListLine size={16} /> Documents
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, transactions.length)} of{" "}
                    {transactions.length} entries
                </div>

                <div className="btn-group">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showDetails && selectedBillingId && (
                <div className={styles.modalOverlay}>
                    <TransactionDetails
                        billingId={selectedBillingId}
                        onClose={() => {
                            setShowDetails(false);
                            setSelectedBillingId(null);
                        }}
                        tenantId={3}
                        summary={currentTransactions.find(
                            (t) => t.billingid === selectedBillingId
                        )}
                    />
                </div>
            )}
        </div>
    );
};

export default TransactionsViewOnly;
