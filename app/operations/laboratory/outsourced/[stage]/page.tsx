import { customFetch } from "../../../../../components/Auth/customFetch";
import StageOutsourcedTable from "../../../../../components/outsource/StageOutsourcedTable";

export interface Test {
    testid: number;
    serviceid: number;
    billingid: number;
    name: string;
    testprice: number;
    organizationType: string;
    outsourcingorganizationName: string;
    requestedby: string | null;
}

export default async function UnresolvedTests({ params }: {
    params: { stage: "resolved" | "unresolved" }
}) {
    const { stage } = await params;
    const response: Test[] = await customFetch(`outsourced/testpanel/${stage}?count=10&page=1`);
    if (!response || response.length === 0) {
        return <div>No data found.</div>;
    }


    return (
        <div>
            <h5 className="text-lead text-capitalize bg-secondary-subtle py-2 br-5 px-3 col-5 border-dashed ">{stage} outsourced Test</h5>
            <StageOutsourcedTable data={response} stage={stage} />
        </div>
    );
}