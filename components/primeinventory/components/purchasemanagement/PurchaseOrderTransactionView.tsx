import React from 'react';
import { ProductOrder } from '../../app/purchasemanagement/purchases/receive/[transactions]/page';
import NoDataAvailable from '../accessories/NoDataAvailable';
import PurchasesAccountingTable from '../Supplier/purchases/PurchasesAccountingTable';
import { currencyFormatter } from '../../Lib/fetcher';
import '../../styles/prime-table.css'
export type PaymentSummaryProps = {
    orderTransactionid: number;
    taxAmount: number;
    method: string;
    debit: number;
    credit: number;
    id: number;
    paymentmode: string;
    amountpaid: number;
    description: string;
    additionalAmount: number;
    amount: number;
};

type PurchaseOrderTransactionViewProps = {
    transactionid: number;
    invoice: {
        data: ProductOrder[];
        accountInfo: any;
        paymentInfo: PaymentSummaryProps;
    };
};

export default function PurchaseOrderTransactionView({ transactionid, invoice }: PurchaseOrderTransactionViewProps) {
    const { data, accountInfo, paymentInfo } = invoice;

    if (data.length === 0) return <NoDataAvailable message="No data found for this transaction" />;

    return (
        <div>
            <div className='d-flex justify-content-between'>
                <h4 className=" bg-secondary-subtle p-2 pls-color" style={{ borderRadius: '10px ' }}>Transaction Detail</h4>
                <div className='d-flex justify-content-end my-2'>
                    <button className='btn btn-sm btn-danger'>Download Pdf</button>
                </div>
            </div>
            <div className="table-responsive bt-wrapper my-4">
                <table className="table ttable bt table-bordered">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Product Name</th>
                            <th>Brand</th>
                            <th>Batch Number</th>
                            <th>Supplier</th>
                            <th>Purchase Unit</th>
                            <th>Qty</th>
                            <th>Qty Received</th>
                            <th>Balance</th>
                            <th>Status</th>
                            <th>Received Date</th>
                            <th>Expiry Date</th>
                            <th>Transaction Date</th>
                            <th>pricing</th>
                            <th>Price</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody style={{ cursor: 'pointer' }}>
                        {data.map((item: ProductOrder, index: number) => (
                            <tr key={item.productordersid}>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td>{item.brand}</td>
                                <td>{item.batchnumber}</td>
                                <td>{item.suppliername}</td>
                                <td>{item.purchaseunit}</td>
                                <td>{item.quantity}</td>
                                <td>{item.quantityReceived}</td>
                                <td>{item.balance}</td>
                                <td>{item.status}</td>
                                <td>{item.receiveddate ? new Date(item.receiveddate).toLocaleDateString() : 'N/A'}</td>
                                <td>{item.expirydate ? new Date(item.expirydate).toLocaleDateString() : 'N/A'}</td>
                                <td>{new Date(item.transactiondate).toLocaleDateString()}</td>
                                <th>{item.pricing}</th>
                                <td>{currencyFormatter.format(item.price)}</td>
                                <td>{currencyFormatter.format(item.totalamount)}</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={15} className="text-right">Amount Paid</td>
                            <td >{currencyFormatter.format(paymentInfo.amountpaid)}</td>
                        </tr>
                        <tr>
                            <td colSpan={15} className="text-right">Payment Mode</td>
                            <td >{paymentInfo.paymentmode}</td>
                        </tr>
                        <tr>
                            <td colSpan={15} className="text-right">Tax Amount</td>
                            <td >{currencyFormatter.format(paymentInfo.taxAmount)}</td>
                        </tr>
                        <tr>
                            <td colSpan={15} className="text-right">Debit (GHS)</td>
                            <td >{currencyFormatter.format(paymentInfo.debit)}</td>
                        </tr>
                        <tr>
                            <td colSpan={15} className="text-right">Credit (GHS)</td>
                            <td >{currencyFormatter.format(paymentInfo.credit)}</td>
                        </tr>
                        <tr>
                            <td colSpan={15} className="text-right">Additional Charges</td>
                            <td >{currencyFormatter.format(paymentInfo.additionalAmount)}</td>
                        </tr>
                        <tr>
                            <td colSpan={15} className="text-right">Description</td>
                            <td >{paymentInfo.description}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div >
                <PurchasesAccountingTable entries={accountInfo} />
            </div>
        </div>
    );
}
