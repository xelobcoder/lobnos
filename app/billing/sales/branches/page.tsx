import React from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import Link from 'next/link';
import { plsEncryption } from '../../../../lib/encryption';


export default async function BillingBranchesPage() {
    const branches = await customFetch(`branches`);

    return (
        <div >
            <h5 className="text-2xl font-bold mb-4">Branches</h5>
            <div className='list-group pls-color'>
                {branches.result.map((branch: { name: string, branchid: number }) => (
                    <div key={branch.branchid} className="text-capitalize  p-3 bg-secondary-subtle my-2 br-5 ">
                        <Link href={`/billing/sales/branches/${plsEncryption(branch.branchid.toString())}`}>
                            {branch.name}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}