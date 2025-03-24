import { customFetch } from '../../../../../Lib/fetcher';
import ReceiveOrdersAcessoryPage from '../../../../../components/Supplier/purchases/receiveOrdersAcessoryPage';
import PurchaseOrderTransactionView from '../../../../../components/purchasemanagement/PurchaseOrderTransactionView';

interface StockBrand {
    stockid: number;
    [key: string]: any;
}

interface Product {
    stockid: number;
    stockbrands?: StockBrand[];
    brandid: number | string;
    expirydate: string;
    batchnumber: string;
    receiveddate: string;
    status: string;
    [key: string]: any;
}

export interface ProductOrder {
    productordersid: number;
    stockid: number;
    orderTransactionid: number;
    name: string;
    supplierid: number;
    suppliername: string;
    purchaseunit: string;
    date: string;
    quantity: number;
    received: 'TRUE' | 'FALSE';
    quantityReceived: number;
    batchnumber: string;
    balance: number;
    expirydate: string;
    receiveddate: string;
    status: string;
    price: number;
    totalamount: number;
    productused: 'TRUE' | 'FALSE';
    pricing: 'unit' | "absolute"
    brand: number;
    expiredDisposed: any;
    disposaldate: any;
    requestedby: number;
    receivedby: number | null;
    transactiondate: string;
    stockbrands: any[];
    brandid: string;
}



type SearchParams = {
    isUpdate: boolean,
    isAdmin: string,
    includebrands: boolean,
    status: "completed" | "pending" | "incompleted"
    withTransactionAccounting: boolean,
}
export default async function ReceiveOrdersPage({ params, searchParams }: {
    params: Promise<{ transactions: number }>,
    searchParams: Promise<SearchParams>
}) {
    const { transactions } = await params;
    const { isAdmin, isUpdate = false, status = 'pending', includebrands = true, withTransactionAccounting } = await searchParams
    let datasource: ProductOrder[] = [];;
    let invoice;

    if (transactions) {
        try {
            const response = await customFetch(`orders?orderTransactionid=${transactions}&&includebrands=${includebrands}&&status=${status}&&isUpdate=${isUpdate}&&isAdmin=${isAdmin}&&withTransactionAccounting=${withTransactionAccounting}`);
            const products = response?.result;
            const { orders, accountingInformation, paymentSummary } = products;
            invoice = { data: orders, accountInfo: accountingInformation, paymentInfo: paymentSummary };
        } catch (err) {
            datasource = [];
        }
    }


    if (status == "completed" && withTransactionAccounting && withTransactionAccounting.toString() == "true" && isUpdate.toString() == 'false') {
        return (
            <div>
                <PurchaseOrderTransactionView
                    transactionid={transactions}
                    invoice={invoice} />
            </div>
        )
    }



    return (
        <ReceiveOrdersAcessoryPage invoice={invoice} transactionid={transactions} />
    );
}
