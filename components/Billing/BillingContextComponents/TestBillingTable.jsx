import { Clear, Delete, Edit } from "@mui/icons-material";
import { useContext, useState } from "react";
import { Table } from "react-bootstrap";
import Select from "react-select";
import { BillingContext } from "./BillingContext";
import TrTable from "./TableTr";
import { currencyFormatter, customFetch } from "../../Auth/customFetch";

export default function TestBillingTable({ toast }) {
	const { billingdata, updateBilling, recalculateTotalBill } = useContext(BillingContext);
	const cart = billingdata?.cart;

	const [editingItem, setEditingItem] = useState(null);
	const [organizations, setOrganizations] = useState([]);

	const removeFromCart = (testId) => {
		const filteredCart = cart.filter((item) => item.id !== testId);
		recalculateTotalBill({ ...billingdata, cart: filteredCart });
	};

	const handleEditTest = async (item) => {
		setEditingItem(item);
		try {
			const storedOrgs = await customFetch(`outsourcing/organization/testpanel/outsourceinfo?testid=${item.id}`);
			const orgOptions = storedOrgs.map(org => ({
				value: org.outsourceid,
				label: org.name,
				organizationType: org.organizationType
			}));
			setOrganizations(orgOptions);
		} catch (error) {
			toast.error(`Error fetching organizations: ${error}`);
		}
	};

	const handleOrganizationChange = (selectedOption) => {
		if (editingItem) {
			const updatedCart = cart.map(item =>
				item.id === editingItem.id
					? {
						...item,
						outsourcingOrg: selectedOption.label,
						outsourceid: selectedOption.value,
						organization: {
							name: selectedOption.label,
							outsourceid: selectedOption?.value, organizationType: selectedOption.organizationType
						}
					}
					: item
			);
			updateBilling({ ...billingdata, cart: updatedCart });
			setEditingItem(null);
		}
	};

	if (!billingdata.billingSource) {
		return <div className="br-0 alert border-2 border-danger alert-danger alert-dismissible">Select Billing Source to continue</div>;
	}

	return (
		<div className="table-responsive-sm">
			<Table className="ttable billing-cart-table">
				<thead className="text-capitalize">
					<tr>
						<th>Test</th>
						<th>Outsourcing To</th>
						<th style={{ width: '10%' }}>Price</th>
						<th style={{ width: '10%' }}>Discount</th>
						<th style={{ width: '10%' }}>Action</th>
					</tr>
				</thead>
				<tbody>
					{cart.length > 0 && cart.map((item, index) => (
						<tr style={{ fontSize: '12px' }} className={item.isoutsourced === 1 ? 'table-danger' : ''} key={index}>
							<td>{item.name}</td>
							<td>
								{editingItem?.id === item.id ? (
									<Select
										options={organizations}
										onChange={handleOrganizationChange}
										defaultValue={organizations.find(org => org.value === item.outsourceid)}
										placeholder="Select Organization"
									/>
								) : (
									item.outsourcingOrg || "-"
								)}
							</td>
							<td>{currencyFormatter.format(item.discountedValue)}</td>
							<td>{currencyFormatter.format(item.discount || 0)}</td>
							<td>
								{item.isoutsourced === 1 && (
									<Edit color="primary" onClick={() => handleEditTest(item)} style={{ cursor: "pointer" }} />
								)}
								<Delete color="error" onClick={() => removeFromCart(item.id)} style={{ cursor: "pointer" }} />
							</td>
						</tr>
					))}
					<TrTable toast={toast} />
				</tbody>
				<tfoot>
					<tr className="table-secondary">
						<td colSpan={2}>Test Count {billingdata.cart.length}</td>
						<td>{currencyFormatter.format(billingdata.testcost)}</td>
						<td>{currencyFormatter.format(billingdata.discount)}</td>
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
