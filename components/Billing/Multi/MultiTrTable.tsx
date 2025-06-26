import Select from "react-select";
import { RiAddLine, RiLinkUnlinkM } from '@remixicon/react';
import Add from "../../icons/PlusOutlineSvg";
import { useState, useContext } from "react";
import Link from "next/link";
import { hasPreviousRecords } from "../../../lib/billingLib";
import { MultiBillingContext } from "./MultiBillingContext";
import { useApplication } from "../../Auth/useApplicationContext";



export default function MultiTrTable() {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata, setBillingData, recalculateTotalBill } = context;

    const [loadingOutsource, setLoadingOutsource] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const { role } = useApplication()?.user;
    const [selectedOutsource, setSelectedOutsource] = useState<any>(null);
    const [OutsourcingCompaniesList, setOutSourcedCompanies] = useState<any[]>([]);
    const { cart } = billingdata;

    const options = OutsourcingCompaniesList.map(org => ({
        value: org.outsourceid,
        label: org.name,
        organization: org
    }));

    const fetchStoredOrganizations = async (testid: any) => {
        if (testid) {
            try {
                setLoadingOutsource(true);
                const storedOrgs = await fetch(`/api/outsourcing/organization/testpanel/outsourceinfo?testid=${testid}`).then(res => res.json());
                const selectedOrgs = storedOrgs.map((org: any) => ({
                    outsourceid: org.outsourceid,
                    name: org.name,
                    organizationType: org.organizationType
                }));
                setOutSourcedCompanies(selectedOrgs);
            } catch (error) {
                setLoadingOutsource(false);
            } finally {
                setLoadingOutsource(false);
            }
        }
    };

    const handleSelectChange = async (selectedOption: any) => {
        setSelectedOutsource(selectedOption)
    };

    const addtoCart = async () => {
        if (!selected || typeof selected != "object") return;
        const testid = selected?.id;
        if (hasPreviousRecords(billingdata, selected)) return;
        const newItem = selected?.isoutsourced && selectedOutsource?.label ?
            {
                ...selected,
                ...selectedOutsource,
                discount: selected.discount ? selected.discount : 0
            }
            : {
                ...selected, discount: selected.discount ? selected.discount : 0
            }

        if (cart.length === 0) {
            recalculateTotalBill({ ...billingdata, cart: [newItem] })
        } else {
            const isInCart = cart.some((item: any) => parseInt(item?.id) == parseInt(testid));
            const newCart = (!isInCart) ? [...cart, newItem] : cart
            recalculateTotalBill({ ...billingdata, cart: newCart })
        }
        setOutSourcedCompanies([]);
        setLoadingOutsource(false);
        setSelected(null);
        setSelectedOutsource(null);
    };

    const handleDiscount = (ev: any) => {
        const { value } = ev.target;
        setSelected({ ...selected, discount: parseFloat(value) })
    }

    const handleTestSelectedChangeVariable = (newValue: any) => {
        if (typeof newValue != "object") return;
        const { isoutsourced, id } = newValue;
        const testid = billingdata.billingSource == 2 ? newValue?.testid : id;
        if (isoutsourced == 1) {
            if (billingdata.cart.length === 0) {
                fetchStoredOrganizations(testid);
            } else {
                const isFound = billingdata.cart.find((item: any) => item.id == id);
                !isFound && fetchStoredOrganizations(testid);
            }
        }
        setSelected(newValue);
    }

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
        else if (OutsourcingCompaniesList.length == 0 && !loadingOutsource && selected?.isoutsourced == 1 && !billingdata.cart.find((item: any) => item.id == selected?.id)) {
            return (<div>
                {role && ['manager', 'admin'].includes(role) ?
                    <div>
                        organization not added for test <br /><Link href={`/settings/applicationsettings/testpanels/testlist/${selected?.id}/outsourcingList?testname=R${selected?.name}`}>
                            <RiLinkUnlinkM size={16} /> Add Outsourcing organization
                        </Link>
                        <button
                            onClick={(ev) => {
                                addtoCart();
                            }}
                            className="btn btn-secondary">
                            <RiAddLine size={18} />
                        </button>
                    </div>
                    :
                    <div>Outsourcing organization not added to test</div>}
            </div>)
        } else {
            return <div></div>
        }
    }

    if (billingdata.isPackageUsed) return null;
    return (
        <tr>
            <td>
                <Select
                    options={Array.isArray(billingdata.testList) ? billingdata.testList : []}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    getOptionLabel={(option: any) => option?.name || ''}
                    isDisabled={!Array.isArray(billingdata.testList) || billingdata.testList.length === 0}
                    getOptionValue={(option: any) => option?.id}
                    styles={{ container: (base: any) => ({ ...base, width: "100%" }) }}
                    placeholder={(!Array.isArray(billingdata.testList) || billingdata.testList.length === 0) ? "No tests available" : "Search test here"}
                    onChange={(newValue: any) => handleTestSelectedChangeVariable(newValue)}
                />
            </td>
            <td>
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
