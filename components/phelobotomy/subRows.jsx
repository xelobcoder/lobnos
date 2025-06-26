
import React from 'react';
import PrimeTable from '../accessories/Datatables/PrimeTable'
const ListTable = ({ data }) => {
    const columns = [
        {
            Header: '',
            accessor: 'billingid',
            width: '10',
            Cell: ({ value }) => <input type='checkbox' />
        }
        ,
        {
            Header: () => null, // Empty header for the expander column
            id: 'expander', // Unique ID for the expander column
            Cell: ({ row }) => (
                <span {...row.getToggleRowExpandedProps()} className="expander">
                    {row.isExpanded ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 8L18 14H6L12 8Z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19.1642 12L12.9571 5.79291L11.5429 7.20712L16.3358 12L11.5429 16.7929L12.9571 18.2071L19.1642 12ZM13.5143 12L7.30722 5.79291L5.89301 7.20712L10.6859 12L5.89301 16.7929L7.30722 18.2071L13.5143 12Z"></path></svg>}
                </span>
            ),
            width: 30,
            canResize: false // Disable resizing for this column
        },
        {
            Header: 'Full Name',
            accessor: 'fullname',
            canResize: true,
            width: 200,
        },
        {
            Header: 'Patient ID',
            accessor: 'patientid',
            canResize: true,
            width: 150,
        },
        {
            Header: 'Age',
            accessor: 'age',
            canResize: true,
            width: 100,
        },
        {
            Header: 'Gender',
            accessor: 'gender',
            canResize: true,
            width: 100,
        },
        {
            Header: 'Status',
            accessor: 'clientstatus',
            canResize: true,
            width: 200,
            Cell: ({ row }) => (
                <span className={row.original.clientstatus === 'urgent' ? 'status-urgent' : ''}>
                    {row.original.clientstatus}
                </span>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            canResize: false, // Disable resizing for actions column
            width: 150,
            Cell: ({ row }) => (
                <button className="balham-btn" onClick={() => handleCollectSample(row.original.billingid, row.original.patientid, row.original.fullname)}>
                    Draw Sample
                </button>
            ),
        }
    ]


    return (
        <div className='table-responsive'>
            <PrimeTable
                columns={columns}
                data={data}
                filtering={false}
                handleServerSideRendering={null}
            />
        </div>
    );
};

export default ListTable;
