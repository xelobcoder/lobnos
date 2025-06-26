import React from 'react';
import RefundAdmin from '../../../../../components/Billing/Refund/RefundAdmin';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { RiErrorWarningLine } from '@remixicon/react';

export default async function RefundAdminPage({ params, searchParams }: {
    params: { employeeid: number },
    searchParams?: {
        status: string,
    }
}) {
    let result: any = [];
    const { employeeid } = await params;
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
        <div className="container-fluid mt-4" style={{ overflowX: "auto" }}>
            <h2 className="mb-4">Refund Administration</h2>
            <RefundAdmin initData={result} employeeid={employeeid} currentStatus={status || 'pending'} />
        </div>
    );
}
