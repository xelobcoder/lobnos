import { useCallback, useContext, useEffect, useState } from "react";
import { BillingContext } from "./BillingContext";
import { billingSource, canIgnoreDebtPaymentAndTax, fetchPreviousBilledRecords, getAllNecessaryData, getOustandingBill, LoadOrganizationalTest } from "../../../lib/billingLib";
import { currencyFormatter, customFetch } from "../../Auth/customFetch";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import RenderingBillingSourceLayout from "./Lib/RenderingSelectedBillingSourecAccessories";
import { toast } from "react-toastify";

const getTransactionPreviousBillingRecords = async (billingid) => {
    try {
        const response = await customFetch(`billing/previous/transaction/data?billingid=${billingid}`);
        return response;
    } catch (err) {
        toast.error('Error Loading Previous Transactions')
        return []
    }
}

export default function BillingSourceDeterminer({ patientid, onLoadingData }) {
    const { billingdata, updateBilling } = useContext(BillingContext);
    const queryBillingid = useSearchParams().get("billingid");
    const [loading, setLoading] = useState(false);
    const isServiceOnly = useSearchParams().get("isServiceOnly");
    const isNewTransaction = useSearchParams().get("isNewTransaction");
    const router = useRouter();


    const loadAndRefinePreviousTransaction = async () => {
        if (!queryBillingid || !patientid) return;

        let previousRecordData = {
            previousOutstanding: 0,
            previousTotalCost: 0,
            previousPaid: 0,
            previousRefunded: 0,
            previousBalance: 0,
            previousAmountIncurredDueTax: 0,
            previousPayable: 0,
        };

        const [previousRecords, previousTransactionSummaryResult] = await Promise.all([
            fetchPreviousBilledRecords(queryBillingid),
            getTransactionPreviousBillingRecords(queryBillingid)
        ]);

        const { result: previousTransactionSummary } = previousTransactionSummaryResult;
        if (Array.isArray(previousTransactionSummary) && previousTransactionSummary.length > 0) {
            const { totalcost, paid, amountIncurredDueTax, totalrefunded, outstanding, balance, payable } = previousTransactionSummary[0];

            previousRecordData['previousTotalCost'] = totalcost;
            previousRecordData['previousPaid'] = paid;
            previousRecordData['previousRefunded'] = totalrefunded;
            previousRecordData['previousOutstanding'] = outstanding;
            previousRecordData['previousBalance'] = balance;
            previousRecordData['previousAmountIncurredDueTax'] = amountIncurredDueTax;
            previousRecordData['previousPayable'] = payable;
        }

        return { previousRecords, previousRecordData }
    };


    const billingSourceTitle = (value) => {
        const matched = billingSource.find((item) => item.value == value)
        return matched && matched?.label ? matched.label : null
    }





    const initGeneralBillingData = useCallback(async function () {
        if (billingdata.billingSource === 1) {
            let previousRecordData = {
                previousOutstanding: 0,
                previousTotalCost: 0,
                previousPaid: 0,
                previousRefunded: 0,
                previousBalance: 0,
                previousAmountIncurredDueTax: 0,
                previousPayable: 0,
            };
            const initGeneralBillingData = await getAllNecessaryData();
            let previousRecords = [];
            if (queryBillingid) {
                previousRecords = await fetchPreviousBilledRecords(queryBillingid);
            }

            if (queryBillingid && isNewTransaction == 0) {
                const { result: previousTransactionSummary } = await getTransactionPreviousBillingRecords(queryBillingid);
                if (Array.isArray(previousTransactionSummary) && previousTransactionSummary.length > 0) {
                    const { totalcost, paid, amountIncurredDueTax, totalrefunded, outstanding, balance, payable } = previousTransactionSummary[0];

                    previousRecordData['previousTotalCost'] = totalcost;
                    previousRecordData['previousPaid'] = paid;
                    previousRecordData['previousRefunded'] = totalrefunded;
                    previousRecordData['previousOutstanding'] = outstanding;
                    previousRecordData['previousBalance'] = balance;
                    previousRecordData['previousAmountIncurredDueTax'] = amountIncurredDueTax;
                    previousRecordData['previousPayable'] = payable;
                }
            }
            updateBilling({
                ...billingdata,
                isServiceOnly,
                billingSourceTitle: 'General Billing',
                ...initGeneralBillingData,
                previousRecords,
                ...previousRecordData
            });
        }
    }, [billingdata.billingSource]);



    const initializedBillingSourceChange = async (billingSourceValue) => {
        if (!billingSourceValue) return;
        const billData = { ...billingdata };

        const { previousRecordData, previousRecords } = await loadAndRefinePreviousTransaction();
        let paymentmodeData = []

        if (billData.paymentmodeData && Array.isArray(billData.paymentmodeData) && billData.paymentmodeData.length == 0) {
            const paymentModes = await customFetch("paymentmodes");
            paymentmodeData = paymentModes?.data;
        }

        const billingTitle = billingSourceTitle(billingSourceValue);

        if (billingSourceValue === 1) {
            const initGeneralBillingData = await getAllNecessaryData();
        } else if (billingSourceValue == 2) {

        }
    }


    const updateBillingSourceSelected = async (ev) => {
        let { value } = ev.target;
        value = parseInt(value);
        if (typeof value == "number" && !isNaN(value)) {
            const billingTitle = billingSourceTitle(value);
            if (value == 1) {
                updateBilling({
                    ...billingdata,
                    organizationId: null,
                    billingSource: 1,
                    billingSourceTitle: billingTitle,
                    isServiceOnly,
                    testpanels: [],
                    billingid: queryBillingid,
                    cart: [],
                })
            } else {
                updateBilling({
                    ...billingdata,
                    billingSource: value,
                    isServiceOnly,
                    testpanels: [],
                    billingSourceTitle: billingTitle,
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
                    isServiceOnly,
                    testpanels: [],
                    organizationData: organizations,
                    billingSourceTitle: `Organizational Billing: ${name}`
                })
            }
        }
    }


    const makeDecisionOnUpdateOrNewTransaction = useCallback(
        async (canInitiateBill, billingid, patientid) => {
            if (typeof canInitiateBill === "boolean" && !canInitiateBill && !queryBillingid) {
                let confirmChoice = confirm('Client was billed Today. Do you want to update Transaction?');
                if (confirmChoice) {
                    router.push(`/billing/patientid?patientid=${patientid}&&billingid=${billingid}&&isNewTransaction=0`);
                }
            }
        }, []
    )

    const LoadOutStanding = async (patientid) => {
        try {
            if (!patientid) return;
            setLoading(true);
            const value = await getOustandingBill(patientid);
            if (value != 'ERROR') {
                const cantIgnoreDebt = await canIgnoreDebtPaymentAndTax(patientid);
                const { PaidBillsBeforeTransaction, includeTax, taxValue } = cantIgnoreDebt;
                updateBilling({
                    ...billingdata,
                    outstandingDebt: value,
                    isServiceOnly,
                    cantIgnoreDebt: PaidBillsBeforeTransaction == 1,
                    appsettings: {
                        taxIncluded: includeTax == 1 || includeTax == "1", taxValue
                    }
                })
            }

            if (value === 0) {
                setLoading(true);
                const hasBeenPreviouslyBilledOnSameDay = await customFetch(`billing/caninitialbill?patientid=${patientid}`);
                const { canInitiateBill, billingid } = hasBeenPreviouslyBilledOnSameDay;
                makeDecisionOnUpdateOrNewTransaction(canInitiateBill, billingid, patientid);
            }

            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    }

    useEffect(() => {
        LoadOutStanding(patientid);
    }, [patientid])


    useEffect(() => {
        initGeneralBillingData();
    }, [billingdata.billingSource])


    const handleLoadBillingClincianAndInsurance = async (target, uniqueid) => {
        try {
            onLoadingData(true);
            const response = await customFetch(`clinicians/billing/strategies/get/testpanels/${uniqueid}/${target}`);
            const paymentModes = await customFetch("paymentmodes");
            const paymentmodeData = paymentModes?.data;
            if (response && Array.isArray(response)) {
                updateBilling({
                    ...billingdata,
                    testpanels: response,
                    paymentmodeData,
                    [target]: uniqueid,
                })
            }
            onLoadingData(false);
        } catch (err) {
            onLoadingData(false);
            alert(`Something wrong occured Loading ${target} data`)
        }
    }

    const handleInsuranceSelection = async (value) => {
        const id = value?.id;
        if (!id) return;
        await handleLoadBillingClincianAndInsurance('phis', id);
    }

    const handleClinicianSelection = async (value) => {
        const id = value?.id;
        if (!id) return;
        await handleLoadBillingClincianAndInsurance('clinicians', id);
    }




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
                            discount: 0,
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

    if (loading) return <div className="vh-10 p-2 m-3 br-5 bg-body-secondary ">Loading.................</div>

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
                <RenderingBillingSourceLayout
                    billingdata={billingdata}
                    handleClinicianSelection={handleClinicianSelection}
                    handleInsuranceSelection={handleInsuranceSelection}
                    updateValuesToContext={updateValuesToContext}
                />

                {queryBillingid && billingdata.outstandingDebt == 0 && <div className="my-2">
                    <input type="checkbox"
                        checked={billingdata.previewPrevious}
                        onChange={(ev) => { updateBilling({ ...billingdata, previewPrevious: !billingdata.previewPrevious }) }} />
                    Refund or preview previously billed Item
                </div>
                }
                {billingdata.outstandingDebt == 0 && <div className="my-2">
                    <input onChange={(ev) => { updateBilling({ ...billingdata, includeServices: ev.target.checked }) }} type="checkbox" /> Include Services
                </div>
                }
            </section>
        </div>
    )
}