import { Alert } from "react-bootstrap";
import { customFetch } from "../../../../components/Auth/customFetch";
import TurnAroundDataTable from "../../../../components/operations/Laboratory/TurnAroundDataTable";

export default async function TurnAroundTime() {
    let data = [];

    try {
        const response = await customFetch(`testascension/tat-data?page=1&count=10&sortby=ASC`);
        if (response?.data && Array.isArray(response?.data)) {
            data = response.data;
        }
    } catch (err) {
        return (
            <Alert dismissible variant="danger" className="pls-color p-3 br-5">
                Error Loading data
            </Alert>
        );
    }

    return <TurnAroundDataTable data={data} />
}