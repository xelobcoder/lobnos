"use client";
import { useEffect, useMemo, useState } from "react";
import { useTable, useGlobalFilter, useFilters, useSortBy } from "react-table";
import GlobalFilter from "./GlobalFilter";
import ShowTableDisplayCount from "./TableDisplayShowCount";
import TableLoading from "./TableLoading";
import style from "../../../styles/SmsTemplateList.module.css";
import "../../../styles/prime-table.css";
import { ButtonGroup } from "react-bootstrap";

export default function PrimeTable({
  column,
  data,
  filtering = false,
  isExpoerted = false,
  serverSideFiltering = false,
  handleSeverSideProcessing,
  urlparams = {},
  theme = null,
  rowStyling = null,
}) {
  const [filteredData, setFilteredData] = useState(data);
  const [isLoading, setIsLoading] = useState(false);
  const [queryParams, setQueryParams] = useState({
    count: data.length || 10,
    page: 1,
  });
  const [globalTheme, setGlobalTheme] = useState("PrimeLaboratoryTableStyling");

  useEffect(() => {
    // Initial check
    if (typeof document !== "undefined") {
      const currentGlobal =
        document.documentElement.getAttribute("data-table-style");
      if (currentGlobal) {
        setGlobalTheme(currentGlobal);
      }

      // Observe changes to the html attribute
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "data-table-style"
          ) {
            const newTheme =
              document.documentElement.getAttribute("data-table-style");
            setGlobalTheme(newTheme || "PrimeLaboratoryTableStyling");
          }
        });
      });

      observer.observe(document.documentElement, { attributes: true });

      return () => observer.disconnect();
    }
  }, []);

  const effectiveTheme = theme || globalTheme;

  useEffect(() => {
    if (Array.isArray(data)) {
      setQueryParams({ ...queryParams, count: data.length });
      setFilteredData(data);
    }
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
    useSortBy,
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
      fill="currentColor"
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
      fill="currentColor"
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
            column.getSortByToggleProps(),
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

  async function RunServerAction(currentPage, currentCount, sortby) {
    if (
      typeof handleSeverSideProcessing === "function" &&
      serverSideFiltering
    ) {
      setIsLoading(true);
      const processedResponse = await handleSeverSideProcessing({
        page: currentPage,
        count: currentCount,
        ...urlparams,
        sortby,
      });

      if (processedResponse) {
        const { result, error } = processedResponse;
        setFilteredData(result);
        setIsLoading(false);

        // setTimeout(() => {
        // 	if (result) {
        // 		setFilteredData(result);
        // 	} else {
        // 		alert(error);
        // 	}
        // 	setIsLoading(false);
        // }, 300);
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

  const getRowStyling = (row, index) => {
    let className = style.tableRow;
    let inlineStyles = { transition: "background 0.2s" };

    if (!rowStyling) {
      // Default zebra striping
      const zebraClass = index % 2 === 0 ? style.evenRow : style.oddRow;
      className += ` ${zebraClass}`;
    } else if (rowStyling.type === "zebra") {
      // Explicit zebra striping
      const zebraClass = index % 2 === 0 ? style.evenRow : style.oddRow;
      className += ` ${zebraClass}`;
    } else if (rowStyling.type === "status") {
      // Status-based styling with inline styles
      const statusField = rowStyling.statusField;
      const statusValue = row.original?.[statusField];

      // Color mapping with inline styles
      const colorMap = {
        paid: { backgroundColor: "#d1e7dd", color: "#0f5132" },
        unpaid: { backgroundColor: "#f8d7da", color: "#842029" },
      };

      if (statusValue && colorMap[statusValue]) {
        inlineStyles = { ...inlineStyles, ...colorMap[statusValue] };
      }
    } else if (rowStyling.type === "custom") {
      // Custom function-based styling
      if (typeof rowStyling.getRowClassName === "function") {
        const customClass = rowStyling.getRowClassName(row.original, index);
        if (customClass) className += ` ${customClass}`;
      }
      if (typeof rowStyling.getRowStyle === "function") {
        const customStyle = rowStyling.getRowStyle(row.original, index);
        if (customStyle) {
          inlineStyles = { ...inlineStyles, ...customStyle };
          // Add CSS class based on background color for CSS module styling
          if (customStyle.backgroundColor === "#d1e7dd") {
            className += ` ${style.rowPaid}`;
          } else if (customStyle.backgroundColor === "#f8d7da") {
            className += ` ${style.rowUnpaid}`;
          }
        }
      }
    } else if (rowStyling.type === "none") {
      // No styling
    }

    return { className, inlineStyles };
  };

  const RenderingTable = ({ getTableBodyProps }) => {
    if (isLoading) return <TableLoading span={column.length} />;
    else if (filteredData.length == 0) return <NoDataAvailable />;
    else {
      return (
        <tbody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row);
            const { className, inlineStyles } = getRowStyling(row, index);

            return (
              <tr
                {...row.getRowProps()}
                key={index}
                className={className}
                style={inlineStyles}
              >
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    key={cell.column.id}
                    className={style.td}
                    style={inlineStyles}
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
    <div className={`${style.tablewrapper}`}>
      <div className="mx-3 my-2 d-flex justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center">
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
        <div className="d-flex align-items-center gap-2">
          {filtering && (
            <div>
              <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            </div>
          )}
          {isExpoerted && (
            <ButtonGroup
              className="d-flex justify-content-end"
              aria-label="Export options"
              size="sm"
            >
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  alert("PDF export is not implemented yet.");
                }}
              >
                excel
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  alert("PDF export is not implemented yet.");
                }}
              >
                PDF
              </button>
            </ButtonGroup>
          )}
        </div>
      </div>

      <div style={{ overflowX: "auto !important", maxWidth: "100%" }}>
        <table
          className={`${style.table} ${effectiveTheme !== "PrimeLaboratoryTableStyling" ? `prime-table-${effectiveTheme} prime-table-theme` : ""}`}
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
                    {[1, 2, 3, 4, "Next", "Previous"].map((item, index) => {
                      const isActive = queryParams.page === item;
                      const isNav = typeof item === "string";
                      return (
                        <button
                          type="button"
                          onClick={() => handlePagination(item)}
                          key={index}
                          className={`
																 ${style.paginationBtn}
																 ${isActive ? style.paginationBtnActive : ""}
																 ${isNav ? style.paginationBtnNav : ""}
															`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
