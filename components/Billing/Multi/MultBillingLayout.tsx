'use client';
import React from "react";
import MultiRenderingBillingSourceFields from "./RenderingBillingSourceFields";
import MultiPACKAGESELECT from './MultiPACKAGESELECT';
import MultiRenderingWithPatientId from "./MultiRenderingWithPatientId";
import { Button, Spinner, Modal } from "react-bootstrap";
import { useContext, useState, useEffect, useRef } from "react";
import { customFetch, customFetchMutation } from "../../Auth/customFetch";
import { billingContextProps, defaultMultiBillingData, MultiBillingData } from "../../../lib/Multi/MultiTypes";
import { MultiBillingProvider, MultiBillingContext } from "./MultiBillingContext";
import MultiSummary from "./MultiSummary";
import { useRouter, useParams } from "next/navigation";
import { useApplication } from "../../Auth/useApplicationContext";
import { roleAllowed } from "../../Auth/roles";
import { toast } from "react-toastify";
import MultiBillingHeader from './MultiBillingHeader';
import PreviousRecordsHeader from './PreviousRecordsHeader';
import { plsEncryption } from "../../../lib/encryption";
import { MultiValidateAndSubmitBillingInformation } from "../../../lib/Multi/multiBillingValidation";
import ReceiptOptionsModal from '../ReceiptOptionsModal';
import { BillingContextPropsProvider, useBillingContextProps } from './BillingContextPropsContext';
import GoogleMapPicker from '../../home-collection/GoogleMapPicker';
import type { LocationValue } from '../../home-collection/v.dev.types';
import { finalizeSuspendedBilling, resumeSuspendedBilling } from '../../../lib/Multi/suspendedBilling';
import { billingInitUrl, canPreloadGeneralBilling, getFacilityBillingMode } from '../../../lib/Multi/billingWorkflow';
import { buildDefaultDeliveryPreferences, DEFAULT_RESULT_DELIVERY_MODE, loadRegistrationPromptSettings, type RegistrationPromptSettings } from '../../../lib/Multi/registrationPrompts';
import { requestedCart, type PatientBillingRequest } from '../../../lib/patientBillingRequests';
import { unwrap } from '../../../lib/patientPortal';



export default function MultiBillingLayout({ billingContextProps }: { billingContextProps: billingContextProps }) {
    const application = useApplication();
    const contextKey = JSON.stringify([
        application?.tenantId, application?.branchid, application?.user?.employeeid,
        billingContextProps.patientid, billingContextProps.categorytrackid, billingContextProps.billingid,
        billingContextProps.suspendedDraftId, billingContextProps.isAdjustment, billingContextProps.ispricingcheckout,
        billingContextProps.billingRequestId,
        billingContextProps.adjustmentType, billingContextProps.adjustmentReason,
        billingContextProps.isRelatedBilling, billingContextProps.isNewTransaction,
    ]);
    return (
        <BillingContextPropsProvider key={contextKey} initialProps={billingContextProps}>
            <MultiBillingProvider>
                <MultiBillingLayoutContent />
            </MultiBillingProvider>
        </BillingContextPropsProvider>
    );
}




function MultiBillingLayoutContent() {
    const { billingContextProps } = useBillingContextProps();
    const { categorytrackid, entitytype, entityname, entityid, patientid, billingid, isNewTransaction,
        isAdjustment, adjustmentType, adjustmentReason,
        isRelatedBilling, ispricingcheckout, suspendedDraftId, billingRequestId } = billingContextProps
    const branchid = useApplication().branchid;
    const employeeid = useApplication().user?.employeeid || 0;
    const role = useApplication().user?.role
    const cachedSettings = useApplication().settings;
    const preparingSubmitRef = useRef(false);
    const promptSettingsRef = useRef<RegistrationPromptSettings | null>(null);
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata, setBillingData, recalculateTotalBill } = context;
    const router = useRouter();
    const patientId = useParams()?.patientid;
    const [specialCodeError, setSpecialCodeError] = useState("");
    const [loadingSpecialCode, setLoadingSpecialCode] = useState(false);
    const [loadingPanels, setLoadingPanels] = useState(false);
    const [loadingBackendBilling, setLoadingBackendBilling] = useState(true);
    const [backendError, setBackendError] = useState<string | null>(null);
    const [usePackage, setUsePackage] = useState(false);
    const [useServices, setUseServices] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [showChoiceModal, setShowChoiceModal] = useState(false);
    const [generatedBillingid, setGeneratedBillingid] = useState<string | number | undefined>(undefined);
    const [showReceiptOptionsModal, setShowReceiptOptionsModal] = useState(false);
    const [pendingDraftFinalization, setPendingDraftFinalization] = useState<{ draftId: number; billingId: number } | null>(null);
    const [finalizingDraft, setFinalizingDraft] = useState(false);
    const [simpleBilling, setSimpleBilling] = useState(false);
    const [catalogLoaded, setCatalogLoaded] = useState(false);
    const [initializationComplete, setInitializationComplete] = useState(false);
    const [initializationAttempt, setInitializationAttempt] = useState(0);

    const retryDraftFinalization = async () => {
        if (!pendingDraftFinalization || finalizingDraft) return;
        setFinalizingDraft(true);
        try {
            await finalizeSuspendedBilling(pendingDraftFinalization.draftId, pendingDraftFinalization.billingId);
            setPendingDraftFinalization(null);
            toast.success('Suspended transaction marked complete.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to mark the suspended transaction complete');
        } finally {
            setFinalizingDraft(false);
        }
    };

    const handleSpecialCodeChange = (e) => {
        const value = e.target.value;
        setBillingData({ ...billingdata, specialCode: value });
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
            insurance: 3,
            nhis: 4,
            general: 1,
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





    const handleSelectedEntityClinician = (entity: { id: number, name: string }) => {
        if (!entity) return;
        const { id, name } = entity;
        setBillingData((prev) => ({
            ...prev,
            entityId: id,
            entitytype: "clinician",
            entityname: name || "",
            billingSource: 6,
            referalName: name || "",
        }));
        updateEntityInUrl("clinician", name || "", id, billingdata.specialCode);
    };

    const handleSelectedEntityInsurance = (entity: { id: number, insuranceName: string }) => {
        if (!entity) return;
        const { id, insuranceName } = entity;
        setBillingData((prev) => ({
            ...prev,
            entityId: id,
            entitytype: "insurance",
            entityname: insuranceName || "",
            billingSource: 3,
            referalName: insuranceName || "",
        }));
        updateEntityInUrl("insurance", insuranceName || "", id, billingdata.specialCode);
    };

    const handleOrganizationSelection = (entity: { id: number, name: string }) => {
        const { id, name } = entity;
        setBillingData((prev) => ({
            ...prev,
            entityId: id,
            entitytype: "organization",
            entityname: name || "",
            billingSource: 2,
            referalName: name || "",
        }));
        updateEntityInUrl("organization", name || "", id, billingdata.specialCode);
    };


    const handleReset = () => {
        if (billingRequestId !== undefined) {
            // Reset must reload the request, not silently detach it into an unrelated bill.
            setInitializationAttempt(value => value + 1);
            return;
        }
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
    const loadBackendBilling = async (data: MultiBillingData = billingdata, isActive = () => true) => {
        const includeServices = useServices;
        const servicesList = data.servicesList || [];
        setLoadingBackendBilling(true);
        setBackendError(null);
        try {
            const url = billingInitUrl(data, includeServices, ispricingcheckout);
            const backendData = await customFetch(url);
            if (!isActive()) return;
            if (!backendData || typeof backendData !== 'object' || !Array.isArray(backendData.testList)) {
                throw new Error(typeof backendData === 'string' ? backendData :
                    backendData?.message || 'Failed to load billing data. Check the sales session and patient, then retry.');
            }
            if (backendData.testList.length === 0) {
                throw new Error('No tests are available for this billing source. Check the test catalog or pricing configuration, then retry.');
            }

            let updated = {
                ...data,
                ...backendData,
                previousRecordsSummary: data.previousRecordsSummary,
                entityId: backendData.entityId ?? data.entityId,
                entitytype: backendData.entityType ?? data.entitytype,
                patientid: backendData.patientId ?? data.patientid,
                billingSource: backendData.billingSource ?? data.billingSource,
                includeServices: backendData.includeServices ?? includeServices,
                servicesList: includeServices ? backendData.servicesList || servicesList : [],
                payments: data.payments || [],
                cart: backendData.isPackageUsed ? backendData.testList : [],
                allowAdvancePayment: backendData.isPackageUsed ? false : backendData.allowAdvancePayment || false,
                ispricingcheckout
            };

            if (billingRequestId !== undefined) {
                if (!Number.isSafeInteger(billingRequestId) || billingRequestId <= 0 || categorytrackid !== 1 ||
                    billingid || suspendedDraftId || isAdjustment || ispricingcheckout) {
                    throw new Error('A patient request must be reviewed as a new General bill.');
                }
                const request = unwrap<PatientBillingRequest>(await customFetch(`patient-portal/admin/billing-requests/${billingRequestId}`));
                if (!isActive()) return;
                if (Number(request.patientid) !== Number(patientid)) throw new Error('This request belongs to a different patient.');
                if (request.status !== 'submitted') throw new Error(request.billingid
                    ? `This request already created bill #${request.billingid}. Do not create another bill.`
                    : 'This request is no longer awaiting review.');
                updated.cart = requestedCart(backendData.testList, request.testIds);
                updated.additionalInfo = request.note;
            }

            if (backendData.entityType && backendData.entityType !== data.entitytype) {
                const entityTypeToBillingSource = {
                    general: 1,
                    organization: 2,
                    insurance: 3,
                    nhis: 4,
                    clinician: 6,
                };

                const newSource = entityTypeToBillingSource[backendData.entityType.toLowerCase()];
                const path = window.location.pathname.split('/');

                if (!isNaN(Number(path[path.length - 1]))) {
                    path[path.length - 1] = String(newSource);
                    const queryParams = new URLSearchParams(window.location.search);
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
            setBillingData(updated);
            setCatalogLoaded(true);
            if (billingRequestId || (data.cart && data.cart.length > 0 && data.isPackageUsed)) {
                recalculateTotalBill(updated);
            }
        } catch (err) {
            if (isActive()) setBackendError(err instanceof Error ? err.message : 'Failed to load billing data from backend.');
        } finally {
            if (isActive()) setLoadingBackendBilling(false);
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
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [savingDeliveryPreference, setSavingDeliveryPreference] = useState(false);
    const [loadingDeliveryDefaults, setLoadingDeliveryDefaults] = useState(false);
    const [deliveryMode, setDeliveryMode] = useState<string>(DEFAULT_RESULT_DELIVERY_MODE);
    const [deliveryDetail, setDeliveryDetail] = useState<string>('');
    const [pendingSubmit, setPendingSubmit] = useState<null | { billingdata: MultiBillingData; writeOffConfirmed: boolean }>(null);
    const [showSampleLocationModal, setShowSampleLocationModal] = useState(false);
    const [sampleLocationChoice, setSampleLocationChoice] = useState<'in-center' | 'home'>('in-center');
    const [homeCollectionLocation, setHomeCollectionLocation] = useState<LocationValue>({
        address: '',
        latitude: 0,
        longitude: 0,
    });
    const [hasPickedHomeCollectionLocation, setHasPickedHomeCollectionLocation] = useState(false);
    const [homeCollectionDate, setHomeCollectionDate] = useState('');
    const [homeCollectionTime, setHomeCollectionTime] = useState('');
    const [homeCollectionError, setHomeCollectionError] = useState('');
    const [submittingHomeCollection, setSubmittingHomeCollection] = useState(false);

    // Per-test delivery preferences
    const [testDeliveryPreferences, setTestDeliveryPreferences] = useState<Array<{
        testid?: string | number;
        testname?: string;
        deliveryMode: string;
        deliveryDetail: string;
    }>>([]);
    const [usePerTestDelivery, setUsePerTestDelivery] = useState(false);

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

    const submitBillingInternal = async (billingdata: MultiBillingData, writeOffConfirmed = false) => {
        if (isSaving) return;
        if (generatedBillingid && (suspendedDraftId || billingRequestId)) {
            toast.info(`This sale has already been saved as billing ${generatedBillingid}. Do not submit it again.`);
            return;
        }

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
                billingRequestId,
                servicesProvided: billingdata.servicesProvided,
                employeeid: employeeid,
                branchid: branchid,
                amountPayable,
                totalPayments,
                billedagaints: billingdata.billedagaints,
                isConditionsUnderstood: false,
                isPromo: billingdata.isPromo ?? false,
                promoCodeId: billingdata.promoDetails?.id || billingdata?.promoId,
                promoCode: billingdata.promoDetails?.code || '',
                patientid: Number(billingdata.patientid),
                payments: billingdata.payments,
                billeddate: billingdata.billedagaints,
                additionalinformation: billingdata.additionalInfo ?? '',
                isAdjustment: typeof billingdata.isAdjustment === 'boolean' ? (billingdata.isAdjustment ? 1 : 0) : billingdata.isAdjustment,
                adjustmentType: billingdata.adjustmentType || 'addition',
                adjustmentReason: billingdata.adjustmentReason || '',
                entitytype: billingdata.entitytype || null,
                writeOffOutstanding: writeOffConfirmed ? true : undefined,
                excessAction: billingdata.excessAction || null,
                isNHIS: billingdata.billingSource == 4 ? true : false,
                claimscheckcode: billingdata.claimscheckcode || null,
                clinicianId: billingdata.clinicianId || null,
                organizationId: billingdata.organizationId || null,
                nhismembershipid: billingdata.nhismembershipid || null,
                result_delivery: billingdata.result_delivery || null,
            } as any;

            const response = await MultiValidateAndSubmitBillingInformation(
                dataToBeUploaded,
                billingid ? Number(billingid) : undefined
            );

            const { status, message } = response;

            if (status == true || status === 'success' || response.success === true) {
                if (typeof window !== 'undefined') {
                    const billingId = response.billingid || response.data?.billingid;
                    setGeneratedBillingid(billingId);
                    if (billingdata.suspendedDraftId && billingId) {
                        try {
                            await finalizeSuspendedBilling(billingdata.suspendedDraftId, Number(billingId));
                        } catch (error) {
                            setPendingDraftFinalization({ draftId: billingdata.suspendedDraftId, billingId: Number(billingId) });
                            toast.error(error instanceof Error ? error.message : 'Sale saved, but the suspended transaction could not be marked complete');
                        }
                    }
                }
            }
            if (status == false) {
                return toast.error(message || "Failed to submit billing data");
            }
            return response;

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to submit billing');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async (billingdata: MultiBillingData, writeOffConfirmed = false) => {
        if (isSaving) return;
        if (generatedBillingid && suspendedDraftId) {
            toast.info(`This sale has already been saved as billing ${generatedBillingid}. Do not submit it again.`);
            return;
        }

        if (!billingdata || !billingdata.patientid) {
            return toast.error('Patient ID is required to submit billing');
        }

        if (billingdata.isAdjustment === 1 && !billingdata.adjustmentType) {
            return toast.error('Adjustment type is required for adjustments');
        }

        if (billingdata.isAdjustment === 1 && !billingdata.adjustmentReason && billingdata.adjustmentType == 'correction') {
            return toast.error('Adjustment reason is required for correction adjustments');
        }

        if (preparingSubmitRef.current) return;
        preparingSubmitRef.current = true;
        let prompts: RegistrationPromptSettings;
        try {
            prompts = await loadRegistrationPromptSettings(cachedSettings);
        } finally {
            preparingSubmitRef.current = false;
        }
        promptSettingsRef.current = prompts;

        if (!prompts.resultDeliveryPrompt) {
            if (!employeeid) {
                toast.error('Employee session not found');
                return;
            }
            const resolvedBillingId =
                billingdata?.billingid ? Number(billingdata.billingid) : (billingid ? Number(billingid) : undefined);
            await completeBillingSubmission(billingdata, writeOffConfirmed,
                buildDefaultDeliveryPreferences(billingdata.cart || [], employeeid, resolvedBillingId), resolvedBillingId);
            return;
        }

        // Initialize test delivery preferences
        const tests = billingdata.cart || [];
        if (tests.length > 0) {
            const prefs = tests.map((test: any) => ({
                testid: test.testid,
                testname: test.testname || test.name || 'Test',
                deliveryMode: DEFAULT_RESULT_DELIVERY_MODE,
                deliveryDetail: '',
            }));
            setTestDeliveryPreferences(prefs);
        }

        setPendingSubmit({ billingdata, writeOffConfirmed });
        setShowDeliveryModal(true);
    };

    const saveDeliveryPreferenceAndContinue = async () => {
        if (!pendingSubmit) return;
        if (!employeeid) {
            toast.error('Employee session not found');
            return;
        }

        setSavingDeliveryPreference(true);
        try {
            const { billingdata, writeOffConfirmed } = pendingSubmit;
            const resolvedBillingId =
                billingdata?.billingid ? Number(billingdata.billingid) : (billingid ? Number(billingid) : undefined);

            // Prepare delivery preferences based on mode
            let preferencesPayload: any = [];
            if (usePerTestDelivery && testDeliveryPreferences.length > 0) {
                preferencesPayload = testDeliveryPreferences.map(pref => ({
                    ...(resolvedBillingId ? { billingid: resolvedBillingId } : {}),
                    testid: pref.testid,
                    testname: pref.testname,
                    requested_mode: pref.deliveryMode,
                    requested_mode_detail: pref.deliveryDetail,
                    employeeid,
                }));
            } else {
                // Global delivery preference
                const tests = billingdata.cart || [];
                preferencesPayload = tests.map((test: any) => ({
                    ...(resolvedBillingId ? { billingid: resolvedBillingId } : {}),
                    testid: test.testid,
                    testname: test.testname || test.name || 'Test',
                    requested_mode: deliveryMode,
                    requested_mode_detail: deliveryDetail,
                    employeeid,
                }));
            }

            const submitted = await completeBillingSubmission(billingdata, writeOffConfirmed, preferencesPayload, resolvedBillingId);
            if (submitted) setShowDeliveryModal(false);
        } catch (err) {
            toast.error('Failed to save delivery preference');
        } finally {
            setSavingDeliveryPreference(false);
        }
    };

    const completeBillingSubmission = async (billingdata: MultiBillingData, writeOffConfirmed: boolean,
        preferencesPayload: any[], resolvedBillingId?: number): Promise<boolean> => {
        const resultDeliveryPayload = {
            ...(resolvedBillingId ? { billingid: resolvedBillingId } : {}),
            preferences: preferencesPayload,
            employeeid,
        };

        const submitResponse: any = await submitBillingInternal(
            { ...billingdata, result_delivery: resultDeliveryPayload },
            writeOffConfirmed
        );
        const submittedBillingId = submitResponse?.billingid || submitResponse?.data?.billingid;
        if (!submittedBillingId) {
            if (submitResponse) toast.error(submitResponse?.message || 'Billing submission failed');
            return false;
        }

        const payloadWithBillingId = {
            ...resultDeliveryPayload,
            billingid: Number(submittedBillingId),
            preferences: resultDeliveryPayload.preferences.map((p: any) => ({
                ...p,
                billingid: Number(submittedBillingId),
            })),
        };

        setBillingData(prev => ({
            ...prev,
            result_delivery: payloadWithBillingId
        }));
        setPendingSubmit(null);
        setSampleLocationChoice('in-center');
        setHomeCollectionLocation({ address: '', latitude: 0, longitude: 0 });
        setHasPickedHomeCollectionLocation(false);
        setHomeCollectionDate('');
        setHomeCollectionTime('');
        setHomeCollectionError('');
        if (promptSettingsRef.current?.homeCollectionPrompt) setShowSampleLocationModal(true);
        return true;
    };

    // Binds the just-submitted billing to a home collection order (tests are pulled
    // from dboservices for this billingid, not re-picked). Skipped entirely for 'in-center'.
    const confirmSampleLocation = async () => {
        if (sampleLocationChoice === 'in-center') {
            setShowSampleLocationModal(false);
            return;
        }

        if (!homeCollectionDate || !homeCollectionTime || !hasPickedHomeCollectionLocation) {
            setHomeCollectionError('Appointment date/time and a pickup location are required.');
            return;
        }

        setSubmittingHomeCollection(true);
        setHomeCollectionError('');
        const response: any = await customFetchMutation('home-collection/orders/from-billing', 'POST', {
            billingid: Number(generatedBillingid),
            patientid: Number(billingdata.patientid),
            appointment_date: homeCollectionDate,
            appointment_time: homeCollectionTime,
            address: homeCollectionLocation.address,
            latitude: homeCollectionLocation.latitude,
            longitude: homeCollectionLocation.longitude,
        });
        setSubmittingHomeCollection(false);

        if (response?.status === 'success') {
            toast.success('Home collection scheduled for this billing.');
            setShowSampleLocationModal(false);
        } else {
            setHomeCollectionError(response?.message || 'Unable to schedule the home collection.');
        }
    };

    const handleBulkDeliveryModeChange = (mode: string) => {
        setTestDeliveryPreferences(prefs =>
            prefs.map(pref => ({
                ...pref,
                deliveryMode: mode,
            }))
        );
    };

    const handleTestDeliveryPreferenceChange = (testid: string | number | undefined, field: 'deliveryMode' | 'deliveryDetail', value: string) => {
        setTestDeliveryPreferences(prefs =>
            prefs.map(pref =>
                pref.testid === testid
                    ? { ...pref, [field]: value }
                    : pref
            )
        );
    };

    const loadDeliveryDefaults = async (billingIdToLoad: string | number | null | undefined) => {
        const resolvedBillingId = Number(billingIdToLoad);
        if (!resolvedBillingId || Number.isNaN(resolvedBillingId)) return;
        setLoadingDeliveryDefaults(true);
        try {
            const response: any = await customFetch(`result/delivery/preference/${resolvedBillingId}`);
            const pref = response?.preference || null;
            if (pref) {
                setDeliveryMode(pref.requested_mode || DEFAULT_RESULT_DELIVERY_MODE);
                setDeliveryDetail(pref.requested_mode_detail || '');
                setBillingData(prev => ({
                    ...prev,
                    resultDeliveryMode: pref.requested_mode || prev.resultDeliveryMode,
                    resultDeliveryDetail: pref.requested_mode_detail || prev.resultDeliveryDetail,
                }));
            }
        } catch (err) {
        } finally {
            setLoadingDeliveryDefaults(false);
        }
    };


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

        const initialData: MultiBillingData = {
            ...defaultMultiBillingData,
            entitytype: entitytype === 'general' || entitytype === 'organization' ||
                entitytype === 'insurance' || entitytype === 'clinician' ||
                entitytype === 'phis' || entitytype === 'nhis' ? entitytype : undefined,
            entityId: entityid,
            entityname: entityname || null,
            specialCode: billingContextProps.specialcode,
            useSpecialCode: Boolean(billingContextProps.specialcode),
            billingSource: categorytrackid,
            patientid,
            branchid: branchid,
            billingid: billingid || undefined,
            isNewTransaction: isNewTransaction || false,
            employeeid: employeeid,
            billingIdVerified,
            isAdjustment: typeof isAdjustment === 'boolean' ? (isAdjustment ? 1 : 0) : isAdjustment,
            adjustmentType: adjustmentType || 'addition',
            adjustmentReason: adjustmentReason || '',
            showRelatedBilling: billingid ? true : false,
            showdetails: roleAllowed(role, ['admin', 'manager']),
            previousRecordsSummary: summaryObj,
            ispricingcheckout,
        };
        return initialData;
    }

    useEffect(() => {
        if (suspendedDraftId) return;
        let active = true;
        const initialize = async () => {
            setLoadingBackendBilling(true);
            setBackendError(null);
            try {
                const initialData = await onMountedRun();
                if (!active) return;
                setBillingData(initialData);
                if (canPreloadGeneralBilling(billingContextProps)) {
                    const mode = await getFacilityBillingMode();
                    if (!active) return;
                    setSimpleBilling(mode === 'simple');
                    if (mode === 'simple' || billingRequestId !== undefined) await loadBackendBilling(initialData, () => active);
                }
                if (active) setInitializationComplete(true);
            } catch (error) {
                if (active) setBackendError(error instanceof Error ? error.message : 'Unable to initialize billing. Please retry.');
            } finally {
                if (active) setLoadingBackendBilling(false);
            }
        };
        void initialize();
        return () => { active = false; };
    }, [initializationAttempt]);

    useEffect(() => {
        if (!suspendedDraftId) return;
        let active = true;
        const restore = async () => {
            setLoadingBackendBilling(true);
            setBackendError(null);
            try {
                const restored = await resumeSuspendedBilling(suspendedDraftId, patientid, branchid, employeeid, ispricingcheckout);
                if (!active) return;
                setBillingData({ ...restored.billingdata, suspendNote: restored.notes });
                setUseServices(Boolean(restored.billingdata.includeServices));
                setUsePackage(restored.billingdata.isPackageUsed);
                setInitializationComplete(true);
                setCatalogLoaded(true);
            } catch (error) {
                if (active) setBackendError(error instanceof Error ? error.message : 'Unable to resume suspended transaction');
            } finally {
                if (active) setLoadingBackendBilling(false);
            }
        };
        void restore();
        return () => { active = false; };
    }, [suspendedDraftId, patientid, branchid, employeeid, ispricingcheckout, initializationAttempt]);
    useEffect(() => {
        if (!billingdata?.billingid) return;
        loadDeliveryDefaults(billingdata.billingid);
    }, [billingdata?.billingid]);



    const handleAdvancedPayment = () => {
        if (billingdata.outstanding != null && billingdata.outstanding <= 0) {
            const finalInput = {
                ...billingdata,
                finalCart: billingdata.cart.map(item => ({ ...item, paymentstatus: 'paid', paidamount: item?.discountedValue })),
                finalServicesList: billingdata.servicesProvided?.map(item => ({ ...item, paymentstatus: 'paid', paidamount: item?.discountedValue })),
                paid: billingdata.amountPayable,
                balance: 0,
                outstanding: 0,
            }

            handleSubmit(finalInput)
            return toast.info("No outstanding amount to make an advanced payment. Billing is fully paid.");
        } else {
            setBillingData(prev => ({
                ...prev,
                openPaymentModal: 2,
            }));
        }
    }


    const canLoadData = (() => {
        if (billingdata.isPackageUsed && !billingdata.packageid) return false;
        if (billingdata.useSpecialCode && billingdata.specialCode && !specialCodeError) return true;
        if (billingdata.billingSource == 4 && (billingdata.nhismembershipid && billingdata.nhismembershipid > 0) &&
            (billingdata.claimscheckcode && billingdata.claimscheckcode > 0)) return true;
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
        return (
            <div className="alert alert-danger" role="alert">
                {backendError}
                <Button className="ms-2" size="sm" variant="outline-danger" onClick={() => {
                    if (initializationComplete && !suspendedDraftId) void loadBackendBilling();
                    else setInitializationAttempt(value => value + 1);
                }}>Retry</Button>
            </div>
        );
    }

    return (
        <React.Fragment>
            {billingRequestId && <div className="alert alert-info" role="status">
                Reviewing patient request #{billingRequestId}. Requested tests are prefilled at current General prices.
                Save without payment; the request is converted only when the bill is successfully saved.
            </div>}
            {pendingDraftFinalization && (
                <div className="alert alert-warning" role="alert">
                    Sale {pendingDraftFinalization.billingId} was saved. Its suspended draft still needs to be marked complete; do not submit the sale again.
                    <Button className="ms-2" size="sm" variant="outline-secondary" disabled={finalizingDraft} onClick={() => void retryDraftFinalization()}>
                        {finalizingDraft ? 'Marking complete...' : 'Retry marking draft complete'}
                    </Button>
                </div>
            )}
            <div className="card mt-2 multi-billing-card">
                <MultiBillingHeader
                    billingdata={billingdata}
                    setBillingData={setBillingData}
                    useServices={useServices}
                    specialCodeError={specialCodeError}
                    loadingSpecialCode={loadingSpecialCode}
                    loadingBackendBilling={loadingBackendBilling}
                    canLoadData={canLoadData}
                    onPackageActivation={handlePackageActivation}
                    onUseServicesChange={checked => {
                        setUseServices(checked);
                        setBillingData(prev => ({ ...prev, includeServices: checked }));
                    }}
                    onSpecialCodeChange={handleSpecialCodeChange}
                    onLoadBackendBilling={() => void loadBackendBilling()}
                    autoStarted={simpleBilling && catalogLoaded}
                    onReset={handleReset}
                    onReturnToMulti={handleReturnToMulti}
                    isSaleSaved={Boolean(generatedBillingid && suspendedDraftId)}
                />

                <PreviousRecordsHeader />

                <div className="card-body m-0 p-0">
                    <div className="row g-0">
                        <div className="col-12 col-md-2 p-3 border-end" style={{ minHeight: 300 }}>
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
                        <div className="col-12 col-md-7" style={{ minHeight: 300 }}>
                            {loadingPanels ? (
                                <div className="h-100 w-100 d-flex align-items-center justify-content-center">
                                    <Spinner animation="border" variant="primary" />
                                    <span className="ms-2">Loading test panels...</span>
                                </div>
                            ) : (
                                <div className="h-100 w-100 border-start p-2">
                                    <MultiRenderingWithPatientId canload={canLoadData} />
                                </div>
                            )}
                        </div>
                        <div className="col-12 col-md-3 border-start p-2" style={{ minHeight: 300 }}>
                            {billingdata.showsummary && <MultiSummary handlesubmit={handleSubmit} generatedBillingid={generatedBillingid} />}
                        </div>
                    </div>
                </div>

                <div className="card-footer d-flex justify-content-end">
                    {billingdata?.allowAdvancePayment && (
                        <>
                            <Button disabled={billingdata.ispricingcheckout} variant="outline-primary" className="mx-2 " size="sm" onClick={handleAdvancedPayment} >
                                💳 Advanced Payment
                            </Button>

                        </>
                    )}
                </div>

            </div>

            {/* Receipt Options Modal */}
            {showReceiptOptionsModal && (
                <ReceiptOptionsModal
                    open={showReceiptOptionsModal}
                    close={closeReceiptModal}
                    patientid={Number(patientid)}
                    billingid={generatedBillingid ? Number(generatedBillingid) : 0}
                />
            )}

            <Modal
                show={showDeliveryModal}
                onHide={() => {
                    if (savingDeliveryPreference) return;
                    setShowDeliveryModal(false);
                    setPendingSubmit(null);
                }}
                backdrop="static"
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5 fw-semibold text-body-emphasis">Result Delivery Preferences</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-muted mb-4 small">
                        Configure how results and delivery preferences will be handled for this transaction.
                    </div>

                    {/* Delivery Mode Toggle */}
                    <div className="mb-4">
                        <label className="form-label fw-semibold text-body-emphasis">Delivery Configuration</label>
                        <div className="btn-group w-100" role="group">
                            <input
                                type="radio"
                                className="btn-check"
                                name="deliveryMode"
                                id="globalDelivery"
                                checked={!usePerTestDelivery}
                                onChange={() => setUsePerTestDelivery(false)}
                            />
                            <label className="btn btn-outline-primary" htmlFor="globalDelivery">
                                Global Delivery Mode
                            </label>

                            <input
                                type="radio"
                                className="btn-check"
                                name="deliveryMode"
                                id="perTestDelivery"
                                checked={usePerTestDelivery}
                                onChange={() => setUsePerTestDelivery(true)}
                            />
                            <label className="btn btn-outline-primary" htmlFor="perTestDelivery">
                                Per-Test Configuration
                            </label>
                        </div>
                    </div>

                    {/* Global Delivery Mode */}
                    {!usePerTestDelivery && (
                        <div className="card mb-4">
                            <div className="card-body">
                                <h6 className="card-title mb-3 fw-semibold text-body-emphasis">Global Settings</h6>
                                <div className="mb-3">
                                    <label className="form-label fw-medium text-body">Mode of Delivery</label>
                                    <select
                                        className="form-select"
                                        value={deliveryMode}
                                        onChange={(e) => setDeliveryMode(e.target.value)}
                                    >
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="email">Email</option>
                                        <option value="hard copy">Hard copy</option>
                                        <option value="phone call">Phone call</option>
                                    </select>
                                </div>
                                <div className="mb-0">
                                    <label className="form-label fw-medium text-body">Detail / Instruction (optional)</label>
                                    <textarea
                                        className="form-control"
                                        rows={2}
                                        value={deliveryDetail}
                                        onChange={(e) => setDeliveryDetail(e.target.value)}
                                        placeholder="Example: Send to main number, call before delivery"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Per-Test Configuration */}
                    {usePerTestDelivery && testDeliveryPreferences.length > 0 && (
                        <div className="card mb-4">
                            <div className="card-body">
                                <h6 className="card-title mb-3 fw-semibold text-body-emphasis">Per-Test Configuration</h6>

                                {/* Bulk Actions */}
                                <div className="mb-3 p-2 bg-light rounded">
                                    <label className="form-label form-label-sm fw-medium text-body">Apply Delivery Mode to All Tests</label>
                                    <select
                                        className="form-select form-select-sm"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleBulkDeliveryModeChange(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="">Select mode...</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="email">Email</option>
                                        <option value="hard copy">Hard copy</option>
                                        <option value="phone call">Phone call</option>
                                    </select>
                                </div>

                                {/* Test Table */}
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="fw-semibold text-body-emphasis">Test Name</th>
                                                <th className="fw-semibold text-body-emphasis">Delivery Mode</th>
                                                <th className="fw-semibold text-body-emphasis">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {testDeliveryPreferences.map((pref, idx) => (
                                                <tr key={idx}>
                                                    <td className="align-middle">{pref.testname}</td>
                                                    <td className="align-middle">
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={pref.deliveryMode}
                                                            onChange={(e) =>
                                                                handleTestDeliveryPreferenceChange(
                                                                    pref.testid,
                                                                    'deliveryMode',
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            <option value="whatsapp">WhatsApp</option>
                                                            <option value="email">Email</option>
                                                            <option value="hard copy">Hard copy</option>
                                                            <option value="phone call">Phone call</option>
                                                        </select>
                                                    </td>
                                                    <td className="align-middle">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="Add notes..."
                                                            value={pref.deliveryDetail}
                                                            onChange={(e) =>
                                                                handleTestDeliveryPreferenceChange(
                                                                    pref.testid,
                                                                    'deliveryDetail',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {loadingDeliveryDefaults && (
                        <div className="alert alert-info mb-3 small text-body">
                            Loading last saved delivery preference...
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={() => {
                            if (savingDeliveryPreference) return;
                            setShowDeliveryModal(false);
                            setPendingSubmit(null);
                        }}
                        className="fw-medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={saveDeliveryPreferenceAndContinue}
                        disabled={savingDeliveryPreference}
                        className="fw-medium"
                    >
                        {savingDeliveryPreference ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Saving...
                            </>
                        ) : (
                            'Submit & Save'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showSampleLocationModal}
                onHide={() => {
                    if (submittingHomeCollection) return;
                    setShowSampleLocationModal(false);
                }}
                backdrop="static"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5 fw-semibold text-body-emphasis">Sample Collection Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-muted mb-3 small">Where should the sample be taken for this billing?</div>
                    <div className="btn-group w-100 mb-3" role="group">
                        <input
                            type="radio"
                            className="btn-check"
                            name="sampleLocationChoice"
                            id="sampleLocationInCenter"
                            checked={sampleLocationChoice === 'in-center'}
                            onChange={() => setSampleLocationChoice('in-center')}
                        />
                        <label className="btn btn-outline-primary" htmlFor="sampleLocationInCenter">In-center</label>

                        <input
                            type="radio"
                            className="btn-check"
                            name="sampleLocationChoice"
                            id="sampleLocationHome"
                            checked={sampleLocationChoice === 'home'}
                            onChange={() => setSampleLocationChoice('home')}
                        />
                        <label className="btn btn-outline-primary" htmlFor="sampleLocationHome">Home collection</label>
                    </div>

                    {sampleLocationChoice === 'home' && (
                        <div>
                            {homeCollectionError && <div className="alert alert-danger py-2">{homeCollectionError}</div>}
                            <div className="row g-2 mb-2">
                                <div className="col-6">
                                    <label className="form-label">Appointment date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={homeCollectionDate}
                                        onChange={(e) => setHomeCollectionDate(e.target.value)}
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">Appointment time</label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        value={homeCollectionTime}
                                        onChange={(e) => setHomeCollectionTime(e.target.value)}
                                    />
                                </div>
                            </div>
                            <label className="form-label">Pickup location</label>
                            <GoogleMapPicker
                                value={homeCollectionLocation}
                                onChange={(next) => {
                                    setHomeCollectionLocation(next);
                                    setHasPickedHomeCollectionLocation(true);
                                }}
                                height={260}
                            />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={confirmSampleLocation}
                        disabled={submittingHomeCollection}
                        className="fw-medium"
                    >
                        {submittingHomeCollection ? 'Scheduling…' : sampleLocationChoice === 'home' ? 'Schedule Home Collection' : 'Continue'}
                    </Button>
                </Modal.Footer>
            </Modal>

        </React.Fragment>
    );
}
