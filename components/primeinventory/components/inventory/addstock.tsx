import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import Modal from 'react-bootstrap/Modal';
import { Purchaseunitlist, Consumptionunitlist, defaultStockDetails, getWareHouseShelves, getcategorylist } from './Util';
import { customPost } from '../../Lib/fetcher';
import { EditingStockItem, StockEditingState, WareHouseType } from '../interfaces/departmentInterface';




interface AddStockInventoryProps {
	show: boolean;
	closeModal: () => void;
	editing: StockEditingState
	warehouseList: WareHouseType[];
}
const ADD_STOCK_INVENTORY: React.FC<AddStockInventoryProps> = ({ show, closeModal, editing, warehouseList }) => {
	const { edit, stockId: stockid, data } = editing;
	const [shelves, setShelves] = useState<{ id: number; name: string }[]>([]);
	const [productdetails, setProductdetails] = useState<EditingStockItem>(defaultStockDetails);
	const [Categorylist, setCategorylist] = useState<{ id: number; category: string }[]>([]);

	const inputhandler = (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof EditingStockItem) => {
		let value = ev.target.value;
		setProductdetails((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSelectFields = (ev: React.ChangeEvent<HTMLSelectElement>, target: keyof EditingStockItem) => {
		const value = parseInt(ev.target.value);
		setProductdetails((prev) => ({
			...prev,
			[target]: value,
		}));
		if (target === 'warehouse') {
			getWareHouseShelves(value, setShelves);
		}
	};

	const handleSubmit = async (ev: React.FormEvent) => {
		try {
			ev.preventDefault();
			const providedstockid = stockid ? parseInt(stockid.toString()) : null;
			if (providedstockid) {
				const method = edit ? 'PUT' : 'POST';
				const hasEmptyFields = checkEmptyFields();
				if (hasEmptyFields) {
					toast.error('All fields are required', { autoClose: 3000 });
					return;
				}

				const refineddata = method === 'PUT' ? { ...productdetails, stockid: providedstockid } : productdetails;
				const data = await customPost(`stock?stockid=${stockid}`, method, refineddata);
				const { status, message, statusCode } = data;

				if (status === 'success' && statusCode === 200) {
					toast.success(message, { autoClose: 500 });
				} else {
					toast.error(message, { autoClose: 3000 });
				}
			}
			throw new Error('Invalid stockid');
		} catch (error: any) {
			toast.error(error.message || 'An error occurred', { autoClose: 3000 });
		}
	};

	const checkEmptyFields = () => {
		const notRequired = ['shelf', 'warehouse'];
		const isZeroAccepted = ['quantity', 'alertlevel'];

		for (let key in productdetails) {
			if (
				(productdetails[key as keyof EditingStockItem] === '' || (productdetails[key as keyof EditingStockItem] === 0 && !isZeroAccepted.includes(key))) &&
				!notRequired.includes(key)
			) {
				return true;
			}
		}

		return false;
	};

	useEffect(() => {
		if (edit && stockid && data && data.warehouse) {
			setProductdetails(data);
			getWareHouseShelves(data?.warehouse, setShelves);
		}
	}, [edit, stockid, data]);

	useEffect(() => {
		getcategorylist(setCategorylist);
	}, []);

	const handleClose = () => {
		setProductdetails(defaultStockDetails);
		closeModal();
	};

	return (
		<>
			<ToastContainer />
			<div className="mx-3">
				<Modal show={show} backdrop='static' size='lg'>
					<Modal.Header closeButton onHide={handleClose} className=' bg-secondary-subtle fw-bold text-capitalize br-0'>
						{edit ? "Update stock information" : "New Stock Entry"}
					</Modal.Header>
					<Modal.Body>
						<form>
							<div className="form-group">
								<label className='text-sm' htmlFor="name">Name</label>
								<input
									type="text"
									className="custom-input"
									id="name"
									placeholder="Enter name"
									value={productdetails.name}
									onChange={(ev) => inputhandler(ev, "name")}
								/>
							</div>

							<div className="form-group">
								<label className='text-sm' htmlFor="category">Category</label>
								<select
									className="custom-input"
									id="category"
									value={productdetails.category}
									onChange={(ev) => handleSelectFields(ev, 'category')}
								>
									<option>Select category</option>
									{Categorylist.map((item, index) => (
										<option key={index} value={item.id}>
											{item.category}
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label className='text-sm' htmlFor="consumptionunit">Consumption Unit</label>
								<select
									className="custom-input"
									id="consumptionunit"
									value={productdetails.consumptionunit}
									onChange={(ev) => inputhandler(ev, "consumptionunit")}
								>
									<option value="">Select consumption unit</option>
									{Consumptionunitlist.map((item, index) => (
										<option key={index} value={item}>
											{item}
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label className='text-sm' htmlFor="purchaseunit">Purchase Unit</label>
								<select
									className="custom-input"
									id="purchaseunit"
									value={productdetails.purchaseunit}
									onChange={(ev) => inputhandler(ev, "purchaseunit")}
								>
									<option value="">Select purchase unit</option>
									{Purchaseunitlist.map((item, index) => (
										<option key={index} value={item}>
											{item}
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label className='text-sm' htmlFor="quantity">Unit Quantity</label>
								<input
									type="text"
									className="custom-input"
									id="quantity"
									placeholder="Enter unit quantity"
									value={productdetails.quantity}
									disabled={edit}
									onChange={(ev) => inputhandler(ev, "quantity")}
								/>
							</div>

							<div className="form-group">
								<label className='text-sm' htmlFor="alertlevel">Alert Level</label>
								<input
									type="text"
									className="custom-input"
									id="alertlevel"
									placeholder="Enter alert level"
									value={productdetails.alertlevel}
									onChange={(ev) => inputhandler(ev, "alertlevel")}
								/>
							</div>

							<div className="form-group">
								<label className='text-sm' htmlFor="materialcode">Material Code</label>
								<input
									type="text"
									className="custom-input"
									id="materialcode"
									placeholder="Enter material code"
									value={productdetails.materialcode}
									onChange={(ev) => inputhandler(ev, "materialcode")}
								/>
							</div>

							<div className="form-group">
								<label className='text-sm' htmlFor="materialcode">WareHouse</label>
								<select
									className="custom-select"
									id="warehouse"
									value={productdetails.warehouse}
									onChange={(ev) => handleSelectFields(ev, "warehouse")}
								>
									<option>select Warehouse</option>
									{warehouseList.map((item: WareHouseType, index) => (
										<option value={item?.id} key={index}>{item?.name}</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label className='text-sm' htmlFor="materialcode">Shelf</label>
								<select
									className='custom-select'
									id='shelf'
									value={productdetails.shelf}
									onChange={(ev) => handleSelectFields(ev, 'shelf')}
									name='shelf'
								>
									<option>select shelf/racks of the selected warehouse</option>
									{shelves.map((item, index) => (
										<option value={item?.id} key={index}>
											{item?.name}
										</option>
									))}
								</select>
							</div>
						</form>
					</Modal.Body>
					<Modal.Footer>
						<div className="form-group mx-3">
							<button
								type="submit"
								className="btn btn-primary btn-sm"
								onClick={handleSubmit}
							>
								{edit ? "Update stock information" : "Add new stock"}
							</button>
							<button onClick={handleClose} className='btn btn-danger btn-sm mx-2'>
								cancel
							</button>
						</div>
					</Modal.Footer>
				</Modal>
			</div>
		</>
	);
};

export default ADD_STOCK_INVENTORY;
