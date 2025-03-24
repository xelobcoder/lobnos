"use client";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import AddWarehouseForm from "../../../components/inventory/WareHouse/AddNewWareHouse";
import AddShelfForm from "../../../components/inventory/WareHouse/shelf";
import RackQuickView from "../../../components/inventory/WareHouse/QuickRackItemsView";
import { getShelves, getWareHouseList } from "../../../components/inventory/Util";
import { getDataAndUpdateState } from "../../../Lib/fetcher";
import Loader from "../../../components/accessories/Loader";
import '../../../styles/prime-table.css'

interface Warehouse {
	id: number;
	name: string;
	created_on: string;
}

interface Shelf {
	name: string;
	warehouse: string;
}

interface EditingState {
	edit: boolean;
	data: { name?: string; warehouseid?: number };
}

export default function WareHouse() {
	const defaultValues = { show: false, target: 0 };
	const [warehouseList, setWareHouseList] = useState<Warehouse[]>([]);
	const [shelves, setShelves] = useState<Shelf[]>([]);
	const [loading, setLoading] = useState<{ warehouses: boolean; shelves: boolean }>({
		warehouses: true,
		shelves: false,
	});
	const [editing, setEditing] = useState<EditingState>({ edit: false, data: {} });
	const [showModal, setShowModal] = useState(defaultValues);
	const [shelfModal, setShelfModal] = useState<boolean>(false);
	const { show, target } = showModal;
	const router = useRouter();

	const fetchData = async () => {
		setLoading({ warehouses: true, shelves: false });
		await getWareHouseList(setWareHouseList);
		setLoading({ warehouses: false, shelves: false });
	};

	useEffect(() => {
		fetchData();
	}, []);

	const getWareHouseShelves = async (warehouseid: number) => {
		if (!warehouseid) return;
		setLoading((prev) => ({ ...prev, shelves: true }));
		await getDataAndUpdateState(setShelves, `inventory/warehouse/shelves?warehouseId=${warehouseid}`, null);
		setLoading((prev) => ({ ...prev, shelves: false }));
		setShelfModal(true);
	};

	const closeModal = async (isReload: boolean) => {
		if (isReload) {
			target === 1
				? await getWareHouseList(setWareHouseList)
				: await getShelves("all", setShelves);
		}
		setShowModal(defaultValues);
	};

	const closeShelfModal = () => setShelfModal(false);

	const editWarehouse = (warehouseid: number, name: string) => {
		if (!warehouseid || !name) return;
		setShowModal({ show: true, target: 1 });
		setEditing({ edit: true, data: { name, warehouseid } });
	};

	if (loading.warehouses) return <Loader />;

	return (
		<>
			<ToastContainer />
			<div className="d-flex justify-content-between">
				<RackQuickView />
				<div className="d-flex justify-content-end">
					<button onClick={() => setShowModal({ show: true, target: 1 })} className="btn btn-sm btn-primary mx-2">
						New Warehouse
					</button>
					<button onClick={() => setShowModal({ show: true, target: 2 })} className="btn btn-sm btn-primary mx-2">
						New Rack/Shelf
					</button>
				</div>
			</div>
			<section className="grid-50 p-2">
				<div className="bt-wrapper">
					<h5>WareHouse</h5>
					<table className="table bt">
						<thead>
							<tr>
								<th>Warehouse</th>
								<th>Date Added</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{warehouseList.map((item, index) => (
								<tr key={index}>
									<td>{item.name}</td>
									<td>{new Date(item.created_on).toLocaleDateString()}</td>
									<td>
										<button
											onClick={() => editWarehouse(item.id, item.name)}
											className="btn btn-primary btn-sm mx-1"
										>
											Edit
										</button>
										<button
											onClick={() =>
												router.push(
													`/inventory/warehouse/racks?warehouseid=${item.id}&&name=${item.name}`
												)
											}
											className="btn btn-warning btn-sm"
										>
											Preview
										</button>
										<button className="btn btn-danger btn-sm mx-1">Delete</button>
										<button
											onClick={() => getWareHouseShelves(item.id)}
											className="btn btn-secondary btn-sm"
										>
											View Shelves
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
			<div>
				{show && target === 1 && (
					<AddWarehouseForm
						handleClose={closeModal}
						editing={editing.edit}
						editingdata={editing.data}
						showModal={show}
					/>
				)}
				{show && target === 2 && (
					<AddShelfForm handleClose={closeModal} warehxlist={warehouseList} showModal={show} />
				)}
			</div>
			{shelfModal && (
				<div className="modal d-block modal-static modal-lg" style={{ zIndex: 9999 }}>
					<div className="modal-dialog modal-lg" >
						<div className="modal-content">
							<div className="modal-header bg-secondary-subtle">
								<h5 className="modal-title">Shelves</h5>
								<button type="button" className="btn-close" onClick={closeShelfModal}></button>
							</div>
							<div className="modal-body">
								{loading.shelves ? (
									<Loader />
								) : (
									<table className="table billing-cart-table">
										<thead>
											<tr>
												<th>Name</th>
												<th>Warehouse</th>
											</tr>
										</thead>
										<tbody>
											{shelves.map((item, index) => (
												<tr key={index}>
													<td>{item.name}</td>
													<td>{item.warehouse}</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={closeShelfModal}>
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
