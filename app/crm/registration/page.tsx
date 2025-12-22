"use client";
import React, { useEffect, useState } from 'react';
import { patientRegistrationDefaultData } from '../../../components/Auth/registerclient';
import { customFetch } from '../../../components/Auth/customFetch';
import { useRouter, useSearchParams } from 'next/navigation';
import RegistrationForm from '../../../components/registration/RegistrationForm';

export default function RegistrationPage() {
const searchParams = useSearchParams();
    const [fields, setFields] = useState<any>(patientRegistrationDefaultData);
    const [personalInformation, setPersonalInformation] = useState<any>(patientRegistrationDefaultData.personalInformation);
    const [addressingInformation, setAddressingInformation] = useState<any>(patientRegistrationDefaultData.addressingInformation);
    const [emmergencyInformation, setEmmergencyInformation] = useState<any>(patientRegistrationDefaultData.emmergencyInformation);
    const patientid = searchParams ? Number(searchParams.get('patientid')) : undefined;

    useEffect(() => {
        async function fetchFields() {
            const data = await customFetch("applicationsettings/registration/fields");
            if (Object.keys(data).length > 0) {
                setFields(data);
            }
        }
        fetchFields();
    }, []);

    useEffect(() => {
        async function fetchPatientData() {
            if (patientid) {
                const [emmergencyRes, addressingRes, personalRes] = await Promise.all([
                    customFetch(`register/emmergencycontactinformation?patientid=${patientid}`),
                    customFetch(`register/addressingformation?patientid=${patientid}`),
                    customFetch(`register/personalinformation?patientid=${patientid}`)
                ]);
                if (emmergencyRes?.result) {
                    setEmmergencyInformation(emmergencyRes?.result);
                }
                if (addressingRes?.result) {
                    setAddressingInformation(addressingRes?.result);
                }
                if (personalRes?.result) {
                    setPersonalInformation({ ...personalRes?.result, whatAppcontact: personalRes?.result?.whatappcontact });
                }
            }
        }
        fetchPatientData();
    }, [patientid]);


    return (
        <RegistrationForm
            fields={fields}
            personalInformation={personalInformation}
            addressingInformation={addressingInformation}
            emmergencyInformation={emmergencyInformation}
            patientid={patientid}
        />
    );
}