import { useMemo, useState, useRef, useEffect } from 'react';
import { useTable, useGlobalFilter, useFilters, useSortBy, usePagination } from 'react-table';
import GlobalFilter from './GlobalFilter';
import Pagination from './pagination';
import { ViewColumn } from '@mui/icons-material';

export default function TableDisplay({
     exporters = true,
     showpage = false,
     column,
     data,
     styling,
     filtering,
     paginationMode = "client",
     serverSideFiltering = false,
     endpoint = '',
     getRows,
     initpageSize = 10,
     minHeight,
     ...props
}) {
     const [filteredData, setFilteredData] = useState(data);
     const [openFilter, setOpenFilter] = useState(false); // Track if filter is open
     const [selectedFilters, setSelectedFilters] = useState({}); // Track selected filter values
     const filterRef = useRef(null); // Reference to close filter when clicking outside

     let debounceTimeout;
     const debounce = (func, delay) => {
          return (...args) => {
               clearTimeout(debounceTimeout);
               debounceTimeout = setTimeout(() => func(...args), delay);
          };
     };

     const tableInstance = useTable(
          {
               columns: useMemo(() => column, [column]),
               data: useMemo(() => filteredData, [filteredData]),
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
          prepareRow,
          state: { globalFilter },
          setGlobalFilter,
     } = tableInstance;

     const toggleDownUp = () => (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(86,37,217,1)">
               <path fill="none" d="M0 0h24v24H0z"></path>
               <path d="M19 3L23 8H20V20H18V8H15L19 3ZM14 18V20H3V18H14ZM14 11V13H3V11H14ZM12 4V6H3V4H12Z"></path>
          </svg>
     );

     // Handle column filter and show/hide the filter panel
     const handleColumnExcelFilter = (column) => {
          setOpenFilter((prev) => !prev); // Toggle filter panel visibility
     };

     const handleClickOutside = (e) => {
          if (filterRef.current && !filterRef.current.contains(e.target)) {
               setOpenFilter(false); // Close filter panel when clicking outside
          }
     };

     const getUniqueValues = (columnId) => {
          const uniqueValues = [...new Set(data.map((a) => a[columnId]))];
          return uniqueValues;
     };

     // Apply filter on change of checkbox selections
     const handleFilterChange = (columnId, value) => {
          setSelectedFilters((prev) => {
               const updatedFilters = { ...prev };
               if (updatedFilters[columnId]) {
                    if (updatedFilters[columnId].includes(value)) {
                         updatedFilters[columnId] = updatedFilters[columnId].filter((v) => v !== value);
                    } else {
                         updatedFilters[columnId].push(value);
                    }
               } else {
                    updatedFilters[columnId] = [value];
               }
               return updatedFilters;
          });
     };

     // Filter the data based on selected filter values
     const applyFilters = () => {
          let filtered = data;

          Object.keys(selectedFilters).forEach((columnId) => {
               filtered = filtered.filter((item) => {
                    return selectedFilters[columnId].includes(item[columnId]);
               });
          });

          setFilteredData(filtered);
     };

     // Close filter panel when clicking outside
     useEffect(() => {
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
               document.removeEventListener("mousedown", handleClickOutside);
          };
     }, []);

     const FilterIcon = (column) => (
          <svg xmlns="http://www.w3.org/2000/svg" onClick={() => handleColumnExcelFilter(column)} viewBox="0 0 24 24" width="24" height="24" fill="rgba(34,131,224,1)">
               <path fill="none" d="M0 0h24v24H0z"></path>
               <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z"></path>
          </svg>
     );

     const customHeaderGroup = () =>
          headerGroups.map((headerGroup, v) => {
               return (
                    <tr {...headerGroup.getHeaderGroupProps()} key={v}>
                         {headerGroup.headers.map((column, index) => {
                              const { key, ...restProps } = column.getHeaderProps(column.getSortByToggleProps());
                              return (
                                   <th key={index}>
                                        <div className="d-flex justify-content-between">
                                             <span className="text-sm fw-bold text-capitalize">
                                                  {column.render('Header')}
                                             </span>
                                             <div className="pointer">
                                                  <span {...restProps} className="mx-2 text-success">
                                                       {toggleDownUp()}
                                                  </span>
                                                  <span className="mx-2 text-success">{FilterIcon(column)}</span>
                                             </div>
                                        </div>
                                   </th>
                              );
                         })}
                    </tr>
               );
          });

     const hasColumnFiltering = column.some((item) => item.customFilterable === true);

     const additionalTableHeader = (columns = []) => {
          return (
               <tr className=" bg-secondary-subtle">
                    {columns.map((item, index) => (
                         <th className=" bg-secondary-subtle" key={index}>
                              <div>
                                   <span>
                                        {item.customFilterable && (
                                             <input
                                                  className="custom-input col-8"
                                                  onChange={(ev) => handleFilteringColumn(ev, item)}
                                             />
                                        )}
                                   </span>
                              </div>
                         </th>
                    ))}
               </tr>
          );
     };

     if (filteredData.length === 0)
          return <div className="heightedBorder p-2 bg-secondary-subtle">No Data Provided</div>;

     return (
          <div className="card br-0">
               {filtering && (
                    <div className="card-header d-flex justify-content-between">
                         <div className="col-5">
                              <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                         </div>
                         <div>
                              <ViewColumn />
                         </div>
                    </div>
               )}
               <div className="card-body p-0" style={{ overflowX: 'auto' }}>
                    <table {...props} className={styling ? styling : 'table'} {...getTableProps()}>
                         <thead>{customHeaderGroup()}</thead>
                         {hasColumnFiltering && <thead>{additionalTableHeader(column)}</thead>}
                         <tbody {...getTableBodyProps()}>
                              {page.map((row, index) => {
                                   prepareRow(row);
                                   return (
                                        <tr {...row.getRowProps()} key={index}>
                                             {row.cells.map((cell) => (
                                                  <td style={{ fontSize: '13px' }} {...cell.getCellProps()} key={cell.column.id}>
                                                       {cell.render('Cell')}
                                                  </td>
                                             ))}
                                        </tr>
                                   );
                              })}
                         </tbody>
                    </table>
               </div>

               {/* Filter panel */}
               {openFilter && (
                    <div
                         ref={filterRef}
                         className="position-absolute bg-white shadow-lg p-2"
                         style={{
                              top: '50px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              zIndex: '1000',
                              maxHeight: '300px',
                              overflowY: 'auto',
                         }}
                    >
                         <h5>Filters</h5>
                         {headerGroups[0]?.headers?.map((column, idx) => {
                              const uniqueValues = getUniqueValues(column.id);
                              return (
                                   <div key={idx}>
                                        <h6>{column.Header}</h6>
                                        {uniqueValues.map((value) => (
                                             <div key={value}>
                                                  <input
                                                       type="checkbox"
                                                       checked={selectedFilters[column.id]?.includes(value)}
                                                       onChange={() => handleFilterChange(column.id, value)}
                                                  />
                                                  {value}
                                             </div>
                                        ))}
                                   </div>
                              );
                         })}
                         <button className="btn btn-primary mt-2" onClick={applyFilters}>Apply Filters</button>
                    </div>
               )}

               <div className="card-footer d-flex py-2 justify-content-center">
                    <Pagination />
               </div>
          </div>
     );
}
