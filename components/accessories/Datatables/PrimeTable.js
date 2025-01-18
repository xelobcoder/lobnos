"use client"
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTable, useGlobalFilter, useFilters, useSortBy, usePagination } from 'react-table';
import GlobalFilter from './GlobalFilter';
import ExcelFilteringLike from './ExcelFilteringLike';
import ShowTableDisplayCount from './TableDisplayShowCount';
import TableLoading from './TableLoading';
import '../../../styles/prime-table.css'
import style from '../../../styles/SmsTemplateList.module.css'


export default function
     PrimeTable({
          column,
          data,
          filtering,
          serverSideFiltering = false,
          handleSeverSideProcessing,
          urlparams = {}
     }) {
     const [filteredData, setFilteredData] = useState(data);
     const [openFilter, setOpenFilter] = useState(false);
     const [excelTarget, setExcelTarget] = useState('');
     const [uniqueValues, setUniqueValues] = useState([]);
     const [isLoading, setIsLoading] = useState(false);
     const filterRef = useRef(null);
     const triggerRef = useRef(null);
     const [queryParams, setQueryParams] = useState({ count: 10, page: 1 })

     useEffect(() => {
          console.warn('Rendering Table client Side.Please wait ');
          setFilteredData(data);
     }, [data]);
     


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
               initialState: { pageSize: queryParams.count },
          },
          useFilters,
          useGlobalFilter,
          useSortBy
     );

     const {
          getTableProps,
          getTableBodyProps,
          headerGroups,
          rows,
          prepareRow,
          state: { globalFilter },
          setGlobalFilter,
     } = tableInstance;

     const toogleUp = () => (
          <svg className='sorted-asc' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="rgba(0,0,0,1)"><path fill="none" d="M0 0h24v24H0z"></path><path d="M13.0001 7.82843V20H11.0001V7.82843L5.63614 13.1924L4.22192 11.7782L12.0001 4L19.7783 11.7782L18.3641 13.1924L13.0001 7.82843Z"></path></svg>
     );

     const toogleDown = () => (
          <svg className='sorted-desc' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="rgba(0,0,0,1)"><path fill="none" d="M0 0h24v24H0z"></path><path d="M13.0001 16.1716L18.3641 10.8076L19.7783 12.2218L12.0001 20L4.22192 12.2218L5.63614 10.8076L11.0001 16.1716V4H13.0001V16.1716Z"></path></svg>
     )

     const getUniqueValues = (columnId) => {
          const uniqueValues = [...new Set(data.map((a) => a[columnId]))];
          return uniqueValues;
     };

     const handleColumnExcelFilter = (column, ref) => {
          setOpenFilter(true);
          setExcelTarget(column.id)
          const uniqueValues = getUniqueValues(column.id);
          setUniqueValues(uniqueValues);
          triggerRef.current = ref;
     }

     const FilterIcon = (column) => (
          <span ref={(el) => (column.filterRef = el)}>
               <svg xmlns="http://www.w3.org/2000/svg"
                    onClick={(ev) => { handleColumnExcelFilter(column, column.filterRef) }} viewBox="0 0 24 24" width="24" height="24" fill="rgba(34,131,224,1)">
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z"></path>
               </svg>
          </span>
     );


     const onApplyFilters = (filterValue = []) => {
          if (filterValue.length == 0) {
               setOpenFilter(false);
               setExcelTarget('');
               return;
          }

          const appliedFilterResultSet = [...data].filter((item, index) => {
               if (excelTarget) {
                    return filterValue.includes(item[excelTarget]);
               }
          })

          if (Array.isArray(appliedFilterResultSet) && appliedFilterResultSet.length > 0) {
               setFilteredData(appliedFilterResultSet);
               setExcelTarget('');
               setOpenFilter(false);
          }
     }



     const customHeaderGroup = () =>
          headerGroups.map((headerGroup, v) => (
               <tr {...headerGroup.getHeaderGroupProps()} key={v}>
                    {headerGroup.headers.map((column, index) => {
                         const { key, ...restProps } = column.getHeaderProps(
                              column.getSortByToggleProps()
                         );

                         const sortIndicator = column.isSorted
                              ? column.isSortedDesc
                                   ? toogleDown()
                                   : toogleUp()
                              : null;

                         return (
                              <th key={index} {...restProps} className="pointer ">
                                   <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-sm fw-bold text-capitalize  align-items-center">
                                             {column.render('Header')}
                                             <span className="mx-1">{sortIndicator}</span>
                                        </span>
                                        <div className="pointer">
                                             {column.isMenu && (
                                                  <span className="mx-2 text-success">
                                                       {FilterIcon(column)}
                                                  </span>
                                             )}
                                             {excelTarget === column.id && (
                                                  <ExcelFilteringLike
                                                       target={excelTarget}
                                                       openFilter={openFilter}
                                                       uniqueValues={uniqueValues}
                                                       onApplyFilters={onApplyFilters}
                                                       filterRef={filterRef}
                                                       triggerRef={triggerRef}
                                                  />
                                             )}
                                        </div>
                                   </div>
                              </th>
                         );
                    })}
               </tr>
          ));



     const handleFilteringColumn = debounce((ev, column) => {
          const { filteringMode, accessor } = column;
          const { value } = ev.target;
          const lowercasedValue = value.toLowerCase();

          if (lowercasedValue.length > 1) {
               if (filteringMode === 'text') {
                    const filtered = [...data].filter((item) => {
                         const columnValue = item[accessor]?.toString() || '';
                         return columnValue.toLowerCase().startsWith(lowercasedValue) || columnValue.toLowerCase().includes(lowercasedValue);
                    });
                    if (filtered.length > 0) {
                         setFilteredData(filtered);
                    }
               } else if (filteringMode === 'alphanumeric') {
                    const filtered = [...data].filter((item) => {
                         const columnValue = item[accessor]?.toString() || '';
                         return columnValue.toLowerCase().includes(lowercasedValue);
                    });
                    if (filtered.length > 0) {
                         setFilteredData(filtered);
                    }
               } else if (filteringMode === 'number') {
                    const filtered = [...data].filter((item) => {
                         const columnValue = parseFloat(item[accessor]);
                         const filterValue = parseFloat(lowercasedValue);
                         return !isNaN(columnValue) && (columnValue === filterValue || columnValue.toString().includes(filterValue.toString()));
                    });
                    if (filtered.length > 0) {
                         setFilteredData(filtered);
                    }
               } else if (filteringMode === 'date') {
                    const filtered = [...data].filter((item) => {
                         const columnValue = new Date(item[accessor]);
                         const filterValue = new Date(lowercasedValue);
                         return columnValue.getTime() === filterValue.getTime();
                    });
                    if (filtered.length > 0) {
                         setFilteredData(filtered);
                    }
               }
          } else {
               setFilteredData(data);
          }
     }, 300);

     const additionalTableHeader = (columns) => {
          return (
               <tr className=" bg-secondary-subtle">
                    {columns.map((item, index) => (
                         <th className=" bg-secondary-subtle" key={index}>
                              <div>
                                   <span>
                                        {item?.customFilterable && (
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

     async function RunServerAction(currentPage, currentCount) {
          if (typeof handleSeverSideProcessing === "function" && serverSideFiltering) {
               setIsLoading(true);
               const processedResponse = await handleSeverSideProcessing({ page: currentPage, count: currentCount });

               if (processedResponse) {
                    const { result, error } = processedResponse;
                    console.log(result)
                    setTimeout(() => {
                         if (result) {
                              setFilteredData(result);
                         } else {
                              alert(error);
                         }
                         setIsLoading(false);
                    }, 300);
               }
          }
     }



     const hasColumnFiltering = column.some((item, index) => item.customFilterable == true)






     const handlePagination = async (value) => {
          let currentPage = queryParams.page;
          if (typeof value === "number") {
               currentPage = value;
          }

          if (typeof value === "string" && ['Next', 'Previous'].includes(value)) {
               const nextPage = value === "Next" ? currentPage + 1 : (currentPage > 0 ? currentPage - 1 : 0);
               currentPage = nextPage;
          }
          setQueryParams({ ...queryParams, page: currentPage });
          await RunServerAction(currentPage, queryParams.count);
     }


     const NoDataAvailable = () => (
          <tbody>
               <tr>
                    <td style={{ height: "10vh" }} colSpan={100} className="text-center bg-secondary-subtle pls-color fw-bold">No Data Available</td>
               </tr>
          </tbody>
     );






     const RenderingTable = ({ getTableBodyProps }) => {
          if (isLoading) return <TableLoading span={column.length} />
          else if (filteredData.length == 0) return <NoDataAvailable />
          else {
               return <tbody {...getTableBodyProps()}>
                    {rows.map((row, index) => {
                         prepareRow(row);
                         return (
                              <tr {...row.getRowProps()} key={index}>
                                   {row.cells.map((cell) => (
                                        <td {...cell.getCellProps()} key={cell.column.id}>
                                             {cell.render('Cell')}
                                        </td>
                                   ))}
                              </tr>
                         );
                    })}
               </tbody>
          }
     }


     return (
          <div className="p-0 my-2">
               <div className=" my-0  d-flex justify-content-between">
                    <div className="col-6 d-flex">
                         <div className='col-5'>
                              {handleSeverSideProcessing && <ShowTableDisplayCount
                                   page={queryParams.page} setLoader={setIsLoading} handleLoader={RunServerAction}
                                   queryParams={queryParams}
                                   setQueryParams={setQueryParams}
                              />}
                         </div>
                         {filtering && <div className='col-8 mt-1 mx-1'>
                              <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                         </div>}
                    </div>
                    <div>
                         {/* <button title='clear off filter applied' className='btn border-secondary border-2 py-0 px-1' onClick={(ev) => { setFilteredData(data) }}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(234,46,70,1)"><path fill="none" d="M0 0h24v24H0z"></path><path d="M6.92893 0.514648L21.0711 14.6568L19.6569 16.071L15.834 12.2486L15 13.4999V21.9999H9V13.4999L4 5.99993H3V3.99993L7.585 3.99965L5.51472 1.92886L6.92893 0.514648ZM9.585 5.99965L6.4037 5.99993L11 12.8944V19.9999H13V12.8944L14.392 10.8066L9.585 5.99965ZM21 3.99993V5.99993H20L18.085 8.87193L16.643 7.42893L17.5963 5.99993H15.213L13.213 3.99993H21Z"></path></svg>
                         </button> */}
                    </div>
               </div>
               <div className={style.tablewrapper} style={{minHeight:'50vh'}}>
                    <table className={`${style.table}`} style={{fontSize:'12px'}} {...getTableProps()}>
                         <thead >{customHeaderGroup()}</thead >
                         {hasColumnFiltering && <thead>{additionalTableHeader(column)}</thead>}
                         <RenderingTable getTableBodyProps={getTableBodyProps} />
                         {serverSideFiltering && <tfoot >
                              <tr>
                                   <td colSpan={2} className='text-secondary-emphasis' ><span >Current Page:{queryParams.page} </span>
                                        {"<"}<span >Item Count: {filteredData.length || 0}</span>
                                        {">"}
                                   </td>
                                   <td colSpan={(column.length) - 1}>
                                        <div className='d-flex justify-content-end'>
                                             {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Next', 'Previous'].map((item, index) => {
                                                  return <span onClick={(ev) => { handlePagination(item) }} key={index} className={`btn btn-outline-secondary mx-1 ${queryParams.page == item ? "active" : ""}`} >{item}</span>;
                                             })}
                                        </div>
                                   </td>
                              </tr>
                         </tfoot>}
                    </table>
               </div>
          </div>
     );


}


