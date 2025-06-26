import React from 'react'
import StockManagementCompo from '../../../../components/inventory/limsConnection/StockManagementCompo'
import { customFetch } from '../../../../components/Auth/customFetch';

export default async function StockManagementPage() {
    let data: any[] = []

    try {
        const result = await customFetch(
            `operations/ascension/staging?operationsStaging=COMPLETED` +
            `&&dateFrom=null` +
            `&&dateEnd=null` +
            `&&searchString=` +
            `&&page=1` +
            `&&count=10` +
            `&&isUltrasound=false` +
            `&&employeeid=3`
        );
        if (Array.isArray(result)) {
            data = result;
        }
    } catch (err) {
        data = []
    }

    return (
        <div>
            <StockManagementCompo ascensionList={data} />
        </div>
    )
}
