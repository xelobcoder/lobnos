"use client";

import React, { useMemo } from "react";
import { useTable, useSortBy, usePagination } from "react-table";

export default function SimpleTableDisplay({ columns, data }) {
    const tableInstance = useTable(
        {
            columns: useMemo(() => columns, [columns]),
            data: useMemo(() => data, [data]),
            initialState: { pageSize: 10 },
        },
        useSortBy,
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,        prepareRow,
        nextPage,
        previousPage,
        canNextPage,
        canPreviousPage,
        state: { pageIndex },
    } = tableInstance;

    return (
        <div className="bt-wrapper">
            <table className="bt" {...getTableProps()} >
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                            {headerGroup.headers.map((column) => (
                                <th
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                   
                                    key={column.id}
                                >
                                    {column.render("Header")}
                                    <span>
                                        {column.isSorted
                                            ? column.isSortedDesc
                                                ? " 🔽"
                                                : " 🔼"
                                            : ""}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()} key={row.id}>
                                {row.cells.map((cell) => (
                                    <td
                                        {...cell.getCellProps()}
                                       
                                        key={cell.column.id}
                                    >
                                        {cell.render("Cell")}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
