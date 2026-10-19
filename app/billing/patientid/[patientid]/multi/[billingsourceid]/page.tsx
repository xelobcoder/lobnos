"use client";
import React, { useEffect, useState } from 'react';
import BillingPagePatientInformation from '../../../../../../components/Billing/BillingContextComponents/PersonalInfoView';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { useParams, useSearchParams } from 'next/navigation';
import { plsDecryption } from '../../../../../../lib/encryption';
import MultiBillingLayout from '../../../../../../components/Billing/Multi/MultBillingLayout';
import { RiErrorWarningFill } from '@remixicon/react';
import { customFetch } from '../../../../../../components/Auth/customFetch';
import { useApplication } from '../../../../../../components/Auth/useApplicationContext';


export interface PatientInfo {
    patientid: number;
    fullpatientid: string;
    designation: string;
    firstname: string;
    lastname: string;
    middlename: string;
    email: string;
    dob: string;
    age: number;
    gender: "male" | "female" | string;
    occupation: string;
    date: string;
    activation_status: boolean;
    contactpointer: string;
    whatappcontact: string;
    maritalstatus: string;
    mobile: string;
    patientOrganization: string;
    years: number;
    months: number;
    days: number;
    ageType: string;
}

export interface PatientInfoResponse {
    statusCode: number;
    status: string;
    result: PatientInfo;
}


function normalizePatientInfo(raw: any): PatientInfo {
    return {
        ...raw,
        activation_status: String(raw.activation_status).toLowerCase() === "true",
        mobile: String(raw.mobile),
    };
}

export default function MultiStepBillingSourcePage() {
    const [patientBasicInformation, setPatientBasicInformation] = useState<any>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [attempt, setAttempt] = useState(0);
    const application = useApplication();
    const params = useParams();
    const searchParams = useSearchParams();

    const categorytrackid = parseInt(String(params?.billingsourceid || ''), 10);
    const ispricingcheckout = searchParams.get('ispricingcheckout') === '1';

    let patientid: string | null = null;
    if (!ispricingcheckout) {
        const undeCryptedPatientId = params?.patientid;
        patientid = plsDecryption(undeCryptedPatientId?.toString() ?? "");
    }

    const entitytype = searchParams.get('entitytype') ?? undefined;
    const entityname = searchParams.get('entityname') ?? undefined;
    const entityid = searchParams.get('entityid') ?? undefined;
    const specialcode = searchParams.get('specialcode') ?? undefined;
    const billingid = searchParams.get('billingid');
    const isRelatedBilling = searchParams.get('isRelatedBilling') !== '0';
    const isNewTransaction = searchParams.get('isNewTransaction') === '0';
    const isAdjustment = ['1', 'true'].includes(searchParams.get('isAdjustment') || '');
    const requestedAdjustmentType = searchParams.get('adjustmentType');
    const adjustmentType = requestedAdjustmentType === 'correction' || requestedAdjustmentType === 'voided'
        ? requestedAdjustmentType
        : 'addition';
    const adjustmentReason = searchParams.get('adjustmentReason') || '';
    const suspendedDraftId = searchParams.get('suspendedDraftId') ? Number(searchParams.get('suspendedDraftId')) : undefined;

    useEffect(() => {
        let active = true;
        setError(null);
        if (!Number.isSafeInteger(categorytrackid) || ![1, 2, 3, 4, 6].includes(categorytrackid)) {
            setError('Invalid billing source.');
            setLoading(false);
        } else if (ispricingcheckout) {
            setLoading(false);
        } else if (!patientid || !Number.isSafeInteger(Number(patientid)) || Number(patientid) <= 0) {
            setError('Select a valid patient before starting billing.');
            setLoading(false);
        } else {
            setLoading(true);
            customFetch(`register/personalinformation?patientid=${patientid}`)
                .then((response) => {
                    if (!active) return;
                    const { result, status, statusCode } = response;
                    if (statusCode === 200 && status === "success" && Number(result?.patientid) === Number(patientid)) {
                        setPatientBasicInformation(normalizePatientInfo(result));
                        setError(null);
                    } else {
                        setError(result?.message || "Failed to fetch patient information.");
                    }
                })
                .catch(() => {
                    if (active) setError("An error occurred while fetching patient information.");
                })
                .finally(() => { if (active) setLoading(false); });
        }
        return () => { active = false; };
    }, [ispricingcheckout, patientid, categorytrackid, application?.tenantId, attempt]);

    if (loading) {
        return <div className="p-3" role="status"><Spinner size="sm" className="me-2" />Loading patient information...</div>;
    }

    if (error) {
        return (
            <Alert variant='danger' className='p-3 text-sm col-3 mx-auto'>
                <RiErrorWarningFill />
                {error}
                <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => setAttempt(value => value + 1)}>Retry</Button>
            </Alert>
        );
    }

    return (
        <div>
            {!ispricingcheckout && (
                <div className='p-2 bg-secondary-subtle mb-2'>
                    <BillingPagePatientInformation data={patientBasicInformation} />
                </div>
            )}
            <hr className='p-0 m-0' />
            <MultiBillingLayout
                billingContextProps={{
                    categorytrackid,
                    entitytype,
                    patientid: ispricingcheckout ? 0 : (patientid ? parseInt(patientid, 10) : 0),
                    entityname,
                    isRelatedBilling,
                    isAdjustment,
                    ispricingcheckout,
                    adjustmentType,
                    adjustmentReason,
                    entityid,
                    billingid: billingid ? parseInt(billingid, 10) : null,
                    isNewTransaction,
                    specialcode,
                    suspendedDraftId,
                    billingRequestId: searchParams.has('billingRequestId') ? Number(searchParams.get('billingRequestId')) : undefined,
                    appointmentId: searchParams.has('appointmentId') ? Number(searchParams.get('appointmentId')) : undefined,
                }}
            />
        </div>
    );
}
