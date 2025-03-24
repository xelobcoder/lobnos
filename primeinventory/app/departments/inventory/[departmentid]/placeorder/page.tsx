import { DepartmentPlaceOrderStockType } from '../../../../../components/interfaces/departmentInterface';
import DepartmentRequestPlaceOrderTable from '../../../../../components/inventoryTables/DepartmentRequestPlaceOrderTable';
import { customFetch } from '../../../../../Lib/fetcher';




export default async function DepartmentRequestCustom({ params }: { params: Promise<{ departmentid: number }> }) {
    const { departmentid } = await params;
    let TemporayDataStore = []
    try {
        const data = await customFetch('stock?warehouseid=all&&page=1&&count=50');
        const { status, result } = data;

        if (status === 'success' && result.length > 0) {
            const transformed = result.map((item: DepartmentPlaceOrderStockType) => ({
                ...item,
                quantityrequired: 0,
            }));
            TemporayDataStore = transformed;
        } else {
            TemporayDataStore = []
        }
    } catch (err) {
        TemporayDataStore = []
    }




    return (
        <div>
            <div>
                <h4 className="text-primary">Department Requisition</h4>
            </div>
            <div >
                <DepartmentRequestPlaceOrderTable temp={TemporayDataStore} departmentId={departmentid} />
            </div>
        </div>
    );
}
