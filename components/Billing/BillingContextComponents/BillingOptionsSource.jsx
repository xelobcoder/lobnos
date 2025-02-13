"use client"
import { useContext, useEffect, useState } from "react";
import { BillingContext } from "./BillingContext";
import { billingSource, LoadOrganizationalTest } from "../../../lib/billingLib";
import { customFetch } from "../../Auth/customFetch";
import { useSearchParams, useRouter } from "next/navigation";
import RenderingBillingSourceLayout from "./Lib/RenderingSelectedBillingSourecAccessories";
import { toast } from "react-toastify";
import Select from 'react-select';
import SelectPackages from "./Lib/packages/SelectPackages";




export default function BillingSourceDeterminer({ initdata }) {
    const { billingdata, updateBilling, recalculateTotalBill } = useContext(BillingContext);
    const queryBillingid = useSearchParams().get("billingid");
    const [isClient, setIsClient] = useState(false);
    const [ondataLoad, setOnDataLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const isServiceOnly = useSearchParams().get("isServiceOnly");

    const updateBillingSourceSelected = (selectedOption) => {
        const value = selectedOption.value;
        if (!isNaN(value)) {
            updateBilling({
                ...initdata,
                billingSource: value,
                isServiceOnly,
                cart: [],
                billingid: queryBillingid,
            });
        }

    };

    console.log(billingdata.testpanels,'T')
    const updateValuesToContext = async (value) => {
        if (billingdata.billingSource === 2 && typeof value === "object") {
            const { id, name } = value;
            updateBilling({
                ...billingdata,
                organizationId: id,
                cart: [],
                type: 'organization',
                servicesProvided: [],
                isServiceOnly,
                testpanels: [],
                billingSourceTitle: `Organizational Billing: ${name}`,
            });
        }
    };


    const handleLoadBillingClincianAndInsurance = async (target, uniqueid) => {
        try {
            setOnDataLoading(true);
            const response =
                await customFetch(`clinicians/billing/strategies/get/testpanels/${uniqueid}/${target}`)

            if (Array.isArray(response)) {
                updateBilling({
                    ...billingdata,
                    testpanels: response,
                    [target]: uniqueid,
                    [target === "clinicians" ? "clinicianId" : "insuranceId"]: uniqueid,
                    type: target,
                });
            }
        } catch (err) {
            console.log(err)
            toast.error(`Error loading ${target} data`);
        } finally {
            setOnDataLoading(false);
        }
    };

    const handleInsuranceSelection = async (value) => {
        if (value?.id) {
            await handleLoadBillingClincianAndInsurance('phis', value.id);
        }
    };

    const handleClinicianSelection = async (value) => {
        if (value?.id) await handleLoadBillingClincianAndInsurance('clinicians', value.id);
    };

    useEffect(() => {
        if (billingdata.organizationId && billingdata.billingSource == 2) {
            LoadOrganizationalTest(billingdata.organizationId)
                .then(({ testList }) => {
                    if (Array.isArray(testList) && testList.length > 0) {
                        updateBilling({
                            ...billingdata,
                            cart: [],
                            testpanels: testList,
                            payable: 0,
                            testcost: 0,
                            outstanding: 0,
                            discount: 0,
                        });
                    }
                })
                .catch(() => {
                    toast.error('Error loading organizational tests');
                });
        }
    }, [billingdata.organizationId]);



    useEffect(() => {
        setIsClient(true)
    }, [])


    if (loading) return <div className="p-2 bg-body-secondary">Loading...</div>;

    return (
        <div className="billing-page-display-child text-sm">
            <section className="br-5">
                <div className="form-group">
                    <label>Billing Source</label>
                    {
                        isClient && <Select
                            options={billingSource}
                            value={billingSource.find(option => option.value === billingdata.billingSource)}
                            onChange={updateBillingSourceSelected}
                            placeholder="Select an option below"
                        />
                    }
                </div>
                <RenderingBillingSourceLayout
                    isClient={isClient}
                    billingdata={billingdata}
                    handleClinicianSelection={handleClinicianSelection}
                    handleInsuranceSelection={handleInsuranceSelection}
                    updateValuesToContext={updateValuesToContext}
                />
                
                    <div className="my-2">
                        <input
                            type="checkbox"
                            checked={billingdata.previewPrevious}
                            onChange={() => updateBilling({ ...billingdata, previewPrevious: !billingdata.previewPrevious })}
                        />
                        <span className="mx-3"> Refund or preview previously billed Item</span>
                    </div>
            
                <SelectPackages  />
                {billingdata.outstandingDebt === 0 && (
                    <div className="my-2">
                        <input
                            type="checkbox"
                            onChange={(ev) => updateBilling({ ...billingdata, includeServices: ev.target.checked })}
                        />
                        <span className="mx-1">  Include Services</span>
                    </div>
                )}
            </section>
        </div>
    );
}