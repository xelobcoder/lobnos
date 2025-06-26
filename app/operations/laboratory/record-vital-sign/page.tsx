'use client'
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import RecordVitalSignsChartForm from "../../../../components/customer/vitalSignChartForms";
import VitalSignCustomerListInformation from "../../../../components/customer/vitalSignCustomerList";




type QueryParams = {
    [key: string]: string | undefined;
    patientid?: string;
};

export default function RecordVitalSigns() {
    const [queryParams, setQueryParams] = useState<QueryParams>({})
    const urlParams = useSearchParams();

    useEffect(() => {
        let paramObject = {};
        if (urlParams?.entries()) {
            Array.from(urlParams.entries()).forEach(([item, value]) => {
                paramObject[item] = value;
            });
            setQueryParams(paramObject)
        }
    }, [urlParams]);

    return (
        <div className="p-3">
            <RecordVitalSignsChartForm searchParams={queryParams} />
            {queryParams.patientid && <VitalSignCustomerListInformation searchParams={queryParams} />}
        </div>
    )
}

