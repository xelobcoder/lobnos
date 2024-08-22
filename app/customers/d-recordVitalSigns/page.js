"use client"
import VitalSignCustomerListInformation from "../../../components/customer/vitalSignCustomerList";
import RecordVitalSignsChartForm from "../../../components/customer/vitalSignChartForms";
import { AuthentificationProvider } from "../../../components/Auth/useAuthentification";
import FrontDeskLayout from "../../../components/Layout/FrontDeskLayout";


export default function RecordVitalSigns(context) {
    return (
        <AuthentificationProvider>
            <FrontDeskLayout>
                <div>
                    <RecordVitalSignsChartForm searchParams={context.searchParams} />
                    <VitalSignCustomerListInformation />
                </div>
            </FrontDeskLayout>
        </AuthentificationProvider>)
}

