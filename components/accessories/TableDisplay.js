import React, { useMemo } from 'react'
import { useTable, useGlobalFilter, useFilters, useSortBy, usePagination } from 'react-table'
import GlobalFilter from './GlobalFilter'
import SECOND_NO_DATA from './secondNodata'

export default function TableDisplay({ column, data, styling, filtering }) {

  const tableInstance = useTable({
    columns: useMemo(() => column, [column]),
    data: useMemo(() => data, [data]),
    initialState: {pageSize: 10},
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
    state: { globalFilter, pageIndex, pageSize },
    setGlobalFilter,
  } = tableInstance

  return (
    <>
      {
        data.length === 0 ?
          <SECOND_NO_DATA /> :
          <div className='p-2'>
            {
              data.length == 0 ? null :
                <>
                  {filtering == true && (<GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />)}
                  <div className='custom-table-wrapper'>
                    <table style={{marginTop:'10px'}} {...getTableProps()} id={styling || 'custom-table'}>
                      <thead>
                        {headerGroups.map((headerGroup) => (
                          <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                            {headerGroup.headers.map((column) => (
                              <th {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id}>
                                {column.render('Header')}
                                <span>{column.isSorted ? (column.isSortedDesc ? '🔽' : '🔼') : ''}</span>
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody {...getTableBodyProps()}>
                        {page.map((row) => {
                          prepareRow(row)
                          return (
                            <tr {...row.getRowProps()} key={row.id}>
                              {row.cells.map((cell) => {
                                return <td {...cell.getCellProps()} key={cell.column.id}>{cell.render('Cell')}</td>
                              })}
                            </tr>
                          )
                        }
                        )}
                      </tbody>
                    </table>
                    <div className='d-flex justify-content-center '>
                      <span className='p-2 mt-2'>
                        Page{' '}
                        <strong>
                          {pageIndex + 1} of {pageOptions.length}
                        </strong>{' '}
                      </span>
                      <span style={{ marginRight: '20px' }}>
                        <select className='form-control mt-2' value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                          {[10,20,25,50,75,100, 150,200].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                              Show {pageSize}
                            </option>
                          ))}
                        </select>
                      </span>
                      <button className='btn btn-primary btn-sm mt-2' onClick={() => previousPage()} disabled={!canPreviousPage} style={{ marginRight: '10px' }}>Previous</button>
                      <button className='btn btn-primary btn-sm mt-2' onClick={() => nextPage()} disabled={!canNextPage}>Next</button>
                    </div>
                  </div>
                </>
            }
          </div>
      }
    </>
  )
}

// The changes made include:

// Removing the eslint-disable comment for the warning.
// Adding a key prop to the <tr> and <th> elements to fix the warning.
// Destructuring the required properties directly from the tableInstance state object