import  { useMemo } from 'react'
import { useTable, useGlobalFilter, useFilters, useSortBy, usePagination} from 'react-table'
import GlobalFilter from './GlobalFilter'
import SECOND_NO_DATA from './secondNodata';

export default function TableDisplay({ showpage = true, column, data, styling, filtering, getRows, initpageSize = 10, ...props }) {
  const tableInstance = useTable({
    columns: useMemo(() => column, [column]),
    data: useMemo(() => data, [data]),
    initialState: { pageSize: initpageSize },
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

  const customHeaderGroup = () => {
    return headerGroups.map((headerGroup, v) => {
      return <tr {...headerGroup.getHeaderGroupProps()} key={v}>
        {headerGroup.headers.map((column, index) => (
          // eslint-disable-next-line react/jsx-key
          <th  {...column.getHeaderProps(column.getSortByToggleProps())} >
            {column.render('Header')}
            <span>{column.isSorted ? (column.isSortedDesc ? '🔽' : '🔼') : ''}</span>
          </th>
        ))}
      </tr>
    })
  }


  const rendering = () => {
    if (data.length == 0) return <SECOND_NO_DATA />
    else {
      return (
        <>
          {filtering == true && (<GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />)}
          <div className='table-wrapper' >
            <table {...props} className={styling ? styling : 'table'} {...getTableProps()} >
                      <thead>
                        {customHeaderGroup()}
                      </thead>
                      <tbody {...getTableBodyProps()}>
                        {page.map((row, index) => {
                          prepareRow(row);
                          return (
                            <tr  {...row.getRowProps()}  key={index} className='t' >
                              {row.cells.map((cell) => {
                                return <td {...cell.getCellProps()} key={cell.column.id}>{cell.render('Cell')}</td>
                              })}
                            </tr>
                          )
                        }
                        )}
                      </tbody>
                    </table>
                    {showpage && (
                      <div className='d-flex justify-content-center '>
                        <span className='mx-2 mt-1'>
                          Page{' '}
                          <strong>
                            {pageIndex + 1} of {pageOptions.length}
                          </strong>{' '}
                        </span>
                        <span>
                          <select className='custom-input' value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                            {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((pageSize, index) => (
                              <option key={index} value={pageSize}>
                                Show {pageSize}
                              </option>
                            ))}
                          </select>
                        </span>
                        <button className='btn btn-primary btn-sm mx-2 py-1 pointer' onClick={() => previousPage()} disabled={!canPreviousPage} >
                          Previous
                        </button>
                        <button className='btn btn-primary btn-sm py-1 pointer' onClick={() => nextPage()} disabled={!canNextPage}>
                          Next
                        </button>
                      </div>
                    )}
                  </div>
        </>
      )
    }
  }

  return (
    <>{rendering()}</>
  )
}
