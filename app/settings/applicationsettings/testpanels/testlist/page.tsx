"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PrimeTable from "../../../../../components/accessories/Datatables/PrimeTable";
import Loader from "../../../../../components/accessories/Loader";
import { customFetch, customPost } from "../../../../../components/Auth/customFetch";
import TestActions from "../../../../../components/settingsComponents/TestActions";
import MasterListView from "./components/MasterListView";
import * as React from 'react';

interface TestPanel {
    id: number;
    name: string;
    price: number;
    qty_required: number;
    unit: string;
    shorttext?: string;
}

interface Column {
    Header: string;
    accessor: string | ((row: TestPanel) => any);
    Cell?: ({ row, value }: { row: { original: TestPanel }, value: any }) => React.JSX.Element;
}

export default function TestListDisplay() {
    const [data, setData] = useState<TestPanel[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'active' | 'master'>('active');
    const [selectedUserTestIds, setSelectedUserTestIds] = useState<Set<number>>(new Set());
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
    const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState<string>('');
    const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
    const router = useRouter();
    const BULK_DELETE_PHRASE = 'DELETE USER TESTS';

    useEffect(() => {
        customFetch('testpanel/list/bulk')
            .then((response) => {
                setData(response?.data || []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                setData([]);
            });
    }, []);

    const deleteCustomTest = async (item: TestPanel): Promise<void> => {
        const { id } = item;
        if (!id) return;
        const confirmation = confirm(`Are you sure you want to delete this test? This will delete all information associated with the test.`);
        if (confirmation) {
            const response = await customPost(`testpanel/list?testid=${id}`, 'DELETE', {});
            if (response.status === "success") {
                setLoading(true);
                setData((prev) => prev.filter((a) => a.id !== id));
                setLoading(false);
            }
        }
    };

    const columns: Column[] = [
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row, value }: { row: { original: TestPanel }, value: string }) => (
                <div className="d-flex align-items-center gap-2">
                    <input
                        type="checkbox"
                        checked={selectedUserTestIds.has(row.original.id)}
                        onChange={(e) => {
                            const updated = new Set(selectedUserTestIds);
                            if (e.target.checked) {
                                updated.add(row.original.id);
                            } else {
                                updated.delete(row.original.id);
                            }
                            setSelectedUserTestIds(updated);
                        }}
                    />
                    <span className="fw-bold text-uppercase">{value} {row.original.shorttext ? `(${row.original.shorttext})` : ""}</span>
                </div>
            )
        },
        {
            Header: 'Price',
            accessor: 'price',
        },
        {
            Header: 'Sample Qty',
            accessor: 'qty_required',
            Cell: ({ row, value }: { row: { original: TestPanel }, value: number }) => (
                <div>{value} {row.original.unit}</div>
            )
        },
        {
            Header: 'Action',
            accessor: 'action',
            Cell: ({ row }: { row: { original: TestPanel } }) => {
                const { id } = row.original;
                return <TestActions id={id} row={row} deleteCustomTest={deleteCustomTest} />;
            }
        }
    ];

    const handleBulkDelete = () => {
        if (selectedUserTestIds.size === 0) {
            alert('Please select at least one user-defined test to delete.');
            return;
        }
        setShowBulkDeleteModal(true);
    };

    const allUserTestsSelected = data.length > 0 && data.every((item) => selectedUserTestIds.has(item.id));

    const handleToggleSelectAll = () => {
        if (allUserTestsSelected) {
            setSelectedUserTestIds(new Set());
            return;
        }

        setSelectedUserTestIds(new Set(data.map((item) => item.id)));
    };

    const confirmBulkDelete = async () => {
        const selectedTests = data.filter((item) => selectedUserTestIds.has(item.id));
        if (selectedTests.length === 0) {
            alert('No selected tests found.');
            return;
        }

        if (bulkDeleteConfirmText.trim() !== BULK_DELETE_PHRASE) {
            alert(`Type ${BULK_DELETE_PHRASE} to continue.`);
            return;
        }

        setIsBulkDeleting(true);
        try {
            const selectedIds = selectedTests.map((item) => item.id).join(',');
            const response = await customPost(`testpanel/list?testid=${selectedIds}`, 'DELETE', {});
            const isSuccess = response?.status === 'success' || response?.status === true;

            if (isSuccess) {
                setData((prev) => prev.filter((item) => !selectedUserTestIds.has(item.id)));
                setSelectedUserTestIds(new Set());
                alert(`Deleted ${selectedTests.length} test(s) successfully.`);
            } else {
                alert(response?.message || 'Bulk delete failed.');
            }
        } catch (error) {
            alert('Bulk delete failed. Please try again.');
        } finally {
            setIsBulkDeleting(false);
            setBulkDeleteConfirmText('');
            setShowBulkDeleteModal(false);
        }
    };

    if (isLoading) return <Loader />;
    return (
        <section>
            <div className="mb-3">
                <ul className="nav nav-tabs" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button
                            className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveTab('active')}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'active'}
                        >
                            User-Defined List
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button
                            className={`nav-link ${activeTab === 'master' ? 'active' : ''}`}
                            onClick={() => setActiveTab('master')}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'master'}
                        >
                            Master List
                        </button>
                    </li>
                </ul>
            </div>
            <div className="tab-content">
                <div className={`tab-pane ${activeTab === 'active' ? 'active' : ''}`} role="tabpanel">
                    <div className="d-flex justify-content-between mx-2 mb-3">
                        <div className="d-flex gap-2">
                            <button
                                onClick={handleToggleSelectAll}
                                disabled={data.length === 0}
                                className="btn btn-outline-secondary btn-sm text-capitalize"
                            >
                                {allUserTestsSelected ? 'Clear Selection' : `Select All (${data.length})`}
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={selectedUserTestIds.size === 0}
                                className="btn btn-outline-danger btn-sm text-capitalize"
                            >
                                Delete Selected ({selectedUserTestIds.size})
                            </button>
                        </div>
                        <button
                            onClick={() => router.push("/settings/applicationsettings/testpanels/testlist/createcustomtest")}
                            className="btn btn-dark btn-sm text-capitalize"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M13.0001 10.9999L22.0002 10.9997L22.0002 12.9997L13.0001 12.9999L13.0001 21.9998L11.0001 21.9998L11.0001 12.9999L2.00004 13.0001L2 11.0001L11.0001 10.9999L11 2.00025L13 2.00024L13.0001 10.9999Z"></path>
                            </svg> new test
                        </button>
                    </div>
                    <div>
                        <PrimeTable
                            serverSideFiltering={true}
                            filtering={true}
                            handleSeverSideProcessing={null}
                            column={columns}
                            data={data}
                        />
                    </div>
                </div>
                <div className={`tab-pane ${activeTab === 'master' ? 'active' : ''}`} role="tabpanel">
                    <MasterListView isVisible={activeTab === 'master'} />
                </div>
            </div>

            {showBulkDeleteModal && (
                <div className="modal d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Bulk Delete</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowBulkDeleteModal(false);
                                        setBulkDeleteConfirmText('');
                                    }}
                                />
                            </div>
                            <div className="modal-body">
                                <p>
                                    You are about to delete <strong>{selectedUserTestIds.size}</strong> user-defined test(s).
                                </p>
                                <p className="text-danger mb-2">This action cannot be undone.</p>
                                <label className="form-label">Type <strong>{BULK_DELETE_PHRASE}</strong> to continue</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={bulkDeleteConfirmText}
                                    onChange={(e) => setBulkDeleteConfirmText(e.target.value)}
                                    placeholder={BULK_DELETE_PHRASE}
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => {
                                        setShowBulkDeleteModal(false);
                                        setBulkDeleteConfirmText('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    disabled={isBulkDeleting || bulkDeleteConfirmText.trim() !== BULK_DELETE_PHRASE}
                                    onClick={confirmBulkDelete}
                                >
                                    {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
