import { useCallback, useContext, useEffect, useMemo } from "react";
import { BillingContext } from "./BillingContext";
import { billingSource, canIgnoreDebtPaymentAndTax, fetchPreviousBilledRecords, getAllNecessaryData, getOustandingBill, LoadOrganizationalTest } from "../../../lib/billingLib";
import OrganizationalBillingSourceSearch from "./BillingSourceComponents/OrganizationBillingSearch";
import { currencyFormatter, customFetch } from "../../Auth/customFetch";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function BillingSourceDeterminer({ patientid }) {
    const { billingdata, updateBilling } = useContext(BillingContext);
    const queryBillingid = useSearchParams().get("billingid");
    const router = useRouter();


    const initGeneralBillingData = useCallback(async function () {
        if (billingdata.billingSource === 1) {
            const initGeneralBillingData = await getAllNecessaryData();
            let previousRecords = [];
            if (queryBillingid) {
                previousRecords = await fetchPreviousBilledRecords(queryBillingid);
            }
            updateBilling({ ...billingdata, billingSourceTitle: 'General Billing', ...initGeneralBillingData, previousRecords });
        }
    }, [billingdata.billingSource]);


    const updateBillingSourceSelected = async (ev) => {
        let { value } = ev.target;
        value = parseInt(value);
        if (typeof value == "number" && !isNaN(value)) {
            if (value == 1) {
                updateBilling({
                    ...billingdata,
                    organizationId: null,
                    billingSource: 1,
                    testpanels: [],
                    billingid: queryBillingid,
                    cart: [],
                })
            } else {
                updateBilling({
                    ...billingdata, billingSource: value, testpanels: [],
                    cart: [],
                });
            }
        }
    }

    const updateValuesToContext = async function (value) {
        if (billingdata.billingSource && billingdata.billingSource == 2) {
            if (typeof value == "object") {
                const { id, name, organizations } = value;
                const paymentModes = await customFetch("paymentmodes");
                const paymentmodeData = paymentModes?.data;
                updateBilling({
                    ...billingdata,
                    organizationId: id,
                    cart: [],
                    type: 'organization',
                    paymentmodeData,
                    testpanels: [],
                    organizationData: organizations,
                    billingSourceTitle: `Organizational Billing: ${name}`
                })
            }
        }
    }


    const LoadOutStanding = async (patientid) => {
        if (!patientid) return;
        const value = await getOustandingBill(patientid);
        if (value != 'ERROR') {
            const cantIgnoreDebt = await canIgnoreDebtPaymentAndTax(patientid);
            const { PaidBillsBeforeTransaction, includeTax, taxValue } = cantIgnoreDebt;
            updateBilling({ ...billingdata, outstandingDebt: value, cantIgnoreDebt: PaidBillsBeforeTransaction == 1, appsettings: { taxIncluded: includeTax == 1 || includeTax == "1", taxValue } })
        }

        if (value === 0) {
            const hasBeenPreviouslyBilledOnSameDay = await customFetch(`billing/caninitialbill?patientid=${patientid}`);
            const { canInitiateBill, billingid } = hasBeenPreviouslyBilledOnSameDay;
            if (!canInitiateBill && !queryBillingid && billingid) {
                router.push(`/billing/patientid?patientid=2024972&&billingid=${billingid}`);
            }
        }
    }

    useEffect(() => {
        LoadOutStanding(patientid);
    }, [patientid])


    useEffect(() => {
        initGeneralBillingData();
    }, [billingdata.billingSource])





    useEffect(() => {
        if (billingdata.organizationId && billingdata.billingSource != 1) {
            LoadOrganizationalTest(billingdata.organizationId)
                .then((response) => {
                    const { testList } = response;
                    if (testList && Array.isArray(testList) && testList.length > 0) {
                        updateBilling({
                            ...billingdata,
                            cart: [],
                            testpanels: testList,
                            payable: 0,
                            testcost: 0,
                            outstanding: 0,
                            discount: 0
                        })
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }
    }, [billingdata.organizationId])




    if (billingdata.outstandingDebt > 0) {
        return (<div>
            <label className="text-danger">Please settle Outstanding Debt </label>
            <br />
            <Link href={`/billing/payment/update/${patientid}`}>
                <div className="alert alert-danger">
                    <h2>
                        {currencyFormatter.format(billingdata.outstandingDebt)}
                    </h2>
                </div>
            </Link>
        </div>)
    }



    return (
        <div className="billing-page-display-child text-sm">
            <section className="br-5">
                <div className="form-group">
                    <label>Billing Source</label>
                    <select
                        value={billingdata.billingSource}
                        disabled={billingdata.cantIgnoreDebt && billingdata.outstandingDebt > 0 || billingdata.previousRecords.length > 0}
                        onChange={(ev) => { updateBillingSourceSelected(ev) }}
                        className="custom-select">
                        <option value='' >select an option below</option>
                        {
                            Array.isArray(billingSource)
                            && billingSource.length > 0
                            && billingSource.map((item) => <option className=" text-sm " key={item.value}
                                value={item.value}> {item.label}
                            </option>)}
                    </select>
                </div>

                <div>
                    {billingdata?.billingSource === 2 &&
                        <div className="mb-2">
                            <OrganizationalBillingSourceSearch updatefunction={updateValuesToContext} />
                        </div>
                    }
                    {billingdata?.billingSource === 3
                        &&
                        <div className="form-group">
                            <label>search organization here</label>
                            <input type='text' placeholder="select private Insrance Comapanies here here" className="custom-input" />
                        </div>
                    }
                    {billingdata?.billingSource === 4
                        &&
                        <div className="form-group">
                            <label>search organization here</label>
                            <input type='text' placeholder="Get Claim Code Here" className="custom-input" />
                        </div>
                    }
                </div>

                {queryBillingid && billingdata.outstandingDebt == 0 && <div>
                    <input type="checkbox" checked={billingdata.previewPrevious} onChange={(ev) => { updateBilling({ ...billingdata, previewPrevious: true }) }} />
                    Refund or preview previously billed Item
                </div>
                }
                {
                    billingdata.outstandingDebt == 0 && <div>
                        <input onChange={(ev) => { updateBilling({ ...billingdata, includeServices: ev.target.checked }) }} type="checkbox" /> Include Services
                    </div>
                }
            </section>
        </div>
    )
}