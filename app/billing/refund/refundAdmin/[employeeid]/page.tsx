import React from 'react';
import RefundAdmin from '../../../../../components/Billing/Refund/RefundAdmin';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { RiErrorWarningLine } from '@remixicon/react';


export default async function RefundAdminPage(
    props: {
        params: Promise<{ employeeid: string }>,
        searchParams?: Promise<{
            status: string,
        }>
    }
) {
    const searchParams = await props.searchParams;
    let result: any = [];
    const { employeeid } = await props.params;
    const status = searchParams?.status || 'pending';

    try {
        const response = await customFetch(
            `billing/refund/details/status?status=${status}&&employeeid=${employeeid}&&page=1&&count=10`
        );
        if (response && Array.isArray(response?.result)) {
            result = response?.result || [];
        }
    } catch (err) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <RiErrorWarningLine className="me-2" size={24} />
                    <div>
                        Error Loading Refund Data. Please try again later.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-1" style={{ overflowX: "auto", fontSize: '0.95rem' }}>
            <h2 className="mb-4" style={{ fontSize: '1.2rem' }}>Refund Administration</h2>
            <RefundAdmin initData={result}  currentStatus={status || 'pending'} />
        </div>
    );
}
