'use client';
import React from "react";
import dayjs from "dayjs";
import MultiRenderingBillingSourceFields from "./RenderingBillingSourceFields";
import MultiPACKAGESELECT from './MultiPACKAGESELECT';
import MultiRenderingWithPatientId from "./MultiRenderingWithPatientId";
import { Button, Spinner, Modal } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import { customFetch, customPost } from "../../Auth/customFetch";
import { defaultMultiBillingData } from "../../../lib/Multi/MultiTypes";
import { MultiBillingProvider, MultiBillingContext } from "./MultiBillingContext";
import MultiSummary from "./MultiSummary";
import { useRouter, useParams } from "next/navigation";
import { useApplication } from "../../Auth/useApplicationContext";
import { toast } from "react-toastify";
import MultiBillingHeader from './MultiBillingHeader';
import PreviousRecordsHeader from './PreviousRecordsHeader';
import { plsEncryption } from "../../../lib/encryption";
import { MultiValidateAndSubmitBillingInformation } from "../../../lib/Multi/multiBillingValidation";
import { RiPrinterLine, RiStore3Line } from '@remixicon/react';
import ReceiptOptionsModal from '../ReceiptOptionsModal';



export default function MultiBillingLayout({ billingContextProps }: {
    billingContextProps: {
        categorytrackid: number,
        entitytype?: string,
        entityname?: string,
        ispricingcheckout: boolean,
        entityid?: string,
        billingid: number | null,
        isNewTransaction?: boolean,
        patientid: number;
        isRelatedBilling?: boolean,
        isAdjustment?: boolean,
        adjustmentType?: 'addition' | 'correction' | 'voided' | null,
        adjustmentReason?: string,
        specialcode?: string,
    }
}) {
    return (
        <MultiBillingProvider>
            <MultiBillingLayoutContent billingContextProps={billingContextProps} />
        </MultiBillingProvider>
    );
}

function MultiBillingLayoutContent({ billingContextProps }: {
    billingContextProps: {
        categorytrackid: number,
        entitytype?: string,
        entityname?: string,
        billingid?: number | null,
        isNewTransaction?: boolean,
        isRelatedBilling?: boolean,
        patientid: number,
        entityid?: string,
        ispricingcheckout: boolean,
        isAdjustment?: boolean,
        adjustmentType?: 'addition' | 'correction' | 'voided' | null,
        adjustmentReason?: string,
        specialcode?: string,
    }
}) {
    const { categorytrackid, entitytype, entityname, entityid, patientid, billingid, isNewTransaction,
        isAdjustment, adjustmentType, adjustmentReason,
        isRelatedBilling, ispricingcheckout } = billingContextProps
    const branchid = useApplication().branchid;
    const employeeid = useApplication().user?.employeeid || 0;
    const role = useApplication().user?.role
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata, setBillingData } = context;
    const router = useRouter();
    const patientId = useParams()?.patientid;



    const [useSpecialCode, setUseSpecialCode] = useState(false);
    const [specialCode, setSpecialCode] = useState(billingContextProps.specialcode || "");
    const [specialCodeError, setSpecialCodeError] = useState("");
    const [loadingSpecialCode, setLoadingSpecialCode] = useState(false);
    const [loadingPanels, setLoadingPanels] = useState(false);
    const [loadingBackendBilling, setLoadingBackendBilling] = useState(false);
    const [backendError, setBackendError] = useState<string | null>(null);
    const [usePackage, setUsePackage] = useState(false);
    const [useServices, setUseServices] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [showChoiceModal, setShowChoiceModal] = useState(false);
    const [generatedBillingid, setGeneratedBillingid] = useState<string | number | undefined>(undefined);
    const [showReceiptOptionsModal, setShowReceiptOptionsModal] = useState(false);

    const handleSpecialCodeChange = (e) => {
        const value = e.target.value;
        setSpecialCode(value);
        if (value.length > 0 && value.length <= 3) {
            setSpecialCodeError("Special code must be more than 3 characters.");
        } else {
            setSpecialCodeError("");
        }
    };

    const updateEntityInUrl = (
        entitytype: string,
        entityname: string,
        entityid: string | number,
        specialcode?: string
    ) => {
        const path = window.location.pathname;
        const parts = path.split('/');

        if (isNaN(Number(parts[parts.length - 1]))) {
            return;
        }

        const entityTypeToBillingSource: Record<string, number> = {
            organization: 2,
            insurance: 4,
            clinician: 6,
        };

        const billingSource = entityTypeToBillingSource[entitytype.toLowerCase()] || 0;
        parts[parts.length - 1] = String(billingSource);

        // Get current query params and update only entitytype, entityname, entityid, and specialcode
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.set('entitytype', entitytype);
        currentParams.set('entityname', entityname.replace(/\s+/g, '+'));
        currentParams.set('entityid', String(entityid));
        if (specialcode && specialcode.length > 0) {
            currentParams.set('specialcode', specialcode);
        } else {
            currentParams.delete('specialcode');
        }
        // All other query params are preserved
        router.replace(`${parts.join('/')}?${currentParams.toString()}`);
    };





    const handleSelectedEntityClinician = (entity) => {
        if (!entity) return;
        const { id, name } = entity;
        setBillingData((prev) => ({
            ...prev,
            entityId: id,
            entitytype: "clinician",
            entityname: name || "",
            billingSource: 6,
        }));
        updateEntityInUrl("clinician", name || "", id, specialCode);
    };

    const handleSelectedEntityInsurance = (entity) => {
        if (!entity) return;
        const { id, insuranceName } = entity;
        setBillingData((prev) => ({
            ...prev,
            entityId: id,
            entitytype: "insurance",
            entityname: insuranceName || "",
            billingSource: 4,
        }));
        updateEntityInUrl("insurance", insuranceName || "", id, specialCode);

    };

    const handleOrganizationSelection = (entity) => {
        const { id, name } = entity;
        setBillingData((prev) => ({
            ...prev,
            entityId: id,
            entitytype: "organization",
            entityname: name || "",
            billingSource: 2,
        }));
        updateEntityInUrl("organization", name || "", id, specialCode);
    };


    const handleReset = () => {
        setBillingData(prev => ({
            ...defaultMultiBillingData,
            billingSource: prev.billingSource,
            branchid: prev.branchid,
            patientid: prev.patientid,
            entitytype: prev.entitytype,
            entityId: prev.entityId,
            entityname: prev.entityname,
            includeServices: false,
            servicesList: [],
            isPackageUsed: false,
            packageid: 0,
            specialcode: '',
        }));
        setUsePackage(false);
        setUseServices(false);
        setShowSummary(false);
        setSpecialCode('');
        setSpecialCodeError('');
        router.replace(window.location.pathname);
    };


    const handleUrgencyChange = (selectedOption) => {
        setBillingData(prev => ({
            ...prev,
            status: selectedOption.value,
        }));
    }


    const handleReturnToMulti = () => {
        if (patientId) router.replace(`/billing/patientid/${patientId}/multi/`);
    };





    // Backend-driven billing: load all info from backend
    const loadBackendBilling = async () => {
        const includeServices = useServices;
        const servicesList = billingdata.servicesList || [];
        let url;
        const billingIdParam = billingdata.billingid ? `&billingid=${billingdata.billingid}` : '';
        if (useSpecialCode && specialCode && !specialCodeError) {
            url = `billing/multi/init?tenantId=3` +
                `&entityType=` +
                `&isPackageUsed=${billingdata.isPackageUsed}` +
                `&useServices=${includeServices}` +
                `&includeServices=${includeServices}` +
                `&packageid=${billingdata.packageid || ''}` +
                `&branchid=${billingdata.branchid || ''}` +
                `&patientId=${billingdata.patientid || patientid || ''}` +
                `&entityId=` +
                `&billingSource=${billingdata.billingSource || categorytrackid}` +
                `&referalCode=${specialCode}` +
                `&ispricingcheckout=${ispricingcheckout}` +
                billingIdParam;
        } else if (billingdata.entitytype && billingdata.entityId && Number(billingdata.billingSource || categorytrackid) > 1) {
            url = `billing/multi/init?tenantId=3` +
                `&entityType=${billingdata.entitytype}` +
                `&isPackageUsed=${billingdata.isPackageUsed}` +
                `&useServices=${includeServices}` +
                `&includeServices=${includeServices}` +
                `&packageid=${billingdata.packageid || ''}` +
                `&branchid=${billingdata.branchid || ''}` +
                `&patientId=${billingdata.patientid || patientid || ''}` +
                `&entityId=${billingdata.entityId}` +
                `&billingSource=${billingdata.billingSource || categorytrackid}` +
                `&ispricingcheckout=${ispricingcheckout}` +
                billingIdParam;
        } else {
            url = `billing/multi/init?tenantId=3` +
                `&entityType=general` +
                `&isPackageUsed=${billingdata.isPackageUsed}` +
                `&useServices=${includeServices}` +
                `&includeServices=${includeServices}` +
                `&packageid=${billingdata.packageid || ''}` +
                `&branchid=${billingdata.branchid || ''}` +
                `&patientId=${billingdata.patientid}` +
                `&billingSource=1` +
                `&ispricingcheckout=${ispricingcheckout}` +
                billingIdParam;
        }
        setLoadingBackendBilling(true);
        setBackendError(null);
        try {
            const backendData = await customFetch(url);
            if (typeof backendData == "string") {
                toast.error(backendData);
            }

            if (typeof backendData == "object" && !backendData.hasOwnProperty('testList')) {
                toast.error(backendData.message || "Failed to load billing data from backend.");
                return;
            }
            setBillingData(prev => {
                // If backend entitytype is different from current, update URL and billingSource
                let updated = {
                    ...prev,
                    ...backendData,
                    previousRecordsSummary: prev.previousRecordsSummary,
                    entityId: backendData.entityId ?? prev.entityId,
                    entitytype: backendData.entityType ?? prev.entitytype,
                    patientid: backendData.patientId ?? prev.patientid,
                    billingSource: backendData.billingSource ?? prev.billingSource,
                    includeServices: backendData.includeServices ?? includeServices,
                    servicesList: includeServices ? backendData.servicesList || servicesList : [],
                    payments: prev.payments || [],
                    cart: backendData.isPackageUsed ? backendData.testList : []
                };
                if (
                    backendData.entityType &&
                    backendData.entityType !== prev.entitytype
                ) {
                    // Update URL to reflect new entitytype and billingSource
                    const entityTypeToBillingSource = {
                        organization: 2,
                        insurance: 4,
                        clinician: 6,
                        general: 1
                    };
                    const newSource = entityTypeToBillingSource[backendData.entityType.toLowerCase()] || 1;
                    const path = window.location.pathname.split('/');

                    if (!isNaN(Number(path[path.length - 1]))) {
                        path[path.length - 1] = String(newSource);
                        const queryParams = new URLSearchParams(window.location.search);
                        // Only update these three, keep all others
                        queryParams.set('entitytype', backendData.entityType);
                        if (backendData.entityname) {
                            queryParams.set('entityname', backendData.entityname);
                        } else {
                            queryParams.delete('entityname');
                        }
                        if (backendData.entityId) {
                            queryParams.set('entityid', backendData.entityId);
                        } else {
                            queryParams.delete('entityid');
                        }
                        window.history.replaceState({}, '', `${path.join('/')}?${queryParams.toString()}`);
                    }
                    updated.billingSource = newSource;
                    updated.entitytype = backendData.entityType;
                }
                return updated;
            });
        } catch (err) {
            setBackendError('Failed to load billing data from backend.');
        } finally {
            setLoadingBackendBilling(false);
        }
    };

    const handlePackageActivation = (checked) => {
        setBillingData(prev => ({
            ...prev,
            isPackageUsed: checked,
            packageid: 0,
        }));
    }

    const [isSaving, setIsSaving] = useState(false);

    const handleModalClose = () => {
        setShowChoiceModal(false);
        setBillingData(prev => ({
            ...defaultMultiBillingData,
            billingSource: prev.billingSource,
            branchid: prev.branchid,
            patientid: prev.patientid,
            entitytype: prev.entitytype,
            entityId: prev.entityId,
            entityname: prev.entityname
        }));
    };

    const handleUserChoice = (choice: string) => {
        setShowChoiceModal(false);
        if (choice === 'print') {
            setShowReceiptOptionsModal(true);
        } else {
            setBillingData(defaultMultiBillingData);
            router.push(`/billing/sales/branches/${plsEncryption(branchid.toString())}`);
        }
    };

    const closeReceiptModal = () => setShowReceiptOptionsModal(false);

    const handleSubmit = async (writeOffConfirmed = false) => {
        if (isSaving) return;

        if (!billingdata || !billingdata.patientid) {
            return toast.error('Patient ID is required to submit billing');
        }

        if (billingdata.isAdjustment === 1 && !billingdata.adjustmentType) {
            return toast.error('Adjustment type is required for adjustments');
        }

        if (billingdata.isAdjustment === 1 && !billingdata.adjustmentReason && billingdata.adjustmentType == 'correction') {
            return toast.error('Adjustment reason is required for correction adjustments');
        }


        const totalPayments = billingdata.paid;
        const amountPayable = Number(billingdata.amountPayable) || 0;

        try {
            setIsSaving(true);
            const dataToBeUploaded = {
                ...billingdata,
                employeeid: employeeid,
                branchid: branchid,
                amountPayable,
                totalPayments,
                isConditionsUnderstood: false,
                isPromo: billingdata.isPromo ?? false,
                promoCodeId: billingdata.promoDetails?.id || billingdata?.promoId,
                promoCode: billingdata.promoDetails?.code || '',
                patientid: Number(patientid),
                payments: billingdata.payments,
                additionalinformation: billingdata.additionalInfo ?? '',
                isAdjustment: typeof billingdata.isAdjustment === 'boolean' ? (billingdata.isAdjustment ? 1 : 0) : billingdata.isAdjustment,
                adjustmentType: billingdata.adjustmentType || 'addition',
                adjustmentReason: billingdata.adjustmentReason || '',
                entitytype: billingdata.entitytype || null,
                writeOffOutstanding: writeOffConfirmed ? true : undefined,
                excessAction: billingdata.excessAction || null
            } as any;

            const response = await MultiValidateAndSubmitBillingInformation(
                dataToBeUploaded,
                billingid ? Number(billingid) : undefined
            );


            const { status, message } = response;

            if (status == true || status === 'success') {
                toast.success(message || "Billing data submitted successfully");
                if (typeof window !== 'undefined') {
                    const viewTransactions = window.confirm("Billing data submitted successfully. Do you want to view transactions?");
                    if (viewTransactions && patientId && branchid) {
                        const today = dayjs().format('YYYY-MM-DD');
                        const url = `/billing/sales/branches/${plsEncryption(branchid?.toString())}?from=${today}&to=${today}&patientid=${plsEncryption(patientId?.toString())}`;
                        router.replace(url);
                    } else {
                        // User wants to stay on the same page - trigger the choice modal
                        setGeneratedBillingid(response.billingid || response.data?.billingid);
                        setShowChoiceModal(true);
                    }
                }
            }
            if (status == false) {
                return toast.error(message || "Failed to submit billing data");
            }

        } catch (error) {
            setIsSaving(false);
        } finally {
            setIsSaving(false);
        }
    };



    // Checkout handler: send billing data to backend
    const handleCheckout = async () => {
        try {
            const checkoutPayload = {
                patientId: billingdata.patientid,
                billingid: billingdata.billingid,
                cart: billingdata.cart,
                servicesList: billingdata.servicesProvided,
                paymentDetails: null,
                branchid: billingdata.branchid,
                billingSource: billingdata.billingSource,
                referalCode: specialCode || '',
                promoCode: billingdata.promoCode || '',
                isPromo: billingdata.isPromo || false,
                promoCodeId: billingdata?.promoDetails?.id,
                isPackageUsed: billingdata.isPackageUsed,
                packageid: billingdata.packageid,
                entityid: billingdata.entityId,
                entitytype: billingdata.entitytype,
                ispricingcheckout: ispricingcheckout
            };

            const retriveOutsourcedFromCheckoutPayload = (currentCart: any[], previousCart: any[]) => {
                if (Array.isArray(currentCart) && Array.isArray(previousCart)) {
                    return currentCart.map((item, index) => {
                        const _current_single_test = previousCart.find(prevItem => prevItem.testid === item.testid);
                        const { organization } = _current_single_test || {};
                        if (organization && organization.outsourceid) {
                            return { ...item, organization, outsourceid: organization.outsourceid, isoutsourced: 1 };
                        } else {
                            return item;
                        }
                    })
                }
                return currentCart;
            }

            const response = await customPost('billing/multi/checkout', 'POST', checkoutPayload);
            if (response && response.success && response.data) {
                setBillingData(prev => ({
                    ...prev, ...response.data,
                    cart: response.data.isPackageUsed ?
                        response.data.packageTestList : retriveOutsourcedFromCheckoutPayload(response.data.cart, billingdata.cart) || [],
                    payments: [],
                    paid: 0,
                    allowAdvancePayment: true,
                    balance: response.data.amountPayable || 0,
                    promoDetails: response.data.promoDetails || {},
                    promoCode: response.data?.promoDetails?.code,
                    promoCodeId: response.data?.promoDetails?.id,
                    promoMethod: response.data?.promoDetails?.method,
                    servicesProvided: response.data?.servicesList || checkoutPayload.servicesList || [],
                }));
                setShowSummary(true);
            } else {
                toast.error(response?.message || "Checkout failed. Please try again.");
                if (response.message == 'Outstanding debt found') {
                    router.replace(`/billing/patientid/${plsEncryption((billingdata.patientid ?? '').toString())}/outstanding-debt`);
                    return;
                }
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("Failed to complete checkout. Please try again.");
        }
    };

    // On mount, set entitytype and billingSource if present

    const onMountedRun = async () => {
        const getTransactionPreviousBillingRecords = async (billingid: number) => {
            try {
                const response = await customFetch(`billing/previous/transaction/data?billingid=${billingid}`);
                return response.result;
            } catch (err) {
                return [];
            }
        };
        let billingIdVerified = false;
        const hasBillingId = isRelatedBilling && billingid;
        let summaryObj = undefined;

        if (hasBillingId) {
            const response = await getTransactionPreviousBillingRecords(Number(billingid));
            if (response && Array.isArray(response) && response.length > 0) {
                console.log("Previous billing records found:", response);
                summaryObj = response[0];
                billingIdVerified = true;
            }
        }

        setBillingData(prev => ({
            ...prev,
            entitytype: entitytype as any,
            billingSource: categorytrackid,
            patientid: patientid || prev.patientid,
            branchid: branchid,
            billingid: billingid || prev.billingid,
            isNewTransaction: isNewTransaction || false,
            employeeid: employeeid,
            billingIdVerified,
            isAdjustment: typeof isAdjustment === 'boolean' ? (isAdjustment ? 1 : 0) : isAdjustment,
            adjustmentType: adjustmentType || 'addition',
            adjustmentReason: adjustmentReason || '',
            showRelatedBilling: billingid ? true : false,
            showdetails: role === 'admin' || role === 'superadmin' || role == "manager",
            previousRecordsSummary: summaryObj,
        }));
    }

    useEffect(() => {
        onMountedRun();
    }, []);

    // Helper: should Load Data be enabled?
    const canLoadData = (() => {
        if (billingdata.isPackageUsed && !billingdata.packageid) return false;
        if (useSpecialCode && specialCode && !specialCodeError) return true;
        const resolvedBillingSource = Number(billingdata.billingSource || categorytrackid);
        if (resolvedBillingSource > 1) {
            return !!(billingdata.entitytype && billingdata.entityId);
        }
        return true;
    })();


    if (loadingBackendBilling) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 200 }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Loading billing data...</span>
            </div>
        );
    }
    if (backendError) {
        return <div className="alert alert-danger">{backendError}</div>;
    }

    return (
        <React.Fragment>
            <div className="card mt-2">
                <MultiBillingHeader
                    billingdata={billingdata}
                    setBillingData={setBillingData}
                    useServices={useServices}
                    useSpecialCode={useSpecialCode}
                    specialCode={specialCode}
                    specialCodeError={specialCodeError}
                    loadingSpecialCode={loadingSpecialCode}
                    loadingBackendBilling={loadingBackendBilling}
                    canLoadData={canLoadData}
                    onPackageActivation={handlePackageActivation}
                    onUseServicesChange={checked => {
                        setUseServices(checked);
                        setBillingData(prev => ({ ...prev, includeServices: checked }));
                    }}
                    onUseSpecialCodeChange={setUseSpecialCode}
                    onSpecialCodeChange={handleSpecialCodeChange}
                    onLoadBackendBilling={loadBackendBilling}
                    onReset={handleReset}
                    onReturnToMulti={handleReturnToMulti}
                    onCheckout={handleCheckout}
                />

                <PreviousRecordsHeader />

                <div className="card-body m-0 p-0">
                    <div className="row g-0">
                        <div className="col-12 col-md-3 p-3 border-end" style={{ minHeight: 300 }}>
                            <MultiRenderingBillingSourceFields
                                isClient={true}
                                updateValuesToContext={handleOrganizationSelection}
                                handleSelectedEntityClinician={handleSelectedEntityClinician}
                                handleUrgencyChange={handleUrgencyChange}
                                handleSelectedEntityInsurance={handleSelectedEntityInsurance}
                            />
                            {billingdata.isPackageUsed && <div className="mt-3">
                                <MultiPACKAGESELECT />
                            </div>}
                            {billingdata.isAdjustment && billingdata.adjustmentReason && (
                                <div>
                                    <label>Reason for Adjustment</label>
                                    <div className="text-muted alert alert-info text-sm mb-0">
                                        {billingdata.adjustmentReason || "No reason provided"}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="col-12 col-md-6" style={{ minHeight: 300 }}>
                            {loadingPanels ? (
                                <div className="h-100 w-100 d-flex align-items-center justify-content-center">
                                    <Spinner animation="border" variant="primary" />
                                    <span className="ms-2">Loading test panels...</span>
                                </div>
                            ) : (
                                <div className="h-100 w-100 border-start p-2">
                                    <MultiRenderingWithPatientId />
                                </div>
                            )}
                        </div>
                        <div className="col-12 col-md-3 border-start p-2" style={{ minHeight: 300 }}>
                            {showSummary && <MultiSummary />}
                        </div>
                    </div>
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center">
                    <div className="d-flex justify-content-between " >
                        {/* Show Advanced Payment and Bill Client only if making advance payment and certain conditions are met */}
                        {billingdata?.allowAdvancePayment && (
                            <>
                                <Button disabled={ispricingcheckout} variant="outline-primary" className="mx-2 " size="sm" onClick={() => {
                                    setBillingData(prev => ({
                                        ...prev,
                                        openPaymentModal: 2,
                                    }));
                                }} >
                                    💳 Advanced Payment
                                </Button>
                                <Button disabled={ispricingcheckout} variant="outline-primary" className="mx-2 " size="sm" onClick={(ev) => { handleSubmit() }}>
                                    💳 Bill Client
                                </Button>
                            </>
                        )}
                        <Button disabled={ispricingcheckout} onClick={(ev) => { handleSubmit() }} variant="outline-secondary" className="mx-2" size="sm"  >
                            Proceed to order
                        </Button>
                    </div>
                </div>

            </div>

            {/* Choice Modal */}
            {showChoiceModal && (
                <Modal
                    show={showChoiceModal}
                    onHide={handleModalClose}
                    centered
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Billing Complete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>What would you like to do next?</p>
                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="primary"
                                onClick={() => handleUserChoice('print')}
                                className="d-flex align-items-center gap-2"
                            >
                                <RiPrinterLine size={18} />
                                Print Receipt
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleUserChoice('sales')}
                                className="d-flex align-items-center gap-2"
                            >
                                <RiStore3Line size={18} />
                                Go to Sales
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
            )}

            {/* Receipt Options Modal */}
            {showReceiptOptionsModal && (
                <ReceiptOptionsModal
                    open={showReceiptOptionsModal}
                    close={closeReceiptModal}
                    patientid={Number(patientid)}
                    billingid={generatedBillingid ? Number(generatedBillingid) : 0}
                />
            )}

        </React.Fragment>
    );
}

