import React, { useMemo, useState } from "react";
import { useTable, useGroupBy, useExpanded, useSortBy, useFilters, useRowSelect, useFlexLayout } from "react-table";
import moment from "moment";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortAscendingIcon from '@mui/icons-material/ArrowUpward';
import SortDescendingIcon from '@mui/icons-material/ArrowDownward';
import Pagination from "../../accessories/pagination";
import ShowTableCount from "./ShowCountTable";
import { printResultNavigator } from "../../Auth/customFetch";
import { useRouter } from "next/navigation";
import { fnTiming } from "./Lib";
import ActionDropdown from "./ActionAscensionTables";
import FilterIcon from "./FilterIcon";

export default function ValidationAscensionTable() {
	const {
		isLoading,
		collection,
		queryParams,
		setQueryParams,
		setLoadPage,
		canloadPage,
		updatePageValue,
	} = useLaboratoryContext();

	const router = useRouter();

	const viewResultHandler = (item) => {
		printResultNavigator(router, item.billingid, { ...item, testid: item.id }, true);
	};

	const columns = useMemo(() => [
		{
			Header: '#',
			accessor: '',
			Cell: ({ row }) => <input type="checkbox" {...row.getToggleRowSelectedProps()} />,
			width: 20,
			filtering: false
		},
		{
			Header: "Fullname",
			accessor: "fullname",
			width: 150,
			Cell: ({ value, row }) => <div className="text-uppercase">{value}<br />{row.original.age}</div>
		},
		{ Header: "Patient ID", accessor: "patientid", width: 60 },
		{ Header: "Client Status", accessor: "clientstatus", width: 70 },
		{ Header: "Test Name", accessor: "name", width: 150 },
		{
			Header: "Processing",
			accessor: "processing",
			Cell: ({ row }) => fnTiming(row.original),
			width: 150,
		},
		{
			Header: "Results",
			accessor: "results",
			Cell: ({ row }) => (
				<div className="list-group p-0 bg-secondary-subtle">
					<span className="list-group-item p-0" key={`start-${row.original.patientid}`}>
						{moment(row.original.resultEntryStart).format("LLLL")}
					</span>
					<span className="list-group-item p-0" key={`end-${row.original.patientid}`}>
						{moment(row.original.resultEntryEnd).format("LLLL")}
					</span>
				</div>
			),
			width: 150,
		},
		{
			Header: 'Action',
			accessor: "action",
			Cell: ({ row }) => (
				<ActionDropdown
					onValidate={() => { }}
					onViewResult={() => viewResultHandler(row.original)}
				/>
			),
			width: 50
		}
	], []);

	const data = useMemo(() => collection, [collection]);

	const tableInstance = useTable(
		{
			columns,
			data,
			initialState: { groupBy: ["billingid"] },
		},
		useFilters,
		useGroupBy,
		useSortBy,
		useExpanded,
		useRowSelect,
		useFlexLayout
	);

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		setFilter,
		toggleAllRowsSelected,
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
		setCurrentColumn(null);
	};

	const handleFilterRemove = () => {
		if (currentColumn) {
			setFilter(currentColumn.id, undefined);
		}
		setCurrentColumn(null);
		setFilterValue('');
	};

	if (isLoading) {
		return (
			<div className="p-2 text-center heightedBorder bg-secondary-subtle">
				Loading...
			</div>
		);
	}

	if (collection.length === 0) {
		if (!canloadPage) {
			return (
				<div className="p-3 alert col-3 alert-info text-sm">
					<span>No Records Found</span>
				</div>
			);
		} else {
			return (
				<div className="d-flex justify-content-center">
					<Pagination page={queryParams.page} updateFunction={updatePageValue} load={setLoadPage} />
				</div>
			);
		}
	}

	return (
		<div className="bg-body-secondary p-2 shadow mx-2 br-5" style={{overflowX:'auto'}}>
			<div className="d-flex justify-content-between">
				<div className="col-10">
					<ShowTableCount queryParams={queryParams} setQueryParams={setQueryParams} />
				</div>
				<button
					className="btn btn-light btn-sm"
					onClick={() => {
						const allSelected = rows.length === Object.keys(tableInstance.state.selectedRowIds).length;
						toggleAllRowsSelected(!allSelected);
					}}
					disabled={collection.length === 0}
				>
					Select All
				</button>
			</div>
			<table {...getTableProps()} className="table text-sm">
				<thead>
					{headerGroups.map((headerGroup) => (
						<tr {...headerGroup.getHeaderGroupProps()} className="table-header" key={headerGroup.id}>
							{headerGroup.headers.map((column) => (
								<th {...column.getHeaderProps()} className="table-cell" key={column.id}>
									<div className="header-content d-flex justify-content-between align-items-center">
										<div>{column.render("Header")}</div>
										{column.id !== 'selection' && (
											<button onClick={() => handleClick(column)} className="btn btn-link p-0">
												<FilterIcon />
											</button>
										)}
									</div>
									{currentColumn === column && (
										<div className="dropdown-menu show">
											<button className="dropdown-item fw-bold text-sm" onClick={() => currentColumn.toggleSortBy(true)}>
												<SortAscendingIcon fontSize="small" /> Sort Asc
											</button>
											<button className="dropdown-item fw-bold text-sm" onClick={() => currentColumn.toggleSortBy(false)}>
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
												<button className="btn btn-outline-danger btn-sm mt-1" onClick={handleFilterRemove}>
													Remove Filter
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
							<tr {...row.getRowProps()} className={row.original?.clientstatus === "urgent" ? "table-danger" : ""} key={row.id}>
								{row.cells.map((cell) => (
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
				<Pagination updateFunction={updatePageValue} page={queryParams.page} load={setLoadPage} />
			</div>
		</div>
	);
}
