// /* eslint-disable react/jsx-key */
// import { Table, TableCell, TableRow, TableBody, TableHead } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';
// import { useTable } from 'react-table';
// import { useMemo } from 'react';


// export default function SampleTable({ data }) {
//     console.log(data)
//     const Columns = [
//         {
//             header: 'ID',
//             accessor: "id",
//         },
//         {
//             header: 'Name',
//             accessor: "name",
//         },
//         {
//             header: 'Email',
//             accessor: "email",
//         },
//         {
//             header: 'Phone',
//             accessor: "phone",
//         },
//         {
//             header: 'Address',
//             accessor: "address",
//         },
//         {
//             header: 'Location',
//             accessor: "location",
//         },
//         {
//             header: 'Contact Person',
//             accessor: "contact person",
//         },
//         {
//             header: 'Contact Person Contact',
//             accessor: "contact person contact",
//         }
//     ]

//     const row = useMemo(() => data, []);

//     const columns = useMemo(() => Columns, []);

//     const tableCreation = useTable(
//         {
//             columns,
//             row
//         }
//     );

//     const {
//         getTableProps,
//         getTableBodyProps,
//         headerGroups,
//         rows,
//         prepareRow,
//     } = tableCreation;

//     return (
//         <>
//             <Table {...getTableProps}>
//                 <TableHead>
//                     {
//                         headerGroups.map(headerGroup => {
//                             <TableRow {...headerGroup.getHeaderGroupProps()}>
//                                 {
//                                     headerGroup.map(column => {
//                                         <TableCell {...column.getHeaderProps()}>
//                                             {column.render('Header')}
//                                         </TableCell>
//                                     })
//                                 }
//                             </TableRow>
//                         })
//                     }
//                 </TableHead>
//                 <TableBody {...getTableBodyProps()}>
//                     {// Loop over the table rows
//                         rows.map(row => {
//                             // Prepare the row for display
//                             prepareRow(row)
//                             return (
//                                 // Apply the row props
//                                 <TableRow {...row.getRowProps()}>
//                                     {// Loop over the rows cells
//                                         row.cells.map(cell => {
//                                             // Apply the cell props
//                                             return (
//                                                 // eslint-disable-next-line react/jsx-key
//                                                 <TableCell {...cell.getCellProps()}>
//                                                     {// Render the cell contents
//                                                         cell.render('Cell')}
//                                                 </TableCell>
//                                             )
//                                         })}
//                                 </TableRow>
//                             )
//                         })}
//                 </TableBody>
//             </Table>
//         </>
//     )
// }


