"use client";
import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { customFetch } from "../../../Lib/fetcher";
import Loader from "../../accessories/Loader";

interface StockItem {
    stockid: string;
    name: string;
    date: string;
    category: string;
    consumptionunit: string;
    alertlevel: number;
    quantity: number;
    quantityrequired: number;
}

interface InventoryStockFilteringProps {
    selectedWarehouse: string;
    count: number;
    page: number;
    onSelectStock: (selectedOption: { value: number; label: string }) => void;
    isDisabled?: boolean;
}

const InventoryStockFiltering: React.FC<InventoryStockFilteringProps> = ({
    selectedWarehouse,
    count,
    page,
    onSelectStock,
    isDisabled = false,
}) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchStockData = async (inputValue: string): Promise<Array<{ value: number; label: string }>> => {
        if (inputValue.length < 3) return [];
        try {
            const response = await customFetch(
                `stocks/filter?filter=${inputValue}&count=${count}&page=${page}&warehouseid=${selectedWarehouse}`
            );
            const { result }: { result: StockItem[] } = response;

            return result.map(item => ({
                value: parseInt(item.stockid, 10),
                label: item.name,
                ...item
            }));
        } catch (error) {
            console.error("Error fetching stock data:", error);
            return [];
        }
    };

    if (!isClient) return <Loader />;

    return (
        <AsyncSelect
            loadOptions={fetchStockData}
            onChange={onSelectStock}
            className="pls-color"
            placeholder="Search and select a stock item..."
            isMulti={false}
            isClearable
            isDisabled={isDisabled}
        />
    );
};

export default InventoryStockFiltering;
