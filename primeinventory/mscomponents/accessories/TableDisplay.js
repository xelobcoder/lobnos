import { useMemo, useRef, useState } from 'react';
import { useTable, useGlobalFilter, useFilters, useSortBy, usePagination } from 'react-table';
import GlobalFilter from './GlobalFilter';
import Pagination from './pagination';
import { ViewColumn } from '@mui/icons-material';
import ExcelFilteringLike from './ExcelFilteringLike';
import ShowTableCount from '../operations/Laboratory/ShowCountTable';

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
	const [openFilter, setOpenFilter] = useState(false);
	const [excelTarget, setExcelTarget] = useState(null);
	const [uniqueValues, setUniqueValues] = useState([]);
	const [hiddenColumns, setHiddenColumns] = useState([]);
	const filterRef = useRef(null);
	const triggerRef = useRef(null);
	const [queryParams, setQueryParams] = useState({ count: 10, page: 1 })

	const handleClickOutside = (e) => {
		if (filterRef.current && !filterRef.current.contains(e.target)) {
			setOpenFilter(false);
		}
	};

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

	const toogleDownUp = () => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(86,37,217,1)">
			<path fill="none" d="M0 0h24v24H0z"></path>
			<path d="M19 3L23 8H20V20H18V8H15L19 3ZM14 18V20H3V18H14ZM14 11V13H3V11H14ZM12 4V6H3V4H12Z"></path>
		</svg>
	);

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
			setExcelTarget(null);
			return;
		}

		const appliedFilterResultSet = [...data].filter((item, index) => {
			return filterValue.includes(item[excelTarget]);
		})

		if (Array.isArray(appliedFilterResultSet) && appliedFilterResultSet.length > 0) {
			setFilteredData(appliedFilterResultSet);
			setExcelTarget(null);
			setOpenFilter(false);
		}
	}
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
											{toogleDownUp()}
										</span>
										{column.isMenu && <span className="mx-2 text-success">{FilterIcon(column)} </span>}
										{excelTarget == column.id &&
											<ExcelFilteringLike
												target={excelTarget}
												openFilter={openFilter}
												uniqueValues={uniqueValues}
												onApplyFilters={onApplyFilters}
												filterRef={filterRef}
												triggerRef={triggerRef}
											/>}
									</div>
								</div>
							</th>
						);
					})}
				</tr>
			);
		});
console.log(hiddenColumns)

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
					return !isNaN(columnValue) && (columnValue === filterValue || columnValue.toString().includes(filterValue));
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


	const hasColumnFiltering = column.some((item, index) => item.customFilterable == true)


	const hideTableColumns = (columnId) => {
		setHiddenColumns((prevHidden) =>
			prevHidden.includes(columnId)
				? prevHidden.filter((id) => id !== columnId) 
				: [...prevHidden, columnId] 
		);
	};


	if (filteredData.length === 0)
		return <div className="heightedBorder p-2 bg-secondary-subtle">No Data Provided</div>;

	return (
		<div className="card br-0 p-0 my-2">
			{filtering && (
				<div className="card-header my-0  d-flex justify-content-between">
					<div className="col-6 d-flex">
						<div className='col-3'>
							<ShowTableCount setQueryParams={setQueryParams} queryParams={queryParams} />
						</div>
						<div className='col-8 mt-1 mx-1'>
							<GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
						</div>
					</div>
					<div>
						<button className='btn br-0 text-sm pls-color' onClick={(ev) =>  {hideTableColumns()}}>Hide columns</button>
						<button title='clear off filter applied' className='btn border-secondary border-2 py-0 px-1' onClick={(ev) => { setFilteredData(data) }}>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(234,46,70,1)"><path fill="none" d="M0 0h24v24H0z"></path><path d="M6.92893 0.514648L21.0711 14.6568L19.6569 16.071L15.834 12.2486L15 13.4999V21.9999H9V13.4999L4 5.99993H3V3.99993L7.585 3.99965L5.51472 1.92886L6.92893 0.514648ZM9.585 5.99965L6.4037 5.99993L11 12.8944V19.9999H13V12.8944L14.392 10.8066L9.585 5.99965ZM21 3.99993V5.99993H20L18.085 8.87193L16.643 7.42893L17.5963 5.99993H15.213L13.213 3.99993H21Z"></path></svg>
						</button>
					</div>
				</div>
			)}
			<div className="card-body p-0 m-0" style={{ overflowX: 'auto' }}>
				<table {...props} {...getTableProps()} className='table '>
					<thead className='table-secondary'>{customHeaderGroup()}</thead >
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
			{/* <div className="card-footer d-flex py-2 justify-content-center">
				<Pagination />
			</div> */}
		</div>
	);
}
