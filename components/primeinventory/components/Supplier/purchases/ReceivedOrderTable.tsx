"use client";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { ProductOrder } from '../../../app/purchasemanagement/purchases/receive/[transactions]/page'

import ReceivedOrderTableUI from "./ReceivedOrderTableUI";
import { paymentInformationProps } from "./PaymentInformation";
import { toast } from "react-toastify";
import { customPost } from "../../../Lib/fetcher";
import { PurchaseInvoiceTypes } from "./receiveOrdersAcessoryPage";
import { PaymentSummaryProps } from "../../purchasemanagement/PurchaseOrderTransactionView";
import { useApplication } from "../../application/ApplicationContextProvider";

interface ReceivedOrderTableProps {
    invoice: PurchaseInvoiceTypes
    transactionid: number
}

export type defaultPaymentInformationType = Omit<paymentInformationProps, "handleChange">

export type NewPaymentInformationType = Partial<defaultPaymentInformationType & PaymentSummaryProps>;

const defaultPaymentInformation: defaultPaymentInformationType = {
    paymentAmount: 0,
    paymentMode: '',
    isDisabled: true,
    additionalPayment: 0,
    additionalPaymentDescription: ''
}

export default function ReceivedOrderTable({ invoice, transactionid }: ReceivedOrderTableProps) {
    const { data: setupdata, paymentInfo } = invoice
    const [pricing, setPricing] = useState<'unit' | "absolute">("unit");
    const [taxIncurred, setTaxIncurred] = useState<{ method: string; amount: number }>({ method: "absolute", amount: 0 });
    const [datasource, setDataSource] = useState<ProductOrder[]>(setupdata);
    const employeeid = useApplication().employeeid;

    const [paymentInformation, setPaymentInformation] = useState<defaultPaymentInformationType>(defaultPaymentInformation)


    const calculateSingleOrderTotalPricing = (pricing: "unit" | "absolute", price: number, quantityReceived: number) => {
        if (pricing === "unit") {
            return price * quantityReceived;
        }
        return price;
    };

    const getProductOrderBalance = (item: ProductOrder) => {
        const { quantityReceived, quantity } = item;
        if (quantityReceived > quantity) {
            return 0;
        } else {
            return quantity - quantityReceived;
        }
    };

    const handleReceivedField = (event: React.ChangeEvent<HTMLInputElement>, item: ProductOrder) => {
        const value = Number(event.target.value);
        const productordersid = item.productordersid;

        setDataSource((prev) => {
            return prev.map((product) => {
                if (product.productordersid === productordersid) {
                    const updatedProduct = {
                        ...product,
                        receivedby: 3,
                        quantityReceived: value > product.quantity ? product.quantity : value,
                        pricing: pricing,
                        totalamount: product.price ? calculateSingleOrderTotalPricing(pricing, product.price, value) : 0,
                    };
                    return updatedProduct;
                } else {
                    return product;
                }
            });
        });
    };

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, item: ProductOrder) => {
        const value = Number(event.target.value);
        const productordersid = item.productordersid;

        setDataSource((prev) => {
            return prev.map((product) => {
                if (product.productordersid === productordersid) {
                    const updatedProduct = {
                        ...product,
                        price: value,
                        totalamount: calculateSingleOrderTotalPricing(pricing, value, product.quantityReceived),
                        balance: getProductOrderBalance(product),
                    };
                    return updatedProduct;
                } else {
                    return product;
                }
            });
        });
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>, item: ProductOrder, field: 'receiveddate' | 'expirydate') => {
        const value = event.target.value;
        const productordersid = item.productordersid;

        if (field === 'expirydate') {
            const expiryDate = new Date(value);
            const receivingDate = new Date(item.receiveddate);

            if (expiryDate <= receivingDate) {
                alert("Expiry date must be greater than the receiving date.");
                return;
            }
        }

        setDataSource((prev) => {
            return prev.map((product) => {
                if (product.productordersid === productordersid) {
                    const updatedProduct = {
                        ...product,
                        [field]: value,
                    };
                    return updatedProduct;
                } else {
                    return product;
                }
            });
        });
    };

    const handlePricingMethodChange = useCallback((pricing: "unit" | "absolute") => {
        setPricing(pricing);
        const currentDataset = datasource.map((item: ProductOrder) => {
            const { price, quantityReceived } = item;
            if (price && quantityReceived) {
                const _totalAmount = calculateSingleOrderTotalPricing(pricing, price, quantityReceived);
                item.totalamount = _totalAmount;
                item.balance = getProductOrderBalance(item);
                item.pricing = pricing
            }
            return item;
        });
        setDataSource(currentDataset);
    }, [pricing]);



    const getTotalAmount = () => {
        return datasource.reduce((total, item) => total + (item.totalamount || 0), 0);
    };



    const getTotalTax = () => {
        const totalAmount = getTotalAmount();
        if (taxIncurred.method === "absolute") {
            return taxIncurred.amount;
        } else if (taxIncurred.method === "percentage") {
            return (totalAmount * taxIncurred.amount) / 100;
        }
        return 0;
    };

    const getFinalTotalAmount = () => {
        return getTotalAmount() + getTotalTax() + parseFloat(paymentInformation.additionalPayment.toString() || '0')
    };

    const handleBatchNumberChange = (ev: React.ChangeEvent<HTMLInputElement>, item: ProductOrder) => {
        const value = ev.target.value;
        const productordersid = item.productordersid;

        setDataSource((prev) => {
            return prev.map((product) => {
                if (product.productordersid === productordersid) {
                    return { ...product, batchnumber: value };
                }
                return product;
            });
        });
    };
    const handleStockBrandChange = (ev: React.ChangeEvent<HTMLSelectElement>, item: ProductOrder) => {
        const value = ev.target.value;
        const productordersid = item.productordersid;
        setDataSource((prev) =>
            prev.map((product) => {
                if (product.productordersid === productordersid) {
                    return { ...product, brandid: value };
                }
                return product;
            })
        );
    };


    const handleAddNewBrand = (item: ProductOrder) => {
        const url = `/inventory/stocks/brands?stockname=${item.name}&stockid=${item.stockid}`;
        window.open(url, "_blank");
    };


    const handlePaymentInformationChange = (ev: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, target: string) => {
        const { value } = ev.target;
        setPaymentInformation({ ...paymentInformation, [target]: value })
    }

    const handleSubmit = async () => {
        type RequiredFields = Pick<
            ProductOrder,
            'batchnumber' | 'brandid' | 'expirydate' | 'receiveddate' | 'quantityReceived' | 'price'
        >;

        const hasEmptyRequiredField = (item: ProductOrder): boolean => {
            const requiredFields: Array<keyof RequiredFields> = [
                'expirydate',
                'receiveddate',
                'batchnumber',
                'brandid',
                'price',
                'quantityReceived',
            ];
            return requiredFields.some((field) => {
                const value = item[field];
                return value === null || value === undefined || value.toString().trim() === '' || value === 0;
            });
        };

        if (!datasource || datasource.length === 0) {
            toast.error('No data to validate.');
            return;
        }

        const listOfWronglyEnteredRows = datasource
            .map((item, index) => (hasEmptyRequiredField(item) ? index + 1 : null))
            .filter((index) => index !== null);

        if (listOfWronglyEnteredRows.length > 0) {
            toast.error(`Row ${listOfWronglyEnteredRows.join(', ')} have empty fields`);
            return;
        }

        let totalPrice = getFinalTotalAmount()
        const { paymentAmount, paymentMode } = paymentInformation;


        if (paymentAmount > 0) {
            if (paymentAmount > totalPrice) {
                toast.error('Payment Amount must be less or equal to the total price (tax inclusive). Please adjust payment.');
                return;
            }

            if (!paymentMode || paymentMode.trim().length === 0) {
                toast.error('Please specify the payment mode.');
                return;
            }
        }

        const requestData = {
            data: datasource,
            tax: taxIncurred,
            paymentInformation,
            employeeid,
            totalprice: totalPrice,
        };

        try {
            const response = await customPost('purchases', 'POST', requestData);
            const { status, message } = response;

            if (status) {
                toast.success('Order updated successfully');
            } else {
                toast.error(message || 'An error occurred while updating the order.');
            }
        } catch (error) {
            toast.error('Failed to submit the data. Please try again later.');
        }
    };



    useEffect(() => {
        if (paymentInfo && paymentInfo.amountpaid && paymentInfo.method) {

            const _refinedFromPaymentInfo = {
                paymentAmount: paymentInfo.amountpaid,
                paymentMode: paymentInfo.paymentmode,
                isDisabled: false,
                additionalPayment: paymentInfo.additionalAmount,
                additionalPaymentDescription: paymentInfo.description
            }

            setTaxIncurred({ method: paymentInfo.method, amount: paymentInfo.taxAmount })

            setPaymentInformation(_refinedFromPaymentInfo)
        }
    }, [paymentInfo]);




    return (
        <ReceivedOrderTableUI
            datasource={datasource}
            pricing={pricing}
            setPricing={setPricing}
            handleBatchNumberChange={handleBatchNumberChange}
            taxIncurred={taxIncurred}
            setTaxIncurred={setTaxIncurred}
            handleChange={handlePaymentInformationChange}
            handleReceivedField={handleReceivedField}
            handlePriceChange={handlePriceChange}
            transactionid={transactionid}
            handlePricingMethodChange={handlePricingMethodChange}
            handleStockBrandChange={handleStockBrandChange}
            handleDateChange={handleDateChange}
            ready={true}
            handleAddNewBrand={handleAddNewBrand}
            onSubmit={handleSubmit}
            getTotalAmount={getTotalAmount}
            paymentInformation={paymentInformation}
            getTotalTax={getTotalTax}
            getFinalTotalAmount={getFinalTotalAmount}
        />
    );
}
