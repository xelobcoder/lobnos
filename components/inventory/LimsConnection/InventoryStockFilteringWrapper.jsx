import React, { useState } from "react";
import TemplateLimsCreationTableDisplay from "./TemplateLimsCreationTableDisplay";
import AutoDeductionTemplateStockFilter from "./AutoDeductionTemplateStockFilter";
import { customPost } from "../../Auth/customFetch";
import { ToastContainer, toast } from "react-toastify";

export default function InventoryStockFilteringWrapper({ selectedWarehouse = 'all', count = 50, page = 1, testId, employeeid }) {
    const [tableData, setTableData] = useState([]);


    const handleAddStock = (selectedStock, quantity, showToast) => {
        const existingStock = tableData.find(stock => stock.value === selectedStock.value);
        if (!existingStock) {
            const newStock = {
                ...selectedStock,
                quantity: parseInt(quantity, 10),
            };
            setTableData(prev => [...prev, newStock]);
        } else {
            showToast();
        }
    };


    const handleEditStock = (index) => {
        const stockToEdit = tableData[index];
        const newQuantity = prompt("Enter new quantity:", stockToEdit.quantity);

        if (newQuantity !== null) {
            setTableData(prev =>
                prev.map((item, i) =>
                    i === index ? { ...item, quantity: parseInt(newQuantity, 10) } : item
                )
            );
        }
    };


    const handleDeleteStock = (index) => {
        setTableData(prev => prev.filter((_, i) => i !== index));
    };


    const handleAddTemplate = async () => {
        try {
            let endpoint = `lims/inventory/connection/template/create`;

            if (!(Array.isArray(tableData) && tableData.length > 0 && testId)) return;

            const responseData = tableData.map((item, index) => {
                const { quantity, consumptionunit, value } = item;
                return {
                    quantity,
                    consumptionunit,
                    stockid: value,
                }
            })

            const data = {
                testid: testId,
                template: responseData,
                isDeductedAfterTestCompletion: 1,
                isPhebotomy: 0,
                isService: 0,
                employeeid,
                isTest: 1
            };

            const response = await customPost(endpoint, 'POST', data);
            const { status } = response;

            if (status && status == true) return toast.success('Update successful');
            toast.error('update failed');
        } catch (err) {
            toast.error('something wrong occured');
        }
    }

    return (
        <div className="my-3">
            <ToastContainer position="top-center" className={'text-sm'} theme="colored" />
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
