import { useMemo, useState } from 'react';
import { useTable, useGlobalFilter, useFilters, useSortBy, usePagination } from 'react-table';
import GlobalFilter from './GlobalFilter';
import SECOND_NO_DATA from './secondNodata';
import dynamic from 'next/dynamic';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ExportTable = dynamic(() => import("./ExportData"));

function CustomDropdown({ columns, visibleColumns, toggleColumnVisibility }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(prev => !prev);

  const dropdownMenuStyles = {
    display: isOpen ? 'block' : 'none',
    position: 'absolute',
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #ddd',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
    zIndex: 1,
    width: '200px', 
    maxHeight: '20vh', 
    overflowY: 'auto', 
    padding: '5px 0'
  };

  const dropdownItemStyles = {
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  };

  const dropdownItemHoverStyles = {
    backgroundColor: '#f1f1f1'
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleToggle}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <MoreVertIcon />
      </button>
      <div style={dropdownMenuStyles}>
        {columns.map((item, index) => (
          <div
            key={index}
            style={dropdownItemStyles}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = dropdownItemHoverStyles.backgroundColor}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <input
              type="checkbox"
              checked={visibleColumns.find(col => col.id === item.accessor)?.isVisible || false}
              onChange={() => toggleColumnVisibility(item.accessor)}
              style={{ marginRight: '8px' }}
            />
            <span>{item.Header}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TableDisplay({
  exporters = true,
  showpage = true,
  column,
  data,
  styling,
  filtering,
  getRows,
  initpageSize = 10,
  ...props
}) {
  const [visibleColumns, setVisibleColumns] = useState(column.map(col => ({
    id: col.accessor,
    isVisible: true,
  })));

  const toggleColumnVisibility = (columnId) => {
    setVisibleColumns(prevState =>
      prevState.map(col =>
        col.id === columnId ? { ...col, isVisible: !col.isVisible } : col
      )
    );
  };

  const filteredColumns = useMemo(
    () => column.filter(col => visibleColumns.find(vCol => vCol.id === col.accessor && vCol.isVisible)),
    [column, visibleColumns]
  );

  const tableInstance = useTable(
    {
      columns: filteredColumns,
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
                {exporters && <ExportTable data={data} column={filteredColumns} />}
                {filtering && <div className="col-6">
                  <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                </div>}
              </div>
              <div className="table-responsive table">
                <div className="d-flex justify-content-end">
                  <CustomDropdown
                    columns={column}
                    visibleColumns={visibleColumns}
                    toggleColumnVisibility={toggleColumnVisibility}
                  />
                </div>
                <table style={{minHeight:'20vh'}} {...props} className={styling ? styling : "billing-cart-table table-striped table-hover"} {...getTableProps()}>
                  <thead>{customHeaderGroup()}</thead>
                  <tbody {...getTableBodyProps()}>
                    {page.map((row, index) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()} key={index}>
                          {row.cells.map((cell) => (
                            <td className="text-sm" {...cell.getCellProps()} key={cell.column.id}>
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
