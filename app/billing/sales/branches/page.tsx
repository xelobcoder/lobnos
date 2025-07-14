import React from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import Link from 'next/link';
import { plsEncryption } from '../../../../lib/encryption';
import dayjs from 'dayjs';

interface Branch {
    name: string;
    branchid: number;
}

export default async function BillingBranchesPage() {
    try {
        const branches = await customFetch(`branches`);
        if (!branches || !branches.result) {
            throw new Error('No branches found');
        }

        const currentDate = dayjs().format('YYYY-MM-DD');

        return (
            <div>
                <h5 className="text-2xl font-bold mb-4">Branches</h5>
                <div className='list-group pls-color'>
                    {branches.result.map((branch: Branch) => (
                        <div key={branch.branchid} className="text-capitalize p-3 bg-secondary-subtle my-2 br-5">
                            <Link href={`/billing/sales/branches/${plsEncryption(branch.branchid.toString())}?from=${currentDate}&to=${currentDate}`}>
                                {branch.name}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        );
    } catch (error) {
        return <div>Error loading branches. Please try again later.</div>;
    }
}