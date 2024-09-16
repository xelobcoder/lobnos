import { useContext, useEffect } from "react";
import { BillingContext } from "./BillingContext";
import { billingSource, canIgnoreDebtPaymentAndTax, getAllNecessaryData, getOustandingBill, LoadOrganizationalTest } from "../../../lib/billingLib";
import OrganizationalBillingSourceSearch from "./BillingSourceComponents/OrganizationBillingSearch";
import { currencyFormatter } from "../../Auth/customFetch";
import Link from "next/link";
import BillingPagePatientInformation from "./PersonalInfoView";

export default function BillingSourceDeterminer({ patientid }) {
    const { billingdata, updateBilling } = useContext(BillingContext);

    const updateBillingSourceSelected = async (ev) => {
        let { value } = ev.target;
        value = parseInt(value);
        if (typeof value == "number" && !isNaN(value)) {
            if (value == 1) {
                const initGeneralBillingData = await getAllNecessaryData();
                updateBilling({
                    ...billingdata,
                    billingSourceTitle: 'General Billing',
                    organizationid: null,
                    billingSource: 1,
                    testpanels: [],
                    cart: [],
                    ...initGeneralBillingData
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
                updateBilling({
                    ...billingdata,
                    organizationid: id,
                    cart: [],
                    type: 'organization',
                    testpanels: [],
                    organizationData: organizations,
                    billingSourceTitle: `Organizational Billing: ${name}`
                })
            }
        }
    }


    const LoadOutStanding = async (patientid) => {
        const value = await getOustandingBill(patientid);
        if (value != 'ERROR') {
            const cantIgnoreDebt = await canIgnoreDebtPaymentAndTax(patientid);
            const { PaidBillsBeforeTransaction, includeTax, taxValue } = cantIgnoreDebt;
            updateBilling({ ...billingdata, outstandingDebt: value, cantIgnoreDebt: PaidBillsBeforeTransaction == 1, appsettings: { taxIncluded: includeTax == 1, taxValue } })
        }
    }

    useEffect(() => {
        LoadOutStanding(patientid);
    }, [patientid])


    useEffect(() => {
        if (billingdata.organizationid) {
            LoadOrganizationalTest(billingdata.organizationid)
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
    }, [billingdata.organizationid])


    return (
        <div>
            <section className="br-5 mb-2" style={{ display: 'grid', gridTemplateColumns: '20% 30% 35% 10%' }}>
                <div className="form-group">
                    <label>Billing Source</label>
                    <select
                        disabled={billingdata.cantIgnoreDebt && billingdata.outstandingDebt > 0}
                        onChange={(ev) => { updateBillingSourceSelected(ev) }}
                        className="custom-select">
                        <option value=''>select an option below</option>
                        {
                            Array.isArray(billingSource)
                            && billingSource.length > 0
                            && billingSource.map((item) => <option key={item.value}
                                value={item.value}> {item.label}
                            </option>)}
                    </select>
                </div>

                <div>
                    {billingdata?.billingSource === 2 &&
                        <div className="mx-2">
                            <OrganizationalBillingSourceSearch updatefunction={updateValuesToContext} />
                        </div>
                    }
                    {billingdata?.billingSource === 3
                        &&
                        <div className="form-group mx-2">
                            <label>search organization here</label>
                            <input type='text' placeholder="select private Insrance Comapanies here here" className="custom-input" />
                        </div>
                    }
                    {billingdata?.billingSource === 4
                        &&
                        <div className="form-group mx-2">
                            <label>search organization here</label>
                            <input type='text' placeholder="Get Claim Code Here" className="custom-input" />
                        </div>
                    }
                </div>
                <div>
                    <BillingPagePatientInformation />
                </div>
                {billingdata.outstandingDebt > 0
                    &&
                    (<div>
                        <label>Outstanding Debt</label>
                        <br />
                        <Link href={`/billing/payment/update/${patientid}`}>
                            <button className="btn btn-danger p-2">
                                <h4>
                                    {currencyFormatter.format(billingdata.outstandingDebt)}
                                </h4>
                            </button>
                        </Link>
                    </div>)
                }
            </section>
        </div>
    )
}