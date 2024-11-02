import React, { useState } from "react";
import InventoryStockFiltering from "./InventoryStockFiltering";
import StockQuantityAdder from "./StockQuantityAdder";

const AutoDeductionTemplateStockFilter = ({ selectedWarehouse, count, page, onAddStock }) => {
    const [selectedStock, setSelectedStock] = useState(null);

    return (
        <div className="my-3">
            <div className="row">
                <div className="col-md-12 col-md-6 col-lg-6 ">
                    <InventoryStockFiltering
                        selectedWarehouse={selectedWarehouse}
                        count={count}
                        page={page}
                        onSelectStock={setSelectedStock}
                    />
                </div>
                <div className="col-sm-12 my-sm-3 my-lg-0 my-md-0 col-md-6 col-lg-6">
                    <StockQuantityAdder
                        selectedStock={selectedStock}
                        onAddStock={onAddStock}
                    />
                </div>
            </div>
        </div>
    );
};

export default AutoDeductionTemplateStockFilter;
