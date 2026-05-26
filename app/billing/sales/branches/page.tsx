
'use client';
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { plsEncryption } from '../../../../lib/encryption';
import dayjs from 'dayjs';


interface Branch {
    name: string;
    branchid: number;
}


export default function BillingBranchesPage() {
    const router = useRouter();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [error, setError] = useState<string | null>(null);
    const currentDate = dayjs().format('YYYY-MM-DD');

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await customFetch(`branches`);
                if (!response || !response.result) {
                    throw new Error('No branches found');
                }
                const fetchedBranches = response.result;
                setBranches(fetchedBranches);

                if (fetchedBranches.length === 1) {
                    const branch = fetchedBranches[0];
                    router.push(`/billing/sales/branches/${plsEncryption(branch.branchid.toString())}?from=${currentDate}&to=${currentDate}&&isOpenSideBarShow=false`);
                }
            } catch (err) {
                setError('Error loading branches. Please try again later.');
            }
        };
        fetchBranches();
    }, [router, currentDate]);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h5 className="text-2xl font-bold mb-4">Branches</h5>
            <div className='list-group pls-color'>
                {Array.isArray(branches) && branches.length > 0 && branches.map((branch: Branch) => (
                    <div key={branch.branchid} className="text-capitalize p-3 bg-secondary-subtle my-2 br-5">
                        <Link href={`/billing/sales/branches/${plsEncryption(branch.branchid.toString())}?from=${currentDate}&to=${currentDate}&&isOpenSideBarShow=false`}>
                            {branch.name}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}