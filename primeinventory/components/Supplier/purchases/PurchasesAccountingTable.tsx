import React from 'react';
import { currencyFormatter } from '../../../Lib/fetcher';

type AccountingEntry = {
    id: number;
    transactionId: string;
    date: string;
    description: string;
    accountId: string;
    subAccountId: string;
    type: 'debit' | 'credit';
    amount: number;
    category: string;
    accountName: string;
    normalBalance: string;
    subAccountName: string;
};

type AccountingTableProps = {
    entries: AccountingEntry[];
};

const PurchasesAccountingTable: React.FC<AccountingTableProps> = ({ entries }) => {
    if (entries.length === 0) {
        return <div className="text-center text-muted mt-4">No accounting entries available.</div>;
    }

    return (
        <div className="mt-4">
            <h4 className=" bg-secondary-subtle p-3 pls-color" style={{borderRadius:'10px '}}>Two-Way Accounting Table</h4>
            <div className="table-responsive bt-wrapper">
                <table className="ttable bt">
                    <thead >
                        <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Account</th>
                            <th>Sub-Account</th>
                            <th>Category</th>
                            <th>Debit (GHS)</th>
                            <th>Credit (GHS)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, index) => (
                            <tr key={entry.id}>
                                <td>{index + 1}</td>
                                <td>{new Date(entry.date).toLocaleDateString()}</td>
                                <td>{entry.description}</td>
                                <td>{entry.accountName}</td>
                                <td>{entry.subAccountName}</td>
                                <td>{entry.category}</td>
                                <td>
                                    {entry.type === 'debit' ? currencyFormatter.format(entry.amount) : '-'}
                                </td>
                                <td>
                                    {entry.type === 'credit' ? currencyFormatter.format(entry.amount) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PurchasesAccountingTable;
