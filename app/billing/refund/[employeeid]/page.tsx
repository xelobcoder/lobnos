import { RiErrorWarningFill } from "@remixicon/react";
import { customFetch } from "../../../../components/Auth/customFetch";
import RefundPageAllView from "../../../../components/Billing/Refund/RefundPageAllView";


export default async function RefundAdminPage({ params }: {
    params: { employeeid: number }
}) {
    let result: any = []
    const { employeeid } = await params

    try {
        const response = await customFetch(
            `billing/refund/details/status?status=pending&&employeeid=${employeeid}&&page=1&&count=10`
        );
        if (response && Array.isArray(response?.result)) {
            result = response?.result || [];
        }
    } catch (err) {
        return <div className='alert alert-danger pls-color col-3'>
            <RiErrorWarningFill color='error'  />
            Error Loading Refund Data</div>
    }


    return (
        <div>
            <RefundPageAllView initData={result} employeeid={employeeid} />
        </div>
    )
}
