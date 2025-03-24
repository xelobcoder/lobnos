import { useState, useEffect, useCallback } from "react";
import { ProductOrder } from "../../app/purchasemanagement/purchases/receive/[transactions]/page";
interface ReceivedOrderTableLogicProps {
    setupdata: ProductOrder[];
    setReady: React.Dispatch<React.SetStateAction<boolean>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ReceivedOrderTableLogic = ({
    setupdata,
    setReady,
    setLoading,
}: ReceivedOrderTableLogicProps) => {
    const [pricing, setPricing] = useState<string>("unit");
    const [taxIncurred, setTaxIncurred] = useState<{ method: string; amount: number }>({ method: "absolute", amount: 0 });
    const [datasource, setDatasource] = useState<ProductOrder[]>(setupdata);

    const calculateSingleOrderTotalPricing = (price: number, quantityReceived: number) => {
        if (pricing === "unit") {
            return price * quantityReceived;
        }
        return price;
    };

    const getProductOrderBalance = (item: ProductOrder) => {
        const { quantityReceived, quantity } = item;
        return quantityReceived > quantity ? 0 : quantity - quantityReceived;
    };

    const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>, item: ProductOrder, field: string) => {
        const value = field === 'price' || field === 'quantityReceived' ? Number(event.target.value) : event.target.value;
        const productordersid = item.productordersid;

        setDatasource((prev) => {
            return prev.map((product) => {
                if (product.productordersid === productordersid) {
                    const updatedProduct = {
                        ...product,
                        [field]: value,
                    };
                    if (field === "quantityReceived" || field === "price") {
                        updatedProduct.totalamount = product.price
                            ? calculateSingleOrderTotalPricing(product.price, product.quantityReceived)
                            : 0;
                        updatedProduct.balance = getProductOrderBalance(product);
                    }
                    return updatedProduct;
                } else {
                    return product;
                }
            });
        });
    };

    const handlePricingMethodChange = useCallback(() => {
        const currentDataset = [...datasource];
        currentDataset.map((item: ProductOrder) => {
            const { price, quantityReceived } = item;
            if (price && quantityReceived) {
                item.totalamount = calculateSingleOrderTotalPricing(price, quantityReceived);
                item.balance = getProductOrderBalance(item);
            }
            return item;
        });
        setDatasource(currentDataset);
    }, [pricing, datasource]);

    useEffect(() => {
        handlePricingMethodChange();
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
        return getTotalAmount() + getTotalTax();
    };

    const handleAddToStock = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    return {
        pricing,
        taxIncurred,
        datasource,
        handleFieldChange,
        handleAddToStock,
        getTotalAmount,
        getTotalTax,
        getFinalTotalAmount,
        setPricing,
        setTaxIncurred,
        setDatasource,
        setReady,
        setLoading,
    };
};
