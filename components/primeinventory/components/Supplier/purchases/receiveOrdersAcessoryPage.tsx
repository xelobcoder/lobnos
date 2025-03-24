import React from 'react'
import { ToastContainer } from 'react-toastify';
import ReceivedOrderTable from './ReceivedOrderTable';
import { ProductOrder } from '../../../app/purchasemanagement/purchases/receive/[transactions]/page'
import { PaymentSummaryProps } from '../../purchasemanagement/PurchaseOrderTransactionView';

export type PurchaseInvoiceTypes = {
    data: ProductOrder[],
    accountInfo: any
    paymentInfo: PaymentSummaryProps
}

export default async function ReceiveOrdersAcessoryPage({ invoice, transactionid }: {invoice:PurchaseInvoiceTypes , transactionid: number }) {

    return (
        <>
            <ToastContainer theme="colored" position="top-center" className="text-sm" />
            <ReceivedOrderTable
                transactionid={transactionid}
                invoice={invoice}
            />
        </>
    );
}
