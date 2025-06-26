import React from "react";
import AsyncSelect from "react-select/async";
import { InventoryFetch } from "../../Auth/customFetch";

const InventoryStockFiltering = ({ selectedWarehouse, count, page, onSelectStock, isDisabled = false }) => {
	const fetchStockData = async (inputValue) => {
		if (inputValue.length < 3) return [];
		try {
			const response = await InventoryFetch(`stocks/filter?filter=${inputValue}&count=${count}&page=${page}&warehouseid=${selectedWarehouse}`);
			const { result } = response;

			return result.map(item => ({
				value: item.stockid,
				label: item.name,
				date: item.date,
				category: item.category,
				consumptionunit: item.consumptionunit,
				alertlevel: item.alertlevel,
				quantity: item.quantity,
				quantityrequired: item.quantityrequired
			}));
		} catch (error) {
			console.error("Error fetching stock data:", error);
			return [];
		}
	};

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
