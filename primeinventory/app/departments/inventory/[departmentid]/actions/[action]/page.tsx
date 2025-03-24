import ReceivedPending from "../../../../../../components/inventory/ReceivedPending";
import { customFetch } from "../../../../../../Lib/fetcher";

type DepartmentAcceptedPageProps = {
    params: Promise<{
        departmentid: number;
        action: string;
    }>;
};

const DepartmentAcceptedPage = async ({ params }: DepartmentAcceptedPageProps) => {
    const { departmentid, action } = await params;
    let stocks: any[] = [];
    let loading: boolean = true;

    try {
        const response = await customFetch(`store/departments/requisitions?id=${departmentid}&&type=${action}`);
        if (response.result && Array.isArray(response.result)) {
            stocks = response.result;
        }
        loading = false;
    } catch (err) {
        stocks = [];
        loading = false;
    }

    return (
        <ReceivedPending
            caption={action}
            loading={loading}
            stocks={stocks}
        />
    );
};

export default DepartmentAcceptedPage;
