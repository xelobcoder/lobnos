

import { RiPencilLine, RiDeleteBinLine } from '@remixicon/react';
import { useState, useContext } from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import Select from "react-select";
import MultiTrTable from "./MultiTrTable";
import { currencyFormatter, customFetch } from "../../Auth/customFetch";
import { MultiBillingContext } from "./MultiBillingContext";


export default function MultiTestBillingTable({ canload, addFirst=false, entryDraft, setEntryDraft }: { canload: boolean; addFirst?:boolean;entryDraft?:any;setEntryDraft?:any }) {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata, setBillingData, recalculateTotalBill } = context;
    const cart = Array.isArray(billingdata?.cart) ? billingdata.cart : [];
    const [editingItem, setEditingItem] = useState<any>(null);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { amountPayable, paid } = billingdata;

    const removeFromCart = (testId: any) => {
        if (cart.length === 0) return;
        if (cart.length === 1) {
           setBillingData({ ...billingdata, cart: [], totaldiscount: 0, totalTestAmountPayable: 0 });
        } else {
            const filteredCart = cart.filter((item: any) => item.id !== testId);
            recalculateTotalBill({ ...billingdata, cart: filteredCart });
        }
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

    if (!canload) {
        <Button
            variant="primary"
            size="sm"
            className="me-2"
            aria-label="Load Billing Data"
            style={{ height: 38, marginLeft: '-20px !important' }}
        >
            Start Transaction
        </Button>
    }

    return (
        <div className="table-responsive-sm">
            <Table className="ttable billing-cart-table">
                <thead className="text-capitalize">
                    <tr>
                        <th>Test</th>
                        {!addFirst&&<th>Outsourcing To</th>}
                        <th style={{ width: '10%' }}>Price</th>
                        {!addFirst&&<th style={{ width: '10%' }}>Type</th>}
                        {!addFirst&&<th style={{ width: '10%' }}>Adj. value</th>}
                        <th style={{ width: '10%' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {addFirst&&<MultiTrTable portalMenu entryDraft={entryDraft} setEntryDraft={setEntryDraft}/>}
                    {cart.length > 0 && cart.map((item: any, index: number) => (
                        <tr style={{ fontSize: '12px' }} className={item.isoutsourced === 1 ? 'table-warning' : ''} key={index}>
                            <td>{item.name}{addFirst&&<div className="text-muted small">{item.organization?.name&&<span>Outsource: {item.organization.name} · </span>}{item.userAdjustmentType&&<span>{item.userAdjustmentType}: {currencyFormatter.format(item.userAdjustedValue??0)}</span>}{editingItem?.id===item.id&&(loading?<Spinner size="sm"/>:<Select menuPortalTarget={typeof document!=='undefined'?document.body:undefined} menuPosition="fixed" styles={{menuPortal:base=>({...base,zIndex:1060})}} options={organizations} onChange={handleOrganizationChange} defaultValue={organizations.find((org:any)=>org.value===item.outsourceid)} aria-label={'Outsourcing organization for '+item.name}/>)}</div>}</td>
                            {!addFirst&&<td>
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
                            </td>}
                            <td>{currencyFormatter.format(item.discountedValue ?? 0)}</td>
                            {!addFirst&&<td>{item.userAdjustmentType || 'Normal Pricing'}</td>}
                            {!addFirst&&<td>{currencyFormatter.format(item.userAdjustedValue ?? 0)}</td>}
                            <td>
                                {addFirst ? <div className="d-flex gap-1">{item.isoutsourced===1&&<button type="button" className="btn btn-sm btn-outline-primary" aria-label={'Edit outsourcing for '+item.name} onClick={()=>void handleEditTest(item)}><RiPencilLine size={16}/></button>}<button type="button" className="btn btn-sm btn-outline-danger" aria-label={'Remove '+item.name} onClick={()=>removeFromCart(item.id)}><RiDeleteBinLine size={16}/></button></div> : <>
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
                                </>}
                            </td>
                        </tr>
                    ))}
                    {!addFirst&&<MultiTrTable/>}
                </tbody>
                {addFirst?<tfoot><tr><td>{cart.length} tests</td><td>{currencyFormatter.format(billingdata.totalTestAmountPayable??0)}</td><td><button type="button" className="btn btn-sm btn-outline-danger" aria-label="Clear all tests" disabled={!cart.length} onClick={()=>setBillingData({...billingdata,cart:[],totaldiscount:0,totalTestAmountPayable:0})}>Clear</button></td></tr></tfoot>:<tfoot>
                    <tr >
                        <td colSpan={2}>Test Count {cart.length}</td>
                        <td>{currencyFormatter.format(billingdata.totalTestAmountPayable ?? 0)}</td>
                        <td>{currencyFormatter.format(billingdata.totaldiscount ?? 0)}</td>
                        <td>
                            <button className="btn btn-danger btn-sm" onClick={() => {
                                // recalculateTotalBill({ ...billingdata, cart: [] })
                                setBillingData({ ...billingdata, cart: [], totaldiscount: 0, totalTestAmountPayable: 0 });
                            }}>
                                <RiDeleteBinLine size={16} />
                            </button>
                        </td>
                    </tr>
                </tfoot>}
            </Table>
        </div>
    );
}
