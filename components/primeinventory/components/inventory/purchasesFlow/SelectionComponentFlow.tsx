"use client"
import React from 'react'
import InventoryStockFiltering from './InventoryStockFiltering'
import { updateUrlParam } from '../../../Lib/fetcher'
import { useRouter ,useS} from 'next/navigation'


export default function SelectionComponentFlow() {
	const navigator = useRouter();

	const handleStockSelection = (item: { label: string, value: number }) => {
		if (item && Object.entries(item).length > 0) {
			const { value: stockid } = item;
			if (stockid && !isNaN(stockid)) {
				updateUrlParam(navigator, 'stockid', stockid.toString());
			}
		}
	}

	return (
		<section className="grid-50">
			<div className="d-flex justify-content-between">
				<div className='col-6'>
					<InventoryStockFiltering onSelectStock={handleStockSelection} count={10} page={1} selectedWarehouse='all' />
				</div>
				<div className="mx-2">
					<select className="custom-select">
						<option value="">Select records</option>
						<option value={5}>Last 5 records</option>
						<option value={10}>Last 10 records</option>
						<option value={20}>Last 20 records</option>
					</select>
				</div>
			</div>
			<hr />
		</section>
	)
}
