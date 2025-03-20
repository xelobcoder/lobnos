import { useMemo } from "react"
import { useTable, useGlobalFilter, useFilters, useSortBy, usePagination, useFlexLayout } from "react-table"
import GlobalFilter from "./GlobalFilter"
import SECOND_NO_DATA from "./secondNodata"

export default function FlexTableDisplay({ column, data, styling, filtering }) {
  const tableInstance = useTable(
    {
      columns: useMemo(() => column, [column]),
      data: useMemo(() => data, [data]),
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useFlexLayout
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { globalFilter },
    setGlobalFilter,
  } = tableInstance

  const customHeaderGroup = () => {
    return headerGroups.map((headerGroup, v) => {
      return (
        <tr {...headerGroup.getHeaderGroupProps()} key={v}>
          {headerGroup.headers.map((column, index) => (
            // eslint-disable-next-line react/jsx-key
            <th {...column.getHeaderProps(column.getSortByToggleProps())}>
              {column.render("Header")}
              <span>{column.isSorted ? (column.isSortedDesc ? "🔽" : "🔼") : ""}</span>
            </th>
          ))}
        </tr>
      )
    })
  }

  const customBodyRow = (row, index) => {
    const { clientstatus } = row.original
    return (
      <tr
        {...row.getRowProps()}
        key={index}
        className={clientstatus == "urgent" ? "border-bottom-0 border-top-0 border-end-0 border-start border-3 border-danger":''}>
        {row.cells.map((cell) => {
          return (
            <td {...cell.getCellProps()} key={cell.column.id} className="border-0 border-bottom">
              {cell.render("Cell")}
            </td>
          )
        })}
      </tr>
    )
  }

  const rendering = () => {
    if (data.length == 0) return <SECOND_NO_DATA />
    else {
      return (
        <>
          {filtering == true && <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />}
          <div className="table-wrapper">
            <table className={styling ? styling : "table my-2"} {...getTableProps()}>
              <thead>{customHeaderGroup()}</thead>
              <tbody {...getTableBodyProps()}>
                {page.map((row, index) => {
                  prepareRow(row)
                  return customBodyRow(row, index)
                })}
              </tbody>
            </table>
          </div>
        </>
      )
    }
  }

  return <>{rendering()}</>
}
