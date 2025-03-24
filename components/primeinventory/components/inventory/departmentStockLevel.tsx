"use client";

import { useState, MouseEvent } from "react";
import { ColDef, GridReadyEvent, GridApi } from "ag-grid-community";
import ConsumeStocKModal from "./ConsumeStocKModal";
import { useRouter } from "next/navigation";
import { customPost } from "../../Lib/fetcher";
import { authMini, DepartmentList, stockConsumptionType } from "../interfaces/departmentInterface";
import { AgGridReact } from "ag-grid-react";
import { myTheme } from "../Supplier/AgGridTheme";
import { useApplication } from "../application/ApplicationContextProvider";


export default function DepartmentStockLevel({
	datasource,
	auth,
	departmentId,
}: {
	datasource: DepartmentList[];
	auth: authMini;
	departmentId: number;
}) {
	type StockItem = {
		category: string;
		consumptionUnit: string;
		name: string;
		quantityAvailable: number;
		stockid: number;
	};

	const router = useRouter();
	const [consume, setConsume] = useState(false);
	const[loadingTable,setLoadingTable] = useState(false);
	const employeeid = useApplication().employeeid;
	const [consumeStock, setConsumeStock] = useState<stockConsumptionType>({
		departmentid: departmentId,
		stockid: 0,
		stockname: "",
		quantityAvailable: 0,
		quantity: 0,
	});

	const [gridApi, setGridApi] = useState<GridApi | null>(null);

	const pushConsume = async (ev: MouseEvent, item: StockItem) => {
		const { stockid, name, quantityAvailable } = item;
		setConsumeStock({ stockid, departmentid: departmentId, stockname: name, quantityAvailable });
		setConsume(true);
	};

	const handleLink = (stockdetails: StockItem) => {
		const { stockid, name } = stockdetails;
		router.push(`/inventory/department/${departmentId}/stockusage?stockid=${stockid}&&departmentid=${departmentId}&&name=${name}`);
	};

	const deleteStock = async (e: MouseEvent, id: number) => {
		const confirmDelete = window.confirm("Are you sure you want to delete this stock?");
		if (confirmDelete) {
			try {
				const deleteStockAsync = await customPost(`departments/stocks?id=${id}`, "DELETE", {});
				const { status, message } = deleteStockAsync;
				if (status === "success") {
					alert(message);
					if (gridApi) {
						// const allRows = gridApi.getDisplayedRowAtIndex();
						// const rowNode: RowNode = allRows.find((row: RowNode) => row.data.stockid === id);
						// rowNode?.remove();
					}
				}
			} catch (err) {
				console.log(err);
			}
		}
	};

	const onGridReady = (params: GridReadyEvent) => {
		setGridApi(params.api);
	};

	const columns: ColDef[] = [
		{ headerName: "Name", field: "name", sortable: true, filter: true },
		{ headerName: "Category", field: "category", sortable: true, filter: true },
		{ headerName: "Consumption Unit", field: "consumptionunit", sortable: true, filter: true },
		{ headerName: "Qty Available", field: "quantityAvailable", sortable: true, filter: true },
		{
			headerName: "Action",
			width:300,
			cellRenderer: (params: any) => {
				const item = params.data;
				return (
					<div>
						<button onClick={(ev) => pushConsume(ev, item)} className="btn btn-sm btn-primary">
							Consume
						</button>
						<button
							className="btn btn-sm btn-danger mx-1"
							title="Delete Stock"
							onClick={(e) => deleteStock(e, item.stockid)}
						>
							Delete
						</button>
						<button onClick={(ev) => handleLink(item)} className="btn btn-sm btn-dark mx-2">
							View Usage
						</button>
					</div>
				);
			},
		},
	];

	if (datasource.length === 0) return <div>No Data Available</div>;

	return (
		<>
			<div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
				<AgGridReact
					columnDefs={columns}
					rowData={datasource}
					theme={myTheme}
					loading={loadingTable}
					onGridReady={onGridReady}
					domLayout="autoHeight"
				/>
			</div>
			<ConsumeStocKModal show={consume} employeeid={employeeid} data={consumeStock} setShow={setConsume} />
		</>
	);
}
