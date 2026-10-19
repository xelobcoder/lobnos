"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { useTable, useGlobalFilter, useFilters, useSortBy } from "react-table";
import { registerTableSource } from "../../reports/tableSources";
import GlobalFilter from "./GlobalFilter";
import ShowTableDisplayCount from "./TableDisplayShowCount";
import TableLoading from "./TableLoading";
import style from "./PrimeTable.module.css";
import "../../../styles/prime-table.css";
import { ButtonGroup } from "react-bootstrap";
import { RiFilePdf2Line } from "@remixicon/react";

/** Plain rendering of the full export dataset with the table's own column renderers. */
function ExportRowsTable({ columns, data }) {
	const { headerGroups, rows, prepareRow } = useTable({ columns, data });
	const lastGroup = headerGroups[headerGroups.length - 1];
	return (
		<table>
			<thead>
				<tr>
					{lastGroup?.headers.map((col) => (
						<th key={col.id}>{col.render("Header")}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map((row) => {
					prepareRow(row);
					return (
						<tr key={row.id}>
							{row.cells.map((cell) => (
								<td key={cell.column.id}>{cell.render("Cell")}</td>
							))}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}

export default function PrimeTable({
	column,
	data,
	filtering = false,
	isExpoerted = false,
	pdfExport = false,
	pdfTitle = "",
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
	const [pdfBusy, setPdfBusy] = useState(false);
	const [exportRows, setExportRows] = useState(null);
	const tableWrapRef = useRef(null);
	const exportRootRef = useRef(null);
	const exportSourceRef = useRef(null);

	// Never fall back to navbar/sidebar headings: those hold the company name, which is already in the letterhead.
	const exportTitle = () => {
		if (pdfTitle) return pdfTitle.trim();
		const chrome = "nav, header, aside, footer, .navbar, .sidebar, [role='navigation'], .offcanvas, .modal";
		const heading = Array.from(document.querySelectorAll("[data-pdf-title], main h1, main h2, main h3, main h4, h1, h2, h3, h4")).find(
			(el) => !el.closest(chrome) && el.textContent?.trim()
		);
		if (heading) return heading.textContent.replace(/[^\p{L}\p{N}\s&()/'-]/gu, "").replace(/\s+/g, " ").trim();
		const segment = window.location.pathname.split("/").filter((s) => s && !/^\d+$/.test(s)).pop() || "report";
		return segment.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	};

	// Server-paginated tables export every page (not just the one on screen) by reusing the page's
	// own fetch handler, then rendering the rows offscreen with the same column renderers.
	exportSourceRef.current = async () => {
		const { tablesFromElement, fetchAllPages, EXPORT_MAX_ROWS } = await import("../../reports/reportPdf");
		if (!(serverSideFiltering && typeof handleSeverSideProcessing === "function")) {
			return { tables: tablesFromElement(tableWrapRef.current) };
		}
		let reportedTotal = null;
		try {
			const { rows: allRows, truncated } = await fetchAllPages(async (page, count) => {
				const response = await handleSeverSideProcessing({ page, count, ...urlparams });
				if (response?.error) throw new Error(typeof response.error === "string" ? response.error : "Unable to load report data");
				if (response?.total !== undefined && response?.total !== null) reportedTotal = Number(response.total);
				return Array.isArray(response?.result) ? response.result : [];
			});
			flushSync(() => setExportRows(allRows));
			const tables = exportRootRef.current ? tablesFromElement(exportRootRef.current) : [];
			const notes = [];
			if (truncated) notes.push(`Export limited to the first ${EXPORT_MAX_ROWS.toLocaleString()} records${reportedTotal ? ` of ${reportedTotal.toLocaleString()}` : ""}. Narrow the filters to export the rest.`);
			else if (reportedTotal && reportedTotal > allRows.length) notes.push(`${allRows.length.toLocaleString()} of ${reportedTotal.toLocaleString()} records were returned for export.`);
			else notes.push(`${allRows.length.toLocaleString()} record(s).`);
			return { tables, notes };
		} finally {
			setExportRows(null);
			// Some page handlers also store the rows they fetch; reload the page the user was viewing.
			await RunServerAction(queryParams.page, queryParams.count);
		}
	};

	useEffect(() => {
		if (!tableWrapRef.current) return;
		return registerTableSource(tableWrapRef.current, () => exportSourceRef.current());
	}, []);

	const exportPdf = async () => {
		if (pdfBusy || !tableWrapRef.current) return;
		setPdfBusy(true);
		try {
			const { exportReportPdf } = await import("../../reports/reportPdf");
			const { tables, notes } = await exportSourceRef.current();
			await exportReportPdf({ title: exportTitle(), notes, tables });
		} catch (error) {
			console.error("PDF export failed", error);
			alert("Unable to generate the PDF. Please try again.");
		} finally {
			setPdfBusy(false);
		}
	};

	const exportCsv = async () => {
		if (pdfBusy || !tableWrapRef.current) return;
		setPdfBusy(true);
		try {
			const { exportTablesCsv } = await import("../../reports/reportPdf");
			const { tables } = await exportSourceRef.current();
			exportTablesCsv(tables, exportTitle());
		} catch (error) {
			console.error("CSV export failed", error);
			alert("Unable to export the data. Please try again.");
		} finally {
			setPdfBusy(false);
		}
	};

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
	const hasControls =
		filtering ||
		isExpoerted ||
		pdfExport ||
		(serverSideFiltering && typeof handleSeverSideProcessing === "function");

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
						<th key={index} {...restProps} className={`${style.th} ${style.sortableHeader}`}>
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
			currentPage = value > 0 ? value : 1;
		}

		if (typeof value === "string" && ["Next", "Previous"].includes(value)) {
			const nextPage = value === "Next" ? currentPage + 1 : currentPage > 1 ? currentPage - 1 : 1;
			currentPage = nextPage;
		}
		setQueryParams({ ...queryParams, page: currentPage });
		await RunServerAction(currentPage, queryParams.count);
	};

	const getPaginationItems = () => {
		const current = queryParams.page || 1;
		const start = Math.max(1, current - 1);
		return [start, start + 1, start + 2].filter((item, index, arr) => item > 0 && arr.indexOf(item) === index);
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
		<div className={style.tableWrapper}>
			{hasControls && (
				<div className={style.controlBar}>
					<div className="d-flex align-items-center">
						{serverSideFiltering && typeof handleSeverSideProcessing === "function" && (
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
									onClick={exportCsv}
								>
									excel
								</button>
							</ButtonGroup>
						)}
						{(isExpoerted || pdfExport) && (
							<button
								type="button"
								className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
								disabled={pdfBusy}
								onClick={exportPdf}
								data-pdf-ignore
							>
								<RiFilePdf2Line size={16} /> {pdfBusy ? "Preparing…" : "Export PDF"}
							</button>
						)}
					</div>
				</div>
			)}

			<div className={style.tableViewport} ref={tableWrapRef}>
				<table
					className={`${style.table} ${style.tableCompact}`}

					// className={`${style.table} ${effectiveTheme !== "PrimeLaboratoryTableStyling" ? `prime-table-${effectiveTheme} prime-table-theme` : ""}`}
					{...getTableProps()}
				>
					<thead>{customHeaderGroup()}</thead>
					<RenderingTable getTableBodyProps={getTableBodyProps} />
				</table>
			</div>
			{exportRows &&
				typeof document !== "undefined" &&
				createPortal(
					<div ref={exportRootRef} aria-hidden="true" style={{ position: "absolute", left: -100000, top: 0, width: 1600, pointerEvents: "none" }}>
						<ExportRowsTable columns={column} data={exportRows} />
					</div>,
					document.body,
				)}
			{serverSideFiltering && typeof handleSeverSideProcessing === "function" && (
				<div className={style.paginationBar}>
					<div className={style.paginationMeta}>
						<span>Page {queryParams.page}</span>
						<span className={style.paginationSeparator} aria-hidden="true">/</span>
						<span>{filteredData.length || 0} items shown</span>
					</div>
					<nav className={style.paginationContainer} aria-label="Table pagination">
						<button
							type="button"
							onClick={() => handlePagination("Previous")}
							className={`${style.paginationBtn} ${style.paginationBtnNav}`}
							disabled={queryParams.page <= 1}
						>
							Previous
						</button>
						{getPaginationItems().map((item) => {
							const isActive = queryParams.page === item;
							return (
								<button
									type="button"
									onClick={() => handlePagination(item)}
									key={item}
									className={`${style.paginationBtn} ${isActive ? style.paginationBtnActive : ""}`}
									aria-current={isActive ? "page" : undefined}
								>
									{item}
								</button>
							);
						})}
						<button
							type="button"
							onClick={() => handlePagination("Next")}
							className={`${style.paginationBtn} ${style.paginationBtnNav}`}
							disabled={filteredData.length === 0}
						>
							Next
						</button>
					</nav>
				</div>
			)}
		</div>
	);
}
