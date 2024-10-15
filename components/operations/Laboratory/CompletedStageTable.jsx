import React, { useMemo, useState } from "react";
import { Info } from "@mui/icons-material";
import { PrepareResultEntryHeader } from "../../Auth/customFetch";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import Pagination from "../../accessories/pagination";
import { fnTiming } from "./Lib";
import {
	useTable,
	useSortBy,
	useFilters,
	useRowSelect,
	useFlexLayout,
} from "react-table";
import { Dropdown } from 'react-bootstrap';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortAscendingIcon from '@mui/icons-material/ArrowUpward';
import SortDescendingIcon from '@mui/icons-material/ArrowDownward';
import ShowTableCount from "./ShowCountTable";

export default function AscentionCompletedTable() {
	const { isLoading, collection, queryParams, setLoadPage, setQueryParams, canloadPage, updatePageValue } = useLaboratoryContext();


	const noRecordsFound = !isLoading && collection.length === 0 && !canloadPage;

	const canLoadMoreRecords = !isLoading && collection.length === 0 && canloadPage;

	const columns = useMemo(() => [
		{
			Header: '#',
			accessor: '',
			Cell: ({ row }) => <input type="checkbox" {...row.getToggleRowSelectedProps()} />,
			width: 20,
		},
		{
			Header: 'Ascension Date',
			accessor: 'ascension_date',
			Cell: ({ value }) => new Date(value).toLocaleDateString(),
			width: 70
		},
		{
			Header: 'Name',
			accessor: 'fullname',
			Cell: ({ row }) => (
				<div className="text-uppercase fw-bold">
					{row.original.fullname} <br />
				</div>
			),
		},
		{ Header: 'Age', accessor: 'age', width: 50 },
		{
			Header: 'Patient ID & Bill ID',
			accessor: 'patientid',
			Cell: ({ row }) => (
				<div>
					{row.original.patientid} <br />
					{row.original.billingid}
				</div>
			),
			width: 100
		},
		{
			Header: 'Test Name',
			accessor: 'name',
		},
		{
			Header: 'Timing',
			accessor: 'timing',
			Cell: ({ row }) => fnTiming(row.original),
		},
		{
			Header: 'Action',
			accessor: 'action',
			Cell: ({ row }) => (
				<Dropdown>
					<Dropdown.Toggle variant="link" size="sm" className="p-0">
						<MoreHorizIcon />
					</Dropdown.Toggle>
					<Dropdown.Menu>
						<Dropdown.Item onClick={() => PrepareResultEntryHeader(row.original)}>
							<CheckIcon fontSize="small" /> Enter result
						</Dropdown.Item>
						<Dropdown.Item onClick={() => console.log(`Enter All related for ${row.original.patientid}`)}>
							<CloseIcon fontSize="small" /> Enter All related
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
			),
			width: 50
		},
	], []);

	// Call useMemo for data and useTable outside the conditional returns
	const data = useMemo(() => collection, [collection]);

	const tableInstance = useTable(
		{
			columns,
			data,
		},
		useFilters,
		useSortBy,
		useRowSelect,
		useFlexLayout
	);

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		toggleAllRowsSelected,
	} = tableInstance;

	const [currentColumn, setCurrentColumn] = useState(null);
	const [filterValue, setFilterValue] = useState('');

	const handleClick = (column) => {
		setCurrentColumn(column);
	};

	const handleFilterApply = () => {
		if (currentColumn) {
			tableInstance.setFilter(currentColumn.id, filterValue || undefined);
		}
		setCurrentColumn(null);
	};

	if (isLoading) return <div className="text-center heightedBorder p-2 bg-secondary-subtle">Loading .......................</div>;

	if (noRecordsFound) {
		return (
			<div className="p-3 alert col-3 alert-info text-sm">
				<span className="mx-2">
					<Info />
				</span>
				<span>No Records Found</span>
			</div>
		);
	}

	if (canLoadMoreRecords) {
		return (
			<div className="d-flex justify-content-center">
				<Pagination page={queryParams.page} updateFunction={updatePageValue} load={setLoadPage} />
			</div>
		);
	}

	return (
		<div className="bg-body-secondary p-2 shadow mx-2 br-5">
			<ShowTableCount queryParams={queryParams} setQueryParams={setQueryParams} />
			<button
				className="btn btn-light btn-sm mb-2"
				onClick={() => {
					const allSelected = rows.length === Object.keys(tableInstance.state.selectedRowIds).length;
					toggleAllRowsSelected(!allSelected);
				}}
			>
				Select All
			</button>

			<table {...getTableProps()} className="table text-sm">
				<thead>
					{headerGroups.map(headerGroup => (
						<tr {...headerGroup.getHeaderGroupProps()} className="table-header" key={headerGroup.id}>
							{headerGroup.headers.map(column => (
								<th {...column.getHeaderProps()} className="table-cell" key={column.id}>
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
					{rows.map(row => {
						prepareRow(row);
						return (
							<tr {...row.getRowProps()} className={`${row.original.clientstatus === "urgent" ? "table-danger" : "table-white"}`} key={row.id}>
								{row.cells.map(cell => (
									<td {...cell.getCellProps()} className="table-cell" key={cell.column.id}>
										{cell.render("Cell")}
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
			<div className="d-flex justify-content-center">
				<Pagination page={queryParams.page} updateFunction={updatePageValue} load={setLoadPage} />
			</div>
		</div>
	);
}
