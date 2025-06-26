"use client";

import React, { useEffect, useState } from "react";
import { customFetch, customPost } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiListCheck2 } from "@remixicon/react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";

interface Branch {
    branchid: number;
    name: string;
}

interface PendingExpense {
    id: number;
    name: string;
    description?: string;
    date: string;
    amount: number;
    employee_username: string;
    category_name: string | null;
}

const currencyFormatter = new Intl.NumberFormat(undefined, { style: "currency", currency: "GHS", maximumFractionDigits: 2 });

export default function PendingExpensesList() {
    const [data, setData] = useState<PendingExpense[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [branchid, setBranchid] = useState<number | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<PendingExpense | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const { user } = useApplication();
    const employeeid = user?.employeeid;

    useEffect(() => {
        async function fetchBranches() {
            try {
                const response = await customFetch("branches");
                if (response && Array.isArray(response.result)) {
                    setBranches(response.result);
                    if (response.result.length > 0) setBranchid(response.result[0].branchid);
                }
            } catch { }
        }
        fetchBranches();
    }, []);

    const fetchData = async () => {
        if (!branchid) return;
        setLoading(true);
        setError(null);
        try {
            const endpoint = `expenses-analytics/pending-expenses-list?branchid=${branchid}`;
            const response = await customFetch(endpoint);
            if (response && Array.isArray(response)) {
                setData(response);
            } else {
                setError("Invalid data format received");
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (branchid && employeeid) {
            fetchData();
        }
        // eslint-disable-next-line
    }, [branchid, employeeid]);

    const handleValidateClick = (expense: PendingExpense) => {
        setSelectedExpense(expense);
        setShowModal(true);
        setActionError(null);
    };

    const handleValidationAction = async (status: "approved" | "rejected", info?: string) => {
        if (!selectedExpense) return;
        setActionLoading(true);
        setActionError(null);
        try {
            const postData = {
                expenseid: selectedExpense.id,
                employeeid: user?.employeeid,
                status: status,
                information: info || '',
                tenantId: user?.tenantId,
                branchid: branchid
            };
            const response = await customPost(`expense/pending/decision?branchid=${branchid}`, 'POST', postData);
            if (response && typeof response.status === "boolean" && response.status) {
                setShowModal(false);
                fetchData();
                toast.success(`Expense ${status === "approved" ? "approved" : "rejected"} successfully!`);
            }
        } catch (err: any) {
            setActionError(err.message || "Failed to update expense");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="card" style={{ borderRadius: '0.75rem' }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                    <RiListCheck2 size={22} className="me-2 flex-shrink-0" />
                    Pending Expenses List
                </h2>
                <div className="mt-3 d-flex flex-wrap gap-3">
                    <div>
                        <label className="me-2">Branch:</label>
                        <select
                            className="form-select"
                            value={branchid ?? ''}
                            onChange={e => setBranchid(Number(e.target.value))}
                            style={{ minWidth: 180 }}
                        >
                            {branches.map(branch => (
                                <option key={branch.branchid} value={branch.branchid}>{branch.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="btn btn-primary ms-2 d-flex align-items-center gap-2 px-3 py-1 btn-sm"
                        onClick={fetchData}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <RiLoader4Line size={16} className="animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <RiListCheck2 size={15} />
                                Load Data
                            </>
                        )}
                    </button>
                </div>
            </div>
            <div className="card-body p-3 p-md-4">
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                        <RiLoader4Line size={48} className="animate-spin mb-3" />
                        <p className="text-muted">Loading data...</p>
                    </div>
                ) : error ? (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                        <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                        <h5 className="fw-medium mb-1">Error Loading Data</h5>
                        <p className="text-muted px-3">{error}</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                        <RiInbox2Line size={48} className="mb-3 text-muted" />
                        <h5 className="fw-medium mb-1">No Data Available</h5>
                        <p className="text-muted px-3">
                            No pending expenses for the selected branch.
                        </p>
                    </div>
                ) : (
                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-sm table-hover table-striped small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">ID</th>
                                    <th scope="col" className="py-2">Name</th>
                                    <th scope="col" className="py-2">Date</th>
                                    <th scope="col" className="py-2">Amount</th>
                                    <th scope="col" className="py-2">Employee</th>
                                    <th scope="col" className="py-2">Category</th>
                                    <th scope="col" className="py-2">Validation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry) => (
                                    <tr key={entry.id}>
                                        <td className="py-2">{entry.id}</td>
                                        <td className="py-2">{entry.name}</td>
                                        <td className="py-2">{new Date(entry.date).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                                        <td className="py-2">{currencyFormatter.format(entry.amount)}</td>
                                        <td className="py-2">{entry.employee_username}</td>
                                        <td className="py-2">{entry.category_name || <span className="text-muted">N/A</span>}</td>
                                        <td className="py-2">
                                            <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleValidateClick(entry)}>
                                                Validate
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="border-0 shadow rounded-4">
                    <Modal.Header closeButton className="bg-body-tertiary border-0 rounded-top-4 pb-2">
                        <Modal.Title className="fs-5 fw-semibold text-body-emphasis">
                            <span className="me-2">📝</span>Validate Pending Expense
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pt-3 pb-0 px-4">
                        {selectedExpense && (
                            <div className="mb-3">
                                <div className="mb-2"><span className="fw-medium text-muted">Name:</span> <span className="fw-semibold">{selectedExpense.name}</span></div>
                                <div className="mb-2"><span className="fw-medium text-muted">Description:</span> <span className="fw-semibold">{selectedExpense.description || <span className="text-muted">N/A</span>}</span></div>
                                <div className="mb-2"><span className="fw-medium text-muted">Amount:</span> <span className="fw-semibold text-success">{currencyFormatter.format(selectedExpense.amount)}</span></div>
                                <div className="mb-2"><span className="fw-medium text-muted">Employee:</span> <span className="fw-semibold">{selectedExpense.employee_username}</span></div>
                                <div className="mb-2"><span className="fw-medium text-muted">Category:</span> <span className="fw-semibold">{selectedExpense.category_name || <span className="text-muted">N/A</span>}</span></div>
                                <div className="mb-2"><span className="fw-medium text-muted">Date:</span> <span className="fw-semibold">{new Date(selectedExpense.date).toLocaleString()}</span></div>
                            </div>
                        )}
                        {actionError && <div className="alert alert-danger mt-2">{actionError}</div>}
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0 pb-4 px-4 d-flex justify-content-end gap-2">
                        <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={actionLoading} className="rounded-pill px-4">
                            Cancel
                        </Button>
                        <Button variant="outline-danger" onClick={() => handleValidationAction("rejected")} disabled={actionLoading} className="rounded-pill px-4">
                            Reject
                        </Button>
                        <Button variant="success" onClick={() => handleValidationAction("approved")} disabled={actionLoading} className="rounded-pill px-4">
                            Accept
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
            <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .table-responsive thead.sticky-top th {
                    border-bottom: 2px solid var(--bs-border-color); 
                }
                .modal-content.rounded-4 { border-radius: 1.5rem !important; }
                .modal-header.rounded-top-4 { border-top-left-radius: 1.5rem !important; border-top-right-radius: 1.5rem !important; }
                .modal-footer { background: var(--bs-body-bg); }
            `}</style>
        </div>
    );
}
