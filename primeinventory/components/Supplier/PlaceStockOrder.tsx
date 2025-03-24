"use client";
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { StockItemPlaceOrder } from '../../app/purchasemanagement/placeorder/page';

interface Stock {
	stockid: number;
	name: string;
}

interface Supplier {
	supplierid: number;
	name: string;
}



interface PLACE_ORDERProps {
	source: Stock[];
	cartHandler: (ev: React.FormEvent, field: StockItemPlaceOrder) => void;
	suppliers: Supplier[];
	supplierid: number |null,
	editdata: StockItemPlaceOrder | null;
	cart: StockItemPlaceOrder[];
}

type typeDefaultData = Pick<StockItemPlaceOrder, "name" | "purchaseunit" | "quantity" | "suppliername" | "stockid">
export default function PlaceStockOrder({ source, supplierid=0, cartHandler, suppliers, editdata, cart }: PLACE_ORDERProps) {

	const purchaseunit = ['kg', 'g', 'litre', 'unit', 'Box', 'Bottle'];
	const defaultdata: StockItemPlaceOrder = { name: '', purchaseunit: '', quantity: 0, suppliername: '', stockid: 0, supplierid: supplierid || 0 };
	const [field, setField] = useState<StockItemPlaceOrder>(defaultdata);
	const [target, setTarget] = useState<number | string>(0);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const handleChange = (value: any, target: string) => {
		if (!value || typeof target !== 'string') return;
		if (target === 'stock') {
			const { stockid, name } = value;
			setField({ ...field, stockid, name });
		}
		if (target === 'supplier') {
			const { supplierid, name } = value;
			setField({ ...field, supplierid, suppliername: name });
		}
		if (target === 'purchaseunit') {
			setField({ ...field, purchaseunit: value });
		}
		if (target === 'qty') {
			setField({ ...field, quantity: value });
		}
	};

	useEffect(() => {
		if (editdata && Object.keys(editdata).length > 0) setField(editdata);
	}, [editdata]);

	const handleAddCart = (ev: React.FormEvent) => {
		ev.preventDefault();
		setTarget(0);
		const { stockid, supplierid, purchaseunit, quantity } = field as StockItemPlaceOrder;
		if (Object.keys(field).length === 0) setTarget('all');
		const empty = [stockid, supplierid, purchaseunit, quantity].findIndex((a) => a === 0 || a === '' || a === undefined);
		if (typeof empty === 'number' && empty > 0) setTarget(empty + 1);
		if (empty === -1) {
			cartHandler(ev, field as StockItemPlaceOrder);
			setField(defaultdata);
		}
	};

	if (!isClient) return null;

	return (
		<section>
			<form>
				<div className="form-container d-flex">
					<div className="form-group col-3">
						<label>Stock</label>
						<Select
							className="custom-autocomplete"
							options={source}
							id="pis-tiifu"
							getOptionLabel={(option) => option.name}
							getOptionValue={(option) => option.stockid.toString()}
							value={source.find((option) => option.stockid === field.stockid) || null}
							onChange={(value) => handleChange(value, 'stock')}
							placeholder="Search stock here"
							isClearable
						/>
					</div>

					{!supplierid && (
						<div className="form-group col-3 mx-2">
							<label>Supplier</label>
							<Select
								className="custom-autocomplete"
								options={suppliers}
								id="pis-tiifu-1"
								getOptionLabel={(option) => option.name}
								getOptionValue={(option) => option.supplierid.toString()}
								value={suppliers.find((option: Required<StockItemPlaceOrder>) => option.supplierid === field.supplierid) || null}
								onChange={(value) => handleChange(value, 'supplier')}
								placeholder="Search supplier here"
								isClearable
							/>
						</div>

					)}
					<div className="form-group col-2 mx-2">
						<label>Purchase Unit</label>
						<Select
							id="pis-tiifu-2"
							className="custom-autocomplete"
							options={purchaseunit.map((unit) => ({ label: unit, value: unit }))}
							getOptionLabel={(option) => option.label}
							getOptionValue={(option) => option.value}
							value={{ label: field.purchaseunit, value: field.purchaseunit }}
							onChange={(value) => {
								if (value) {
									handleChange(value.value, 'purchaseunit')
								}
							}}
							placeholder="Search purchase unit here"
							isClearable
						/>
					</div>

					<div className="form-group col-2">
						<label>Quantity</label>
						<input
							className="custom-input"
							style={{ height: 37 }}
							value={field.quantity}
							onChange={(ev) => handleChange(ev.target.value, 'qty')}
							required
							placeholder="Quantity"
							type="number"
						/>
					</div>

					<div className="form-group d-flex justify-content-center align-items-center">
						<button type="button" onClick={handleAddCart} className="btn btn-primary btn-add-cart mx-2 mt-3">
							Add to Cart
						</button>
					</div>
				</div>

				{/* Display errors below the form */}
				{(target === 'all' || target === 1) && (
					<div className="text-danger text-capitalize text-sm">Stock is required and must be filled</div>
				)}
				{(target === 'all' || target === 2) && (
					<div className="text-danger text-sm text-capitalize">Supplier is required and must be filled</div>
				)}
				{(target === 'all' || target === 3) && (
					<div className="text-danger text-sm text-capitalize">Unit of purchase is required and must be filled</div>
				)}
				{(target === 'all' || target === 4) && (
					<div className="text-danger text-sm text-capitalize">Quantity must be filled</div>
				)}
			</form>
		</section>
	);
}
