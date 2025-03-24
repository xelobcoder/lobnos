"use client"
import SelectionComponentFlow from './SelectionComponentFlow';
import '../../../styles/prime-table.css';
import TableDisplay from '../../accessories/TableDisplay';
import { handlePurchaseFlowSeverSideProcessing } from '../UtilLib/serverActions/handleserverprocessingTable';
import { PurchaseRecord } from '../../../app/inventory/analytics/purchasesflow/page';

type PurchasesFlowCCRWrapperProps = {
    result: PurchaseRecord[];
    stockid: number
};



export default function PurchasesFlowCCRWrapper({ result, stockid }: PurchasesFlowCCRWrapperProps) {
    
    const columns = [
        { Header: 'Order ID', accessor: 'productordersid' },
        { Header: 'Received', accessor: 'receiveddate' },
        { Header: 'Dept. Qty', accessor: 'departments_qty' },
        { Header: 'Main Qty', accessor: 'main_store_qty' },
        { Header: 'Last Debit', accessor: 'lastdebitdate' },
        {
            Header: 'PO (Days)',
            accessor: 'PO Duration (in days)'
        },
        {
            Header: 'Main Store (Days)',
            accessor: 'Main Store Duration(in days)',
        },
        {
            Header: 'Dept. (Days)',
            accessor: 'Department Duration(in days)',
        },
        { Header: 'Main Status', accessor: 'main_store_status' },
        { Header: 'Dept. Status', accessor: 'department_store_status' },
    ];


    return (
        <div className='po'>
            <SelectionComponentFlow />
            <div className="table-label">
                <h3>Purchase Order Flow</h3>
                <TableDisplay
                    column={columns}
                    data={result}
                    filtering={false}
                    serverSideFiltering={true}
                    urlparams={{ stockid }}
                    handleSeverSideProcessing={handlePurchaseFlowSeverSideProcessing}
                />
                </div>
        </div>
    );
}
