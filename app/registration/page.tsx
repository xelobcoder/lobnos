import React from 'react'
import { patientRegistrationDefaultData } from '../../components/Auth/registerclient'
import { customFetch } from '../../components/Auth/customFetch'
import { redirect } from 'next/navigation'
import RegistrationForm from '../../components/registration/RegistrationForm';

export default async function RegistrationPage({ searchParams }: { searchParams: { patientid: number } }) {
    let { personalInformation, addressingInformation, emmergencyInformation } = patientRegistrationDefaultData
    const { patientid } = await searchParams

    let fields = patientRegistrationDefaultData
    const data = await customFetch("applicationsettings/registration/fields")
    if (Object.keys(data).length > 0) {
        fields = data
    }
    const filteredPatient = async (options) => {
        "use server"
        const hasPatientid = typeof options === "object" && options.hasOwnProperty("patientid")
        if (!hasPatientid) return
        const { patientid } = options
        redirect(`/registration?patientid=${patientid}`)
    }

    if (patientid) {
        const [emmergencyRes, addressingRes, personalRes] = await Promise.all([
            customFetch(`register/emmergencycontactinformation?patientid=${patientid}`),
            customFetch(`register/addressingformation?patientid=${patientid}`),
            customFetch(`register/personalinformation?patientid=${patientid}`)
        ])
        if (emmergencyRes?.result) {
            emmergencyInformation = emmergencyRes?.result
        }

        if (addressingRes?.result) {
            addressingInformation = addressingRes?.result
        }

        if (personalRes?.result) {
            personalInformation = { ...personalRes?.result, whatAppcontact: personalRes?.result?.whatappcontact }
        }
    }
    return <RegistrationForm 
    fields={fields}
    personalInformation={personalInformation}
    addressingInformation={addressingInformation}
    emmergencyInformation={emmergencyInformation}
    patientid={patientid}
/>;
}