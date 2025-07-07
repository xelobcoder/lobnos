

import { RiPencilLine, RiDeleteBinLine } from '@remixicon/react';
import { useState, useContext } from "react";
import { Table, Spinner } from "react-bootstrap";
import Select from "react-select";
import MultiTrTable from "./MultiTrTable";
import { currencyFormatter, customFetch } from "../../Auth/customFetch";
import { MultiBillingContext } from "./MultiBillingContext";


export default function MultiTestBillingTable() {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata, setBillingData, recalculateTotalBill } = context;
    const cart = Array.isArray(billingdata?.cart) ? billingdata.cart : [];
    const [editingItem, setEditingItem] = useState<any>(null);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const {amountPayable,paid } = billingdata;

    const removeFromCart = (testId: any) => {
        const filteredCart = cart.filter((item: any) => item.id !== testId);
        recalculateTotalBill({ ...billingdata, cart: filteredCart });
    };

    const handleEditTest = async (item: any) => {
        setEditingItem(item);
        setLoading(true);
        try {
            const storedOrgs = await customFetch(`outsourcing/organization/testpanel/outsourceinfo?testid=${item.id}`);
            const orgOptions = Array.isArray(storedOrgs) ? storedOrgs.map((org: any) => ({
                value: org.outsourceid,
                label: `${org.name}  ${org.organizationType}`,
                organizationType: org.organizationType,
                outsourceid: org.outsourceid,
                name: org.name
            })) : [];
            setOrganizations(orgOptions);
        } catch (error) {
            // Removed toast error handling as per the change request
        } finally {
            setLoading(false);
        }
    };

    const handleOrganizationChange = (selectedOption: any) => {
        if (editingItem) {
            const updatedCart = cart.map((item: any) =>
                item.id === editingItem.id
                    ? {
                        ...item,
                        outsourcingOrg: selectedOption.label,
                        outsourceid: selectedOption.value,
                        organization: {
                            name: selectedOption.name,
                            organizationType: selectedOption.organizationType,
                            outsourceid: selectedOption.outsourceid
                        },
                        label: selectedOption.label
                    }
                    : item
            );
            setBillingData({ ...billingdata, cart: updatedCart });
            setEditingItem(null);
        }
    };


    if (!billingdata.billingSource) {
        return <div className="br-0 alert border-2 border-danger alert-danger alert-dismissible br-5 text-sm">Select Billing Source to continue</div>;
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
                    {cart.length > 0 && cart.map((item: any, index: number) => (
                        <tr style={{ fontSize: '12px' }} className={item.isoutsourced === 1 ? 'table-warning' : ''} key={index}>
                            <td>{item.name}</td>
                            <td>
                                {editingItem?.id === item.id ? (
                                    loading ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        <Select
                                            options={organizations}
                                            onChange={handleOrganizationChange}
                                            defaultValue={organizations.find((org: any) => org.value === item.outsourceid)}
                                            placeholder="Select Organization"
                                        />
                                    )
                                ) : (
                                    item.organization?.name || "-"
                                )}
                            </td>
                            <td>{currencyFormatter.format(item.discountedValue ?? 0)}</td>
                            <td>{currencyFormatter.format(item.discount ?? 0)}</td>
                            <td>
                                {item.isoutsourced === 1 && (
                                    <RiPencilLine 
                                        className="text-primary" 
                                        onClick={() => handleEditTest(item)} 
                                        style={{ cursor: "pointer" }}
                                        size={16}
                                    />
                                )}
                                <RiDeleteBinLine 
                                    className="text-danger" 
                                    onClick={() => removeFromCart(item.id)} 
                                    style={{ cursor: "pointer" }}
                                    size={16}
                                />
                            </td>
                        </tr>
                    ))}
                    <MultiTrTable 
                    />
                </tbody>
                <tfoot>
                    <tr className="table-secondary">
                        <td colSpan={2}>Test Count {cart.length}</td>
                        <td>{currencyFormatter.format(billingdata.amountPayable ?? 0)}</td>
                        <td>{currencyFormatter.format(billingdata.totaldiscount?? 0)}</td>
                        <td>
                            <button className="btn btn-danger btn-sm" onClick={() => recalculateTotalBill({ ...billingdata, cart: [] })}>
                                <RiDeleteBinLine size={16} />
                            </button>
                        </td>
                    </tr>
                </tfoot>
            </Table>
        </div>
    );
}
