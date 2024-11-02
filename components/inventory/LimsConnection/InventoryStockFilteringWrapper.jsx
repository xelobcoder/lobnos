import React, { useState } from "react";
import TemplateLimsCreationTableDisplay from "./TemplateLimsCreationTableDisplay";
import AutoDeductionTemplateStockFilter from "./AutoDeductionTemplateStockFilter";

export default function InventoryStockFilteringWrapper({ selectedWarehouse = 'all', count = 50, page = 1 }) {
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

    return (
        <div className="my-3">
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
        </div>
    );
}
