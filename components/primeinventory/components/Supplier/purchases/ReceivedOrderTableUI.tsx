import React, { ChangeEvent, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { currencyFormatter } from '../../../Lib/fetcher';
import SupplierPurchasePaymentInformation from './PaymentInformation';
import { defaultPaymentInformationType } from './ReceivedOrderTable';
import Link from 'next/link';

interface ProductOrder {
    name: string;
    purchaseunit: string;
    quantity: number;
    balance: number;
    quantityReceived: number;
    price: number;
    receiveddate: string;
    expirydate: string;
    brandid: string;
    batchnumber: string;
    pricing: 'unit' | 'absolute';
    totalamount: number;
    stockbrands?: { brandid: string, brand: string }[];
}

interface ReceivedOrderTableUIProps {
    datasource: ProductOrder[];
    handleReceivedField: (ev: React.ChangeEvent<HTMLInputElement>, item: ProductOrder, index: number) => void;
    handlePriceChange: (ev: React.ChangeEvent<HTMLInputElement>, item: ProductOrder) => void;
    taxIncurred: { method: string; amount: number };
    setTaxIncurred: React.Dispatch<React.SetStateAction<{ method: string; amount: number }>>;
    pricing: string;
    setPricing: React.Dispatch<React.SetStateAction<string>>;
    ready: boolean;
    getTotalAmount: () => number;
    getTotalTax: () => number;
    getFinalTotalAmount: () => number;
    handleBatchNumberChange: (ev: React.ChangeEvent<HTMLInputElement>, item: ProductOrder) => void;
    handleStockBrandChange: (ev: React.ChangeEvent<HTMLSelectElement>, item: ProductOrder) => void,
    transactionid: number,
    handleAddNewBrand: (item: ProductOrder) => void,
    handleDateChange: (ev: React.ChangeEvent<HTMLInputElement>, item: ProductOrder, date: string) => void;
    handleChange: (ev: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, target: string) => void,
    paymentInformation: defaultPaymentInformationType,
    onSubmit: () => void,
    handlePricingMethodChange: (item: "unit" | "absolute") => void,
}

export default function ReceivedOrderTableUI({
    datasource,
    handleReceivedField,
    handlePriceChange,
    taxIncurred,
    setTaxIncurred,
    pricing,
    handleStockBrandChange,
    onSubmit,
    handleDateChange,
    setPricing,
    handleChange,
    handleAddNewBrand,
    handlePricingMethodChange,
    paymentInformation,
    ready,
    getTotalAmount,
    transactionid,
    handleBatchNumberChange,
    getTotalTax,
    getFinalTotalAmount,
}: ReceivedOrderTableUIProps) {
    const [isLoadedData, setIsLoadedData] = useState<boolean>(false);


    useEffect(() => {
        if (datasource.length > 0 && !isLoadedData) {
            const pricing = datasource[0]['pricing']
            setPricing(pricing);
            setIsLoadedData(true)
        }
    }, [])

    const handlePricingChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        const newPricing = ev.target.value as "unit" | "absolute";
        handlePricingMethodChange(newPricing);
    };


    const AddStockBrand = () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="rgba(0,0,0,1)"><path fill="none" d="M0 0h24v24H0z"></path><path d="M11 11V7H13V11H17V13H13V17H11V13H7V11H11ZM12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"></path></svg>
    )

    if (datasource.length === 0) {
        return (
            <div className=' bg-secondary-subtle p-3 pls-color' style={{ borderRadius: '6px' }}>
                <div className='my-2' >
                    <h5 className='text-capitalize'>
                        No pending Item to be received. Incase you need update this transaction.Please kindly Click on updates
                    </h5>
                </div>
                <Link className='text-decoration-none btn btn-success' href={`/purchasemanagement/purchases/receive/${transactionid}?isUpdate=true&&isAdmin=validate&&isPending=false&&includebrands=true&&withTransactionAccounting=true`}>Update Transaction </Link>
            </div>
        )
    }

    return (
        <div className="mx-2 my-2 ui">
            <ToastContainer />
            <div className="d-block d-lg-flex justify-content-lg-between">
                <div className="form-row">
                    <select
                        className="custom-select"
                        required
                        value={pricing}
                        onChange={(ev) => { handlePricingChange(ev) }}
                    >
                        <option value="">Select product pricing method</option>
                        <option value="absolute">Absolute</option>
                        <option value="unit">Unit Price</option>
                    </select>
                </div>
                <div className="form-row my-2 my-lg-0">
                    <select
                        className="custom-select"
                        required
                        value={taxIncurred.method}
                        onChange={(ev) => setTaxIncurred({ method: ev.target.value, amount: taxIncurred.amount })}
                    >
                        <option value="">Select tax calculation method</option>
                        <option value="absolute">Absolute</option>
                        <option value="percentage">Percentage (%)</option>
                    </select>
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="my-3 ttable table table-bordered">
                    <thead >
                        <tr>
                            <th style={{ width: "20px !important" }}>#</th>
                            <th>Name</th>
                            <th>Unit</th>
                            <th>Purchase Qty</th>
                            <th>Balance Qty</th>
                            <th>Received Qty</th>
                            <th>Price</th>
                            <th>Receiving Date</th>
                            <th>Expiry Date</th>
                            <th>Brand</th>
                            <th>Batch Number</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datasource.length === 0 ? (
                            <tr>
                                <td colSpan={12} style={{ textAlign: "center" }}>
                                    <h4>No data found</h4>
                                </td>
                            </tr>
                        ) : (
                            datasource.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ width: "20px !important" }}>{index + 1}</td>
                                    <td>{item.name}</td>
                                    <td>{item.purchaseunit}</td>
                                    <td>{item.quantity}</td>
                                    <td>
                                        <input type="number" className="custom-input" value={item.balance} disabled />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="custom-input"
                                            value={item.quantityReceived}
                                            onChange={(ev) => handleReceivedField(ev, item, index)}
                                            disabled={pricing === "" || taxIncurred.method === "" || !ready}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="custom-input"
                                            value={item.price}
                                            onChange={(ev) => handlePriceChange(ev, item)}
                                            disabled={pricing === "" || taxIncurred.method === "" || !ready}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="date"
                                            className="custom-input"
                                            value={item.receiveddate}
                                            onChange={(ev) => handleDateChange(ev, item, 'receiveddate')}
                                            disabled={pricing === "" || taxIncurred.method === "" || !ready}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="date"
                                            className="custom-input"
                                            value={item.expirydate}
                                            onChange={(ev) => handleDateChange(ev, item, 'expirydate')}
                                            disabled={pricing === "" || taxIncurred.method === "" || !ready}
                                        />
                                    </td>
                                    <td>
                                        {item.stockbrands && item.stockbrands.length > 0 ? (
                                            <select
                                                className="custom-input"
                                                value={item.brandid}
                                                onChange={(ev) => handleStockBrandChange(ev, item)}
                                            >
                                                <option value="">Select brand</option>
                                                {item.stockbrands.map((brand, i) => (
                                                    <option key={i} value={brand.brandid}>
                                                        {brand.brand}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <button
                                                className="btn btn-warning py-0 px-4 btn-sm"
                                                onClick={() => handleAddNewBrand(item)}
                                            >
                                                {AddStockBrand()}
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="custom-input"
                                            value={item.batchnumber}
                                            onChange={(ev) => { handleBatchNumberChange(ev, item) }}
                                            disabled={pricing === "" || taxIncurred.method === "" || !ready}
                                        />
                                    </td>
                                    <td style={{ flexWrap: 'wrap', textOverflow: 'clip' }}>
                                        {currencyFormatter.format(item.totalamount || 0)}
                                    </td>
                                    <td>
                                        {item.balance === 0 ? "received" : "pending"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className='pls-color'>
                        <tr>
                            <td style={{ textAlign: "right", textTransform: 'capitalize' }} colSpan={11}>
                               Product Total Amount
                            </td>
                            <td>
                                {currencyFormatter.format(getTotalAmount())}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "right", textTransform: 'capitalize' }} colSpan={11}>
                                Tax Amount
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="custom-input ml-2"
                                    disabled={!taxIncurred.method || datasource.length == 0}
                                    value={taxIncurred.amount}

                                    onChange={(ev) => setTaxIncurred({ ...taxIncurred, amount: Number(ev.target.value) })}
                                    placeholder={taxIncurred.method === "percentage" ? "Tax Percentage" : "Tax Amount"}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={11} style={{ textAlign: "right" }}>Tax:</td>
                            <td>{currencyFormatter.format(getTotalTax())}</td>
                        </tr>
                        <tr>
                            <td colSpan={11} style={{ textAlign: "right" }}>Additonal Charges Incurred:</td>
                            <td>{currencyFormatter.format(paymentInformation.additionalPayment)}</td>
                        </tr>
                        <tr>
                            <td colSpan={11} style={{ textAlign: "right" }}>Final Total:</td>
                            <td>{currencyFormatter.format(getFinalTotalAmount())}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <SupplierPurchasePaymentInformation
                additionalPaymentDescription={paymentInformation.additionalPaymentDescription}
                isDisabled={datasource.length == 0}
                paymentAmount={paymentInformation.paymentAmount}
                paymentMode={paymentInformation.paymentMode}
                additionalPayment={paymentInformation.additionalPayment}
                handleChange={handleChange}
            />
            <div>
                <button onClick={onSubmit} className="btn btn-primary" disabled={pricing === "" || taxIncurred.method === "" || !ready}>
                    Add to Stock
                </button>
            </div>
        </div>
    );
}
