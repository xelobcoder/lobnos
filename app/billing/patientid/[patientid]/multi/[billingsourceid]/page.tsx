"use client";
import React, { useEffect, useState } from 'react';
import BillingPagePatientInformation from '../../../../../../components/Billing/BillingContextComponents/PersonalInfoView';
import { Alert } from 'react-bootstrap';
import { plsDecryption } from '../../../../../../lib/encryption';
import MultiBillingLayout from '../../../../../../components/Billing/Multi/MultBillingLayout';
import { RiErrorWarningFill } from '@remixicon/react';
import { customFetch } from '../../../../../../components/Auth/customFetch';


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

export default function MultiStepBillingSourcePage({ params, searchParams }: any) {
    const [patientBasicInformation, setPatientBasicInformation] = useState<any>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const categorytrackid = parseInt(params.billingsourceid, 10);
    const ispricingcheckout = searchParams?.ispricingcheckout === '1';
    let patientid: string | null = null;
    if (!ispricingcheckout) {
        const undeCryptedPatientId = params?.patientid;
        patientid = plsDecryption(undeCryptedPatientId?.toString() ?? "");
    }

    const entitytype = searchParams?.entitytype ?? null;
    const entityname = searchParams?.entityname ?? null;
    const entityid = searchParams?.entityid ?? null;
    const specialcode = searchParams?.specialcode ?? null;
    const billingid = searchParams?.billingid ?? null;
    const isRelatedBilling = searchParams?.isRelatedBilling === 0 || searchParams?.isRelatedBilling === "0" ? false : true;
    const isNewTransaction = searchParams?.isNewTransaction === 0 || searchParams?.isNewTransaction === "0" ? true : false;
    const isAdjustment = searchParams?.isAdjustment === 0 || searchParams?.isAdjustment === "0" ? false : true;
    const adjustmentType = searchParams?.adjustmentType || 'addition';
    const adjustmentReason = searchParams?.adjustmentReason || '';

    useEffect(() => {
        if (!ispricingcheckout && patientid && categorytrackid) {
            setLoading(true);
            customFetch(`register/personalinformation?patientid=${patientid}`)
                .then((response) => {
                    const { result, status, statusCode } = response;
                    if (statusCode === 200 && status === "success") {
                        setPatientBasicInformation(normalizePatientInfo(result));
                        setError(null);
                    } else {
                        setError(result?.message || "Failed to fetch patient information.");
                    }
                })
                .catch(() => {
                    setError("An error occurred while fetching patient information.");
                })
                .finally(() => setLoading(false));
        }
    }, [ispricingcheckout, patientid, categorytrackid]);

    if (error) {
        return (
            <Alert variant='danger' className='p-3 text-sm col-3 mx-auto'>
                <RiErrorWarningFill />
                {error}
            </Alert>
        );
    }

    return (
        <div>
            {!ispricingcheckout && (
                <div className='p-2 bg-white'>
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
                }}
            />
        </div>
    );
}
