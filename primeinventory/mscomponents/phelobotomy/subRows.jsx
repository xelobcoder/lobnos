
import React from 'react';
import { useTable, useResizeColumns, useFlexLayout, useExpanded } from 'react-table';


const ListTable = ({ data }) => {
    const columns = React.useMemo(() => [
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
    ], []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable(
        {
            columns,
            data,
            defaultColumn: { minWidth: 10, maxWidth: 300 },
            getSubRows: (row) => row.subRows || [],

        },
        useFlexLayout,
        useResizeColumns,
        useExpanded
    );

    return (
        <div className='table-responsive'>
            <table {...getTableProps()} className="table" style={{ fontSize: '14px' }}>
                <thead>
                    {headerGroups.map((headerGroup,v) => (
                        <tr key={v} {...headerGroup.getHeaderGroupProps()} >
                            {headerGroup.headers.map((column,index )=> (
                                <th key={index} {...column.getHeaderProps()}>
                                    {column.render('Header')}
                                    {/* Resizer for columns */}
                                    {column.canResize && (
                                        <div
                                            {...column.getResizerProps()}
                                            className="resizer"
                                        />
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row);
                        const rowClass = row.original.clientstatus === 'urgent' ? 'table-danger' : '';
                        return (
                            <React.Fragment key={row.id}>
                                <tr {...row.getRowProps({ className: `${rowClass}` })}>
                                    {row.cells.map(cell,index => (
                                        <td key={index} {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                    ))}
                                </tr>
                                {row.isExpanded && row.subRows && (
                                    row.subRows.map((subRow,ind) => {
                                        prepareRow(subRow);
                                        return (
                                            <tr key={ind} {...subRow.getRowProps({ className: 'column-bordered p-3' })}>
                                                {subRow.cells.map((cell,index )=> (
                                                    <td key={index} {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                                ))}
                                            </tr>
                                        );
                                    })
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ListTable;
