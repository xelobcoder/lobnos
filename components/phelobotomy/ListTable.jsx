import React, { useMemo, useState } from "react";
import { useTable, useSortBy, useFilters, useRowSelect } from "react-table";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortAscendingIcon from '@mui/icons-material/ArrowUpward';
import SortDescendingIcon from '@mui/icons-material/ArrowDownward';

export default function ListTable({ data, handleCollectSample, receive }) {
  const columns = useMemo(() => [
    {
      Header: "Date",
      accessor: "date",
      Cell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      Header: "Fullname", accessor: "fullname",
      Cell: ({ value }) => <div className="text-uppercase"> {value}</div>
    },
    { Header: "Age", accessor: "age" },
    { Header: "Gender", accessor: "gender" },
    {
      Header: "Urgency",
      accessor: "clientstatus",
      Cell: ({ value }) => (
        value === "urgent" ? (
          <span className="btn btn-danger btn-sm">{value}</span>
        ) : (
          <div>{value}</div>
        )
      ),
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <div>
          <button onClick={receive} className="btn btn-primary btn-sm mx-1">
            Receive
          </button>
          <button
            className="btn btn-primary btn-sm mx-1"
            onClick={() => {
              handleCollectSample(
                row.original.billingid,
                row.original.patientid,
                row.original.fullname
              );
            }}
          >
            Pull Sample
          </button>
        </div>
      ),
    },
  ], [receive, handleCollectSample]);

  const tableInstance = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useSortBy,
    useRowSelect
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setFilter,
    getToggleAllRowsSelectedProps,
  } = tableInstance;

  const [currentColumn, setCurrentColumn] = useState(null);
  const [filterValue, setFilterValue] = useState('');

  const handleClick = (column) => {
    setCurrentColumn(column);
  };

  const handleFilterApply = () => {
    if (currentColumn) {
      setFilter(currentColumn.id, filterValue || undefined);
    }
    setCurrentColumn(null); // Close dropdown after applying
  };

  return (
    <div className="container-fluid bg-body-secondary p-2 mx-2 my-2">
      {/* <div className="d-flex justify-content-start mb-2">
        <label className="form-check-label" htmlFor="selectAll">
          <input
            type="checkbox"
            {...getToggleAllRowsSelectedProps()}
            id="selectAll"
            className="form-check-input me-2"
          />
          Select All
        </label>
      </div> */}
      <table {...getTableProps()} className="table text-sm">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} className="table-header">
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()} className="table-cell">
                  <div className="header-content d-flex justify-content-between align-items-center">
                    <div>{column.render("Header")}</div>
                    {column.id !== 'selection' && (
                      <button onClick={() => handleClick(column)} className="btn btn-link p-0">
                        <FilterAltIcon />
                      </button>
                    )}
                  </div>
                  {currentColumn === column && (
                    <div className="dropdown-menu show">
                      <button className="dropdown-item fw-bold text-sm" onClick={() => column.toggleSortBy(true)}>
                        <SortAscendingIcon fontSize="small" /> Sort Asc
                      </button>
                      <button className="dropdown-item fw-bold text-sm" onClick={() => column.toggleSortBy(false)}>
                        <SortDescendingIcon fontSize="small" /> Sort Desc
                      </button>
                      <div className="dropdown-item fw-bold text-sm">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Filter"
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                        />
                        <button className="btn btn-outline-secondary btn-sm mt-1" onClick={handleFilterApply}>
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className={row.original?.clientstatus === "urgent" ? "table-danger" : ""}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} className="table-cell">{cell.render("Cell")}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
