"use client";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { customPost } from "../../../../Lib/fetcher";
import NoDataAvailable from "../../../accessories/NoDataAvailable";


type RequisitionItem = {
	id: number;
	name: string;
	quantity: number;
	quantity_requested: number;
	quantity_approved: number;
};

type DepartmentalStockRequestServingProps = {
	departmentid: number;
	data: RequisitionItem[];
};

export default function DepartmentalStockRequestServing({
	departmentid,
	data = [],
}: DepartmentalStockRequestServingProps) {
	const [requisitions, setRequisitions] = useState<RequisitionItem[]>(data);
	const EMPLOYEEID = 3;

	const handleQuantity = (ev: React.ChangeEvent<HTMLInputElement>, item: RequisitionItem) => {
		ev.preventDefault();
		let value = ev.target.value;
		if (value.length > 0) {
			setRequisitions((prev) => {
				return prev.map((a: RequisitionItem) => {
					if (a.id === item.id) {
						return { ...a, quantity_approved: parseInt(value) };
					}
					return a;
				});
			});
		}
	};

	const handleSupply = async (ev: React.MouseEvent<HTMLButtonElement>, item: RequisitionItem) => {
		const { quantity, quantity_requested, quantity_approved, id } = item;

		if (quantity_approved > quantity || quantity_approved < 0) {
			const updatedRequisitions = requisitions.map((a) => {
				if (a.id === id) {
					return { ...a, quantity_approved: quantity_requested };
				}
				return a;
			});
			setRequisitions(updatedRequisitions);
			toast.warning(
				"Quantity should not be less than 0 and not greater than quantity available in store",
				{ autoClose: 3000 }
			);
		} else {
			const data = { quantity: quantity_approved, status: "approved", requisitionid: id ,employeeid:EMPLOYEEID};
			const response = await customPost(`departments/requisitions/stage1`, "PATCH", data);
			if (response?.status == "success") {
				toast.success("Requisition updated successfully", { autoClose: 1000 });
				const updatedRequisitions = requisitions.filter((item) => item.id !== id);
				setRequisitions(updatedRequisitions);
			} else {
				toast.error("Approval failed", { autoClose: 2000 });
			}
		}
	};

	if (requisitions.length === 0) return <NoDataAvailable message="No Pending requisitions to be dispatched" />

	return (
		<>
			<ToastContainer position="top-center" closeButton theme="colored" className={'text-sm'} />
			<table className="table table-striped border border-1  border-secondary-subtle ">
				<thead>
					<tr className="p-2">
						<th className="fw-bold">Name</th>
						<th className="fw-bold">Store qty</th>
						<th className="fw-bold">Quantity Requested</th>
						<th className="fw-bold">Qty Approved</th>
						<th className="fw-bold">Action</th>
					</tr>
				</thead>
				<tbody>
					{requisitions.map((item) => (
						<tr key={item.id}>
							<td>{item.name}</td>
							<td >{item.quantity}</td>
							<td>{item.quantity_requested}</td>
							<td>
								<input
									disabled={item.quantity === 0}
									className="custom-input"
									value={item.quantity_approved || ""}
									placeholder={item.quantity === 0 ? "out of stock" : ""}
									type="number"
									onChange={(ev) => handleQuantity(ev, item)}
								/>
							</td>
							<td>
								<button
									onClick={(ev) => handleSupply(ev, item)}
									className="btn btn-primary btn-sm"
								>
									Supply
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	);
}
