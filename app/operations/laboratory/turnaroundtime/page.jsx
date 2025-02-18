import { Alert } from "react-bootstrap";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";
import { customFetch } from "../../../../components/Auth/customFetch";
import { handleServerTurnAroundTime } from "../../../../components/serverActions/ActionFiltering";
import moment from "moment";
import TurnAroundDataTable from "../../../../components/operations/Laboratory/TurnAroundDataTable";

export default async function TurnAroundTime() {
    let data = [];

    try {
        const response = await customFetch(`testascension/tat-data?page=1&&count=10`);
        if (response?.data && Array.isArray(response?.data)) {
            data = response.data;
        }
    } catch (err) {
        console.error("Error loading data:", err);
        return (
            <Alert dismissible variant="danger" className="pls-color p-3 br-5">
                Error Loading data
            </Alert>
        );
    }

   return <TurnAroundDataTable data={data}/> 
}