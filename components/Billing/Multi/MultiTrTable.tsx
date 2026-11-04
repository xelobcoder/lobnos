import Select from "react-select";
import { RiAddLine, RiLinkUnlinkM } from '@remixicon/react';
import styles from '../Modern/ModernBilling.module.css';
import Add from "../../icons/PlusOutlineSvg";
import { useState, useContext, useRef, useEffect } from "react";
import Link from "next/link";
import { hasPreviousRecords } from "../../../lib/billingLib";
import { MultiBillingContext } from "./MultiBillingContext";
import { useApplication } from "../../Auth/useApplicationContext";
import { roleAllowed } from "../../Auth/roles";
import { customFetch, reactSelectCustomStyles } from "../../Auth/customFetch";




export default function MultiTrTable({portalMenu=false,entryDraft,setEntryDraft}:{portalMenu?:boolean;entryDraft?:any;setEntryDraft?:any}={}) {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata, setBillingData, recalculateTotalBill, pricingPending } = context;
    const [loadingOutsource, setLoadingOutsource] = useState(false);
    const [outsourceError,setOutsourceError]=useState(false);
    const [localSelected, setLocalSelected] = useState<any>(null);
    const selected = entryDraft ? entryDraft.selected : localSelected;
    const setSelected = (value:any) => entryDraft ? setEntryDraft((prev:any)=>({...prev,selected:value})) : setLocalSelected(value);
    const searchRef=useRef<any>(null);
    const [advanced,setAdvanced]=useState(false);
    const [announcement,setAnnouncement]=useState('');
    useEffect(()=>{if(portalMenu && !pricingPending && billingdata.testList?.length)searchRef.current?.focus();},[portalMenu,Boolean(billingdata.testList?.length),pricingPending]);
    const { role } = useApplication()?.user;
    const [localOutsource, setLocalOutsource] = useState<any>(null);
    const selectedOutsource=entryDraft?entryDraft.selectedOutsource:localOutsource;
    const setSelectedOutsource=(value:any)=>entryDraft?setEntryDraft((prev:any)=>({...prev,selectedOutsource:value})):setLocalOutsource(value);
    const [localOrganizations, setLocalOrganizations] = useState<any[]>([]);
    const OutsourcingCompaniesList=entryDraft?entryDraft.organizations:localOrganizations;
    const setOutSourcedCompanies=(value:any[])=>entryDraft?setEntryDraft((prev:any)=>({...prev,organizations:value})):setLocalOrganizations(value);
    const { cart } = billingdata;
    const applicationsettings = useApplication()?.settings;
    const allowCrmDiscount = roleAllowed(role, ['manager', 'admin']) ? true :
        applicationsettings?.AllowCrmToGiveDisocunt == 1 ? true : false;

    const options = OutsourcingCompaniesList.map((org: {outsourceid: number; name: string}) => ({
        value: org.outsourceid,
        label: org.name,
        organization: org
    }));

    const outsourceRequest=useRef(0);
    const fetchStoredOrganizations = async (testid: any) => {
        const request=++outsourceRequest.current;
        if(portalMenu)setOutsourceError(false);
        if (testid) {
            try {
                setLoadingOutsource(true);
                const storedOrgs = await customFetch(`outsourcing/organization/testpanel/outsourceinfo?testid=${testid}`)
                if(portalMenu && request!==outsourceRequest.current)return;
                const selectedOrgs = storedOrgs.map((org: any) => ({
                    outsourceid: org.outsourceid,
                    name: org.name,
                    organizationType: org.organizationType
                }));
                if(portalMenu && setEntryDraft){
                    setEntryDraft((prev:any)=>String(prev.selected?.testid)===String(testid)?{...prev,organizations:selectedOrgs,selectedOutsource:selectedOrgs.length===1?{value:selectedOrgs[0].outsourceid,label:selectedOrgs[0].name,organization:selectedOrgs[0]}:null}:prev);
                    return;
                }
                setOutSourcedCompanies(selectedOrgs);
                if (selectedOrgs.length === 1) {
                    const org = selectedOrgs[0];
                    setSelectedOutsource({
                        value: org.outsourceid,
                        label: org.name,
                        organization: org
                    });
                }
            } catch (error) {
                if(portalMenu && request!==outsourceRequest.current)return;
                if(portalMenu)setOutsourceError(true);
                setLoadingOutsource(false);
            } finally {
                if(!portalMenu || request===outsourceRequest.current)setLoadingOutsource(false);
            }
        }
    };

    const handleSelectChange = async (selectedOption: any) => {
        setSelectedOutsource(selectedOption)
    };

    const adding=useRef(false);
    const addtoCart = async () => {
        if(portalMenu && (adding.current||pricingPending))return;
        if (!selected || typeof selected != "object") return;
        const testid = selected?.id;
        if (hasPreviousRecords(billingdata, selected)) return;
        if(portalMenu && cart.some((item:any)=>parseInt(item.id)===parseInt(testid))){setAnnouncement(selected.name+' is already on this bill');return;}
        const newItem = selected?.isoutsourced && selectedOutsource?.label ?
            {
                ...selected,
                ...selectedOutsource,
                discount: selected.discount ? selected.discount : 0
            }
            : {
                ...selected, discount: selected.discount ? selected.discount : 0
            }

        let pricing:void|Promise<void>;
        if(portalMenu)adding.current=true;
        if (cart.length === 0) {
            pricing=recalculateTotalBill({ ...billingdata, cart: [newItem] })
        } else {
            const isInCart = cart.some((item: any) => parseInt(item?.id) == parseInt(testid));
            const newCart = (!isInCart) ? [...cart, newItem] : cart
            pricing=recalculateTotalBill({ ...billingdata, cart: newCart })
        }
        setOutSourcedCompanies([]);
        setLoadingOutsource(false);
        setSelected(null);
        setSelectedOutsource(null);
        if(portalMenu){setAnnouncement('Updating bill');searchRef.current?.focus();try{await pricing;}finally{adding.current=false;setAnnouncement('Pricing updated. Review the cart.');}}
    };

    const handleDiscount = (ev: any) => {
        const { value } = ev.target;
        setSelected({ ...selected, discount: parseFloat(value), userAdjustedValue: parseFloat(value) });
    }

    const handleTestSelectedChangeVariable = (newValue: any) => {
        if (typeof newValue != "object") return;
        if(portalMenu){outsourceRequest.current++;setSelectedOutsource(null);setOutSourcedCompanies([]);setLoadingOutsource(false);setOutsourceError(false);setAnnouncement('');}
        const { isoutsourced, id } = newValue;
        const testid = newValue?.testid;
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
        if(portalMenu&&outsourceError)return <div role="alert">Unable to load outsourcing organizations. <button type="button" className="btn btn-sm btn-outline-primary" onClick={()=>void fetchStoredOrganizations(selected?.testid)}>Retry</button></div>;
        if (loadingOutsource && selected?.isoutsourced == 1) return <div>Loading test outsourcings organizations ....</div>;
        else if (OutsourcingCompaniesList.length > 0 && !loadingOutsource && selected?.isoutsourced == 1) {
            if (OutsourcingCompaniesList.length === 1) {
                return (
                    <div style={{ padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
                        <strong>{selectedOutsource?.label || OutsourcingCompaniesList[0].name}</strong>
                    </div>
                );
            }
            return (<div >
                <Select menuPortalTarget={portalMenu&&typeof document!=='undefined'?document.body:undefined} menuPosition={portalMenu?'fixed':'absolute'}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    options={options}
                    value={selectedOutsource}
                    onChange={handleSelectChange}
                    aria-label={portalMenu?"Outsourcing organization":undefined}
                    styles={portalMenu?{menuPortal:base=>({...base,zIndex:1060})}:undefined}
                    placeholder="Select outsouring org"
                />
            </div>)
        }
        else if (OutsourcingCompaniesList.length == 0 && !loadingOutsource && selected?.isoutsourced == 1 && !billingdata.cart.find((item: any) => item.id == selected?.id)) {
            return (<div>
                {role && roleAllowed(role, ['manager', 'admin']) ?
                    <div>
                        organization not added for test
                        <br />
                        <Link href={`/settings/applicationsettings/testpanels/testlist/${selected?.testid}/outsourcingList?testname=R${selected?.name}`}>
                            <RiLinkUnlinkM size={16} /> Add Outsourcing organization
                        </Link>
                        <button
                            hidden={portalMenu}
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

    if(portalMenu){
        const needsOrganization=selected?.isoutsourced==1;
        const addDisabled=!selected||Boolean(pricingPending);
        const add=()=>{if(!addDisabled)void addtoCart();};
        return <tr><td colSpan={3} className={styles.entryCell}>
            <div className={styles.quickEntry} onKeyDown={event=>{if(event.ctrlKey&&event.key==='Enter'){event.preventDefault();add();}}}>
                <div className={styles.searchField}><label htmlFor="modern-test-search">Search tests <kbd>F2</kbd></label>
                <Select ref={searchRef} inputId="modern-test-search" aria-label="Search tests" value={selected}
                    menuPortalTarget={typeof document!=='undefined'?document.body:undefined} menuPosition="fixed"
                    options={Array.isArray(billingdata.testList)?billingdata.testList:[]}
                    getOptionLabel={(option:any)=>option?.name||''} getOptionValue={(option:any)=>String(option?.id)}
                    isDisabled={!billingdata.testList?.length} styles={{...reactSelectCustomStyles,menuPortal:base=>({...base,zIndex:1060})}}
                    placeholder="Type a test name…" onChange={value=>handleTestSelectedChangeVariable(value)}
                    aria-describedby="modern-entry-help"/>
                </div>
                {selected&&<span className={styles.entryPrice}>{new Intl.NumberFormat(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(selected.discountedValue??0))}</span>}
                <button type="button" className="btn btn-primary" disabled={addDisabled} onClick={add}>{pricingPending?'Pricing…':'Add test'} <kbd>Ctrl ↵</kbd></button>
                <button type="button" className="btn btn-outline-secondary" aria-expanded={advanced} onClick={()=>setAdvanced(!advanced)}>Adjustment{selected?.userAdjustmentType?' •':''}</button>
            </div>
            {needsOrganization&&<div className={styles.entryOptions}><label>Outsourcing organization</label>{displayOutsourcingChoicingOptions()}</div>}
            {advanced&&<div className={styles.entryOptions}><label htmlFor="modern-adjustment">Adjustment</label><select id="modern-adjustment" value={selected?.userAdjustmentType||''} disabled={!selected||!allowCrmDiscount} onChange={event=>setSelected({...selected,userAdjustmentType:event.target.value})}><option value="">Normal pricing</option><option value="surcharge">Surcharge</option><option value="discount">Discount</option></select><label htmlFor="modern-adjustment-value">Value</label><input id="modern-adjustment-value" type="number" step={0.1} disabled={!selected||!allowCrmDiscount} value={selected?.discount??''} onChange={handleDiscount}/></div>}
            <p id="modern-entry-help" className={styles.entryHelp}>Type to search · ↑ ↓ to choose · Enter to select · Ctrl+Enter to add</p>
            <span className="visually-hidden" role="status" aria-live="polite">{announcement}</span>
        </td></tr>;
    }

    return (
        <tr >

            <td>
                <Select menuPortalTarget={portalMenu&&typeof document!=='undefined'?document.body:undefined} menuPosition={portalMenu?'fixed':'absolute'}
                    options={Array.isArray(billingdata.testList) ? billingdata.testList : []}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    getOptionLabel={(option: any) => option?.name || ''}
                    isDisabled={!Array.isArray(billingdata.testList) || billingdata.testList.length === 0}
                    getOptionValue={(option: any) => option?.id}
                    styles={portalMenu?{...reactSelectCustomStyles,menuPortal:base=>({...base,zIndex:1060})}:reactSelectCustomStyles}
                    placeholder={(!Array.isArray(billingdata.testList) || billingdata.testList.length === 0) ? "No tests available" : "Search test here"}
                    onChange={(newValue: any) => handleTestSelectedChangeVariable(newValue)}
                />
            </td>
            <td>
                {displayOutsourcingChoicingOptions()}
            </td>
            <td></td>
            <td >
                <select
                    value={selected?.userAdjustmentType || ''}
                    style={{ border: "1px solid lightgray", padding: "10px", borderRadius: '5px' }}
                    onChange={(ev) => { setSelected({ ...selected, userAdjustmentType: ev.target.value }) }}>
                    <option value="">Select Adjustment Type</option>
                    <option value='surcharge'>surcharge</option>
                    <option value='discount'>discount</option>
                </select>
            </td>

            <td>
                <input
                    onChange={(ev) => { handleDiscount(ev) }}
                    disabled={!allowCrmDiscount}
                    value={selected?.discount ?? ''}
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
