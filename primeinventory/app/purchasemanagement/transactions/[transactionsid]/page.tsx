import { customFetch } from "../../../../Lib/fetcher";
import TransactionDetailSuppys from "../../../../components/Supplier/TransactionDetailSuppys";

export interface ProductTransactionDetail {
    orderTransactionid: string;
    name: string;
    suppliername: string;
    purchaseunit: string;
    date: string;
    quantity: number;
    received: string;
    totalamount: number;
    details: string;
    quantityReceived: number;
    batchnumber: string;
    balance: number;
    expirydate: string;
    receiveddate: string;
    status: string;
    price: number;
    productused: string;
    pricing: string;
    brand: string;
    expiredDisposed: string;
    disposaldate: string;
    requestedby: string;
    receivedby: string;
    transactiondate: string;
}

export default async function ViewTransactionsDetailPage({ params }: { params: { transactionsid: number } }) {
    const { transactionsid } = await params;
    let data: ProductTransactionDetail[] = [];
    try {
        if (transactionsid) {
            const response = await customFetch(`orders?orderTransactionid=${transactionsid}`);
            const { result } = response;
            if (Array.isArray(result.products)) {
                data = result.products;
            }
        }
    } catch (error) {
        console.error("Error fetching transaction details:", error);
    }

    return <TransactionDetailSuppys data={data} transactionid={transactionsid} />;
}
