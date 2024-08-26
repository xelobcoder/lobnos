import VitalSignCustomerListInformation from "../../../components/customer/vitalSignCustomerList";
import RecordVitalSignsChartForm from "../../../components/customer/vitalSignChartForms";
import FrontDeskLayout from "../../../components/Layout/FrontDeskLayout";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


export default function RecordVitalSigns() {
    const [queryParams, setQueryParams] = useState({})
    const urlParams = useSearchParams();

    useEffect(() => {
        let paramObject = {};
        for (const [item, value] of urlParams.entries()) {
            paramObject[item] = value;
        }
        setQueryParams(paramObject)
    }, [urlParams])
    return (
        <FrontDeskLayout>
            <div>
                <RecordVitalSignsChartForm searchParams={queryParams} />
                {queryParams.patientid && <VitalSignCustomerListInformation searchParams={queryParams} />}
            </div>
        </FrontDeskLayout>)
}

