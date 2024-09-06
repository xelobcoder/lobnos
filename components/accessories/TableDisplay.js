import { useMemo } from 'react';
import { useTable, useGlobalFilter, useFilters, useSortBy, usePagination } from 'react-table';
import GlobalFilter from './GlobalFilter';
import SECOND_NO_DATA from './secondNodata';


export default function TableDisplay({
  exporters = true,
  showpage = true,
  column,
  data,
  styling,
  filtering,
  getRows,
  initpageSize = 10,
  minHeight,
  ...props
}) {


  
 

  const tableInstance = useTable(
    {
      columns:column,
      data: useMemo(() => data, [data]),
      initialState: { pageSize: initpageSize },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

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
  } = tableInstance;

  const toogleDownUp = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
      <path d="M12 8H8.001L8 20H6V8H2L7 3L12 8ZM22 16L17 21L12 16H16V4H18V16H22Z"></path>
    </svg>
  );

  const customHeaderGroup = () => headerGroups.map((headerGroup, v) => (
    <tr {...headerGroup.getHeaderGroupProps()} key={v}>
      {headerGroup.headers.map((column, index) => (
        <th {...column.getHeaderProps(column.getSortByToggleProps())} key={index}>
          <div>
            <span className="text-sm fw-bold text-capitalize"> {column.render("Header")}</span>
            <span className="mx-2 text-success">{column.isSorted ? toogleDownUp() : toogleDownUp()}</span>
          </div>
        </th>
      ))}
    </tr>
  ));

  const rendering = () => {
    if (data.length === 0) return <SECOND_NO_DATA />;
    return (
      <>
        <div className="my-2">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between col-12">
                {filtering && <div className="col-6">
                  <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                </div>}
              </div>
              <div style={{ minHeight: minHeight || '30vh' }} className="table-responsive table my-2">
                <table {...props} className={styling ? styling : "table table-responsive billing-cart-table table-striped table-hover"} {...getTableProps()}>
                  <thead>{customHeaderGroup()}</thead>
                  <tbody {...getTableBodyProps()}>
                    {page.map((row, index) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()} key={index}>
                          {row.cells.map((cell) => (
                            <td style={{fontSize:'13px'}} {...cell.getCellProps()} key={cell.column.id}>
                              {cell.render("Cell")}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {showpage && (
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span className="mx-2 mt-1">
                    Page{" "}
                    <strong>
                      {pageIndex + 1} of {pageOptions.length}
                    </strong>{" "}
                  </span>
                  <div>
                    <select className="custom-select" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                      {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((size, index) => (
                        <option key={index} value={size}>
                          Show {size}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button className="btn btn-primary btn-sm mx-2 py-1" onClick={() => previousPage()} disabled={!canPreviousPage}>
                      Previous
                    </button>
                    <button className="btn btn-primary btn-sm py-1" onClick={() => nextPage()} disabled={!canNextPage}>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  return <>{rendering()}</>;
}
