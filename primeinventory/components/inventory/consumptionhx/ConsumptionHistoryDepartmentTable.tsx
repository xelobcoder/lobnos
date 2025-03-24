'use client'
import TableDisplay from '../../accessories/TableDisplay';
import { handleConsumptionhxSeverSideProcessing } from '../UtilLib/serverActions/handleserverprocessingTable';


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

export default function DepartmentInventoryConsumptionHistory({ data }: {
    data: ConsumptionData[] | []
}) {

    const columns = [
        {
            Header: 'Consume ID',
            accessor: 'comsumeid',
        },
        {
            Header: 'stock',
            accessor: "stockname"
        },
        {
            Header: 'Brand',
            accessor: 'brand',
        },
        {
            Header: 'Batch Number',
            accessor: 'batchnumber',
        },

        {
            Header: 'Quantity',
            accessor: 'debit',
        },
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ value }: any) => new Date(value).toLocaleDateString(),
        },
        {
            Header: 'Time',
            accessor: 'time',
        },
        {
            Header: 'Consumed By',
            accessor: 'consumptionby',
        },
    ]


    return (
        <div>
            <div className='bt-wrapper'>
                <TableDisplay
                    serverSideFiltering={true}
                    filtering={true}
                    handleSeverSideProcessing={handleConsumptionhxSeverSideProcessing}
                    column={columns} data={data} />
            </div>
        </div>
    );
}
