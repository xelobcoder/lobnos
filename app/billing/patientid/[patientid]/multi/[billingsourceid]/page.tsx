import React from 'react'
import BillingPagePatientInformation from '../../../../../../components/Billing/BillingContextComponents/PersonalInfoView';
import { customFetch } from '../../../../../../components/Auth/customFetch';
import { Alert } from 'react-bootstrap';
import { plsDecryption } from '../../../../../../lib/encryption';
import MultiBillingLayout from '../../../../../../components/Billing/Multi/MultBillingLayout';
import { RiErrorWarningFill } from '@remixicon/react';


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

export default async function MultiStepBillingSourcePage({ params, searchParams }: any) {
    let patientBasicInformation = {};
    const categorytrackid = parseInt(params.billingsourceid, 10);
    const undeCryptedPatientId = params?.patientid;
    const patientid = plsDecryption(undeCryptedPatientId?.toString() ?? "");


    const entitytype = searchParams?.entitytype ?? null;
    const entityname = searchParams?.entityname ?? null;
    const entityid = searchParams?.entityid ?? null;
    const specialcode = searchParams?.specialcode ?? null;
    const billingid = searchParams?.billingid ?? null;
    const isNewTransaction = searchParams?.isNewTransaction === 0 || searchParams?.isNewTransaction === "0" ?  true : false;

    if (patientid && categorytrackid) {
        try {
            const response = await customFetch(`register/personalinformation?patientid=${patientid}`);
            const { result, status, statusCode } = response;
            if (statusCode == 200 && status === "success") {
                patientBasicInformation = normalizePatientInfo(result);
            } else {
                return (
                    <Alert variant='danger' className='p-3'>
                        {result?.message || "Failed to fetch patient information."}
                    </Alert>
                );
            }
        } catch (error) {
            return (
                <Alert variant='danger' className='p-3 text-sm col-3 mx-auto'>
                    <RiErrorWarningFill />
                    An error occurred while fetching patient information.
                </Alert>
            );
        }
    }

    return (
        <div>
            <div className='p-2 bg-white'>
                <BillingPagePatientInformation data={patientBasicInformation} />
            </div>
            <hr className='p-0 m-0' />
            <MultiBillingLayout
                billingContextProps={{
                    categorytrackid,
                    entitytype,
                    patientid:parseInt(patientid, 10),
                    entityname,
                    entityid,
                    billingid: billingid ? parseInt(billingid, 10) : null,
                    isNewTransaction,
                    specialcode,
                }}
            />
        </div>
    );
}
