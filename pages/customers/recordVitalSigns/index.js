import VitalSignCustomerListInformation from "../../../components/customer/vitalSignCustomerList";
import RecordVitalSignsChartForm from "../../../components/customer/vitalSignChartForms";
import FrontDeskLayout from "../../../components/Layout/FrontDeskLayout";


export default function RecordVitalSigns(context) {
    return (
        <FrontDeskLayout>
            <div>
                <RecordVitalSignsChartForm searchParams={context.searchParams} />
                <VitalSignCustomerListInformation />
            </div>
        </FrontDeskLayout>)
}

