import { customFetch } from '../../../../../Lib/fetcher';
import '../../../../../styles/prime-table.css';
import DepartmentInventoryConsumptionHistory from '../../../../../components/inventory/consumptionhx/ConsumptionHistoryDepartmentTable';

interface ConsumptionData {
    comsumeid: number;
    department: number;
    stockid: number;
    batchnumber: string;
    brand: string;
    debit: number;
    date: string;
    time: string;
    employeeid: number;
    wastage: number;
    productordersid: number;
    consumptionby: string;
}

export default async function DepartmentInventoryConsumptionPage() {
    let data: ConsumptionData[] | [] = [];
    let error = false;
    try {
        const response = await customFetch(`department/consumptionhx?departmentid=16&&page=1&&count=20`);
        const { result } = response;
        data = result;
    } catch (err) {
        error = true;
    }

    if (error) {
        return <div>{error}</div>;
    }




    return (
        <div>
            <h4 className="p-3 bg-body-secondary rounded col-4">Department Stocks Consumption History</h4>
            <DepartmentInventoryConsumptionHistory data={data} />
        </div>
    );
}
