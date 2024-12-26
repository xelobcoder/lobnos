import Select from "react-select";
import Add from "../../icons/PlusOutlineSvg";
import { useContext, useEffect, useState } from "react";
import { BillingContext } from "./BillingContext";
import { customFetch } from "../../Auth/customFetch";
import Link from "next/link";
import { LinkOff } from "@mui/icons-material";
import { hasPreviousRecords } from "../../../lib/billingLib";
import { useApplicationSettings } from "../../Auth/useApplicationContext";

export default function TrTable({ toast }) {
	const { billingdata, updateBilling, recalculateTotalBill } = useContext(BillingContext);
	const { applicationsettings } = useApplicationSettings();
	const { user } = applicationsettings;
	const role = user?.role;
	const [loadingOutsource, setLoadingOutsource] = useState(false);
	const [selected, setSelected] = useState(null);
	const [selectedOutsource, setSelectedOutsource] = useState(null);
	const [OutsourcingCompaniesList, setOutSourcedCompanies] = useState([]);
	const { cart } = billingdata;


	const options = OutsourcingCompaniesList.map(org => ({
		value: org.outsourceid,
		label: org.name,
		organization: org
	}));


	const fetchStoredOrganizations = async (testid) => {
		if (testid) {
			try {
				setLoadingOutsource(true);
				const storedOrgs = await customFetch(`outsourcing/organization/testpanel/outsourceinfo?testid=${testid}`);
				const selectedOrgs = storedOrgs.map(org => ({
					outsourceid: org.outsourceid,
					name: org.name,
					organizationType: org.organizationType
				}));
				setOutSourcedCompanies(selectedOrgs);
			} catch (error) {
				toast.error(`Error fetching stored organizations:${error}`);
				setLoadingOutsource(false);
			} finally {
				setLoadingOutsource(false);
			}
		}
	};

	const handleSelectChange = async (selectedOption) => {
		setSelectedOutsource(selectedOption)
	};

	const addtoCart = async () => {
		if (!selected || typeof selected != "object") return;
		const testid = selected?.id;
		if (hasPreviousRecords(billingdata, selected)) return;
		const newItem = selected?.isoutsourced && selectedOutsource?.label ? { ...selected, ...selectedOutsource } : selected

		if (cart.length === 0) {
			updateBilling({ ...billingdata, cart: [...billingdata.cart, newItem] });
		} else {
			updateBilling((prev) => {
				const { cart } = prev;
				const isInCart = cart.some((item, index) => parseInt(item?.id) == parseInt(testid));
				if (!isInCart) {
					return { ...prev, cart: [...cart, newItem] };
				} else return prev;
			});
		}
		setOutSourcedCompanies([]);
		setLoadingOutsource(false);
		setSelected(null);
		setSelectedOutsource(null);
	};


	const handleDiscount = (ev) => {
		const { value } = ev.target;
		setSelected({ ...selected, discount: parseFloat(value) })
	}


	const handleTestSelectedChangeVariable = (newValue) => {
		if (typeof newValue != "object") return;
		const { isoutsourced, id } = newValue;
		const testid = billingdata.billingSource == 2 ? newValue?.testid : id;
		if (isoutsourced == 1) {
			if (billingdata.cart.length === 0) {
				fetchStoredOrganizations(testid);
			} else {
				const isFound = billingdata.cart.find((item, index) => item.id == id);
				!isFound && fetchStoredOrganizations(testid);
			}
		}
		setSelected(newValue);
	}

	useEffect(() => {
		if (cart.length >= 0) {
			recalculateTotalBill(billingdata);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cart.length]);



	const displayOutsourcingChoicingOptions = () => {
		if (loadingOutsource && selected?.isoutsourced == 1) return <div>Loading test outsourcings organizations ....</div>;
		else if (OutsourcingCompaniesList.length > 0 && !loadingOutsource && selected?.isoutsourced == 1) {
			return (<div >
				<Select
					className="react-select-container"
					classNamePrefix="react-select"
					options={options}
					onChange={handleSelectChange}

					placeholder="Select outsouring org"
				/>
			</div>)
		}
		else if (OutsourcingCompaniesList.length == 0 && !loadingOutsource && selected?.isoutsourced == 1 && !billingdata.cart.find((item, index) => item.id == selected?.id)) {
			return (<div>
				{role && ['manager', 'admin'].includes(role) ?
					<div>
						organization not added for test <br /><Link href={`/settings/testpanel/testlist/${selected?.id}/outsourcingList?testname=R${selected?.name}`}><LinkOff /> Add Outsourcing organization</Link>
					</div>
					:
					<div>Outsourcing organization not added to test</div>}
			</div>)
		} else {
			return <div></div>
		}
	}
	return (
		<tr >
			<td colSpan={'sm-4'}>
				<Select
					options={billingdata.testpanels}
					className="react-select-container"
					classNamePrefix="react-select"
					getOptionLabel={(option) => option.name}
					getOptionValue={(option) => option.id}
					styles={{ container: (base) => ({ ...base, width: "100%" }) }}
					placeholder="search test here please"
					onChange={(newValue) => handleTestSelectedChangeVariable(newValue)}
				/>
			</td>
			<td colSpan={1}>
				{displayOutsourcingChoicingOptions()}
			</td>
			<td></td>
			<td>
				<input
					onChange={(ev) => { handleDiscount(ev) }}
					disabled={!['manager', 'admin'].includes(role)}
					className="custom-input" type="number" step={0.1} max={selected != null ? selected.discountedValue : ''} />
			</td>
			<td>
				<button
					onClick={(ev) => {
						addtoCart();
					}}
					className="btn btn-secondary">
					<Add />
				</button>
			</td>
		</tr>
	);
}
