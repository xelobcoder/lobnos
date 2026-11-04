"use client"
import PrimeTable from '../../components/accessories/Datatables/PrimeTable';
import TableDisplay from '../../components/accessories/TableDisplay'

interface TestResult {
    id: number;
    field: string;
    ascensionid: number;
    billingid: number;
    patientid: number;
    testid: number;
    value: string;
    originalvalue: string;
    created_on: string;
    updated_on: string;
    employeeid: number;
    entrymode: string | null;
    fieldid: number;
    resultby?: string;
}

interface Column {
    Header: string;
    accessor: keyof TestResult;
    Cell?: ({ value, row }: { value: any; row: {original: TestResult} }) => React.ReactNode;
    isMenu?: boolean;
}

interface MonthResultValuesComponentProps {
    data: TestResult[];
    onFieldClick: (result: TestResult) => void;
}

const MonthResultValuesComponent: React.FC<MonthResultValuesComponentProps> = ({ data, onFieldClick }) => {
    const columns: Column[] = [
        {
            Header: 'date',
            accessor: 'created_on',
            Cell: ({ value }) => new Date(value).toLocaleDateString()
        },
        {
            Header: 'field',
            accessor: 'field',
            isMenu: true,
            Cell: ({ value, row }: { value: any; row: { original: TestResult } }) => (
                <button
                    className="btn btn-link p-0"
                    onClick={() => onFieldClick(row.original)}
                >
                    {value}
                </button>
            )
        },
        {
            Header: 'value',
            accessor: 'value'
        },
        {
            Header: 'resultby',
            accessor: 'resultby'
        },
    ];

    return (
        <div>
            <PrimeTable
                column={columns}
                data={data}
                filtering={true}
                serverSideFiltering={false}
                handleSeverSideProcessing={null}
            />
        </div>
    );
}

export default MonthResultValuesComponent;