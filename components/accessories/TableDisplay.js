/* eslint-disable react/jsx-key */
import React, { useMemo } from 'react'
import { useTable, useGlobalFilter, useFilters, useSortBy, usePagination } from 'react-table'
import GlobalFilter from './GlobalFilter'
import SECOND_NO_DATA from './secondNodata'
export default function TableDisplay({ column, data }) {
  const tableInstance = useTable({
    columns: useMemo(() => column, [column]),
    data: useMemo(() => data, [data])
  }, useFilters, useGlobalFilter, useSortBy, usePagination)

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    pageCount,
    setPageSize,
    prepareRow,
    state,
    setGlobalFilter,
  } = tableInstance


  const { globalFilter } = state;

  const { pageIndex, pageSize } = state;

  return (
    <>
      {
        data.length === 0 ?
          <SECOND_NO_DATA /> :
          <div className='p-2'>
            {
              data.length == 0 ? null :
                <>
                  <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                  <div className='custom-table-wrapper'>
                    <table {...getTableProps()} id='custom-table'>
                      <thead>
                        {headerGroups.map((headerGroup) => (
                          <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column, index) => (
                              <th {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render('Header')}
                                <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
                              </th>
                            ))}

                          </tr>
                        ))}
                      </thead>
                      <tbody {...getTableBodyProps()}>
                        {page.map((row, index) => {
                          prepareRow(row)
                          return (
                            <tr {...row.getRowProps()}>
                              {row.cells.map((cell) => {
                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                              })}
                            </tr>
                          )
                        }
                        )}
                      </tbody>
                    </table>
                    <div className='d-flex justify-content-center'>
                      <span className='p-2'>
                        Page{' '}
                        <strong>
                          {state.pageIndex + 1} of {pageOptions.length}
                        </strong>{' '}
                      </span>
                      <span style={{ marginRight: '20px' }}>
                        <select className='custom-input' value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                          {[10, 15, 20, 25, 30, 35, 40, 45, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                              Show {pageSize}
                            </option>
                          ))}
                        </select>
                      </span>
                      <button className='btn btn-primary btn-sm' onClick={() => previousPage()} disabled={!canPreviousPage} style={{ marginRight: '10px' }}>Previous</button>
                      <button className='btn btn-primary btn-sm' onClick={() => nextPage()} disabled={!canNextPage}>Next</button>
                    </div>
                  </div>
                </>
            }
          </div>
      }
    </>
  )
}
