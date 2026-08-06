"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ButtonGroup } from "react-bootstrap";
import {
     BarChart, Bar, LineChart, Line, AreaChart, Area,
     XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
     aggregationFn_mean,
     aggregationFn_sum,
     columnFacetingFeature,
     columnFilteringFeature,
     columnGroupingFeature,
     columnOrderingFeature,
     columnPinningFeature,
     columnResizingFeature,
     columnSizingFeature,
     columnVisibilityFeature,
     createExpandedRowModel,
     createFacetedMinMaxValues,
     createFacetedRowModel,
     createFacetedUniqueValues,
     createFilteredRowModel,
     createGroupedRowModel,
     createPaginatedRowModel,
     createSortedRowModel,
     filterFn_includesString,
     globalFilteringFeature,
     rowAggregationFeature,
     rowExpandingFeature,
     rowPaginationFeature,
     rowPinningFeature,
     rowSelectionFeature,
     rowSortingFeature,
     sortFn_alphanumeric,
     tableFeatures,
     useTable,
     type Column,
     type ColumnDef,
     type ColumnFiltersState,
     type ColumnOrderState,
     type ColumnPinningState,
     type ColumnSizingState,
     type ExpandedState,
     type GroupingState,
     type PaginationState,
     type Row,
     type RowPinningState,
     type RowSelectionState,
     type SortingState,
     type ColumnVisibilityState,
} from "@tanstack/react-table";
import GlobalFilter from "./GlobalFilter";
import TableLoading from "./TableLoading";
import v2Style from "./PrimeTableV2.module.css";

type AnyRecord = Record<string, unknown>;
type SortDirection = "ASC" | "DESC";

interface TableColumn {
     Header?: string;
     accessor?: string;
     id?: string;
     Cell?: (args: { value: unknown; row: { original: AnyRecord } }) => ReactNode;
     [key: string]: unknown;
}

type RowStylingType = "zebra" | "status" | "custom" | "none";

interface RowStylingConfig {
     type?: RowStylingType;
     statusField?: string;
     getRowClassName?: (row: AnyRecord, index: number) => string;
     getRowStyle?: (row: AnyRecord, index: number) => Record<string, unknown>;
}

interface ServerSideResponse {
     result?: unknown[];
     error?: unknown;
     totalCount?: number;
     totalPages?: number;
}

type ServerSideHandler = (
     params: Record<string, unknown>,
) => Promise<ServerSideResponse | void> | ServerSideResponse | void;

interface PrimeTableV2Props {
     column: TableColumn[];
     data?: unknown[];
     filtering?: boolean;
     isExpoerted?: boolean;
     serverSideFiltering?: boolean;
     handleSeverSideProcessing?: ServerSideHandler;
     urlparams?: Record<string, unknown>;
     theme?: string | null;
     rowStyling?: RowStylingConfig | null;
     tableId?: string;
     enableColumnVisibility?: boolean;
     /** When true, a chart toggle button is added to the toolbar */
     showChartView?: boolean;
}

const gridFeatures = tableFeatures({
     columnFacetingFeature,
     columnFilteringFeature,
     columnGroupingFeature,
     columnOrderingFeature,
     columnPinningFeature,
     columnResizingFeature,
     columnSizingFeature,
     columnVisibilityFeature,
     globalFilteringFeature,
     rowAggregationFeature,
     rowExpandingFeature,
     rowPaginationFeature,
     rowPinningFeature,
     rowSelectionFeature,
     rowSortingFeature,
     filteredRowModel: createFilteredRowModel(),
     sortedRowModel: createSortedRowModel(),
     paginatedRowModel: createPaginatedRowModel(),
     expandedRowModel: createExpandedRowModel(),
     groupedRowModel: createGroupedRowModel(),
     facetedRowModel: createFacetedRowModel(),
     facetedMinMaxValues: createFacetedMinMaxValues(),
     facetedUniqueValues: createFacetedUniqueValues(),
     filterFns: {
          includesString: filterFn_includesString,
     },
     sortFns: {
          alphanumeric: sortFn_alphanumeric,
     },
     aggregationFns: {
          sum: aggregationFn_sum,
          mean: aggregationFn_mean,
     },
});

function getColumnId(col: TableColumn, index: number): string {
     const accessorId = typeof col.accessor === "string" ? col.accessor : "";
     const headerId = typeof col.Header === "string" ? col.Header.toLowerCase().replace(/\s+/g, "-") : "";
     return String(col.id || accessorId || headerId || `col-${index}`);
}

function renderLegacyCell(col: TableColumn, value: unknown, row: AnyRecord): ReactNode {
     if (typeof col.Cell === "function") {
          return col.Cell({ value, row: { original: row } });
     }

     if (value == null) return "";
     return String(value);
}

function toSortDirection(sorting: SortingState): SortDirection {
     if (!sorting[0]) return "DESC";
     return sorting[0].desc ? "DESC" : "ASC";
}

function toSafeNumber(value: string | null, fallback: number): number {
     if (!value) return fallback;
     const parsed = Number(value);
     return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getHeaderText<TData extends AnyRecord>(column: Column<typeof gridFeatures, TData>): string {
     const value = column.columnDef.header;
     if (typeof value === "string") return value;
     return column.id;
}

export default function PrimeTableV2({
     column,
     data,
     filtering = false,
     isExpoerted = false,
     serverSideFiltering = false,
     handleSeverSideProcessing,
     urlparams = {},
     theme = null,
     rowStyling = null,
     tableId = "prime-table-v2",
     enableColumnVisibility = true,
     showChartView = true,
}: PrimeTableV2Props) {
     const initialData = Array.isArray(data) ? (data as AnyRecord[]) : [];
     const [rowsData, setRowsData] = useState<AnyRecord[]>(initialData);
     const [isLoading, setIsLoading] = useState(false);
     const [errorMessage, setErrorMessage] = useState("");
     const [showColumnsPanel, setShowColumnsPanel] = useState(false);
     const [chartVisible, setChartVisible] = useState(false);
     const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");
     const density = "compact";
     const [stickyHeader, setStickyHeader] = useState(true);
     const [isFullscreen, setIsFullscreen] = useState(false);
     const [lastSyncedAt, setLastSyncedAt] = useState("");
     const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
     const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

     const [globalFilter, setGlobalFilter] = useState("");
     const [sorting, setSorting] = useState<SortingState>([]);
     const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
     const [grouping, setGrouping] = useState<GroupingState>([]);
     const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
     const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
     const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({ start: [], end: [] });
     const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
     const [expanded, setExpanded] = useState<ExpandedState>({});
     const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
     const [rowPinning, setRowPinning] = useState<RowPinningState>({ top: [], bottom: [] });
     const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
     const [totalCount, setTotalCount] = useState<number | null>(null);
     const [totalPages, setTotalPages] = useState<number | null>(null);
     // true only after server confirms current page returned 0 rows
     const [serverReachedEnd, setServerReachedEnd] = useState(false);
     // true once data has been loaded (either from props or from server) — used to
     // keep Next/Last enabled even while a background refresh is running
     const [hasEverLoaded, setHasEverLoaded] = useState(initialData.length > 0);

     const wrapperRef = useRef<HTMLDivElement | null>(null);
     // monotonic counter — any fetch result with a stale id is discarded
     const fetchIdRef = useRef(0);
     const effectiveTheme = theme || "PrimeLaboratoryTableStyling";

     const columnsWithIds = useMemo(() => {
          return (Array.isArray(column) ? column : []).map((col, index) => ({
               ...col,
               id: getColumnId(col, index),
          }));
     }, [column]);

     const tanstackColumns = useMemo<ColumnDef<typeof gridFeatures, AnyRecord>[]>(() => {
          const selectColumn: ColumnDef<typeof gridFeatures, AnyRecord> = {
               id: "__select",
               header: ({ table }) => {
                    return (
                         <input
                              type="checkbox"
                              className="form-check-input"
                              checked={table.getIsAllPageRowsSelected()}
                              onChange={table.getToggleAllPageRowsSelectedHandler()}
                              aria-label="Select rows"
                         />
                    );
               },
               cell: ({ row }) => (
                    <input
                         type="checkbox"
                         className="form-check-input"
                         checked={row.getIsSelected()}
                         disabled={!row.getCanSelect()}
                         onChange={row.getToggleSelectedHandler()}
                         aria-label="Select row"
                    />
               ),
               enableSorting: false,
               enableColumnFilter: false,
               enableGrouping: false,
               enablePinning: true,
               enableResizing: false,
               size: 44,
          };

          const mapped = columnsWithIds.map((col): ColumnDef<typeof gridFeatures, AnyRecord> => {
               const hasAccessor = typeof col.accessor === "string" && col.accessor.length > 0;

               if (hasAccessor) {
                    return {
                         id: String(col.id),
                         accessorKey: col.accessor,
                         header: () => col.Header || col.id || "Column",
                         cell: ({ getValue, row }) => renderLegacyCell(col, getValue(), row.original),
                         sortFn: "alphanumeric",
                         filterFn: "includesString",
                         aggregationFn: "sum",
                         enableColumnFilter: true,
                         enableSorting: true,
                         enableGrouping: true,
                         enablePinning: true,
                         enableResizing: true,
                    };
               }

               return {
                    id: String(col.id),
                    header: () => col.Header || col.id || "Column",
                    cell: ({ row }) => renderLegacyCell(col, undefined, row.original),
                    enableColumnFilter: false,
                    enableSorting: false,
                    enableGrouping: false,
                    enablePinning: true,
                    enableResizing: true,
               };
          });

          return [selectColumn, ...mapped];
     }, [columnsWithIds]);

     const table = useTable(
          {
               features: gridFeatures,
               columns: tanstackColumns,
               data: rowsData,
               getRowId: (row, index) => String(row.patientid ?? row.id ?? index),
               state: {
                    globalFilter,
                    sorting,
                    columnFilters,
                    grouping,
                    columnOrder,
                    columnVisibility,
                    columnPinning,
                    columnSizing,
                    expanded,
                    pagination,
                    rowPinning,
                    rowSelection,
               },
               onGlobalFilterChange: setGlobalFilter,
               onSortingChange: setSorting,
               onColumnFiltersChange: setColumnFilters,
               onGroupingChange: setGrouping,
               onColumnOrderChange: setColumnOrder,
               onColumnVisibilityChange: setColumnVisibility,
               onColumnPinningChange: setColumnPinning,
               onColumnSizingChange: setColumnSizing,
               onExpandedChange: setExpanded,
               onPaginationChange: setPagination,
               onRowPinningChange: setRowPinning,
               onRowSelectionChange: setRowSelection,
               manualPagination: serverSideFiltering,
               manualSorting: false,
               manualFiltering: false,
               pageCount: totalPages ?? -1,
               enableRowSelection: true,
               enableMultiRowSelection: true,
               enableSubRowSelection: true,
               columnResizeMode: "onChange",
               globalFilterFn: "includesString",
          },
          (state) => ({
               pagination: state.pagination,
               rowSelection: state.rowSelection,
               sorting: state.sorting,
               globalFilter: state.globalFilter,
          }),
     );

     const visibleColumns = table.getVisibleLeafColumns();
     const visibleDataColumns = visibleColumns.filter((col) => col.id !== "__select");
     const totalRecordsToShow = totalCount ?? rowsData.length;

     const updateUrlFromState = () => {
          if (typeof window === "undefined") return;
          const params = new URLSearchParams(window.location.search);
          params.set("page", String(pagination.pageIndex + 1));
          params.set("count", String(pagination.pageSize));
          params.set("sortby", toSortDirection(sorting));
          if (globalFilter) {
               params.set("q", globalFilter);
          } else {
               params.delete("q");
          }
          const nextUrl = `${window.location.pathname}?${params.toString()}`;
          window.history.replaceState(null, "", nextUrl);
     };

     const runServerSide = async () => {
          if (!serverSideFiltering || typeof handleSeverSideProcessing !== "function") return;

          const currentPage = pagination.pageIndex + 1;
          const currentCount = pagination.pageSize;
          const sortby = toSortDirection(sorting);
          const myFetchId = ++fetchIdRef.current;

          setIsLoading(true);
          setErrorMessage("");
          try {
               const processedResponse = await Promise.resolve(
                    handleSeverSideProcessing({
                         page: currentPage,
                         count: currentCount,
                         sortby,
                         globalFilter,
                         columnFilters,
                         grouping,
                         ...urlparams,
                    }),
               );

               // discard if a newer fetch has already started
               if (myFetchId !== fetchIdRef.current) return;
               if (!processedResponse) return;
               const { result, error, totalCount: nextTotalCount, totalPages: nextTotalPages } = processedResponse;
               if (error) {
                    setErrorMessage("Unable to load data. Please retry.");
                    return;
               }

               const nextRows = Array.isArray(result) ? (result as AnyRecord[]) : [];
               setRowsData(nextRows);
               setTotalCount(typeof nextTotalCount === "number" ? nextTotalCount : null);
               setTotalPages(typeof nextTotalPages === "number" ? nextTotalPages : null);
               setLastSyncedAt(new Date().toLocaleTimeString());
               setServerReachedEnd(nextRows.length === 0 && pagination.pageIndex > 0);
               setHasEverLoaded(true);
          } catch (error) {
               if (myFetchId !== fetchIdRef.current) return;
               console.error("PrimeTableV2 server processing failed", error);
               setErrorMessage("Unable to load data. Please retry.");
          } finally {
               if (myFetchId === fetchIdRef.current) setIsLoading(false);
          }
     };

     const toggleFullscreen = async () => {
          if (typeof document === "undefined" || !wrapperRef.current) return;
          if (!document.fullscreenElement) {
               await wrapperRef.current.requestFullscreen();
               return;
          }
          await document.exitFullscreen();
     };

     const moveColumn = (columnId: string, direction: "left" | "right") => {
          const order = table.getAllLeafColumns().map((leaf) => leaf.id);
          const index = order.indexOf(columnId);
          if (index < 0) return;

          const targetIndex = direction === "left" ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= order.length) return;

          const next = [...order];
          const [removed] = next.splice(index, 1);
          next.splice(targetIndex, 0, removed);
          setColumnOrder(next);
     };

     const reorderColumn = (sourceId: string, targetId: string) => {
          if (!sourceId || !targetId || sourceId === targetId) return;

          const order = table.getAllLeafColumns().map((leaf) => leaf.id);
          const sourceIndex = order.indexOf(sourceId);
          const targetIndex = order.indexOf(targetId);
          if (sourceIndex < 0 || targetIndex < 0) return;

          const next = [...order];
          const [removed] = next.splice(sourceIndex, 1);
          next.splice(targetIndex, 0, removed);
          setColumnOrder(next);
     };

     const onHeaderDragStart = (columnId: string) => {
          if (columnId === "__select") return;
          setDraggedColumnId(columnId);
          setDragOverColumnId(columnId);
     };

     const onHeaderDrop = (columnId: string) => {
          if (!draggedColumnId || columnId === "__select") {
               setDraggedColumnId(null);
               setDragOverColumnId(null);
               return;
          }

          reorderColumn(draggedColumnId, columnId);
          setDraggedColumnId(null);
          setDragOverColumnId(null);
     };

     const onHeaderDragEnd = () => {
          setDraggedColumnId(null);
          setDragOverColumnId(null);
     };

     const getPinnedStyles = (col: Column<typeof gridFeatures, AnyRecord>): CSSProperties => {
          const pinned = col.getIsPinned?.();
          if (!pinned) return {};

          const isStart = pinned === "start";
          const offset = isStart ? col.getStart("start") : col.getAfter("end");

          return {
               position: "sticky",
               [isStart ? "left" : "right"]: `${offset}px`,
               zIndex: 3,
               background: "var(--pt-cell-bg)",
               boxShadow: isStart ? "inset -1px 0 0 #d5d9de" : "inset 1px 0 0 #d5d9de",
          };
     };

     const pinSelectedRows = (position: "top" | "bottom") => {
          table.getSelectedRowModel().rows.forEach((row) => row.pin(position));
     };

     const clearPinnedRows = () => {
          table.getTopRows().forEach((row) => row.pin(false));
          table.getBottomRows().forEach((row) => row.pin(false));
     };

     const expandAllRows = () => {
          table.toggleAllRowsExpanded(true);
     };

     const collapseAllRows = () => {
          table.toggleAllRowsExpanded(false);
     };

     const autoSizeVisibleColumns = () => {
          const sampleRows = table.getRowModel().rows.slice(0, 50);
          const nextSizing: ColumnSizingState = {};

          visibleColumns.forEach((col) => {
               const headerWidth = getHeaderText(col).length * 9;
               const maxCellWidth = sampleRows.reduce((maxWidth, row) => {
                    const raw = row.getValue(col.id);
                    const text = raw == null ? "" : String(raw);
                    const width = text.length * 8;
                    return Math.max(maxWidth, width);
               }, 40);

               nextSizing[col.id] = Math.max(54, Math.min(420, Math.max(headerWidth, maxCellWidth) + 24));
          });

          setColumnSizing(nextSizing);
     };

     const exportRowsToCsv = () => {
          const modelRows = table.getRowModel().rows;
          if (modelRows.length === 0 || visibleDataColumns.length === 0) return;

          const headerLine = visibleDataColumns
               .map((col) => `"${getHeaderText(col).replace(/"/g, '""')}"`)
               .join(",");

          const bodyLines = modelRows.map((row) => {
               return visibleDataColumns
                    .map((col) => {
                         const raw = row.getValue(col.id);
                         const textValue = raw == null ? "" : String(raw);
                         return `"${textValue.replace(/"/g, '""')}"`;
                    })
                    .join(",");
          });

          const csv = [headerLine, ...bodyLines].join("\n");
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${tableId}-${new Date().toISOString().slice(0, 10)}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
     };

     const getRowStyling = (row: Row<typeof gridFeatures, AnyRecord>, index: number) => {
          let className = v2Style.tableRow;
          let inlineStyles: Record<string, unknown> = {};

          if (!rowStyling || rowStyling.type === "zebra") {
               className += ` ${index % 2 === 0 ? v2Style.evenRow : v2Style.oddRow}`;
          } else if (rowStyling.type === "status") {
               const statusValue = rowStyling.statusField ? row.original?.[rowStyling.statusField] : undefined;
               if (statusValue === "paid") className += ` ${v2Style.rowPaid}`;
               if (statusValue === "unpaid") className += ` ${v2Style.rowUnpaid}`;
          } else if (rowStyling.type === "custom") {
               if (typeof rowStyling.getRowClassName === "function") {
                    const customClass = rowStyling.getRowClassName(row.original, index);
                    if (customClass) className += ` ${customClass}`;
               }
               if (typeof rowStyling.getRowStyle === "function") {
                    inlineStyles = rowStyling.getRowStyle(row.original, index) || {};
               }
          }

          return { className, inlineStyles };
     };

     const renderColumnFilter = (col: Column<typeof gridFeatures, AnyRecord>) => {
          if (!col.getCanFilter()) return null;

          const filterValue = (col.getFilterValue() as string) ?? "";
          const uniqueValues = Array.from(col.getFacetedUniqueValues().keys()).slice(0, 25);

          if (uniqueValues.length > 1 && uniqueValues.length <= 20) {
               return (
                    <select
                         className="form-select form-select-sm"
                         value={filterValue}
                         onChange={(ev) => col.setFilterValue(ev.target.value || undefined)}
                    >
                         <option value="">All</option>
                         {uniqueValues.map((item) => (
                              <option key={String(item)} value={String(item)}>{String(item)}</option>
                         ))}
                    </select>
               );
          }

          return (
               <input
                    type="text"
                    className="form-control form-control-sm"
                    value={filterValue}
                    onChange={(ev) => col.setFilterValue(ev.target.value || undefined)}
                    placeholder={`Filter ${getHeaderText(col)}`}
               />
          );
     };

     const clearAllFilters = () => {
          setGlobalFilter("");
          setColumnFilters([]);
     };

     useEffect(() => {
          const next = Array.isArray(data) ? (data as AnyRecord[]) : [];
          setRowsData(next);
     }, [data]);

     useEffect(() => {
          if (columnOrder.length > 0) return;
          setColumnOrder(tanstackColumns.map((col) => String(col.id)));
     }, [columnOrder.length, tanstackColumns]);

     useEffect(() => {
          if (typeof document === "undefined") return;
          const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
          document.addEventListener("fullscreenchange", onFullscreenChange);
          return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
     }, []);

     useEffect(() => {
          if (!serverSideFiltering) return;
          setServerReachedEnd(false);
          void runServerSide();
          updateUrlFromState();
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [pagination.pageIndex, pagination.pageSize]);

     useEffect(() => {
          if (typeof window === "undefined") return;
          const params = new URLSearchParams(window.location.search);
          const page = toSafeNumber(params.get("page"), 1);
          const count = toSafeNumber(params.get("count"), 20);
          const q = params.get("q") || "";
          const sortby = params.get("sortby");

          setPagination((prev) => ({ ...prev, pageIndex: page - 1, pageSize: count }));
          setGlobalFilter(q);
          if (sortby === "ASC") {
               const firstSortable = columnsWithIds.find((c) => typeof c.accessor === "string" && c.accessor.length > 0);
               if (firstSortable) {
                    setSorting([{ id: String(firstSortable.id), desc: false }]);
               }
          }
          if (sortby === "DESC") {
               const firstSortable = columnsWithIds.find((c) => typeof c.accessor === "string" && c.accessor.length > 0);
               if (firstSortable) {
                    setSorting([{ id: String(firstSortable.id), desc: true }]);
               }
          }
          // Hydrate once on mount.
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);

     const noDataNode = (
          <tbody>
               <tr>
                    <td colSpan={Math.max(1, visibleColumns.length)} className={v2Style.noDataCell}>
                         <div className={v2Style.noDataWrapper}>
                              <div className={v2Style.noDataText}>No Data Available</div>
                         </div>
                    </td>
               </tr>
          </tbody>
     );

     // --- Chart aggregation ------------------------------------------------
     const chartColors = ["oklch(0.646 0.222 41.116)", "#2563eb", "#ea580c", "#16a34a", "#7c3aed", "#0891b2"];

     const chartData = useMemo(() => {
          if (!showChartView || !chartVisible || rowsData.length === 0) return [];

          // Determine the grouping key: first grouped column, or first string-typed column
          const numericCols = visibleDataColumns.filter((col) => {
               const sample = rowsData[0]?.[col.id];
               return typeof sample === "number" || (typeof sample === "string" && !isNaN(Number(sample)) && sample.trim() !== "");
          });

          const categoryCols = visibleDataColumns.filter((col) => {
               const sample = rowsData[0]?.[col.id];
               return typeof sample === "string" && isNaN(Number(sample));
          });

          const groupKey = grouping[0] ?? categoryCols[0]?.id;
          if (!groupKey || numericCols.length === 0) return [];

          const buckets: Record<string, Record<string, number>> = {};
          rowsData.forEach((row) => {
               const key = String(row[groupKey] ?? "—");
               if (!buckets[key]) buckets[key] = {};
               numericCols.forEach((col) => {
                    buckets[key][col.id] = (buckets[key][col.id] ?? 0) + Number(row[col.id] ?? 0);
               });
          });

          return Object.entries(buckets).map(([name, values]) => ({ name, ...values }));
     }, [showChartView, chartVisible, rowsData, grouping, visibleDataColumns]);

     const chartNumericKeys = useMemo(() => {
          if (chartData.length === 0) return [];
          const first = chartData[0];
          return Object.keys(first).filter((k) => k !== "name");
     }, [chartData]);

     const renderChart = () => {
          if (chartData.length === 0) {
               return (
                    <div className={v2Style.chartEmpty}>
                         Add at least one numeric column and one text column (or use the Group By feature) to generate a chart.
                    </div>
               );
          }
          const commonProps = { data: chartData, margin: { top: 4, right: 16, left: 16, bottom: 32 } };
          const xAxis = <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={50} />;
          const yAxis = <YAxis tick={{ fontSize: 11 }} width={60} />;
          const grid = <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />;
          const tip = <Tooltip contentStyle={{ fontSize: "0.8rem" }} />;
          const legend = <Legend wrapperStyle={{ fontSize: "0.8rem" }} />;

          if (chartType === "bar") {
               return (
                    <BarChart {...commonProps}>
                         {grid}{xAxis}{yAxis}{tip}{legend}
                         {chartNumericKeys.map((key, i) => (
                              <Bar key={key} dataKey={key} stackId="a" fill={chartColors[i % chartColors.length]} radius={i === chartNumericKeys.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
                         ))}
                    </BarChart>
               );
          }
          if (chartType === "line") {
               return (
                    <LineChart {...commonProps}>
                         {grid}{xAxis}{yAxis}{tip}{legend}
                         {chartNumericKeys.map((key, i) => (
                              <Line key={key} type="monotone" dataKey={key} stroke={chartColors[i % chartColors.length]} strokeWidth={2} dot={{ r: 3 }} />
                         ))}
                    </LineChart>
               );
          }
          return (
               <AreaChart {...commonProps}>
                    <defs>
                         {chartNumericKeys.map((key, i) => (
                              <linearGradient key={key} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0.5} />
                                   <stop offset="95%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0.05} />
                              </linearGradient>
                         ))}
                    </defs>
                    {grid}{xAxis}{yAxis}{tip}{legend}
                    {chartNumericKeys.map((key, i) => (
                         <Area key={key} type="monotone" dataKey={key} stackId="a" stroke={chartColors[i % chartColors.length]} fill={`url(#grad-${i})`} strokeWidth={2} />
                    ))}
               </AreaChart>
          );
     };
     // --- End chart ---------------------------------------------------------
     const hasKnownPageCount = typeof totalPages === "number" && totalPages > 0;
     const canGoPrevious = pagination.pageIndex > 0;
     const canGoNext = hasKnownPageCount
          ? pagination.pageIndex + 1 < totalPages
          : serverSideFiltering
               ? !serverReachedEnd
               : table.getCanNextPage();
     // Only show loading-disabled state before first data arrives (blank page).
     // Once data has loaded at least once, keep Next/Last visually active while
     // background refreshes run so Strict Mode double-invocation doesn't freeze the UI.
     const isInitialLoading = isLoading && !hasEverLoaded;

     const goToFirstPage = () => {
          if (!canGoPrevious || isLoading) return;
          setServerReachedEnd(false);
          if (serverSideFiltering) {
               setPagination((prev) => ({ ...prev, pageIndex: 0 }));
               return;
          }
          table.firstPage();
     };

     const goToPreviousPage = () => {
          if (!canGoPrevious || isLoading) return;
          setServerReachedEnd(false);
          if (serverSideFiltering) {
               setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }));
               return;
          }
          table.previousPage();
     };

     const goToNextPage = () => {
          if (!canGoNext) return;

          if (serverSideFiltering) {
               if (hasKnownPageCount) {
                    setPagination((prev) => ({
                         ...prev,
                         pageIndex: Math.min((totalPages ?? 1) - 1, prev.pageIndex + 1),
                    }));
                    return;
               }

               setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
               return;
          }

          table.nextPage();
     };

     const goToLastPage = () => {
          if (!canGoNext) return;

          if (serverSideFiltering && !hasKnownPageCount) {
               setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
               return;
          }

          if (hasKnownPageCount) {
               table.lastPage();
               return;
          }
          table.nextPage();
     };

     return (
          <div ref={wrapperRef} className={`${v2Style.tableWrapper} ${isFullscreen ? v2Style.fullscreen : ""}`} data-table-theme={effectiveTheme}>
               <div className={v2Style.topBar}>
                    <div className={v2Style.topBarTitleGroup}>
                         <h6 className={v2Style.topBarTitle}>Enterprise Grid V9</h6>
                         <div className={v2Style.metaRow}>
                              <table.Subscribe selector={(s) => Object.keys(s.rowSelection || {}).length}>
                                   {(selectedCount) => <span className={v2Style.metaChip}>Selected: {selectedCount}</span>}
                              </table.Subscribe>
                              <table.Subscribe selector={(s) => (s.pagination?.pageIndex ?? 0) + 1}>
                                   {(page) => <span className={v2Style.metaChip}>Page: {page}</span>}
                              </table.Subscribe>
                              <span className={v2Style.metaChip}>Records: {totalRecordsToShow || 0}</span>
                              <span className={v2Style.metaChip}>Sort: {toSortDirection(sorting)}</span>
                              <span className={v2Style.metaChip}>Density: {density}</span>
                              <span className={v2Style.metaChip}>Pinned Rows: {table.getTopRows().length + table.getBottomRows().length}</span>
                              {lastSyncedAt && <span className={v2Style.metaChip}>Last Sync: {lastSyncedAt}</span>}
                         </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                         <label className={v2Style.toggleInline}>
                              <span>Rows</span>
                              <select
                                   className="form-select form-select-sm"
                                   value={pagination.pageSize}
                                   onChange={(ev) => table.setPageSize(Number(ev.target.value))}
                              >
                                   {[10, 20, 30, 50, 100].map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                   ))}
                              </select>
                         </label>
                         <button type="button" className="btn btn-sm btn-outline-primary" onClick={autoSizeVisibleColumns}>Auto Size</button>
                         <button type="button" className="btn btn-sm btn-outline-primary" onClick={expandAllRows}>Expand All</button>
                         <button type="button" className="btn btn-sm btn-outline-primary" onClick={collapseAllRows}>Collapse All</button>
                         <button type="button" className="btn btn-sm btn-outline-primary" onClick={runServerSide} disabled={!serverSideFiltering || isLoading}>Refresh</button>
                         {showChartView && (
                              <button type="button" className={`btn btn-sm ${chartVisible ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setChartVisible((v) => !v)}>
                                   {chartVisible ? "Hide Chart" : "Show Chart"}
                              </button>
                         )}
                         <button type="button" className="btn btn-sm btn-outline-primary" onClick={toggleFullscreen}>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</button>
                    </div>
               </div>

               {grouping.length > 0 && (
                    <div className={v2Style.groupingBar}>
                         <span className={v2Style.groupingLabel}>Grouped By</span>
                         <div className={v2Style.groupingChips}>
                              {grouping.map((groupId) => (
                                   <button
                                        key={groupId}
                                        type="button"
                                        className={v2Style.groupingChip}
                                        onClick={() => setGrouping((prev) => prev.filter((id) => id !== groupId))}
                                   >
                                        {groupId} x
                                   </button>
                              ))}
                         </div>
                    </div>
               )}

               <div className={v2Style.controlBar}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                         {filtering && (
                              <div className={v2Style.searchSlot}>
                                   <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                              </div>
                         )}

                         {filtering && (
                              <button
                                   type="button"
                                   className="btn btn-sm btn-outline-secondary"
                                   onClick={clearAllFilters}
                                   disabled={!globalFilter && columnFilters.length === 0}
                              >
                                   Clear Filters
                              </button>
                         )}

                         <label className={v2Style.toggleInline}>
                              <input
                                   type="checkbox"
                                   className="form-check-input"
                                   checked={stickyHeader}
                                   onChange={(ev) => setStickyHeader(ev.target.checked)}
                              />
                              <span>Sticky Header</span>
                         </label>

                         {enableColumnVisibility && (
                              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setShowColumnsPanel((prev) => !prev)}>
                                   {showColumnsPanel ? "Hide Panel" : "Columns Panel"}
                              </button>
                         )}

                         <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => pinSelectedRows("top")} disabled={Object.keys(rowSelection).length === 0}>Pin Selected Top</button>
                         <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => pinSelectedRows("bottom")} disabled={Object.keys(rowSelection).length === 0}>Pin Selected Bottom</button>
                         <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearPinnedRows}>Clear Pinning</button>
                    </div>

                    {isExpoerted && (
                         <ButtonGroup className="d-flex justify-content-end" aria-label="Export options" size="sm">
                              <button type="button" className="btn btn-sm btn-outline-primary" onClick={exportRowsToCsv}>CSV</button>
                              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>Print</button>
                         </ButtonGroup>
                    )}
               </div>

               <div className={v2Style.tableViewport}>
                    <table className={`${v2Style.table} ${density === "compact" ? v2Style.tableCompact : ""}`}>
                         <thead className={stickyHeader ? v2Style.stickyHeader : ""}>
                              {table.getHeaderGroups().map((headerGroup) => (
                                   <tr key={headerGroup.id} className={v2Style.headerRow}>
                                        {headerGroup.headers.map((header) => {
                                             if (header.isPlaceholder) {
                                                  return <th key={header.id} className={v2Style.th} />;
                                             }
                                             const canSort = header.column.getCanSort();
                                             const sortState = header.column.getIsSorted();
                                             const pinnedStyles = getPinnedStyles(header.column);
                                             const isDraggable = header.column.id !== "__select";
                                             const isDragging = draggedColumnId === header.column.id;
                                             const isDragOver = dragOverColumnId === header.column.id && draggedColumnId !== header.column.id;
                                             return (
                                                  <th
                                                       key={header.id}
                                                       className={`${v2Style.th} ${canSort ? v2Style.sortableHeader : ""} ${isDraggable ? v2Style.draggableHeader : ""} ${isDragging ? v2Style.draggingHeader : ""} ${isDragOver ? v2Style.dragOverHeader : ""}`}
                                                       style={{ width: header.getSize(), ...pinnedStyles }}
                                                       draggable={isDraggable}
                                                       onDragStart={() => onHeaderDragStart(header.column.id)}
                                                       onDragEnter={() => {
                                                            if (!isDraggable) return;
                                                            setDragOverColumnId(header.column.id);
                                                       }}
                                                       onDragOver={(ev) => {
                                                            if (!isDraggable) return;
                                                            ev.preventDefault();
                                                            setDragOverColumnId(header.column.id);
                                                       }}
                                                       onDrop={() => onHeaderDrop(header.column.id)}
                                                       onDragEnd={onHeaderDragEnd}
                                                  >
                                                       <div className={v2Style.headerCellWrap}>
                                                            <button
                                                                 type="button"
                                                                 className={v2Style.headerButton}
                                                                 onClick={draggedColumnId ? undefined : canSort ? header.column.getToggleSortingHandler() : undefined}
                                                            >
                                                                 <table.FlexRender header={header} />
                                                                 <span className={v2Style.sortBadge}>{sortState === "asc" ? "ASC" : sortState === "desc" ? "DESC" : ""}</span>
                                                            </button>
                                                            {header.column.getCanResize() && (
                                                                 <div
                                                                      className={v2Style.resizeHandle}
                                                                      onDoubleClick={() => header.column.resetSize()}
                                                                      onMouseDown={header.getResizeHandler()}
                                                                      onTouchStart={header.getResizeHandler()}
                                                                 />
                                                            )}
                                                       </div>
                                                  </th>
                                             );
                                        })}
                                   </tr>
                              ))}

                              {filtering && (
                                   <tr className={v2Style.filterRow}>
                                        {table.getHeaderGroups()[table.getHeaderGroups().length - 1]?.headers.map((header) => {
                                             const pinnedStyles = header.isPlaceholder ? {} : getPinnedStyles(header.column);
                                             return (
                                                  <th key={`filter-${header.id}`} className={v2Style.filterCell} style={pinnedStyles}>
                                                       {header.isPlaceholder ? null : renderColumnFilter(header.column)}
                                                  </th>
                                             );
                                        })}
                                   </tr>
                              )}
                         </thead>

                         {isLoading && rowsData.length === 0 ? (
                              <TableLoading span={Math.max(1, visibleColumns.length)} />
                         ) : errorMessage && rowsData.length === 0 ? (
                              <tbody>
                                   <tr>
                                        <td colSpan={Math.max(1, visibleColumns.length)} className={v2Style.noDataCell}>
                                             <div className={v2Style.noDataWrapper}>
                                                  <div className={v2Style.noDataText}>{errorMessage}</div>
                                             </div>
                                        </td>
                                   </tr>
                              </tbody>
                         ) : table.getRowModel().rows.length === 0 ? (
                              noDataNode
                         ) : (
                              <tbody>
                                   {table.getTopRows().map((row, index) => {
                                        const { className, inlineStyles } = getRowStyling(row, index);
                                        return (
                                             <tr key={`top-${row.id}`} className={`${className} ${v2Style.pinnedRow}`} style={inlineStyles as never}>
                                                  {row.getVisibleCells().map((cell) => (
                                                       <td key={cell.id} className={v2Style.td} style={getPinnedStyles(cell.column)}>
                                                            <table.FlexRender cell={cell} />
                                                       </td>
                                                  ))}
                                             </tr>
                                        );
                                   })}

                                   {table.getCenterRows().map((row, index) => {
                                        const { className, inlineStyles } = getRowStyling(row, index);
                                        return (
                                             <tr key={row.id} className={className} style={inlineStyles as never}>
                                                  {row.getVisibleCells().map((cell) => (
                                                       <td key={cell.id} className={v2Style.td} style={getPinnedStyles(cell.column)}>
                                                            <table.FlexRender cell={cell} />
                                                       </td>
                                                  ))}
                                             </tr>
                                        );
                                   })}

                                   {table.getBottomRows().map((row, index) => {
                                        const { className, inlineStyles } = getRowStyling(row, index);
                                        return (
                                             <tr key={`bottom-${row.id}`} className={`${className} ${v2Style.pinnedRow}`} style={inlineStyles as never}>
                                                  {row.getVisibleCells().map((cell) => (
                                                       <td key={cell.id} className={v2Style.td} style={getPinnedStyles(cell.column)}>
                                                            <table.FlexRender cell={cell} />
                                                       </td>
                                                  ))}
                                             </tr>
                                        );
                                   })}
                              </tbody>
                         )}

                         <tfoot className={v2Style.tableFooter}>
                              <tr className={v2Style.footerRow}>
                                   <td colSpan={Math.max(1, visibleColumns.length)}>
                                        <div className={v2Style.paginationContainer}>
                                             <button type="button" className={`${v2Style.paginationBtn} ${v2Style.paginationBtnNav}`} onClick={goToFirstPage} disabled={!canGoPrevious || isLoading}>First</button>
                                             <button type="button" className={`${v2Style.paginationBtn} ${v2Style.paginationBtnNav}`} onClick={goToPreviousPage} disabled={!canGoPrevious || isLoading}>Previous</button>
                                             <span className={v2Style.paginationInfo}>Page {pagination.pageIndex + 1} of {(totalPages ?? table.getPageCount()) || 1}</span>
                                             <button type="button" className={`${v2Style.paginationBtn} ${v2Style.paginationBtnNav}`} onClick={goToNextPage} disabled={!canGoNext || isInitialLoading}>Next</button>
                                             <button type="button" className={`${v2Style.paginationBtn} ${v2Style.paginationBtnNav}`} onClick={goToLastPage} disabled={!canGoNext || isInitialLoading}>Last</button>
                                        </div>
                                   </td>
                              </tr>
                         </tfoot>
                    </table>
               </div>

               {showColumnsPanel && (
                    <aside className={v2Style.sidePanel}>
                         <div className={v2Style.sidePanelHeader}>
                              <h6 className={v2Style.sidePanelTitle}>Columns</h6>
                              <button type="button" className={v2Style.sidePanelClose} onClick={() => setShowColumnsPanel(false)} aria-label="Close panel">✕</button>
                         </div>
                         <div className={v2Style.columnMenu}>
                              {table.getAllLeafColumns().map((col) => {
                                   if (col.id === "__select") return null;
                                   const label = getHeaderText(col);
                                   const grouped = col.getIsGrouped?.() ?? false;
                                   return (
                                        <div key={col.id} className={v2Style.columnMenuItem}>
                                             <label className="d-flex align-items-center gap-2 py-1">
                                                  <input type="checkbox" checked={col.getIsVisible()} onChange={col.getToggleVisibilityHandler()} />
                                                  <span className={v2Style.columnMenuLabel}>{label}</span>
                                             </label>
                                             <div className={v2Style.columnMenuActions}>
                                                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => moveColumn(col.id, "left")}>Left</button>
                                                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => moveColumn(col.id, "right")}>Right</button>
                                                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => col.pin("start")}>Pin Start</button>
                                                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => col.pin("end")}>Pin End</button>
                                                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => col.pin(false)}>Unpin</button>
                                                  {col.getCanGroup() && (
                                                       <button
                                                            type="button"
                                                            className={`btn btn-sm ${grouped ? "btn-primary" : "btn-outline-secondary"}`}
                                                            onClick={() => col.toggleGrouping()}
                                                       >
                                                            Group
                                                       </button>
                                                  )}
                                             </div>
                                        </div>
                                   );
                              })}
                         </div>
                    </aside>
               )}

               <div className={v2Style.statusBar}>
                    <table.Subscribe selector={(s) => Object.keys(s.rowSelection || {}).length}>
                         {(selectedCount) => <span className={v2Style.statusItem}>Selected: {selectedCount}</span>}
                    </table.Subscribe>
                    <span className={v2Style.statusItem}>Rows In View: {table.getRowModel().rows.length}</span>
                    <span className={v2Style.statusItem}>Total: {totalRecordsToShow || 0}</span>
                    <span className={v2Style.statusItem}>Pinned Top: {table.getTopRows().length}</span>
                    <span className={v2Style.statusItem}>Pinned Bottom: {table.getBottomRows().length}</span>
                    <span className={v2Style.statusItem}>Grouped: {grouping.length}</span>
               </div>

               {showChartView && chartVisible && (
                    <div className={v2Style.chartSection}>
                         <div className={v2Style.chartHeader}>
                              <span className={v2Style.chartTitle}>Chart View — grouped by: {grouping[0] ?? "first category column"}</span>
                              <div className="btn-group btn-group-sm">
                                   {(["bar", "line", "area"] as const).map((t) => (
                                        <button
                                             key={t}
                                             type="button"
                                             className={`btn ${chartType === t ? "btn-primary" : "btn-outline-secondary"}`}
                                             style={chartType === t ? { backgroundColor: "oklch(0.646 0.222 41.116)", borderColor: "oklch(0.646 0.222 41.116)" } : {}}
                                             onClick={() => setChartType(t)}
                                        >
                                             {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                   ))}
                              </div>
                         </div>
                         <ResponsiveContainer width="100%" height={280}>
                              {renderChart()}
                         </ResponsiveContainer>
                    </div>
               )}
          </div>
     );
}
