import { useReducer, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { customFetch, customPost } from "../../components/Auth/customFetch";
import InventoryLayout from "../../components/inventory/InventoryLayout";
import {
	filterStocks,
	getWareHouseList,
	handleAssignWare,
	updatePagination,
} from "../../components/inventory/Util";
import ADD_STOCK_INVENTORY from "../../components/inventory/addstock";
import Pagination from "../../components/accessories/pagination";
import AddStockCategory from "../../components/inventory/stocks/AddStocksCategory";
import Loader from "../../components/accessories/Loader";
import TableDisplay from "../../components/accessories/TableDisplay";
import { Button, ButtonGroup } from "react-bootstrap";

export default function InventoryPage() {
	const [editing, setEditing] = useState({ edit: false, stockId: null, data: {} });
	const [stocks, setStocks] = useState([]);
	const [query, dispatchQuery] = useReducer(updatePagination, { count: 10, page: 1 });
	const [loading, setLoading] = useState(true);
	const [warehouseList, setWarehouseList] = useState([]);
	const [isPaginating, setIsPaginating] = useState(false);
	const [selectedWarehouse, setSelectedWarehouse] = useState("all");
	const [showModal, setShowModal] = useState(false);
	const [showCategoryModal, setShowCategoryModal] = useState(false);
	const router = useRouter();

	useEffect(() => {
		loadStocks();
	}, [selectedWarehouse, isPaginating, query]);

	useEffect(() => {
		getWareHouseList(setWarehouseList);
	}, []);

	const loadStocks = async () => {
		setLoading(true);
		const { count, page } = isPaginating ? query : { count: 10, page: 1 };
		try {
			const data = await customFetch(
				`stock?warehouseid=${selectedWarehouse}&count=${count}&page=${page}`
			);
			if (data.statusCode === 200 && data.status === "success") {
				setStocks(data.result);
			}
		} catch (error) {
			console.error("Failed to load stocks:", error);
		} finally {
			setLoading(false);
		}
	};

	const closeModal = () => {
		setShowModal(false);
		setEditing({ edit: false, stockId: null });
	};

	const closeCategoryModal = () => setShowCategoryModal(false);

	const openAddStockModal = () => setShowModal(true);

	const handleDelete = async (id) => {
		if (!id) return;
		try {
			const data = await customPost("stock", "DELETE", { stockid: id });
			if (data.status === "success" && data.statusCode === 200) {
				setStocks((prevStocks) => prevStocks.filter((item) => item.stockid !== id));
			}
		} catch (error) {
			console.error("Failed to delete stock:", error);
		}
	};

	const handleEditStock = (id, data) => {
		if (!id) return;
		setEditing({ edit: true, stockid: id, data });
		setShowModal(true);
	};

	const MemoizedPagination = useMemo(
		() => (
			<Pagination page={query.page} load={setIsPaginating} updateFunction={dispatchQuery} />
		),
		[dispatchQuery, query.page]
	);

	const columns = [
		{ Header: "Name", accessor: "name" },
		{ Header: "Category", accessor: "categoryname" },
		{ Header: "Purchase Unit", accessor: "purchaseunit" },
		{ Header: "Consumption Unit", accessor: "consumptionunit" },
		{ Header: "Qty Available", accessor: "quantity" },
		{
			Header: "Alert Level",
			accessor: "alertlevel",
			Cell: ({ row, value }) => {
				const className =
					value < row.original.quantity
						? "text-danger border-bottom border-2 border-danger"
						: value === row.original.quantity
							? "text-warning border-bottom border-2 border-warning"
							: "";
				return <span className={className}>{value}</span>;
			},
		},
		{
			Header: "Action",
			Cell: ({ row }) => {
				const { stockid } = row.original;
				return (
					<ButtonGroup>
						<Button
							variant="outline-danger"
							size="sm"
							className="br-0"
							onClick={() => handleDelete(stockid)}
						>
							Delete
						</Button>
						<Button
							variant="outline-primary"
							size="sm"
							className="br-0"
							onClick={() => handleEditStock(stockid, row.original)}
						>
							Edit
						</Button>
						<Button
							variant="outline-success"
							size="sm"
							className="br-0"
							onClick={() => handleAssignWare(row.original, router)}
						>
							Add brands
						</Button>
					</ButtonGroup>
				);
			},
		},
	];

	// const columns = [
	// 	{ Header: "Name", accessor: "name" },
	// 	{ Header: "Category", accessor: "categoryname" },
	// 	{ Header: "Purchase Unit", accessor: "purchaseunit" },
	// 	{ Header: "Consumption Unit", accessor: "consumptionunit" },
	// 	{ Header: "Qty Available", accessor: "quantity" },
	// 	{
	// 		Header: "Alert Level",
	// 		accessor: "alertlevel",
	// 		Cell: ({ row, value }) => {
	// 			const className =
	// 				value < row.original.quantity
	// 					? "text-danger border-bottom border-2 border-danger"
	// 					: value === row.original.quantity
	// 						? "text-warning border-bottom border-2 border-warning"
	// 						: "";
	// 			return <span className={className}>{value}</span>;
	// 		},
	// 	},
	// 	{
	// 		Header: "Action",
	// 		Cell: ({ row }) => {
	// 			const { stockid } = row.original;



	// 			return (
	// 				<div>
	// 					<span onClick={ () =>  {handleDelete(stockid)}} className="text-decoration-underline p-0 text-sm pls-color text-danger pointer">
	// 						Delete
	// 					</span>
	// 					<span onClick={() => { handleEditStock(stockid, row.original); }} className="text-decoration-underline p-0 text-sm pls-color text-primary mx-2 pointer">
	// 						Edit
	// 					</span>
	// 					<span onClick={() => { window.open(`inventory/stocks/brands?stockname=syringes&&stockid=2`)}} className="text-decoration-underline p-0 text-sm pls-color text-success mx-2 pointer">
	// 						Add brands
	// 					</span>
	// 				</div>
	// 			);
	// 		},
	// 	},
	// ];


	const renderContent = () => {
		if (loading) return <Loader />;
		return (
			<section>
				<TableDisplay column={columns} data={stocks} styling="ttable table" showpage={false} />
				<div className="d-flex justify-content-center mt-1">{MemoizedPagination}</div>
				{showModal && (
					<ADD_STOCK_INVENTORY
						warehouseList={warehouseList}
						editing={editing}
						show={showModal}
						closeModal={closeModal}
					/>
				)}
				{showCategoryModal && (
					<AddStockCategory show={showCategoryModal} onHide={closeCategoryModal} />
				)}
			</section>
		);
	};

	return (
		<InventoryLayout>
			<div className="d-flex justify-content-between">
				<div className="d-flex col-4">
					<input
						onChange={(ev) =>
							filterStocks(ev.target.value, selectedWarehouse, query, setStocks)
						}
						className="custom-input"
						type="text"
						placeholder="Filter stock here"
					/>
				</div>
				<div className="d-flex justify-content-end">
					<select
						className="custom-select col-3 mx-2"
						onChange={(ev) => setSelectedWarehouse(ev.target.value)}
					>
						<option>Select a warehouse</option>
						<option value="all">All warehouses</option>
						{warehouseList.map((item, index) => (
							<option value={item.id} key={index}>
								{item.name}
							</option>
						))}
					</select>
					<button onClick={() => setShowCategoryModal(true)} className="btn btn-primary btn-sm mx-2">
						New stock category
					</button>
					<button onClick={openAddStockModal} className="btn btn-primary btn-sm">
						New stock
					</button>
				</div>
			</div>
			{renderContent()}
		</InventoryLayout>
	);
}
