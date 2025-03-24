"use server"
import { customFetch } from "../../../../Lib/fetcher";

export const handleConsumptionhxSeverSideProcessing = async (records) => {
    const { page, count} = records;
    try {
        const response = await customFetch(`department/consumptionhx?departmentid=16&&page=${page}&&count=${count}`);
        return { result: response.result, error: null }
    } catch (err) {
        return { result: null, error: 'something wrong occured' }
    }
}



export const handlePurchaseFlowSeverSideProcessing = async (records) => {
    try {
        const { page, count, stockid } = records;
        const response = await customFetch(`inventory/analytics/purchase-flow-analytics?page=${page}&&count=${count}&&stockid=${stockid}`);
        let result = response?.result;

        if (Array.isArray(result) && result.length > 0) {
            result = result.map(record => ({
                ...record,
                productordersid: `ORD-${record.productordersid}`,
                receiveddate: new Date(record.receiveddate).toLocaleDateString(),
                lastdebitdate: new Date(record.lastdebitdate).toLocaleDateString()
            }));
        }
        return { result, error: null }
    } catch (err) {
        return { result: null, error: 'something wrong occured' }
    }
}


export async function handleServerSideTableLoading(
    handler: Function,
    currentPage: number,
    curentCount: number
) {
    try {
        return await handler(currentPage, curentCount);
    } catch (err) {
        console.error(err);
        return { result: null, error: 'Something went wrong' };
    }
}
