'use client';
import { FormProvider, useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { RegistrationWrapper } from './RegistrationWrapper';
import PatientImageUpload from './PersonalRegistrationForms/PatientImageUpload';
import PersonalInfomationRegistration from './PersonalInfomationRegistration';
import Addressing from './Addressing';
import EmmergencyContactInformation from './EmmergencyContactInformation';
import PatientCredentials from './PersonalRegistrationForms/PatientCredentials';
import PatientSettings from './PersonalRegistrationForms/PatientSettings';
import PrimeToast from '../accessories/PrimeToast';
import { toast } from 'react-toastify';


export default function RegistrationForm({ fields, personalInformation, addressingInformation, emmergencyInformation, patientid }) {
    const searchParams = useSearchParams();
    const isOnlyRegistration = searchParams.get('isOnlyRegistration') === 'true';

    const methods = useForm({
        defaultValues: {
            ...personalInformation,
            ...addressingInformation,
            ...emmergencyInformation
        }
    });

    return (
        <FormProvider {...methods}>
            <div>
                <RegistrationWrapper isOnlyRegistration={isOnlyRegistration}>
                    {!isOnlyRegistration && <PatientImageUpload patientid={patientid} />}
                    <PersonalInfomationRegistration
                        fields={fields.personalInformation}
                        toast={toast}
                        redirect={patientid ? false : true}
                        patientid={patientid}
                        defaultData={personalInformation}
                    />
                    {!isOnlyRegistration && (
                        <>
                            <Addressing
                                fields={fields.addressingInformation}
                                toast={toast}
                                patientid={patientid}
                                defaultData={addressingInformation}
                            />
                            <EmmergencyContactInformation
                                fields={fields.emmergencyInformation}
                                toast={toast}
                                patientid={patientid}
                                defaultData={emmergencyInformation}
                            />
                            <PatientCredentials />
                            <PatientSettings />
                        </>
                    )}
                </RegistrationWrapper>
                <PrimeToast />
            </div>
        </FormProvider>
    );
}