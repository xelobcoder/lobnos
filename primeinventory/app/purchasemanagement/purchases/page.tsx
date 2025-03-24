import React from 'react'
import { customFetch } from '../../../Lib/fetcher'
import PurchasesTransactionSummary, { Order } from '../../../components/purchasemanagement/PurchasesTransactionSummaryList';

export default async function PurchaseMainPageIndex() {
    let data: Order[] = [];
    try {
        const response = await customFetch(`orders/transactions-summary?status=pending&&page=1&&count=10`);
        if (response && Array.isArray(response)) {
            data = response;
        }
    } catch (err) {
        data = []
    }

    
    return (
        <div>
            <PurchasesTransactionSummary summary={data} />
        </div>
    )
}
