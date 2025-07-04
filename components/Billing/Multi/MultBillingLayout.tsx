'use client';

import MultiRenderingBillingSourceFields from "./RenderingBillingSourceFields";
import MultiPACKAGESELECT from './MultiPACKAGESELECT';
import MultiRenderingWithPatientId from "./MultiRenderingWithPatientId";
import { Spinner } from "react-bootstrap";
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



export default function MultiBillingLayout({ billingContextProps }: {
    billingContextProps: {
        categorytrackid: number,
        entitytype?: string,
        entityname?: string,
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
        isAdjustment?: boolean,
        adjustmentType?: 'addition' | 'correction' | 'voided' | null,
        adjustmentReason?: string,
        specialcode?: string,
    }
}) {
    const { categorytrackid, entitytype, entityname, entityid, patientid, billingid, isNewTransaction,
        isAdjustment, adjustmentType, adjustmentReason,
        isRelatedBilling } = billingContextProps;
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

    // Checkout handler: send billing data to backend
    const handleCheckout = async () => {
        try {
            console.log("Checkout data:", billingdata);
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
            };
            const response = await customPost('billing/multi/checkout', 'POST', checkoutPayload);
            if (response && response.success && response.data) {
                setBillingData(prev => ({
                    ...prev, ...response.data, cart: response.data.isPackageUsed ?
                        response.data.packageTestList : response.data.cart || [],
                    payments: [],
                    paid: 0,
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
        onMountedRun()
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
                    <div className="col-md-3 p-3 border-end" style={{ minHeight: 300 }}>
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
                    <div className="col-md-6" style={{ minHeight: 300 }}>
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
                    <div className="col-md-3 border-start p-2" style={{ minHeight: 300 }}>
                        {showSummary && <MultiSummary />}
                    </div>
                </div>
            </div>
        </div>
    );
}

