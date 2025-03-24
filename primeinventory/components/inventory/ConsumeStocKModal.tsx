"use client";

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Loader from "../accessories/Loader";
import { customData, customPost } from "../../Lib/fetcher";
import { stockConsumptionType } from "../interfaces/departmentInterface";
import { toast, ToastContainer } from "react-toastify";
type StockLot = {
	id: number,
	batchnumber: string,
	brand: string,
	brandid: number,
	departmentid: number,
	quantity: number
}


type filteredBatch = {
	data: any[] | [],
	batch: string,
	qty: (number | string),
	selected: any
	batchname?: string
}

export default function ConsumeStockModal({ data, setShow, show, employeeid }: { setShow: Dispatch<SetStateAction<boolean>>, show: boolean, data: stockConsumptionType, employeeid: number }) {
	const { stockid, stockname, departmentid, quantityAvailable } = data;
	const [loading, setLoading] = useState(true);
	const [stockLot, setStockLot] = useState<StockLot[]>([]);
	const [active, setActive] = useState(true);
	const [filteredBatch, setFilteredBatch] = useState<filteredBatch>({ data: [], batch: "", qty: 0, selected: {} });
	const [qtyProvided, setQtyProvided] = useState<number>(0);

	const getStockLot = useCallback(
		async (stockid: number) => {
			try {
				setLoading(true);
				await customData(`stock/department/consume/lot?stockid=${stockid}&departmentid=${departmentid}`, setStockLot);
				setLoading(false);
			} catch (err) {
				setLoading(false);
				setStockLot([]);
			}
		},
		[departmentid]
	);

	useEffect(() => {
		if (stockid && departmentid) {
			getStockLot(stockid);
		}
	}, [stockid, departmentid, getStockLot]);

	const getLotsBrandAndQty = async (name: string) => {
		const matched = stockLot.filter((item: StockLot) => item.brand === name);
		setFilteredBatch({ ...filteredBatch, data: matched });
		setActive(false);
	};

	const handleBatch = async (batchid) => {
		const matched = filteredBatch.data.filter((item: StockLot) => item.id == batchid);
		if (matched.length > 0) {
			setFilteredBatch({ ...filteredBatch, batch: batchid, qty: matched[0].quantity, selected: matched[0] });
		}
	};

	const handleProvidedQtyNeeded = (ev) => {
		const value = ev.target.value;
		if (!isNaN(value)) setQtyProvided(parseInt(value.toString()));
	};

	const checkForRightQty = () => {
		if (qtyProvided && qtyProvided > parseFloat(filteredBatch.qty.toString())) {
			alert("Provide less or equal to quantity available")
		}
	}

	const handleSubmit = async (ev) => {
		try {
			ev.preventDefault();
			const { batchnumber, brand, brandid, productordersid } = filteredBatch.selected;
			const dataToSubmit = {
				stockname,
				stockid,
				departmentid,
				consumeqty: qtyProvided,
				batchnumber,
				brand,
				productordersid,
				brandid,
				employeeid,
			};
			const consumeResponse = await customPost(`departments/stock/consume`, "POST", dataToSubmit);
			const { status, message } = consumeResponse;
			status == 'success' ? toast.success(message) : toast.error(message);
			setTimeout(() => {
				setShow(false);
			}, 1000);
		} catch (err) {
			toast.error('Something wrong occured');
		}
	};

	const renderer = () => {
		if (loading) return <Loader />
		return (
			<form>
				<div className="form-row">
					<label>Stock Name</label>
					<input type="text" className="form-control" style={{ height: "50px" }} value={stockname} disabled required />
				</div>
				<div className="form-row">
					<label>Qty Available</label>
					<input type="text" className="form-control" style={{ height: "50px" }} value={quantityAvailable} disabled required />
				</div>
				<div className="form-row">
					<label>Brand</label>
					<select className="form-control" onChange={(ev) => getLotsBrandAndQty(ev.target.value)}>
						<option>Select Brand</option>
						{stockLot.map((item, index) => (
							<option key={index} value={item.brand}>
								{item.brand}
							</option>
						))}
					</select>
				</div>
				<div className="form-row d-flex mt-2 gap-2">
					<select
						disabled={active}
						className="form-control"
						onChange={(ev) => handleBatch(ev.target.value)}
					>
						<option>Select a Batch Number</option>
						{filteredBatch.data.map((item: StockLot, index: number) => (
							<option key={index} value={item.id}>
								{item.batchnumber}
							</option>
						))}
					</select>
					<input
						value={filteredBatch.qty}
						disabled
						className="form-control"
						style={{ height: "50px" }}
						placeholder="Qty of Brand Available"
					/>
				</div>
				<div className="form-row">
					<label>
						Qty to be Consumed
						<span className="text-danger" style={{ fontSize: "12px" }}>
							{" "}
							(Must be less or equal to available quantity)
						</span>
					</label>
					<input
						type="text"
						className="form-control"
						style={{ height: "50px" }}
						onBlur={checkForRightQty}
						value={qtyProvided || 0}
						onChange={handleProvidedQtyNeeded}
						required
					/>
				</div>
			</form>
		);
	};

	return (
		<Modal size="lg" show={show} onHide={() => setShow(false)} style={{ zIndex: 9999 }}>
			<Modal.Header closeButton>
				<Modal.Title>
					<h4>Consume {stockname}</h4>
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>{renderer()}</Modal.Body>
			<Modal.Footer className="d-flex justify-content-start">
				<ToastContainer position="top-center" className={'text-sm'} theme="colored" />
				<button
					onClick={handleSubmit}
					disabled={loading}
					className="btn btn-warning"
				>
					Consume
				</button>
				<button
					onClick={() => {
						setActive(true);
						setFilteredBatch({ data: [], qty: 0, batch: "", selected: null });
						setShow(false);
					}}
					disabled={loading}
					className="btn btn-danger"
				>
					Cancel
				</button>
			</Modal.Footer>
		</Modal>
	);
}
