import { Clear, Delete } from "@mui/icons-material";
import { useContext } from "react";
import { Table } from "react-bootstrap";
import { BillingContext } from "./BillingContext";
import TrTable from "./TableTr";
import { currencyFormatter } from "../../Auth/customFetch";

export default function TestBillingTable({ toast }) {
	const { billingdata, updateBilling } = useContext(BillingContext);
	const cart = billingdata?.cart;


	const removeFromCart = (testId) => {
		updateBilling(function (prev) {
			const newCart = prev.cart.filter((item) => item.id !== testId);
			return { ...prev, cart: newCart };
		});
	};

	if (!billingdata.billingSource) {
		return <div className="br-0 alert border-2 border-danger alert-danger alert-dismissible"> Select Billing Source to continue</div>;
	}

	return (
		<div className="table-responsive-sm">
			<Table className="ttable billing-cart-table" >
				<thead className="text-capitalize">
					<tr>
						<th >Test</th>
						<th >Outsourcing To</th>
						<th style={{ width: '10%' }}>Price</th>
						<th style={{ width: '10%' }} >discount</th>
						<th style={{ width: '10%' }}>Action</th>
					</tr>
				</thead>
				<tbody>
					{cart.length > 0 && cart.map((item, index) => (
						<tr style={{ fontSize: '12px' }} className={item.isoutsourced === 1 ? 'table-danger' : ''} key={index}>
							<td>{item.name}</td>
							<td>
								{item.isoutsourced === 1 && item?.label}
							</td>
							<td>{currencyFormatter.format(item.discountedValue)}</td>
							<td>{currencyFormatter.format(item.discount || 0)}</td>
							<td>
								<button
									className="btn btn-danger btn-sm"
									onClick={() => removeFromCart(item.id)}
								>
									<Delete />
								</button>
							</td>
						</tr>
					))}
					<TrTable toast={toast} />
				</tbody>
				<tfoot>
					<tr className="table-secondary">
						<td colSpan={2}> Test Count {billingdata.cart.length}</td>
						<td >  {currencyFormatter.format(billingdata.testcost)}</td>
						<td > {currencyFormatter.format(billingdata.discount)}</td>
						<td>
							<button className="btn btn-danger btn-sm">
								<Delete />
							</button>
						</td>
					</tr>
				</tfoot>
			</Table>
		</div>
	);
}
