import { useCallback, useContext, useEffect, useState } from "react";
import { BillingContext } from "./BillingContext";
import { billingSource, canIgnoreDebtPaymentAndTax, fetchPreviousBilledRecords, getAllNecessaryData, getOustandingBill, LoadOrganizationalTest } from "../../../lib/billingLib";
import { currencyFormatter, customFetch } from "../../Auth/customFetch";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import RenderingBillingSourceLayout from "./Lib/RenderingSelectedBillingSourecAccessories";
import { toast } from "react-toastify";
import Select from 'react-select';
import SelectPackages from "./Lib/packages/SelectPackages";

const getTransactionPreviousBillingRecords = async (billingid) => {
    try {
        const response = await customFetch(`billing/previous/transaction/data?billingid=${billingid}`);
        return response;
    } catch (err) {
        toast.error('Error Loading Previous Transactions');
        return [];
    }
};

export default function BillingSourceDeterminer({ patientid, onLoadingData }) {
    const { billingdata, updateBilling, recalculateTotalBill } = useContext(BillingContext);
    const queryBillingid = useSearchParams().get("billingid");
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(false);
    const isServiceOnly = useSearchParams().get("isServiceOnly");
    const isNewTransaction = useSearchParams().get("isNewTransaction");
    const router = useRouter();

    const initializedPreviousTransactionWithSummary = async () => {
        let previousRecordData = {
            previousOutstanding: 0,
            previousTotalCost: 0,
            previousPaid: 0,
            previousRefunded: 0,
            previousBalance: 0,
            previousAmountIncurredDueTax: 0,
            previousPayable: 0,
        };
        let previousRecords = [];

        if (queryBillingid) {
            previousRecords = await fetchPreviousBilledRecords(queryBillingid);
        }

        if (queryBillingid && isNewTransaction == 0) {
            const { result: previousTransactionSummary } = await getTransactionPreviousBillingRecords(queryBillingid);
            if (Array.isArray(previousTransactionSummary) && previousTransactionSummary.length > 0) {
                const { totalcost, paid, amountIncurredDueTax, totalrefunded, outstanding, balance, payable } = previousTransactionSummary[0];
                previousRecordData = {
                    ...previousRecordData,
                    previousTotalCost: totalcost,
                    previousPaid: paid,
                    previousRefunded: totalrefunded,
                    previousOutstanding: outstanding,
                    previousBalance: balance,
                    previousAmountIncurredDueTax: amountIncurredDueTax,
                    previousPayable: payable,
                };
            }
        }

        return { previousRecordData, previousRecords };
    };

    const initGeneralBillingData = useCallback(async () => {
        if (billingdata.billingSource === 1) {
            const initGeneralBillingData = await getAllNecessaryData();
            const { previousRecordData, previousRecords } = await initializedPreviousTransactionWithSummary();
            updateBilling({
                ...billingdata,
                isServiceOnly,
                billingSourceTitle: 'General Billing',
                ...initGeneralBillingData,
                previousRecords,
                ...previousRecordData,
            });
        }
    }, [billingdata.billingSource]);

    const updateBillingSourceSelected = (selectedOption) => {
        const value = selectedOption.value;
        if (!isNaN(value)) {
            updateBilling({
                ...billingdata,
                organizationId: value === 1 ? null : billingdata.organizationId,
                billingSource: value,
                isServiceOnly,
                testpanels: [],
                cart: [],
                billingid: queryBillingid,
            });
        }
    };

    const updateValuesToContext = async (value) => {
        if (billingdata.billingSource === 2 && typeof value === "object") {
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
                billingSourceTitle: `Organizational Billing: ${name}`,
            });
        }
    };

    const makeDecisionOnUpdateOrNewTransaction = useCallback(async (canInitiateBill, billingid, patientid) => {
        if (!canInitiateBill && !queryBillingid) {
            const confirmChoice = confirm('Client was billed Today. Do you want to update Transaction?');
            if (confirmChoice) {
                router.push(`/billing/patientid?patientid=${patientid}&&billingid=${billingid}&&isNewTransaction=0`);
            }
        }
    }, [queryBillingid, router]);

    const LoadOutStanding = async (patientid) => {
        if (!patientid) return;
        setLoading(true);
        try {
            const value = await getOustandingBill(patientid);
            if (value !== 'ERROR') {
                const { PaidBillsBeforeTransaction, includeTax, taxValue } = await canIgnoreDebtPaymentAndTax(patientid);

                const billingNightAdjustmentSettings = await customFetch(`applicationsettings/target/billingsettings`);

                let hasNightAdjustment = false;
                let nightAdjustmentMode = 'absolute';
                let nightAdjustmentValue = 0;
                let nightStart = billingdata.nightStart;
                let nightEnd = billingdata.nightEnd


                const parsedTimeValue = function (value) {
                    return (value && typeof value == "string" && value.includes(":")) ? parseInt(value.split(":")[0])
                        : null;
                }


                const { billingsettings } = billingNightAdjustmentSettings;

                if (billingsettings) {
                    hasNightAdjustment = billingsettings.hasNightAdjustment;
                    if (hasNightAdjustment) {
                        nightAdjustmentMode = billingsettings.nightAdjustmentMode;
                        nightAdjustmentValue = parseFloat(billingsettings.nightAdjustmentValue);
                        const { endTime, startTime } = billingsettings;
                        nightStart = startTime ? parsedTimeValue(startTime) : billingdata.startTime;
                        nightEnd = endTime ? parsedTimeValue(endTime) : billingdata.endTime;
                    }

                }


                updateBilling({
                    ...billingdata,
                    outstandingDebt: value,
                    isServiceOnly,
                    nightAdjustmentMode,
                    hasNightAdjustment,
                    nightAdjustmentValue,
                    nightEnd,
                    nightStart,
                    cantIgnoreDebt: PaidBillsBeforeTransaction == 1,
                    appsettings: {
                        taxIncluded: includeTax == 1 || includeTax == "1",
                        taxValue,
                    },
                });
            }

            if (value === 0) {
                const { canInitiateBill, billingid } = await customFetch(`billing/caninitialbill?patientid=${patientid}`);
                makeDecisionOnUpdateOrNewTransaction(canInitiateBill, billingid, patientid);
            }
        } catch (err) {
            console.log(err)
            toast.error('Error loading outstanding debt');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadBillingClincianAndInsurance = async (target, uniqueid) => {
        try {
            onLoadingData(true);
            let paymentModalities = billingdata?.paymentmodeData;

            const [response, previousData] = await Promise.all([
                customFetch(`clinicians/billing/strategies/get/testpanels/${uniqueid}/${target}`),
                initializedPreviousTransactionWithSummary(),
            ]);

            if (!paymentModalities || paymentModalities.length === 0) {
                const paymentModes = await customFetch("paymentmodes");
                paymentModalities = paymentModes?.data;
            }

            if (Array.isArray(response)) {
                const { previousRecordData, previousRecords } = previousData;
                updateBilling({
                    ...billingdata,
                    testpanels: response,
                    paymentmodeData: paymentModalities,
                    [target]: uniqueid,
                    [target === "clinicians" ? "clinicianId" : "insuranceId"]: uniqueid,
                    previousRecords,
                    ...previousRecordData,
                    type: target,
                });
            }
        } catch (err) {
            toast.error(`Error loading ${target} data`);
        } finally {
            onLoadingData(false);
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
        LoadOutStanding(patientid);
        setIsClient(true);
    }, [patientid]);

    useEffect(() => {
        initGeneralBillingData();
    }, [billingdata.billingSource]);



    useEffect(() => {
        if (billingdata.organizationId && billingdata.billingSource !== 1) {
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
                .catch((err) => {
                    toast.error('Error loading organizational tests');
                });
        }
    }, [billingdata.organizationId]);


    const handleSelectedPackagePanels = (panels) => {
        if (panels && Array.isArray(panels)) {
            const { previousRecords } = billingdata;

            if (previousRecords && Array.isArray(previousRecords) && previousRecords.length > 0) {
                let unique = [];
                for (const panel of panels) {
                    const isIn = previousRecords.filter((item) => item.trackId == panel.testid);
                    if (isIn.length == 0) {
                        unique.push(panel);
                    }
                }
                recalculateTotalBill({ ...billingdata, cart: panels, isPackageUsed: true })

            } else {
                recalculateTotalBill
                    ({ ...billingdata, cart: panels, isPackageUsed: true })
            }
        }
    }

    console.log(billingdata)

    if (billingdata.outstandingDebt > 0) {
        return (
            <div>
                <label className="text-danger">Please settle Outstanding Debt</label>
                <br />
                <Link href={`/billing/payment/update/${patientid}`}>
                    <div className="alert alert-danger">
                        <h2>{currencyFormatter.format(billingdata.outstandingDebt)}</h2>
                    </div>
                </Link>
            </div>
        );
    }

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
                            isDisabled={billingdata.cantIgnoreDebt && billingdata.outstandingDebt > 0}
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
                {queryBillingid && billingdata.outstandingDebt === 0 && (
                    <div className="my-2">
                        <input
                            type="checkbox"
                            checked={billingdata.previewPrevious}
                            onChange={() => updateBilling({ ...billingdata, previewPrevious: !billingdata.previewPrevious })}
                        />
                        <span className="mx-3"> Refund or preview previously billed Item</span>
                    </div>
                )}
                <SelectPackages billingdata={billingdata} onSelect={handleSelectedPackagePanels} />
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