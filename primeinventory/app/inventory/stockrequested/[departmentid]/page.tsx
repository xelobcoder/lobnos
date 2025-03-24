import React from "react";
import { Accordion } from 'react-bootstrap';
import Loader from "../../../../components/accessories/Loader";
import DispatchStockAccordionList from "../../../../components/inventory/stocks/stockRequest/_DispatchStockAccordionList";
import { getInvSettings, inventorySettings } from "../../../../components/inventory/Util";
import SelectedDeptServe from "../../../../components/inventory/stocks/stockRequest/_SelectedDeptServe";
import { ToastContainer, toast } from 'react-toastify';
import { customFetch } from "../../../../Lib/fetcher";
import DispatchTablesAndAcessories from "../../../../components/inventoryTables/DispatchTablesAndAcessories";

type DataItem = {
	id: number;
};

export default async function DispatchApprovedStockToDepart({ params }: { params: Promise<{ departmentid: number }> }) {
	const { departmentid } = await params;
	let defaultInventorySettings = inventorySettings;
	let data = [];

	if (departmentid) {
		const [inv, departmentRequisitions] = await Promise.all([getInvSettings(), customFetch(`store/departments/requisitions/serve?departmentid=${departmentid}`)]);
		if (departmentRequisitions.result && Array.isArray(departmentRequisitions.result)) {
			data = departmentRequisitions.result;
		}
		if (inv && inv.stocksAutoDeduct) {
			defaultInventorySettings = inv;
		}
	}

	return (
		<div>
			<DispatchTablesAndAcessories departmentid={departmentid} requisitions={data} inv={defaultInventorySettings} />
		</div>
	);
}
