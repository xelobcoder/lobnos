"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { testPanelBasePath } from "../../../../../lib/testPanelNavigation";
import PrimeTable from "../../../../../components/accessories/Datatables/PrimeTable";
import Loader from "../../../../../components/accessories/Loader";
import { customFetch, customPost } from "../../../../../components/Auth/customFetch";
import TestActions from "../../../../../components/settingsComponents/TestActions";
import MasterListView from "./components/MasterListView";
import * as React from 'react';
import { useApplicationSettings } from "../../../../../components/Auth/useApplicationContext";
import { isSuperAdminRole } from "../../../../../components/Auth/roles";
import TestPanelStaffAccess from "../../../../../components/settingsComponents/TestPanelStaffAccess";

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
    const [activeTab, setActiveTab] = useState<'active' | 'master' | 'access'>('active');
    const [selectedUserTestIds, setSelectedUserTestIds] = useState<Set<number>>(new Set());
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
    const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState<string>('');
    const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
    const [canViewTests, setCanViewTests] = useState(false);
    const [canManageTests, setCanManageTests] = useState(false);
    const [canDelegateAccess, setCanDelegateAccess] = useState(false);
    const [accessError, setAccessError] = useState('');
    const router = useRouter();
    const basePath = testPanelBasePath(usePathname());
    const { applicationsettings } = useApplicationSettings();
    const canDeleteTests = isSuperAdminRole(applicationsettings?.user?.role);
    const BULK_DELETE_PHRASE = 'DELETE USER TESTS';

    useEffect(() => {
        let active = true;
        const loadPanelAccess = async () => {
            try {
                const access = await customFetch('testpanel/my-access');
                if (!access?.success) throw new Error(access?.message || 'Unable to verify test-panel access.');
                if (!active) return;
                setCanViewTests(access.can_view === true);
                setCanManageTests(access.can_manage === true);
                setCanDelegateAccess(access.can_delegate === true);
                if (access.can_view !== true && access.can_delegate === true) setActiveTab('access');
                if (access.can_view !== true && access.can_delegate !== true) {
                    setAccessError('You do not have permission to view test panels.');
                    setLoading(false);
                    return;
                }
                if (access.can_view !== true) {
                    setLoading(false);
                    return;
                }
                const response = await customFetch('testpanel/management/list');
                if (!active) return;
                setData(response?.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Unable to load test-panel access and list:', error);
                if (!active) return;
                setAccessError(error instanceof Error ? error.message : 'Unable to load test panels.');
                setLoading(false);
            }
        };
        void loadPanelAccess();
        return () => { active = false; };
    }, []);

    const deleteCustomTest = async (item: TestPanel): Promise<void> => {
        if (!canDeleteTests) return;
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
                            {canDeleteTests && (
                                <input
                                    type="checkbox"
                                    aria-label={`Select ${value} for deletion`}
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
                            )}
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
                return <TestActions id={id} row={row} canManage={canManageTests} canDelete={canDeleteTests} deleteCustomTest={deleteCustomTest} />;
            }
        }
    ];

    const handleBulkDelete = () => {
        if (!canDeleteTests) return;
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
        if (!canDeleteTests) return;
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
    if (accessError || (!canViewTests && !canDelegateAccess)) return <div className="alert alert-danger" role="alert">{accessError || 'You do not have permission to view test panels.'}</div>;
    return (
        <section>
            <div className="mb-3">
                <ul className="nav nav-tabs" role="tablist">
                    {canViewTests && <li className="nav-item" role="presentation">
                        <button
                            className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveTab('active')}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'active'}
                        >
                            User-Defined List
                        </button>
                    </li>}
                    {canViewTests && <li className="nav-item" role="presentation">
                        <button
                            className={`nav-link ${activeTab === 'master' ? 'active' : ''}`}
                            onClick={() => setActiveTab('master')}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'master'}
                        >
                            Master List
                        </button>
                    </li>}
                    {canDelegateAccess && <li className="nav-item" role="presentation">
                        <button className={`nav-link ${activeTab === 'access' ? 'active' : ''}`} onClick={() => setActiveTab('access')} type="button" role="tab" aria-selected={activeTab === 'access'}>
                            Staff Access
                        </button>
                    </li>}
                </ul>
            </div>
            <div className="tab-content">
                {canViewTests && <div className={`tab-pane ${activeTab === 'active' ? 'active' : ''}`} role="tabpanel">
                    <div className="d-flex justify-content-between mx-2 mb-3">
                        {canDeleteTests && <div className="d-flex gap-2">
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
                        </div>}
                        {canManageTests && <button
                            onClick={() => router.push(`${basePath}/testlist/createcustomtest`)}
                            className="btn btn-dark btn-sm text-capitalize"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M13.0001 10.9999L22.0002 10.9997L22.0002 12.9997L13.0001 12.9999L13.0001 21.9998L11.0001 21.9998L11.0001 12.9999L2.00004 13.0001L2 11.0001L11.0001 10.9999L11 2.00025L13 2.00024L13.0001 10.9999Z"></path>
                            </svg> new test
                        </button>}
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
                </div>}
                {canViewTests && <div className={`tab-pane ${activeTab === 'master' ? 'active' : ''}`} role="tabpanel">
                    <MasterListView isVisible={activeTab === 'master'} canManage={canManageTests} />
                </div>}
                {canDelegateAccess && <div className={`tab-pane ${activeTab === 'access' ? 'active' : ''}`} role="tabpanel">
                    <TestPanelStaffAccess isVisible={activeTab === 'access'} />
                </div>}
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
