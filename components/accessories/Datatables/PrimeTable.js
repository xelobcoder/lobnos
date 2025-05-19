"use client";
import { useEffect, useMemo, useState } from "react";
import { useTable, useGlobalFilter, useFilters, useSortBy } from "react-table";
import GlobalFilter from "./GlobalFilter";
import ShowTableDisplayCount from "./TableDisplayShowCount";
import TableLoading from "./TableLoading";
import "../../../styles/prime-table.css";
import style from "../../../styles/SmsTemplateList.module.css";

export default function PrimeTable({
  column,
  data,
  filtering = false,
  serverSideFiltering = false,
  handleSeverSideProcessing,
  urlparams = {},
}) {
  const [filteredData, setFilteredData] = useState(data);
  const [isLoading, setIsLoading] = useState(false);
  const [queryParams, setQueryParams] = useState({ count: 10, page: 1 });

  useEffect(() => {
    console.warn("Rendering Table client Side.Please wait ");
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
    <svg
      className="sorted-asc"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="rgba(0,0,0,1)"
    >
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path d="M13.0001 7.82843V20H11.0001V7.82843L5.63614 13.1924L4.22192 11.7782L12.0001 4L19.7783 11.7782L18.3641 13.1924L13.0001 7.82843Z"></path>
    </svg>
  );

  const toogleDown = () => (
    <svg
      className="sorted-desc"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="rgba(0,0,0,1)"
    >
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path d="M13.0001 16.1716L18.3641 10.8076L19.7783 12.2218L12.0001 20L4.22192 12.2218L5.63614 10.8076L11.0001 16.1716V4H13.0001V16.1716Z"></path>
    </svg>
  );

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
            <th key={index} {...restProps} className={`${style.th} pointer`}>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-sm fw-bold text-capitalize align-items-center">
                  {column.render("Header")}
                  <span className="mx-1">{sortIndicator}</span>
                </span>
              </div>
            </th>
          );
        })}
      </tr>
    ));

  async function RunServerAction(currentPage, currentCount) {
    if (
      typeof handleSeverSideProcessing === "function" &&
      serverSideFiltering
    ) {
      setIsLoading(true);
      const processedResponse = await handleSeverSideProcessing({
        page: currentPage,
        count: currentCount,
        ...urlparams,
      });

      if (processedResponse) {
        const { result, error } = processedResponse;
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

  const handlePagination = async (value) => {
    let currentPage = queryParams.page;
    if (typeof value === "number") {
      currentPage = value;
    }

    if (typeof value === "string" && ["Next", "Previous"].includes(value)) {
      const nextPage =
        value === "Next"
          ? currentPage + 1
          : currentPage > 0
          ? currentPage - 1
          : 0;
      currentPage = nextPage;
    }
    setQueryParams({ ...queryParams, page: currentPage });
    await RunServerAction(currentPage, queryParams.count);
  };

  const NoDataAvailable = () => (
    <tbody>
      <tr>
        <td colSpan={100} className={style.noDataCell}>
          <div className={style.noDataWrapper}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              fill="none"
              viewBox="0 0 48 48"
              className={style.noDataIcon}
            >
              <circle
                cx="24"
                cy="24"
                r="22"
                fill="#F3F7FA"
                stroke="#D7E2E6"
                strokeWidth="2"
              />
              <path
                d="M24 16v8"
                stroke="#84868B"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="24" cy="32" r="1.5" fill="#84868B" />
            </svg>
            <div className={style.noDataText}>No Data Available</div>
          </div>
        </td>
      </tr>
    </tbody>
  );

  const RenderingTable = ({ getTableBodyProps }) => {
    if (isLoading) return <TableLoading span={column.length} />;
    else if (filteredData.length == 0) return <NoDataAvailable />;
    else {
      return (
        <tbody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row);
            // Add even/odd row styling for zebra effect
            const zebraClass = index % 2 === 0 ? style.evenRow : style.oddRow;
            return (
              <tr
                {...row.getRowProps()}
                key={index}
                className={`${rowClass}  ${style.tableRow}`}
                style={{ transition: "background 0.2s" }}
              >
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    key={cell.column.id}
                    className={style.td}
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      );
    }
  };

  return (
    <div
      className={`${style.tablewrapper} shadow-sm`}
      style={{ minHeight: "60vh", borderRadius: "10px" }}
    >
      <div className="mx-3 my-2 d-flex justify-content-between">
        <div className="col-3">
          {handleSeverSideProcessing && (
            <ShowTableDisplayCount
              page={queryParams.page}
              setLoader={setIsLoading}
              handleLoader={RunServerAction}
              queryParams={queryParams}
              setQueryParams={setQueryParams}
            />
          )}
        </div>
        <div>
          {filtering && (
            <div>
              <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            </div>
          )}
        </div>
      </div>
      <table
        className={style.table}
        style={{ fontSize: "1rem", minWidth: "100%" }}
        {...getTableProps()}
      >
        <thead>{customHeaderGroup()}</thead>
        <RenderingTable getTableBodyProps={getTableBodyProps} />
        {serverSideFiltering && (
          <tfoot>
            <tr>
              <td colSpan={2} className="text-secondary-emphasis">
                <span>Current Page: {queryParams.page} </span>
                <span className={style.paginationSeparator}>|</span>
                <span>Item Count: {filteredData.length || 0}</span>
              </td>
              <td colSpan={column.length - 1}>
                <div className={style.paginationContainer}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "Next", "Previous"].map(
                    (item, index) => {
                      const isActive = queryParams.page === item;
                      const isNav = typeof item === "string";
                      return (
                        <button
                          type="button"
                          onClick={() => handlePagination(item)}
                          key={index}
                          className={`
                                                                 ${
                                                                   style.paginationBtn
                                                                 }
                                                                 ${
                                                                   isActive
                                                                     ? style.paginationBtnActive
                                                                     : ""
                                                                 }
                                                                 ${
                                                                   isNav
                                                                     ? style.paginationBtnNav
                                                                     : ""
                                                                 }
                                                            `}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {item}
                        </button>
                      );
                    }
                  )}
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
