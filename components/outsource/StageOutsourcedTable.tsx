"use client";
import React from 'react';
import PrimeTable from '../accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../Auth/customFetch';
import { Test } from '../../app/operations/laboratory/outsourced/[stage]/page';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import { ToastContainer, toast } from 'react-toastify';

export default function StageOutsourcedTable({ data, stage }: {
    data: Test[], stage: "resolved" | "unresolved"
}) {
    const employeeid = useApplicationSettings().applicationsettings.user.employeeid;

    const handleResolveTest = async (serviceid: string) => {
        try {
            const response = await customPost(`outsourced/testpanel/resolve`, 'POST', { serviceid, employeeid });
            const { status } = response;
            if (status === true) {
                toast.success('Test marked as resolved.', { position: 'top-center', theme: 'colored' });
            } else {
                toast.error('Failed to resolve the test.', { position: 'top-center', theme: 'colored' });
            }
        } catch (error) {
            toast.error('Failed to resolve the test.', { position: 'top-center', theme: 'colored' });
        }
    };

    const columns = [
        { Header: "Test ID", accessor: "testid" },
        { Header: "Service ID", accessor: "serviceid" },
        { Header: "Billing ID", accessor: "billingid" },
        { Header: "Name", accessor: "name" },
        { Header: "Test Price", accessor: "testprice" },
        { Header: "Organization Type", accessor: "organizationType" },
        { Header: "Outsourcing Organization Name", accessor: "outsourcingorganizationName" },
        { Header: "Requested By", accessor: "requestedby" },
        { Header: "Completed By", accessor: "completedby" },
        {
            Header: "Action", accessor: "action", Cell: ({ row }: any) => (
                <button
                    onClick={() => handleResolveTest(row.original.serviceid)}
                    disabled={stage === 'resolved'}
                    className="btn btn-secondary btn-sm d-flex align-items-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Resolve Test
                </button>
            )
        }
    ];

    const handleSeverSideProcessing = async (pagination: { count: number, page: number }) => {
        try {
            const { count, page } = pagination;
            const response: Test[] = await customFetch(`outsourced/testpanel/${stage}?count=${count}&page=${page}`);

            if (response && Array.isArray(response)) {
                return { result: response, error: false };
            }
            return { result: [], error: false };
        } catch (err) {
            return { result: [], error: true };
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="mb-3 d-flex align-items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-muted small mb-0">
                    This table displays the list of outsourced tests. You can resolve tests by clicking the &quot;Resolve Test&quot; button.
                </p>
            </div>

            <PrimeTable
                column={columns}
                data={data}
                filtering={false}
                serverSideFiltering={true}
                handleSeverSideProcessing={handleSeverSideProcessing}
            />

            <ToastContainer className="small" />
        </div>
    );
}