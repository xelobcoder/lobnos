import ReceivingStocksDepartmentClient from "../../../../../../components/inventory/departments/ReceivingStocksDepartmentClient";
import { customFetch } from "../../../../../../Lib/fetcher";

export default async function ReceiveStocksDepartmentLevel({ params }: { params: Promise<{ departmentid: number }> }) {
    const { departmentid } = await params;
    let resultItems: any = [];
    const response = await customFetch(`store/departments/requisitions?id=${departmentid}&&type=receiving`);
    const { result } = response;
    if (result && Array.isArray(result)) {
        resultItems = result;
    }
    return (
        <div>
            <h4 className="text-capitalize">Stocks to be received</h4>
            <ReceivingStocksDepartmentClient stocks={resultItems} departmentId={departmentid} />
        </div>
    );
}
