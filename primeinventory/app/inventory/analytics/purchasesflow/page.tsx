import React from 'react'
import { customFetch } from '../../../../Lib/fetcher';
import PurchasesFlowCCRWrapper from '../../../../components/inventory/purchasesFlow/purchasesFlowCCRWrapper';

const get_stock_p_order = async (stockid: number): Promise<{ result: [], status: boolean }> => {
	const pushResponse = await customFetch(`inventory/analytics/purchase-flow-analytics?page=1&&count=10&&stockid=${stockid}`);
	return pushResponse as { result: [], status: boolean }
}

export interface PurchaseRecord {
	productordersid: number | string;
	orderdate: string;
	first_received_date: string;
	transactiondate: string;
	departments_qty: number;
	main_store_qty: number;
	receiveddate: string;
	lastdebitdate: string;
	"PO Duration (in days)": number;
	"Main Store Duration(in days)": number;
	"Department Duration(in days)": number;
	main_store_status: string;
	department_store_status: string;
};

const formatDate = (date: string) => {
	return new Date(date).toLocaleDateString();
};

export default async function InventoryPurchasesFlow({ searchParams }: {
	searchParams: Promise<{
		stockid: number
	}>
}) {
	const { stockid } = await searchParams;
	let resultDataset: PurchaseRecord[] | [] = [];

	try {
		const { result, status } = await get_stock_p_order(stockid);
		if (result && Array.isArray(result)) {
			const formattedData: PurchaseRecord[] = result.map((record: PurchaseRecord, index) => {
				return {
					...record,
					productordersid: `ORD-${record.productordersid}`,
					receiveddate: formatDate(record.receiveddate),
					lastdebitdate: formatDate(record.lastdebitdate),
				}
			});

			resultDataset = formattedData;
		} else {
			resultDataset = []
		}
	} catch (err) {
		console.log(err)
	}


	return (
		<div>
			<PurchasesFlowCCRWrapper stockid={stockid} result={resultDataset} />
		</div>
	)
}
