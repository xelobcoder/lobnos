import React from 'react'
import { patientRegistrationDefaultData } from '../../components/Auth/registerclient'
import PatientFiltered from '../../components/accessories/SectorFileringComponents/CustomerFiltering'
import { customFetch } from '../../components/Auth/customFetch'
import { toast, ToastContainer } from 'react-toastify'
import PersonalInfomationRegistration from '../../components/registration/PersonalInfomationRegistration'
import Addressing from '../../components/registration/Addressing'
import EmmergencyContactInformation from '../../components/registration/EmmergencyContactInformation'
import { redirect } from 'next/navigation'

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
    return (
        <div className="col-12 my-2">
            <div className="col-md-8 col-sm-12 col-lg-4 my-2">
                <PatientFiltered getSelectedPatient={filteredPatient} isDisabled={false} />
            </div>
            <div className="list-group mb-3">
                <div className="list-group-item text-capitalize bg-secondary-subtle fw-bold list-group-item-action fw-bold text-capitalize">
                    Personal Information
                </div>
                <div className="list-group-item pls-color">
                    <PersonalInfomationRegistration
                        fields={fields.personalInformation}
                        toast={toast}
                        redirect={patientid ? false : true}
                        patientid={patientid}
                        defaultData={personalInformation}
                    />
                </div>
            </div>
            <div className="list-group mb-3">
                <div className="list-group-item-action fw-bold text-capitalize list-group-item text-capitalize bg-secondary-subtle fw-bold">
                    Address Information
                </div>
                <div className="list-group-item pls-color">
                    <Addressing
                        fields={fields.addressingInformation}
                        toast={toast}
                        patientid={patientid}
                        defaultData={addressingInformation}
                    />
                </div>
            </div>
            <div className="list-group mb-3">
                <div className="list-group-item text-capitalize bg-secondary-subtle fw-bold list-group-item-action text-capitalize">
                    Emergency Contact Information
                </div>
                <div className="list-group-item pls-color">
                    <EmmergencyContactInformation
                        fields={fields.emmergencyInformation}
                        toast={toast}
                        patientid={patientid}
                        defaultData={emmergencyInformation}
                    />
                </div>
            </div>
            <ToastContainer className={'text-sm'} position='top-center' theme='colored' />
        </div>
    )
}
