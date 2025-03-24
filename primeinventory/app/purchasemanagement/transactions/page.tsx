import SuppliersTansactionList from "../../../components/Supplier/TransactionsList";
import { customFetch } from "../../../Lib/fetcher";

interface Transaction {
    requestedby: string;
    receivedby: string;
    orderTransactionid: string;
    orderdate: string;
}

const endpointDefault = `orders/transactions?count=20&page=1&paginate=true`;

export default async function SupplierManagementSupplyTransactions() {
    let TransactionDetails: Transaction[] = [];
    try {
        const response = await customFetch(endpointDefault);
        if (Array.isArray(response)) {
            TransactionDetails = response;
        }
    } catch (error) {
        console.error("Error fetching transaction details:", error);
    }

    return <SuppliersTansactionList data={TransactionDetails} />;
}
