import React, { useMemo, useState } from "react";
import { useTable, useGroupBy, useExpanded, useSortBy, useFilters, useRowSelect, useFlexLayout } from "react-table";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import Pagination from "../../accessories/pagination";
import ShowTableCount from "./ShowCountTable";
import { printResultNavigator } from "../../Auth/customFetch";
import { useRouter } from "next/navigation";
import ActionDropdown from "./ActionAscensionTables";
import FilterIcon from "./FilterIcon";
import { useMediaQuery } from 'react-responsive';
import { SelectAll } from "@mui/icons-material";
import ValidationModal from "./ValidationModal"; // Make sure this path is correct
import { getValidationColumns } from "./validationColumns";
import ValidationMobile from "./validationMobile";

export default function ValidationAscensionTable() {
	const { isLoading, collection, queryParams, setQueryParams, setLoadPage, canloadPage, updatePageValue } = useLaboratoryContext();
	const router = useRouter();
	const isMobile = useMediaQuery({ maxWidth: 768 });

	const [isValidationModalOpened, setIsValidationModalOpened] = useState(false);
	const [selectedAscension, setSelectedAscension] = useState(null);

	const [visibleTimelines, setVisibleTimelines] = useState({});
	const [currentColumn, setCurrentColumn] = useState(null);
	const [filterValue, setFilterValue] = useState('');

	const viewResultHandler = (item) => {
		printResultNavigator(router, item.billingid, { ...item, testid: item.id }, true);
	};

	const handleActionClick = (doc) => {
		setSelectedAscension(doc);
		setIsValidationModalOpened(true);
	};

	const handleCloseModal = () => {
		setIsValidationModalOpened(false);
		setSelectedAscension(null);
	};

	const columns = useMemo(() => getValidationColumns(viewResultHandler, ActionDropdown, handleActionClick), []);
	const data = useMemo(() => collection, [collection]);

	const tableInstance = useTable(
		{
			columns: useMemo(() => columns, [columns]),
			data: useMemo(() => data, [data]),
			initialState: { groupBy: ["billingid"] }
		},
		useFilters,
		useGroupBy,
		useSortBy,
		useExpanded,
		useRowSelect,
		useFlexLayout
	);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, setFilter } = tableInstance;

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

	const toggleTimeline = (rowId) => {
		setVisibleTimelines((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
	};

	if (isLoading) {
		return <div className="p-2 text-center heightedBorder bg-secondary-subtle">Loading...</div>;
	}

	if (collection.length === 0) {
		return !canloadPage ? (
			<div className="p-3 alert col-3 alert-info text-sm">No Records Found</div>
		) : (
			<div className="d-flex justify-content-center">
				<Pagination page={queryParams.page} updateFunction={updatePageValue} load={setLoadPage} />
			</div>
		);
	}

	return (
		<div className="mx-2 br-5" style={{ overflowX: 'auto' }}>
			<div className="d-flex justify-content-between">
				<div className="col-10">
					<ShowTableCount queryParams={queryParams} setQueryParams={setQueryParams} />
				</div>
				<button
					className="btn btn-light btn-sm"
					onClick={() => {
						const allSelected = rows.length === Object.keys(tableInstance.state.selectedRowIds).length;
						tableInstance.toggleAllRowsSelected(!allSelected);
					}}
					disabled={collection.length === 0}
				>
					{isMobile ? <SelectAll titleAccess="select and unselect all ascensions" /> : "Select All"}
				</button>
			</div>

			{isMobile ? (
				<ValidationMobile
					rows={rows}
					visibleTimelines={visibleTimelines}
					viewResultHandler={viewResultHandler}
					ActionDropdown={ActionDropdown}
					prepareRow={prepareRow}
					openModal={handleActionClick}
					toggleTimeline={toggleTimeline}
				/>
			) : (
				<div className="bg-body-secondary shadow">
					<table {...getTableProps()} className="table text-sm">
						<thead>
							{headerGroups.map((headerGroup, v) => (
								<tr {...headerGroup.getHeaderGroupProps()} key={v}>
									{headerGroup.headers.map((column,headerIndex) => (
										<th  {...column.getHeaderProps()} key={headerIndex}>
											<div className="header-content d-flex justify-content-between   align-items-center">
												{column.render("Header")}
												{column.id !== 'selection' && (
													<button onClick={() => handleClick(column)} className="btn btn-link p-0">
														<FilterIcon />
													</button>
												)}
											</div>
											{currentColumn === column && (
												<div className="dropdown-menu show">
													<button className="dropdown-item fw-bold text-sm" onClick={() => column.toggleSortBy(true)}>Sort Asc</button>
													<button className="dropdown-item fw-bold text-sm" onClick={() => column.toggleSortBy(false)}>Sort Desc</button>
													<div className="dropdown-item fw-bold text-sm">
														<input
															type="text"
															value={filterValue}
															onChange={(e) => setFilterValue(e.target.value)}
															placeholder="Type to filter..."
														/>
													</div>
													<button className="dropdown-item" onClick={handleFilterApply}>Apply</button>
													<button className="dropdown-item" onClick={handleFilterRemove}>Remove Filter</button>
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
									<tr {...row.getRowProps()} key={row.getRowProps().key}>
										{row.cells.map(cell => (
											<td {...cell.getCellProps()} key={cell.getCellProps().key}>{cell.render("Cell")}</td>
										))}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
			{isValidationModalOpened && (
				<ValidationModal show={isValidationModalOpened} onClose={handleCloseModal} selectedAscension={selectedAscension} />
			)}

			<div className="d-flex justify-content-center">
				<Pagination page={queryParams.page} updateFunction={updatePageValue} load={setLoadPage} />
			</div>
		</div>
	);
}
