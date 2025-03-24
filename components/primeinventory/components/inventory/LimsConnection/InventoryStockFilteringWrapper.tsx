"use client"
import { useState } from "react";
import TemplateLimsCreationTableDisplay from "./TemplateLimsCreationTableDisplay";
import AutoDeductionTemplateStockFilter from "./AutoDeductionTemplateStockFilter";
import { ToastContainer, toast } from "react-toastify";
import { customPost } from "../../../Lib/fetcher";

interface StockItem {
    quantity: number;
    consumptionunit: string;
    value: string;
    label: string;
}

interface InventoryStockFilteringWrapperProps {
    selectedWarehouse?: string;
    count?: number;
    page?: number;
    testId?: number;
    employeeid: number;
    templateData: any[]
}

export default function InventoryStockFilteringWrapper({
    selectedWarehouse = "all",
    count = 50,
    page = 1,
    testId,
    templateData,

    employeeid,
}: InventoryStockFilteringWrapperProps) {
    const [tableData, setTableData] = useState<StockItem[]>(templateData);
    const [isLoading, setLoading] = useState<boolean>(true);



    const handleAddStock = (
        selectedStock: StockItem,
        quantity: number,
        showToast: () => void
    ) => {
        const existingStock = tableData.find((stock) => stock.value === selectedStock.value);
        if (!existingStock) {
            const newStock = { ...selectedStock, quantity };
            setTableData((prev) => [...prev, newStock]);
        } else {
            showToast();
        }
    };

    const handleEditStock = (index: number) => {
        const stockToEdit = tableData[index];
        const newQuantity = prompt("Enter new quantity:", stockToEdit.quantity.toString());
        if (newQuantity !== null) {
            setTableData((prev) =>
                prev.map((item, i) =>
                    i === index ? { ...item, quantity: parseInt(newQuantity, 10) } : item
                )
            );
        }
    };

    const handleDeleteStock = (index: number) => {
        setTableData((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddTemplate = async () => {
        if (!(Array.isArray(tableData) && tableData.length > 0 && testId)) return;
        const responseData = tableData.map(({ quantity, consumptionunit, value, label }) => ({
            quantity,
            consumptionunit,
            stockid: value,
            label,
        }));
        const data = {
            testid: testId,
            template: responseData,
            isDeductedAfterTestCompletion: 1,
            isPhebotomy: 0,
            isService: 0,
            employeeid,
            isTest: 1,
        };
        try {
            const response = await customPost(`lims/inventory/connection/template/create`, "POST", data);
            response.status ? toast.success("Update successful") : toast.error("Update failed");
        } catch {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="my-3">
            <ToastContainer position="top-center" className="text-sm" theme="colored" />
            <AutoDeductionTemplateStockFilter
                selectedWarehouse={selectedWarehouse}
                count={count}
                page={page}
                onAddStock={handleAddStock}
            />
            <TemplateLimsCreationTableDisplay
                tableData={tableData}

                handleEditStock={handleEditStock}
                handleDeleteStock={handleDeleteStock}
            />
            <div className="my-3">
                <button className="btn btn-primary btn-sm" onClick={handleAddTemplate}>
                    Save Information
                </button>
            </div>
        </div>
    );
}
