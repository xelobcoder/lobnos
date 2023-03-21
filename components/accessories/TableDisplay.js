/* eslint-disable react/jsx-key */
import React, { useMemo } from 'react'
import { useTable } from 'react-table'
export default function TableDisplay({ column, data }) {
  const tableInstance = useTable({
    columns: useMemo(() => column, [column]),
    data: useMemo(() => data, [data])
  })

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = tableInstance

  return (
    <div>
      {
        data.length == 0 ? null :
          <table {...getTableProps()} id='custom-table'>
            <thead>
              {
                headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {
                      headerGroup.headers.map((column,index) => (
                        <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                      ))
                    }
                  </tr>
                ))
              }
            </thead>
            <tbody {...getTableBodyProps()}>
              {
                rows.map((row,index) => {
                  prepareRow(row)
                  return (
                    <tr {...row.getRowProps()}>
                      {
                        row.cells.map((cell) => {
                          return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                        })
                      }
                    </tr>
                  )
                }
                )
              }
            </tbody>
          </table>
      }
    </div>
  )
}
