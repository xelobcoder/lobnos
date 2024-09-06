import { useEffect, useState } from "react";
import { patientRegistrationDefaultData } from "../../components/Auth/registerclient";
import PersonalInfomationRegistration from "../../components/registration/PersonalInfomationRegistration";
import { getRegistrationFields, registrationFields } from "../../components/registration/fields/Util";
import { toast, ToastContainer } from 'react-toastify';
import FrontDeskLayout from "../../components/Layout/FrontDeskLayout";
import Addressing from "../../components/registration/Addressing";
import EmmergencyContactInformation from "../../components/registration/EmmergencyContactInformation";
import { useRouter, useSearchParams } from "next/navigation";
import PatientFiltered from "../../components/accessories/CustomerFiltering";


export default function RegistrationForm() {
    const { personalInformation, addressingInformation, emmergencyInformation } = patientRegistrationDefaultData;
    const [fields, setFields] = useState(patientRegistrationDefaultData);
    const [visibleFields, setVisibleFields] = useState(registrationFields);
    const [showSearchUser, setSearchUser] = useState(false);
    const patientid = useSearchParams().get('patientid');
    const router = useRouter()
    const [isloading, setLoading] = useState(true);


    const getFields = async () => {
        try {
            setLoading(true);
            await getRegistrationFields(setVisibleFields);
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    }

    useEffect(() => {
        getFields();
    }, [])


    useEffect(() => {
        if (patientid === null) {
            setSearchUser(true)
        };
    }, [patientid])

    const filteredPatient = (options) => {
        const hasPatientid = typeof options == "object" && options.hasOwnProperty('patientid');
        if (!hasPatientid) return;
        const { patientid } = options;
        router.push(`/registration?patientid=${patientid}`)
    }

    return (
        <FrontDeskLayout>
            <ToastContainer theme="colored" position="top-center" className={'text-sm'} />
            {showSearchUser &&
                <div className="col-5">
                    <PatientFiltered getSelectedPatient={filteredPatient} />
                </div>
            }
            <div className="col-12">
                <div>
                    <div className="bg-primary text-white fw-bold text-capitalize p-2 mb-2 col-3 mt-1 pls-label">Personal Information</div>
                    <fieldset className="  heightedBorder bg-secondary-subtle  p-3">
                        <PersonalInfomationRegistration
                            fields={visibleFields.personalInformation}
                            toast={toast}
                            patientid={patientid}
                            defaultData={fields.personalInformation} />
                    </fieldset>
                </div>
                <div>
                    <div className="bg-primary text-white fw-bold text-capitalize p-2 mb-2 col-3    mt-1 pls-label">Address Information</div>
                    <fieldset className=" heightedBorder bg-secondary-subtle p-3">
                        {/* <legend>Address Information</legend> */}
                        <Addressing
                            fields={visibleFields.addressingInformation}
                            toast={toast}
                            patientid={patientid}
                            defaultData={addressingInformation} />
                    </fieldset>
                </div>
                <div>
                    <div className="bg-primary text-white fw-bold text-capitalize p-2 mb-2 col-3 mt-1 pls-label">Emmergency Contact Information</div>
                    <fieldset className="heightedBorder bg-secondary-subtle   p-3">
                        {/* <legend>Emmergency Information</legend> */}
                        <EmmergencyContactInformation
                            fields={visibleFields.emmergencyInformation}
                            toast={toast}
                            patientid={patientid}
                            defaultData={emmergencyInformation} />
                    </fieldset>
                </div>
            </div>
        </FrontDeskLayout>
    );
}

