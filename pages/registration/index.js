import { useEffect, useState } from "react";
import { patientRegistrationDefaultData } from "../../components/Auth/registerclient";
import PersonalInfomationRegistration from "../../components/registration/PersonalInfomationRegistration";
import { getRegistrationFields, registrationFields } from "../../components/registration/fields/Util";
import { toast, ToastContainer } from 'react-toastify';
import FrontDeskLayout from "../../components/Layout/FrontDeskLayout";
import Addressing from "../../components/registration/Addressing";
import EmmergencyContactInformation from "../../components/registration/EmmergencyContactInformation";
import { useRouter, useSearchParams } from "next/navigation";
import PatientFiltered from '../../components/accessories/SectorFileringComponents/CustomerFiltering'
export default function RegistrationForm() {
    const { personalInformation, addressingInformation, emmergencyInformation } = patientRegistrationDefaultData;
    const [fields, setFields] = useState(patientRegistrationDefaultData);
    const [visibleFields, setVisibleFields] = useState(registrationFields);
    const [showSearchUser, setShowSearchUser] = useState(false);
    const patientid = useSearchParams().get('patientid');
    const router = useRouter();
    const [isloading, setLoading] = useState(true);

    const getFields = async () => {
        try {
            setLoading(true);
            await getRegistrationFields(setVisibleFields);
        } catch (err) {
            toast.error("Failed to load registration fields.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getFields();
    }, []);

    useEffect(() => {
        if (patientid === null) {
            setShowSearchUser(true);
        }
    }, [patientid]);

    const filteredPatient = (options) => {
        const hasPatientid = typeof options === "object" && options.hasOwnProperty('patientid');
        if (!hasPatientid) return;
        const { patientid } = options;
        router.push(`/registration?patientid=${patientid}`);
    };

    return (
        <FrontDeskLayout>
            <ToastContainer theme="colored" position="top-center" className={'text-sm'} />
            {showSearchUser && (
                <div className="col-md-8 col-sm-12 col-lg-4 my-2">
                    <PatientFiltered getSelectedPatient={filteredPatient} />
                </div>
            )}
            <div className="col-12 my-2">
                <div className="list-group mb-3">
                    <div className="list-group-item text-capitalize bg-secondary-subtle fw-bold list-group-item-action fw-bold text-capitalize">Personal Information</div>
                    <div className="list-group-item pls-color">
                        <PersonalInfomationRegistration
                            fields={visibleFields.personalInformation}
                            toast={toast}
                            patientid={patientid}
                            defaultData={fields.personalInformation}
                        />
                    </div>
                </div>
                <div className="list-group mb-3">
                    <div className="list-group-item-action fw-bold text-capitalize list-group-item text-capitalize bg-secondary-subtle fw-bold">Address Information</div>
                    <div className="list-group-item pls-color">
                        <Addressing
                            fields={visibleFields.addressingInformation}
                            toast={toast}
                            patientid={patientid}
                            defaultData={addressingInformation}
                        />
                    </div>
                </div>
                <div className="list-group mb-3">
                    <div className="list-group-item text-capitalize bg-secondary-subtle fw-bold list-group-item-action  text-capitalize">Emergency Contact Information</div>
                    <div className="list-group-item pls-color">
                        <EmmergencyContactInformation
                            fields={visibleFields.emmergencyInformation}
                            toast={toast}
                            patientid={patientid}
                            defaultData={emmergencyInformation}
                        />
                    </div>
                </div>
            </div>
        </FrontDeskLayout>
    );
}
