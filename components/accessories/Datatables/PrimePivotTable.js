"use client";
import { useEffect, useMemo, useState } from "react";
import { useTable, useGlobalFilter, useFilters, useSortBy } from "react-table";
import GlobalFilter from "./GlobalFilter";
import ShowTableDisplayCount from "./TableDisplayShowCount";
import TableLoading from "./TableLoading";
import style from "../../../styles/SmsTemplateList.module.css";
import { ButtonGroup } from "react-bootstrap";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PrimeTable({
	column,
	data,
	serverSideFiltering = false,
	handleSeverSideProcessing,
	urlparams = {},
}) {
	const [filteredData, setFilteredData] = useState(data);
	const [isLoading, setIsLoading] = useState(false);
	const [queryParams, setQueryParams] = useState({ count: 10, page: 1 });
	const [isPivotMode, setIsPivotMode] = useState(false);
	const [pivotSort, setPivotSort] = useState({ field: null, direction: 'asc' });
	const [pivotFilter, setPivotFilter] = useState('');
	const [pivotConfig, setPivotConfig] = useState({
		rowGroups: [],
		valueFields: [],
		columnLabels: [],
		aggregations: {} // field -> aggregation type
	});
	const [columnOrder, setColumnOrder] = useState([]);
	const [columnGroups, setColumnGroups] = useState({});
	const [rowGroups, setRowGroups] = useState([]);
	const [draggedColumn, setDraggedColumn] = useState(null);
	const [showChart, setShowChart] = useState(false);
	const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'pie', 'area', 'radar', 'scatter', 'composed'
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [conditionalFormatting, setConditionalFormatting] = useState({
		enabled: false,
		type: 'heatmap', // 'heatmap', 'databar', 'colorscale'
		column: null
	});
	const [showSparklines, setShowSparklines] = useState(false);
	const [comparisonMode, setComparisonMode] = useState({
		enabled: false,
		field: null,
		value1: null,
		value2: null
	});
	const [drillDownData, setDrillDownData] = useState(null);
	const [showFormatPopup, setShowFormatPopup] = useState(false);
	const [showShareModal, setShowShareModal] = useState(false);
	const [shareConfig, setShareConfig] = useState(null);
	const [showScheduleModal, setShowScheduleModal] = useState(false);
	const [isPivotSectionCollapsed, setIsPivotSectionCollapsed] = useState(false);
	const [scheduleConfig, setScheduleConfig] = useState({
		frequency: 'daily',
		time: '09:00',
		email: '',
		format: 'excel',
		enabled: false
	});

	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};

	// Close format popup when clicking outside
	// Close format popup when clicking outside
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (showFormatPopup && !e.target.closest('.format-popup-container')) {
				setShowFormatPopup(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [showFormatPopup]);

	// Load shared configuration from URL on mount
	useEffect(() => {
		loadSharedConfig();
	}, []);

	// Export to CSV
	const exportToCSV = () => {
		const dataToExport = isPivotMode ? pivotData : groupedData;
		if (!dataToExport || dataToExport.length === 0) {
			alert('No data to export');
			return;
		}

		const headers = Object.keys(dataToExport[0]);
		const csvContent = [
			headers.join(','),
			...dataToExport.map(row =>
				headers.map(header => {
					const value = row[header];
					// Escape quotes and wrap in quotes if contains comma
					if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
						return `"${value.replace(/"/g, '""')}"`;
					}
					return value;
				}).join(',')
			)
		].join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `table_export_${new Date().toISOString().split('T')[0]}.csv`;
		link.click();
	};

	// Export to Excel (using HTML table format that Excel can read)
	const exportToExcel = () => {
		const dataToExport = isPivotMode ? pivotData : groupedData;
		if (!dataToExport || dataToExport.length === 0) {
			alert('No data to export');
			return;
		}

		const headers = Object.keys(dataToExport[0]);
		const htmlTable = `
			<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
			<head><meta charset="UTF-8"></head>
			<body>
				<table>
					<thead>
						<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
					</thead>
					<tbody>
						${dataToExport.map(row =>
			`<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
		).join('')}
					</tbody>
				</table>
			</body>
			</html>
		`;

		const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `table_export_${new Date().toISOString().split('T')[0]}.xls`;
		link.click();
	};

	// Generate shareable configuration
	const generateShareConfig = () => {
		const config = {
			isPivotMode,
			pivotConfig,
			columnOrder,
			columnGroups,
			rowGroups,
			showChart,
			chartType,
			conditionalFormatting,
			showSparklines,
			comparisonMode,
			globalFilter: globalFilter,
			timestamp: new Date().toISOString()
		};

		const configJSON = JSON.stringify(config);
		const encoded = btoa(encodeURIComponent(configJSON));
		const shareUrl = `${window.location.origin}${window.location.pathname}?config=${encoded}`;

		setShareConfig({
			json: configJSON,
			url: shareUrl
		});
		setShowShareModal(true);
	};

	// Load configuration from shared URL
	const loadSharedConfig = () => {
		const params = new URLSearchParams(window.location.search);
		const configParam = params.get('config');

		if (configParam) {
			try {
				const decoded = decodeURIComponent(atob(configParam));
				const config = JSON.parse(decoded);

				// Apply configuration
				setIsPivotMode(config.isPivotMode || false);
				setPivotConfig(config.pivotConfig || { rowGroups: [], valueFields: [], columnLabels: [], aggregations: {} });
				setColumnOrder(config.columnOrder || []);
				setColumnGroups(config.columnGroups || {});
				setRowGroups(config.rowGroups || []);
				setShowChart(config.showChart || false);
				setChartType(config.chartType || 'bar');
				setConditionalFormatting(config.conditionalFormatting || { enabled: false, type: 'heatmap', column: null });
				setShowSparklines(config.showSparklines || false);
				setComparisonMode(config.comparisonMode || { enabled: false, field: null, value1: null, value2: null });

				// Apply global filter if present
				if (config.globalFilter) {
					setGlobalFilter(config.globalFilter);
				}

				return true;
			} catch (error) {
				console.error('Failed to load shared configuration:', error);
				return false;
			}
		}
		return false;
	};

	// Copy to clipboard
	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text).then(() => {
			alert('Copied to clipboard!');
		}).catch(err => {
			console.error('Failed to copy:', err);
		});
	};

	// Print optimized view
	const handlePrintOptimized = () => {
		window.print();
	};

	// Get cell color based on value for conditional formatting
	const getCellColor = (value, columnId, allValues) => {
		if (!conditionalFormatting.enabled || conditionalFormatting.column !== columnId) {
			return null;
		}

		const numericValue = parseFloat(value);
		if (isNaN(numericValue)) return null;

		const numericValues = allValues
			.map(v => parseFloat(v))
			.filter(v => !isNaN(v));

		const min = Math.min(...numericValues);
		const max = Math.max(...numericValues);
		const range = max - min;
		const normalized = range === 0 ? 0.5 : (numericValue - min) / range;

		if (conditionalFormatting.type === 'heatmap') {
			// Red (low) to Yellow (mid) to Green (high)
			if (normalized < 0.5) {
				const r = 255;
				const g = Math.round(255 * (normalized * 2));
				return `rgba(${r}, ${g}, 0, 0.3)`;
			} else {
				const r = Math.round(255 * (2 - normalized * 2));
				const g = 255;
				return `rgba(${r}, ${g}, 0, 0.3)`;
			}
		} else if (conditionalFormatting.type === 'colorscale') {
			// Blue (low) to White (mid) to Red (high)
			if (normalized < 0.5) {
				const intensity = Math.round(255 * (1 - normalized * 2));
				return `rgba(0, ${255 - intensity}, 255, 0.4)`;
			} else {
				const intensity = Math.round(255 * ((normalized - 0.5) * 2));
				return `rgba(255, ${255 - intensity}, ${255 - intensity}, 0.4)`;
			}
		}

		return null;
	};

	// Get data bar width percentage
	const getDataBarWidth = (value, columnId, allValues) => {
		if (!conditionalFormatting.enabled ||
			conditionalFormatting.type !== 'databar' ||
			conditionalFormatting.column !== columnId) {
			return 0;
		}

		const numericValue = parseFloat(value);
		if (isNaN(numericValue)) return 0;

		const numericValues = allValues
			.map(v => parseFloat(v))
			.filter(v => !isNaN(v));

		const max = Math.max(...numericValues);
		return max === 0 ? 0 : (numericValue / max) * 100;
	};

	// Generate sparkline data for a column
	const getSparklineData = (columnId) => {
		if (!showSparklines) return null;

		const values = groupedData
			.map(row => parseFloat(row[columnId]))
			.filter(v => !isNaN(v))
			.slice(0, 20); // Limit to recent 20 values

		if (values.length < 2) return null;

		return values;
	};

	// Render mini sparkline
	const renderSparkline = (data) => {
		if (!data || data.length < 2) return null;

		const max = Math.max(...data);
		const min = Math.min(...data);
		const range = max - min;
		const width = 60;
		const height = 20;

		const points = data.map((val, idx) => {
			const x = (idx / (data.length - 1)) * width;
			const y = range === 0 ? height / 2 : height - ((val - min) / range) * height;
			return `${x},${y}`;
		}).join(' ');

		return (
			<svg width={width} height={height} style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '8px' }}>
				<polyline
					points={points}
					fill="none"
					stroke="#2196f3"
					strokeWidth="1.5"
				/>
			</svg>
		);
	};

	// Handle drill down into aggregated data
	const handleDrillDown = (groupKey, groupField, groupData) => {
		setDrillDownData({
			groupKey,
			groupField,
			data: groupData
		});
	};

	// Close drill down modal
	const closeDrillDown = () => {
		setDrillDownData(null);
	};

	const handleDragStart = (e, field) => {
		e.dataTransfer.setData('text/plain', field);
	};

	const handleDrop = (e, target) => {
		e.preventDefault();
		const field = e.dataTransfer.getData('text/plain');
		if (!field) return;

		setPivotConfig(prev => {
			const newConfig = { ...prev };
			// Remove from all areas first
			Object.keys(newConfig).forEach(key => {
				if (Array.isArray(newConfig[key])) {
					// For arrays (rowGroups, valueFields, columnLabels)
					newConfig[key] = newConfig[key].filter(f => f !== field);
				} else if (key === 'aggregations') {
					// For aggregations object, remove the field if it exists
					const { [field]: removed, ...rest } = newConfig[key];
					newConfig[key] = rest;
				}
			});
			// Add to target
			if (!newConfig[target].includes(field)) {
				newConfig[target] = [...newConfig[target], field];
			}
			return newConfig;
		});
	};

	const handleDragOver = (e) => {
		e.preventDefault();
	};

	const aggregationTypes = ['Sum', 'Count', 'Average', 'Min', 'Max', 'Median', 'StdDev', 'Variance'];

	const setAggregation = (field, type) => {
		setPivotConfig(prev => ({
			...prev,
			aggregations: { ...prev.aggregations, [field]: type }
		}));
	};

	const removeField = (area, field) => {
		setPivotConfig(prev => ({
			...prev,
			[area]: prev[area].filter(f => f !== field)
		}));
	};

	const clearPivotConfig = () => {
		setPivotConfig({
			rowGroups: [],
			valueFields: [],
			columnLabels: [],
			aggregations: {}
		});
		setPivotSort({ field: null, direction: 'asc' });
		setPivotFilter('');
		setShowChart(false);
	};

	// Column reordering functions
	const handleColumnDragStart = (e, columnId) => {
		setDraggedColumn(columnId);
		e.dataTransfer.effectAllowed = 'move';
	};

	const handleColumnDragOver = (e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	};

	const handleColumnDrop = (e, targetColumnId) => {
		e.preventDefault();
		if (!draggedColumn || draggedColumn === targetColumnId) return;

		const newOrder = [...columnOrder];
		const draggedIndex = newOrder.indexOf(draggedColumn);
		const targetIndex = newOrder.indexOf(targetColumnId);

		if (draggedIndex !== -1 && targetIndex !== -1) {
			newOrder.splice(draggedIndex, 1);
			newOrder.splice(targetIndex, 0, draggedColumn);
			setColumnOrder(newOrder);
		}
		setDraggedColumn(null);
	};

	// Column grouping functions
	const createColumnGroup = (groupName, columnIds) => {
		setColumnGroups(prev => ({
			...prev,
			[groupName]: {
				columns: columnIds,
				collapsed: false
			}
		}));
	};

	const removeColumnGroup = (groupName) => {
		setColumnGroups(prev => {
			const newGroups = { ...prev };
			delete newGroups[groupName];
			return newGroups;
		});
	};

	const toggleColumnGroup = (groupName) => {
		setColumnGroups(prev => ({
			...prev,
			[groupName]: {
				...prev[groupName],
				collapsed: !prev[groupName].collapsed
			}
		}));
	};

	// Row grouping functions
	const addRowGroup = (field) => {
		if (!rowGroups.includes(field)) {
			setRowGroups(prev => [...prev, field]);
		}
	};

	const removeRowGroup = (field) => {
		setRowGroups(prev => prev.filter(f => f !== field));
	};

	const clearRowGroups = () => {
		setRowGroups([]);
	};

	const availableFields = useMemo(() => {
		return column.map(col => ({
			key: col.accessor || col.id,
			header: col.Header
		}));
	}, [column]);

	// Initialize column order if not set
	useEffect(() => {
		if (columnOrder.length === 0 && column.length > 0) {
			setColumnOrder(column.map(col => col.accessor || col.id));
		}
	}, [column, columnOrder.length]);

	// Get ordered columns for regular table
	const orderedColumns = useMemo(() => {
		if (isPivotMode) return column;
		return columnOrder.map(colId => column.find(col => (col.accessor || col.id) === colId)).filter(Boolean);
	}, [column, columnOrder, isPivotMode]);

	// Grouped data for row grouping
	const groupedData = useMemo(() => {
		if (isPivotMode || rowGroups.length === 0) return filteredData;

		const groupData = (data, groupFields, level = 0) => {
			if (level >= groupFields.length) return data;

			const field = groupFields[level];
			const grouped = {};

			data.forEach(row => {
				const key = row[field] || 'N/A';
				if (!grouped[key]) {
					grouped[key] = [];
				}
				grouped[key].push(row);
			});

			const result = [];
			Object.keys(grouped).forEach(key => {
				result.push({
					_isGroup: true,
					_groupKey: key,
					_groupField: field,
					_groupLevel: level,
					_groupData: grouped[key],
					_expanded: true
				});
				if (level < groupFields.length - 1) {
					result.push(...groupData(grouped[key], groupFields, level + 1));
				} else {
					result.push(...grouped[key]);
				}
			});

			return result;
		};

		return groupData(filteredData, rowGroups);
	}, [filteredData, rowGroups, isPivotMode]);

	const usedFields = useMemo(() => {
		return [...pivotConfig.rowGroups, ...pivotConfig.valueFields, ...pivotConfig.columnLabels];
	}, [pivotConfig]);

	const unusedFields = useMemo(() => {
		return availableFields.filter(field => !usedFields.includes(field.key));
	}, [availableFields, usedFields]);

	const pivotData = useMemo(() => {
		if (!isPivotMode || pivotConfig.rowGroups.length === 0 || pivotConfig.valueFields.length === 0) {
			return null;
		}

		// Helper function to calculate aggregation
		const calculateAggregation = (values, type) => {
			const nums = values.map(v => parseFloat(v) || 0).filter(v => !isNaN(v));

			if (nums.length === 0 && type !== 'Count') return 0;

			switch (type) {
				case 'Sum':
					return nums.reduce((a, b) => a + b, 0);

				case 'Count':
					return values.length;

				case 'Average':
					return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;

				case 'Min':
					return Math.min(...nums);

				case 'Max':
					return Math.max(...nums);

				case 'Median': {
					const sorted = [...nums].sort((a, b) => a - b);
					const mid = Math.floor(sorted.length / 2);
					return sorted.length % 2 === 0
						? (sorted[mid - 1] + sorted[mid]) / 2
						: sorted[mid];
				}

				case 'StdDev': {
					const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
					const squaredDiffs = nums.map(num => Math.pow(num - mean, 2));
					const variance = squaredDiffs.reduce((a, b) => a + b, 0) / nums.length;
					return Math.sqrt(variance);
				}

				case 'Variance': {
					const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
					const squaredDiffs = nums.map(num => Math.pow(num - mean, 2));
					return squaredDiffs.reduce((a, b) => a + b, 0) / nums.length;
				}

				default:
					return nums.reduce((a, b) => a + b, 0);
			}
		};

		// For multiple row groups, create combinations
		const groupCombinations = [];
		const processGroups = (data, groupFields, currentPath = {}) => {
			if (groupFields.length === 0) {
				groupCombinations.push({ ...currentPath, _data: data });
				return;
			}

			const currentField = groupFields[0];
			const remainingFields = groupFields.slice(1);

			const grouped = {};
			data.forEach(row => {
				const key = row[currentField] || 'N/A';
				if (!grouped[key]) grouped[key] = [];
				grouped[key].push(row);
			});

			Object.keys(grouped).forEach(key => {
				processGroups(grouped[key], remainingFields, { ...currentPath, [currentField]: key });
			});
		};

		processGroups(filteredData, pivotConfig.rowGroups);

		// Build result rows
		let result = groupCombinations.map(combination => {
			const row = { ...combination };
			delete row._data;

			pivotConfig.valueFields.forEach(field => {
				const values = combination._data.map(r => r[field]);
				const aggType = pivotConfig.aggregations[field] || 'Sum';
				row[`${availableFields.find(f => f.key === field)?.header || field} (${aggType})`] = calculateAggregation(values, aggType);
			});

			return row;
		});

		// Apply sorting
		if (pivotSort.field) {
			result.sort((a, b) => {
				const aVal = a[pivotSort.field];
				const bVal = b[pivotSort.field];
				if (aVal < bVal) return pivotSort.direction === 'asc' ? -1 : 1;
				if (aVal > bVal) return pivotSort.direction === 'asc' ? 1 : -1;
				return 0;
			});
		}

		// Apply filtering
		if (pivotFilter) {
			result = result.filter(row =>
				Object.values(row).some(value =>
					String(value).toLowerCase().includes(pivotFilter.toLowerCase())
				)
			);
		}

		return result;
	}, [isPivotMode, pivotConfig, filteredData, availableFields]);

	// Prepare chart data from pivot data
	const chartData = useMemo(() => {
		if (!pivotData || pivotData.length === 0) return [];

		const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

		return pivotData.map((row, index) => {
			const dataPoint = { name: '', fill: COLORS[index % COLORS.length] };

			// Find the first row group field to use as name
			if (pivotConfig.rowGroups.length > 0) {
				dataPoint.name = row[pivotConfig.rowGroups[0]] || `Row ${index + 1}`;
			}

			// Add all value fields
			pivotConfig.valueFields.forEach(field => {
				const fieldHeader = availableFields.find(f => f.key === field)?.header || field;
				const aggType = pivotConfig.aggregations[field] || 'Sum';
				const key = `${fieldHeader} (${aggType})`;
				dataPoint[key] = row[key] || 0;
			});

			return dataPoint;
		});
	}, [pivotData, pivotConfig, availableFields]);

	const [groupNameInput, setGroupNameInput] = useState('');
	const [selectedColumns, setSelectedColumns] = useState([]);

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
			columns: useMemo(() => orderedColumns, [orderedColumns]),
			data: useMemo(() => isPivotMode ? filteredData : groupedData, [groupedData, filteredData, isPivotMode]),
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

	const customHeaderGroup = () => {
		if (isPivotMode && pivotData && pivotData.length > 0) {
			const headers = Object.keys(pivotData[0]);
			return (
				<tr>
					{headers.map((header, index) => (
						<th
							key={index}
							className={`${style.th} pointer`}
							onClick={() => {
								setPivotSort(prev => ({
									field: header,
									direction: prev.field === header && prev.direction === 'asc' ? 'desc' : 'asc'
								}));
							}}
						>
							<div className="d-flex justify-content-between align-items-center">
								<span className="text-sm fw-bold text-capitalize align-items-center">
									{header}
									{pivotSort.field === header && (
										<span className="mx-1">
											{pivotSort.direction === 'asc' ? '↑' : '↓'}
										</span>
									)}
								</span>
							</div>
						</th>
					))}
				</tr>
			);
		}

		// Handle column grouping for regular table mode
		if (!isPivotMode && Object.keys(columnGroups).length > 0) {
			// Create a map of column IDs to their group colors with enhanced styling
			const columnGroupMap = {};
			const groupColorSchemes = [
				{ bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', border: '#2196f3', badge: '#1976d2', icon: '📘' },
				{ bg: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', border: '#9c27b0', badge: '#7b1fa2', icon: '📗' },
				{ bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', border: '#4caf50', badge: '#388e3c', icon: '📙' },
				{ bg: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', border: '#ff9800', badge: '#f57c00', icon: '📕' },
				{ bg: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)', border: '#e91e63', badge: '#c2185b', icon: '📓' }
			];
			let colorIndex = 0;

			Object.entries(columnGroups).forEach(([groupName, groupData]) => {
				if (!groupData.collapsed && groupData.columns && groupData.columns.length > 0) {
					const scheme = groupColorSchemes[colorIndex % groupColorSchemes.length];
					groupData.columns.forEach(colId => {
						columnGroupMap[colId] = {
							groupName,
							...scheme
						};
					});
					colorIndex++;
				}
			});

			// Single row: individual column headers with group highlighting
			const processedColumns = headerGroups[0]?.headers || [];
			return (
				<tr key="column-row">
					{processedColumns.map((column, index) => {
						const { key, ...restProps } = column.getHeaderProps(
							column.getSortByToggleProps()
						);

						const sortIndicator = column.isSorted
							? column.isSortedDesc
								? toogleDown()
								: toogleUp()
							: null;

						const columnId = column.id || column.accessor;
						const groupInfo = columnGroupMap[columnId];

						return (
							<th
								key={index}
								{...restProps}
								className={`${style.th} pointer`}
								draggable={!isPivotMode}
								onDragStart={(e) => handleColumnDragStart(e, columnId)}
								onDragOver={handleColumnDragOver}
								onDrop={(e) => handleColumnDrop(e, columnId)}
								style={{
									cursor: isPivotMode ? 'pointer' : 'grab',
									userSelect: 'none',
									position: 'relative'
								}}
								title={groupInfo ? `Group: ${groupInfo.groupName}` : undefined}
							>
								{groupInfo && (
									<div
										style={{
											position: 'absolute',
											top: '-18px',
											left: '50%',
											transform: 'translateX(-50%)',
											background: `linear-gradient(135deg, ${groupInfo.badge} 0%, ${groupInfo.border} 100%)`,
											color: 'white',
											padding: '3px 10px',
											borderRadius: '8px 8px 0 0',
											fontSize: '9px',
											fontWeight: '600',
											whiteSpace: 'nowrap',
											zIndex: 10,
											boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
											letterSpacing: '0.3px',
											border: `1px solid ${groupInfo.border}`,
											borderBottom: 'none'
										}}
									>
										{groupInfo.icon} {groupInfo.groupName}
									</div>
								)}
								<div className="d-flex justify-content-between align-items-center" style={{ paddingTop: groupInfo ? '18px' : '0' }}>
									<span className="text-sm fw-bold text-capitalize align-items-center">
										{column.render("Header")}
										<span className="mx-1">{sortIndicator}</span>
									</span>
									{!isPivotMode && (
										<span className="text-muted" style={{ fontSize: '12px' }}>⋮⋮</span>
									)}
								</div>
							</th>
						);
					})}
				</tr>
			);
		}

		return headerGroups.map((headerGroup, v) => (
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

					const columnId = column.id || column.accessor;

					return (
						<th
							key={index}
							{...restProps}
							className={`${style.th} pointer`}
							draggable={!isPivotMode}
							onDragStart={(e) => handleColumnDragStart(e, columnId)}
							onDragOver={handleColumnDragOver}
							onDrop={(e) => handleColumnDrop(e, columnId)}
							style={{
								cursor: isPivotMode ? 'pointer' : 'grab',
								userSelect: 'none'
							}}
						>
							<div className="d-flex justify-content-between align-items-center">
								<span className="text-sm fw-bold text-capitalize align-items-center">
									{column.render("Header")}
									<span className="mx-1">{sortIndicator}</span>
								</span>
								{!isPivotMode && (
									<span className="text-muted" style={{ fontSize: '12px' }}>⋮⋮</span>
								)}
							</div>
						</th>
					);
				})}
			</tr>
		));
	};

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
				sortby
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
		if (isPivotMode) {
			if (!pivotData) {
				return (
					<tbody>
						<tr>
							<td colSpan={100} className={style.noDataCell}>
								<div className={style.noDataWrapper}>
									Configure pivot settings to view data
								</div>
							</td>
						</tr>
					</tbody>
				);
			}
			return (
				<tbody>
					{pivotData.map((row, index) => (
						<tr key={index} className={index % 2 === 0 ? style.evenRow : style.oddRow}>
							{Object.keys(row).map(key => (
								<td key={key} className={style.td}>
									{row[key]}
								</td>
							))}
						</tr>
					))}
				</tbody>
			);
		}

		if (isLoading) return <TableLoading span={column.length} />;
		else if (groupedData.length == 0) return <NoDataAvailable />;
		else {
			return (
				<tbody {...getTableBodyProps()}>
					{rows.map((row, index) => {
						prepareRow(row);
						const zebraClass = index % 2 === 0 ? style.evenRow : style.oddRow;

						// Check if this is a group row
						if (row.original._isGroup) {
							const groupLevel = row.original._groupLevel;
							const indent = groupLevel * 20;
							return (
								<tr key={index} className="table-group-header" style={{ backgroundColor: '#f8f9fa', cursor: 'pointer' }}>
									<td colSpan={column.length} className={style.td} style={{ paddingLeft: `${indent + 10}px` }}>
										<div className="d-flex align-items-center justify-content-between">
											<div className="d-flex align-items-center">
												<button
													className="btn btn-sm btn-outline-secondary me-2"
													onClick={() => {
														// Toggle group expansion
														const newData = [...groupedData];
														const groupIndex = groupedData.indexOf(row.original);
														if (groupIndex !== -1) {
															newData[groupIndex]._expanded = !newData[groupIndex]._expanded;
															// Here we would need to update the groupedData state
															// For now, this is a placeholder
														}
													}}
													style={{ width: '20px', height: '20px', padding: '0' }}
												>
													{row.original._expanded ? '−' : '+'}
												</button>
												<strong>
													{availableFields.find(f => f.key === row.original._groupField)?.header || row.original._groupField}: {row.original._groupKey}
													<span className="text-muted ms-2">({row.original._groupData.length} items)</span>
												</strong>
											</div>
											<button
												className="btn btn-sm btn-outline-info"
												onClick={() => handleDrillDown(row.original._groupKey, row.original._groupField, row.original._groupData)}
												style={{ fontSize: '10px', padding: '2px 8px' }}
												title="View Details"
											>
												🔍 Drill Down
											</button>
										</div>
									</td>
								</tr>
							);
						}

						return (
							<tr
								{...row.getRowProps()}
								key={index}
								className={`${style.tableRow} ${zebraClass}`}
								style={{ transition: "background 0.2s" }}
							>
								{row.cells.map((cell) => {
									// Apply column grouping styling to cells
									let cellStyle = {};
									let cellClass = style.td;

									if (!isPivotMode && Object.keys(columnGroups).length > 0) {
										// Create the same column group map as in header
										const columnGroupMap = {};
										const groupColorSchemes = [
											{ bg: 'linear-gradient(180deg, rgba(227, 242, 253, 0.4) 0%, rgba(187, 222, 251, 0.3) 100%)', border: '#2196f3' },
											{ bg: 'linear-gradient(180deg, rgba(243, 229, 245, 0.4) 0%, rgba(225, 190, 231, 0.3) 100%)', border: '#9c27b0' },
											{ bg: 'linear-gradient(180deg, rgba(232, 245, 233, 0.4) 0%, rgba(200, 230, 201, 0.3) 100%)', border: '#4caf50' },
											{ bg: 'linear-gradient(180deg, rgba(255, 243, 224, 0.4) 0%, rgba(255, 224, 178, 0.3) 100%)', border: '#ff9800' },
											{ bg: 'linear-gradient(180deg, rgba(252, 228, 236, 0.4) 0%, rgba(248, 187, 208, 0.3) 100%)', border: '#e91e63' }
										];
										let colorIndex = 0;

										Object.entries(columnGroups).forEach(([groupName, groupData]) => {
											if (!groupData.collapsed && groupData.columns && groupData.columns.length > 0) {
												const scheme = groupColorSchemes[colorIndex % groupColorSchemes.length];
												groupData.columns.forEach(colId => {
													columnGroupMap[colId] = {
														groupName,
														...scheme
													};
												});
												colorIndex++;
											}
										});

										const columnId = cell.column.id || cell.column.accessor;
										const groupInfo = columnGroupMap[columnId];

										if (groupInfo) {
											cellStyle = {
												background: groupInfo.bg,
												borderLeft: `2px solid ${groupInfo.border}`,
												borderRight: `2px solid ${groupInfo.border}`,
												borderBottom: `1px solid ${groupInfo.border}33`,
												transition: 'all 0.2s ease'
											};
										}
									}

									// Apply conditional formatting
									const cellValue = cell.value;
									const allColumnValues = rows.map(r => r.values[cell.column.id]);
									const conditionalColor = getCellColor(cellValue, cell.column.id, allColumnValues);
									const dataBarWidth = getDataBarWidth(cellValue, cell.column.id, allColumnValues);

									if (conditionalColor) {
										cellStyle = { ...cellStyle, backgroundColor: conditionalColor };
									}

									return (
										<td
											{...cell.getCellProps()}
											key={cell.column.id}
											className={cellClass}
											style={{ ...cellStyle, position: 'relative' }}
										>
											{dataBarWidth > 0 && (
												<div style={{
													position: 'absolute',
													left: 0,
													top: 0,
													bottom: 0,
													width: `${dataBarWidth}%`,
													backgroundColor: 'rgba(33, 150, 243, 0.3)',
													zIndex: 0
												}} />
											)}
											<div style={{ position: 'relative', zIndex: 1 }}>
												{cell.render("Cell")}
												{showSparklines && renderSparkline(getSparklineData(cell.column.id))}
											</div>
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			);
		}
	};

	return (
		<>
			<style jsx global>{`
				@media print {
					/* Print-specific styles */
					body * {
						visibility: hidden;
					}
					
					.row.border.border-1, 
					.row.border.border-1 * {
						visibility: visible;
					}
					
					.row.border.border-1 {
						position: absolute;
						left: 0;
						top: 0;
						width: 100%;
						margin: 0 !important;
						padding: 0 !important;
						border: none !important;
					}
					
					/* Hide UI controls during print */
					button, 
					.btn,
					input[type="text"],
					input[type="search"],
					select,
					.format-popup-container,
					.modal {
						display: none !important;
					}
					
					/* Optimize table for print */
					table {
						width: 100% !important;
						font-size: 9px !important;
						page-break-inside: auto;
					}
					
					thead {
						display: table-header-group;
						background-color: #f0f0f0 !important;
						-webkit-print-color-adjust: exact;
						print-color-adjust: exact;
					}
					
					tbody tr {
						page-break-inside: avoid;
						page-break-after: auto;
					}
					
					/* Landscape mode */
					@page {
						size: landscape;
						margin: 1cm;
					}
					
					/* Print chart if visible */
					.chart-container {
						page-break-before: always;
						page-break-after: always;
					}
					
					/* Preserve colors for conditional formatting */
					td, th {
						-webkit-print-color-adjust: exact;
						print-color-adjust: exact;
					}
					
					/* Remove borders that don't print well */
					.border-bottom,
					.border-top {
						border: 1px solid #ddd !important;
					}
				}
			`}</style>
			<div
				className="row border border-1 br-5 mx-2"
				style={isFullscreen ? {
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					width: '100vw',
					height: '100vh',
					zIndex: 9999,
					margin: 0,
					backgroundColor: 'white',
					overflow: 'auto'
				} : {}}
			>
				<div className="d-flex m-0 p-0  border-bottom border">
					<div className="col-9 d-flex justify-content-between  p-2 ">
						<div className="mx-3">
							{!isPivotMode && (
								<ShowTableDisplayCount
									page={queryParams.page}
									setLoader={setIsLoading}
									handleLoader={RunServerAction}
									queryParams={queryParams}
									setQueryParams={setQueryParams}
								/>
							)}
						</div>
						<div className="d-flex gap-2 align-items-center flex-wrap">
							{!isPivotMode ? (
								<>
									<GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />

									{/* Export Buttons */}
									<button
										onClick={exportToCSV}
										className="btn btn-sm btn-outline-success"
										style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
										title="Export to CSV"
									>
										� CSV
									</button>
									<button
										onClick={exportToExcel}
										className="btn btn-sm btn-outline-success"
										style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
										title="Export to Excel"
									>
										📊 Excel
									</button>
									<button
										onClick={handlePrintOptimized}
										className="btn btn-sm btn-outline-secondary"
										style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
										title="Print Optimized"
									>
										🖨️ Print
									</button>
									<button
										onClick={generateShareConfig}
										className="btn btn-sm btn-outline-info"
										style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
										title="Share Configuration"
									>
										🔗 Share
									</button>
									<button
										onClick={() => setShowScheduleModal(true)}
										className="btn btn-sm btn-outline-primary"
										style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
										title="Schedule Reports"
									>
										⏰ Schedule
									</button>

									{/* Conditional Formatting Toggle */}
									<div style={{ position: 'relative' }} className="format-popup-container">
										<button
											onClick={() => {
												setShowFormatPopup(!showFormatPopup);
												if (!conditionalFormatting.enabled) {
													setConditionalFormatting(prev => ({ ...prev, enabled: true }));
												}
											}}
											className={`btn btn-sm ${conditionalFormatting.enabled ? 'btn-warning' : 'btn-outline-warning'}`}
											style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
											title="Configure Conditional Formatting"
										>
											🎨 Format
										</button>
										{showFormatPopup && (
											<div
												style={{
													position: 'absolute',
													top: '100%',
													left: 0,
													marginTop: '4px',
													backgroundColor: 'white',
													border: '1px solid #ddd',
													borderRadius: '6px',
													padding: '12px',
													boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
													zIndex: 1000,
													minWidth: '220px'
												}}
											>
												<div className="mb-2">
													<div className="form-check mb-2">
														<input
															className="form-check-input"
															type="checkbox"
															checked={conditionalFormatting.enabled}
															onChange={(e) => setConditionalFormatting({ ...conditionalFormatting, enabled: e.target.checked })}
															id="enableFormatting"
														/>
														<label className="form-check-label" htmlFor="enableFormatting" style={{ fontSize: '11px' }}>
															Enable Formatting
														</label>
													</div>
												</div>
												{conditionalFormatting.enabled && (
													<>
														<div className="mb-2">
															<small className="text-muted d-block mb-1" style={{ fontSize: '10px' }}>Format Type:</small>
															<select
																className="form-select form-select-sm"
																value={conditionalFormatting.type}
																onChange={(e) => setConditionalFormatting({ ...conditionalFormatting, type: e.target.value })}
																style={{ fontSize: '11px' }}
															>
																<option value="heatmap">🔥 Heat Map</option>
																<option value="databar">📊 Data Bars</option>
																<option value="colorscale">🌈 Color Scale</option>
															</select>
														</div>
														<div>
															<small className="text-muted d-block mb-1" style={{ fontSize: '10px' }}>Apply to Column:</small>
															<select
																className="form-select form-select-sm"
																value={conditionalFormatting.column || ''}
																onChange={(e) => setConditionalFormatting({ ...conditionalFormatting, column: e.target.value })}
																style={{ fontSize: '11px' }}
															>
																<option value="">Select column...</option>
																{availableFields.map(field => (
																	<option key={field.key} value={field.key}>{field.header}</option>
																))}
															</select>
														</div>
													</>
												)}
											</div>
										)}
									</div>

									{/* Sparklines Toggle */}
									<button
										onClick={() => setShowSparklines(!showSparklines)}
										className={`btn btn-sm ${showSparklines ? 'btn-info' : 'btn-outline-info'}`}
										style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
										title="Toggle Sparklines"
									>
										📈 Sparklines
									</button>

									<button
										onClick={toggleFullscreen}
										className="btn btn-sm btn-outline-secondary"
										style={{
											fontSize: '14px',
											padding: '4px 10px',
											display: 'flex',
											alignItems: 'center',
											gap: '4px',
											whiteSpace: 'nowrap'
										}}
										title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
									>
										{isFullscreen ? (
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
												<path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z" />
											</svg>
										) : (
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
												<path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
											</svg>
										)}
									</button>
								</>
							) : (
								<>
									<input
										type="text"
										placeholder="Filter pivot data..."
										value={pivotFilter}
										onChange={(e) => setPivotFilter(e.target.value)}
										className="form-control form-control-sm"
										style={{ width: '180px', fontSize: '11px' }}
									/>
									{pivotData && pivotData.length > 0 && (
										<button
											onClick={() => setShowChart(!showChart)}
											className="btn btn-xs btn-outline-primary"
											style={{ fontSize: '10px', padding: '2px 8px', whiteSpace: 'nowrap', backgroundColor: '#007bff', color: 'white', border: '2px solid #0056b3' }}
										>
											{showChart ? 'Hide Chart' : 'Show Chart'}
										</button>
									)}
									<button
										onClick={toggleFullscreen}
										className="btn btn-sm btn-outline-secondary"
										style={{
											fontSize: '14px',
											padding: '4px 10px',
											display: 'flex',
											alignItems: 'center',
											gap: '4px',
											whiteSpace: 'nowrap'
										}}
										title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
									>
										{isFullscreen ? (
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
												<path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z" />
											</svg>
										) : (
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
												<path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
											</svg>
										)}
									</button>
								</>
							)}
						</div>
					</div>
					<div className="col-3 border-1 border-start p-2 ">
						<div className="d-flex justify-content-between align-items-center my-2">
							<div className="form-check form-switch">
								<input className="form-check-input" type="checkbox" role="switch" id="pivotModeSwitch" onChange={e => setIsPivotMode(e.target.checked)} />
								<label className="form-check-label" htmlFor="pivotModeSwitch">Pivot Mode</label>
							</div>
							{isPivotMode && (
								<button
									onClick={() => setIsPivotSectionCollapsed(!isPivotSectionCollapsed)}
									className="btn btn-sm"
									style={{
										fontSize: '16px',
										padding: '4px 8px',
										lineHeight: '1',
										border: '1px solid #0d6efd',
										background: '#e7f1ff',
										color: '#0d6efd',
										fontWeight: 'bold',
										borderRadius: '4px',
										cursor: 'pointer',
										transition: 'all 0.2s'
									}}
									onMouseEnter={(e) => {
										e.target.style.background = '#0d6efd';
										e.target.style.color = 'white';
									}}
									onMouseLeave={(e) => {
										e.target.style.background = '#e7f1ff';
										e.target.style.color = '#0d6efd';
									}}
									title={isPivotSectionCollapsed ? 'Expand Pivot Config' : 'Collapse Pivot Config'}
								>
									{isPivotSectionCollapsed ? '◀' : '▶'}
								</button>
							)}
						</div>
					</div>
				</div>
				<div className="row m-0 p-0 flex-nowrap">
					<div className={isPivotMode && !isPivotSectionCollapsed ? "col-9" : "col-12"} style={{ overflowY: 'auto', overflowX: 'auto', maxHeight: '70vh' }}>
						{isPivotMode && showChart && pivotData && pivotData.length > 0 && (
							<>
								<div className="p-3 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
									<div className="d-flex justify-content-between align-items-center mb-3">
										<div>
											<h6 className="mb-0 fw-bold" style={{ color: '#198754' }}>📊 Pivot Chart</h6>
											<small className="text-muted" style={{ fontSize: '10px' }}>Select visualization type</small>
										</div>
									</div>
									<div className="d-flex flex-wrap gap-2">
										<button
											type="button"
											className={`btn btn-sm ${chartType === 'bar' ? 'btn-success' : 'btn-outline-success'}`}
											onClick={() => setChartType('bar')}
											style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', fontWeight: '500' }}
											title="Bar Chart"
										>
											📊 Bar
										</button>
										<button
											type="button"
											className={`btn btn-sm ${chartType === 'line' ? 'btn-success' : 'btn-outline-success'}`}
											onClick={() => setChartType('line')}
											style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', fontWeight: '500' }}
											title="Line Chart"
										>
											📈 Line
										</button>
										<button
											type="button"
											className={`btn btn-sm ${chartType === 'area' ? 'btn-success' : 'btn-outline-success'}`}
											onClick={() => setChartType('area')}
											style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', fontWeight: '500' }}
											title="Area Chart"
										>
											🏔️ Area
										</button>
										<button
											type="button"
											className={`btn btn-sm ${chartType === 'pie' ? 'btn-success' : 'btn-outline-success'}`}
											onClick={() => setChartType('pie')}
											style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', fontWeight: '500' }}
											title="Pie Chart"
										>
											🥧 Pie
										</button>
										<button
											type="button"
											className={`btn btn-sm ${chartType === 'radar' ? 'btn-success' : 'btn-outline-success'}`}
											onClick={() => setChartType('radar')}
											style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', fontWeight: '500' }}
											title="Radar Chart"
										>
											🎯 Radar
										</button>
										<button
											type="button"
											className={`btn btn-sm ${chartType === 'scatter' ? 'btn-success' : 'btn-outline-success'}`}
											onClick={() => setChartType('scatter')}
											style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', fontWeight: '500' }}
											title="Scatter Plot"
										>
											⚫ Scatter
										</button>
										<button
											type="button"
											className={`btn btn-sm ${chartType === 'composed' ? 'btn-success' : 'btn-outline-success'}`}
											onClick={() => setChartType('composed')}
											style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', fontWeight: '500' }}
											title="Combined Chart"
										>
											📉 Mixed
										</button>
									</div>
								</div>
								<div className="p-2">
									<ResponsiveContainer width="100%" height={350}>
										{chartType === 'bar' && (
											<BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="name" style={{ fontSize: '10px' }} />
												<YAxis style={{ fontSize: '10px' }} />
												<Tooltip contentStyle={{ fontSize: '11px' }} />
												<Legend wrapperStyle={{ fontSize: '10px' }} />
												{pivotConfig.valueFields.map((field, index) => {
													const fieldHeader = availableFields.find(f => f.key === field)?.header || field;
													const aggType = pivotConfig.aggregations[field] || 'Sum';
													const key = `${fieldHeader} (${aggType})`;
													const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
													return <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />;
												})}
											</BarChart>
										)}
										{chartType === 'line' && (
											<LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="name" style={{ fontSize: '10px' }} />
												<YAxis style={{ fontSize: '10px' }} />
												<Tooltip contentStyle={{ fontSize: '11px' }} />
												<Legend wrapperStyle={{ fontSize: '10px' }} />
												{pivotConfig.valueFields.map((field, index) => {
													const fieldHeader = availableFields.find(f => f.key === field)?.header || field;
													const aggType = pivotConfig.aggregations[field] || 'Sum';
													const key = `${fieldHeader} (${aggType})`;
													const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
													return <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} />;
												})}
											</LineChart>
										)}
										{chartType === 'pie' && pivotConfig.valueFields.length > 0 && (
											<PieChart>
												<Pie
													data={chartData}
													dataKey={(() => {
														const field = pivotConfig.valueFields[0];
														const fieldHeader = availableFields.find(f => f.key === field)?.header || field;
														const aggType = pivotConfig.aggregations[field] || 'Sum';
														return `${fieldHeader} (${aggType})`;
													})()}
													nameKey="name"
													cx="50%"
													cy="50%"
													outerRadius={100}
													label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
													labelStyle={{ fontSize: '10px' }}
												>
													{chartData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.fill} />
													))}
												</Pie>
												<Tooltip contentStyle={{ fontSize: '11px' }} />
											</PieChart>
										)}
										{chartType === 'area' && (
											<AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="name" style={{ fontSize: '10px' }} />
												<YAxis style={{ fontSize: '10px' }} />
												<Tooltip contentStyle={{ fontSize: '11px' }} />
												<Legend wrapperStyle={{ fontSize: '10px' }} />
												{pivotConfig.valueFields.map((field, index) => {
													const fieldHeader = availableFields.find(f => f.key === field)?.header || field;
													const aggType = pivotConfig.aggregations[field] || 'Sum';
													const key = `${fieldHeader} (${aggType})`;
													const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
													return <Area key={key} type="monotone" dataKey={key} fill={colors[index % colors.length]} stroke={colors[index % colors.length]} fillOpacity={0.6} />;
												})}
											</AreaChart>
										)}
										{chartType === 'radar' && (
											<RadarChart data={chartData}>
												<PolarGrid />
												<PolarAngleAxis dataKey="name" style={{ fontSize: '10px' }} />
												<PolarRadiusAxis style={{ fontSize: '10px' }} />
												<Tooltip contentStyle={{ fontSize: '11px' }} />
												<Legend wrapperStyle={{ fontSize: '10px' }} />
												{pivotConfig.valueFields.map((field, index) => {
													const fieldHeader = availableFields.find(f => f.key === field)?.header || field;
													const aggType = pivotConfig.aggregations[field] || 'Sum';
													const key = `${fieldHeader} (${aggType})`;
													const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
													return <Radar key={key} name={key} dataKey={key} stroke={colors[index % colors.length]} fill={colors[index % colors.length]} fillOpacity={0.6} />;
												})}
											</RadarChart>
										)}
										{chartType === 'scatter' && (
											<ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="name" name="Category" style={{ fontSize: '10px' }} />
												<YAxis style={{ fontSize: '10px' }} />
												<Tooltip contentStyle={{ fontSize: '11px' }} cursor={{ strokeDasharray: '3 3' }} />
												<Legend wrapperStyle={{ fontSize: '10px' }} />
												{pivotConfig.valueFields.map((field, index) => {
													const fieldHeader = availableFields.find(f => f.key === field)?.header || field;
													const aggType = pivotConfig.aggregations[field] || 'Sum';
													const key = `${fieldHeader} (${aggType})`;
													const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
													return <Scatter key={key} name={key} data={chartData.map(d => ({ x: d.name, y: d[key] }))} fill={colors[index % colors.length]} />;
												})}
											</ScatterChart>
										)}
										{chartType === 'composed' && (
											<ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="name" style={{ fontSize: '10px' }} />
												<YAxis style={{ fontSize: '10px' }} />
												<Tooltip contentStyle={{ fontSize: '11px' }} />
												<Legend wrapperStyle={{ fontSize: '10px' }} />
												{pivotConfig.valueFields.map((field, index) => {
													const fieldHeader = availableFields.find(f => f.key === field)?.header || field;
													const aggType = pivotConfig.aggregations[field] || 'Sum';
													const key = `${fieldHeader} (${aggType})`;
													const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
													// Alternate between Bar, Line, and Area for variety
													if (index % 3 === 0) {
														return <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />;
													} else if (index % 3 === 1) {
														return <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} />;
													} else {
														return <Area key={key} type="monotone" dataKey={key} fill={colors[index % colors.length]} stroke={colors[index % colors.length]} fillOpacity={0.3} />;
													}
												})}
											</ComposedChart>
										)}
									</ResponsiveContainer>
								</div>
							</>
						)}
						<table
							className={style.table}
							style={{ fontSize: "1rem", minWidth: "100%" }}
							{...(isPivotMode ? {} : getTableProps())}
						>
							<thead>{customHeaderGroup()}</thead>
							<RenderingTable getTableBodyProps={isPivotMode ? () => ({}) : getTableBodyProps} />

						</table>
					</div>
					{isPivotMode && !isPivotSectionCollapsed && (
						<div className="col-3 border-1 border-start p-2 " style={{ overflowY: 'auto', maxHeight: '70vh', backgroundColor: '#fafbfc' }}>
							<div className="mt-3">
								<div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
									<h6 className="mb-0 fw-bold text-primary">⚙️ Pivot Config</h6>
									<button onClick={clearPivotConfig} className="btn btn-sm btn-outline-danger" style={{ fontSize: '11px' }}>
										<span style={{ fontSize: '13px' }}>🗑️</span> Clear
									</button>
								</div>

								{/* Available Fields */}
								<div className="mb-3">
									<div className="d-flex align-items-center mb-2">
										<span style={{ fontSize: '11px', fontWeight: '600', color: '#6c757d', letterSpacing: '0.5px' }}>📋 AVAILABLE FIELDS</span>
										<span className="badge bg-secondary ms-2" style={{ fontSize: '9px' }}>{unusedFields.length}</span>
									</div>
									<div
										className="mb-2 rounded-2 shadow-sm"
										style={{
											minHeight: '70px',
											border: '2px dashed #d1d5db',
											padding: '10px',
											backgroundColor: '#ffffff',
											transition: 'all 0.2s ease'
										}}
									>
										{unusedFields.length === 0 ? (
											<div className="text-center text-muted py-3" style={{ fontSize: '11px' }}>
												<div style={{ fontSize: '24px', opacity: 0.5 }}>📦</div>
												<div className="mt-1">All fields in use</div>
											</div>
										) : (
											<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
												{unusedFields.map(field => (
													<div
														key={field.key}
														draggable
														onDragStart={(e) => handleDragStart(e, field.key)}
														className="badge"
														style={{
															padding: '6px 10px',
															background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
															color: 'white',
															border: 'none',
															borderRadius: '6px',
															cursor: 'grab',
															fontSize: '11px',
															fontWeight: '500',
															boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)',
															transition: 'all 0.2s ease',
															userSelect: 'none'
														}}
														onMouseEnter={(e) => {
															e.target.style.transform = 'translateY(-2px) scale(1.02)';
															e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.4)';
														}}
														onMouseLeave={(e) => {
															e.target.style.transform = 'translateY(0) scale(1)';
															e.target.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.3)';
														}}
													>
														⋮⋮ {field.header}
													</div>
												))}
											</div>
										)}
									</div>
									<div className="text-center">
										<small className="text-muted" style={{ fontSize: '10px' }}>👆 Drag fields to configure pivot</small>
									</div>
								</div>

								{/* Row Groups */}
								<div className="mb-3">
									<div className="d-flex align-items-center mb-2">
										<span style={{ fontSize: '11px', fontWeight: '600', color: '#0d6efd', letterSpacing: '0.5px' }}>📊 ROW GROUPS</span>
										<span className="badge bg-primary ms-2" style={{ fontSize: '9px' }}>{pivotConfig.rowGroups.length}</span>
									</div>
									<div
										className="rounded-2 shadow-sm"
										style={{
											minHeight: '65px',
											border: '2px dashed #0d6efd',
											padding: '10px',
											backgroundColor: 'rgba(13, 110, 253, 0.03)',
											transition: 'all 0.3s ease'
										}}
										onDrop={(e) => {
											handleDrop(e, 'rowGroups');
											e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.03)';
											e.currentTarget.style.borderColor = '#0d6efd';
										}}
										onDragOver={handleDragOver}
										onDragEnter={(e) => {
											e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
											e.currentTarget.style.borderColor = '#0a58ca';
											e.currentTarget.style.borderWidth = '3px';
										}}
										onDragLeave={(e) => {
											e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.03)';
											e.currentTarget.style.borderColor = '#0d6efd';
											e.currentTarget.style.borderWidth = '2px';
										}}
									>
										{pivotConfig.rowGroups.length === 0 ? (
											<div className="text-center text-muted py-2" style={{ fontSize: '11px' }}>
												<div style={{ fontSize: '20px', opacity: 0.5 }}>⬇️</div>
												<div className="mt-1">Drop here</div>
											</div>
										) : (
											<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
												{pivotConfig.rowGroups.map(field => (
													<div key={field} className="badge bg-primary" style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}>
														🏷️ {availableFields.find(f => f.key === field)?.header}
														<button
															onClick={() => removeField('rowGroups', field)}
															className="btn-close btn-close-white"
															style={{ fontSize: '8px', padding: '0', width: '12px', height: '12px' }}
															title="Remove"
														/>
													</div>
												))}
											</div>
										)}
									</div>
								</div>

								{/* Values */}
								<div className="mb-3">
									<div className="d-flex align-items-center mb-2">
										<span style={{ fontSize: '11px', fontWeight: '600', color: '#198754', letterSpacing: '0.5px' }}>🔢 VALUES</span>
										<span className="badge bg-success ms-2" style={{ fontSize: '9px' }}>{pivotConfig.valueFields.length}</span>
									</div>
									<div
										className="rounded-2 shadow-sm"
										style={{
											minHeight: '65px',
											border: '2px dashed #198754',
											padding: '10px',
											backgroundColor: 'rgba(25, 135, 84, 0.03)',
											transition: 'all 0.3s ease'
										}}
										onDrop={(e) => {
											handleDrop(e, 'valueFields');
											e.currentTarget.style.backgroundColor = 'rgba(25, 135, 84, 0.03)';
											e.currentTarget.style.borderColor = '#198754';
										}}
										onDragOver={handleDragOver}
										onDragEnter={(e) => {
											e.currentTarget.style.backgroundColor = 'rgba(25, 135, 84, 0.1)';
											e.currentTarget.style.borderColor = '#146c43';
											e.currentTarget.style.borderWidth = '3px';
										}}
										onDragLeave={(e) => {
											e.currentTarget.style.backgroundColor = 'rgba(25, 135, 84, 0.03)';
											e.currentTarget.style.borderColor = '#198754';
											e.currentTarget.style.borderWidth = '2px';
										}}
									>
										{pivotConfig.valueFields.length === 0 ? (
											<div className="text-center text-muted py-2" style={{ fontSize: '11px' }}>
												<div style={{ fontSize: '20px', opacity: 0.5 }}>⬇️</div>
												<div className="mt-1">Drop numeric fields</div>
											</div>
										) : (
											<div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
												{pivotConfig.valueFields.map(field => (
													<div key={field} className="badge bg-success" style={{ padding: '8px 10px', fontSize: '11px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '6px' }}>
														<span>📈 {availableFields.find(f => f.key === field)?.header}</span>
														<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
															<select
																value={pivotConfig.aggregations[field] || 'Sum'}
																onChange={(e) => setAggregation(field, e.target.value)}
																className="form-select form-select-sm"
																style={{
																	fontSize: '10px',
																	padding: '2px 6px',
																	height: '22px',
																	width: '65px',
																	backgroundColor: 'rgba(255,255,255,0.95)',
																	border: '1px solid rgba(255,255,255,0.3)',
																	color: '#000',
																	fontWeight: '500'
																}}
															>
																{aggregationTypes.map(type => (
																	<option key={type} value={type}>{type}</option>
																))}
															</select>
															<button
																onClick={() => removeField('valueFields', field)}
																className="btn-close btn-close-white"
																style={{ fontSize: '8px', padding: '0', width: '12px', height: '12px' }}
																title="Remove"
															/>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</div>

								{/* Column Labels */}
								<div className="mb-3">
									<div className="d-flex align-items-center mb-2">
										<span style={{ fontSize: '11px', fontWeight: '600', color: '#fd7e14', letterSpacing: '0.5px' }}>📑 COLUMN LABELS</span>
										<span className="badge bg-warning text-dark ms-2" style={{ fontSize: '9px' }}>{pivotConfig.columnLabels.length}</span>
									</div>
									<div
										className="rounded-2 shadow-sm"
										style={{
											minHeight: '65px',
											border: '2px dashed #fd7e14',
											padding: '10px',
											backgroundColor: 'rgba(253, 126, 20, 0.03)',
											transition: 'all 0.3s ease'
										}}
										onDrop={(e) => {
											handleDrop(e, 'columnLabels');
											e.currentTarget.style.backgroundColor = 'rgba(253, 126, 20, 0.03)';
											e.currentTarget.style.borderColor = '#fd7e14';
										}}
										onDragOver={handleDragOver}
										onDragEnter={(e) => {
											e.currentTarget.style.backgroundColor = 'rgba(253, 126, 20, 0.1)';
											e.currentTarget.style.borderColor = '#ca6510';
											e.currentTarget.style.borderWidth = '3px';
										}}
										onDragLeave={(e) => {
											e.currentTarget.style.backgroundColor = 'rgba(253, 126, 20, 0.03)';
											e.currentTarget.style.borderColor = '#fd7e14';
											e.currentTarget.style.borderWidth = '2px';
										}}
									>
										{pivotConfig.columnLabels.length === 0 ? (
											<div className="text-center text-muted py-2" style={{ fontSize: '11px' }}>
												<div style={{ fontSize: '20px', opacity: 0.5 }}>⬇️</div>
												<div className="mt-1">Drop here</div>
											</div>
										) : (
											<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
												{pivotConfig.columnLabels.map(field => (
													<div key={field} className="badge bg-warning text-dark" style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}>
														🏷️ {availableFields.find(f => f.key === field)?.header}
														<button
															onClick={() => removeField('columnLabels', field)}
															className="btn-close"
															style={{ fontSize: '8px', padding: '0', width: '12px', height: '12px' }}
															title="Remove"
														/>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
					{!isPivotMode && (
						<div className="col-3 border-1 border-start p-2 " style={{ overflowY: 'auto', maxHeight: '70vh', backgroundColor: '#fafbfc' }}>
							<div className="mt-3">
								<div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
									<h6 className="mb-0 fw-bold" style={{ color: '#198754' }}>🎛️ Table Controls</h6>
								</div>

								{/* Column Reordering */}
								<div className="mb-4">
									<div className="d-flex align-items-center mb-2">
										<span style={{ fontSize: '11px', fontWeight: '600', color: '#0d6efd', letterSpacing: '0.5px' }}>🔄 COLUMN ORDER</span>
									</div>
									<div className="rounded-2 p-3 shadow-sm" style={{ backgroundColor: 'rgba(13, 110, 253, 0.03)', border: '1px solid rgba(13, 110, 253, 0.2)' }}>
										<div className="mb-2" style={{ fontSize: '11px', color: '#6c757d' }}>
											<span>↔️</span> Drag column headers to reorder
										</div>
										<button
											onClick={() => setColumnOrder(column.map(col => col.accessor || col.id))}
											className="btn btn-sm w-100"
											style={{
												background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
												color: 'white',
												border: 'none',
												fontSize: '11px',
												fontWeight: '500',
												borderRadius: '6px',
												padding: '6px 12px'
											}}
										>
											🔄 Reset Order
										</button>
									</div>
								</div>

								{/* Row Grouping */}
								<div className="mb-4">
									<div className="d-flex align-items-center justify-content-between mb-2">
										<div className="d-flex align-items-center">
											<span style={{ fontSize: '11px', fontWeight: '600', color: '#198754', letterSpacing: '0.5px' }}>📊 ROW GROUPS</span>
											<span className="badge bg-success ms-2" style={{ fontSize: '9px' }}>{rowGroups.length}</span>
										</div>
										{rowGroups.length > 0 && (
											<button onClick={clearRowGroups} className="btn btn-sm" style={{ fontSize: '10px', padding: '2px 8px', color: '#dc3545', background: 'none', border: 'none' }}>
												🗑️
											</button>
										)}
									</div>
									<div className="rounded-2 p-3 shadow-sm" style={{ backgroundColor: 'rgba(25, 135, 84, 0.03)', border: '1px solid rgba(25, 135, 84, 0.2)' }}>
										<select
											className="form-select form-select-sm mb-3"
											onChange={(e) => {
												if (e.target.value) {
													addRowGroup(e.target.value);
													e.target.value = '';
												}
											}}
											style={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #198754' }}
										>
											<option value="">➕ Add group field...</option>
											{availableFields.filter(field => !rowGroups.includes(field.key)).map(field => (
												<option key={field.key} value={field.key}>{field.header}</option>
											))}
										</select>
										{rowGroups.length === 0 ? (
											<div className="text-center text-muted py-2" style={{ fontSize: '11px' }}>
												<div style={{ fontSize: '20px', opacity: 0.5 }}>📋</div>
												<div className="mt-1">No groups</div>
											</div>
										) : (
											<div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
												{rowGroups.map(field => (
													<div key={field} className="badge bg-success text-white" style={{ padding: '8px 10px', fontSize: '11px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '6px' }}>
														<span>🏷️ {availableFields.find(f => f.key === field)?.header}</span>
														<button
															onClick={() => removeRowGroup(field)}
															className="btn-close btn-close-white"
															style={{ fontSize: '8px', padding: '0', width: '12px', height: '12px' }}
															title="Remove"
														/>
													</div>
												))}
											</div>
										)}
									</div>
								</div>

								{/* Column Grouping */}
								<div className="mb-4">
									<div className="d-flex align-items-center mb-2">
										<span style={{ fontSize: '11px', fontWeight: '600', color: '#0d6efd', letterSpacing: '0.5px' }}>📁 COLUMN GROUPS</span>
										<span className="badge bg-primary ms-2" style={{ fontSize: '9px' }}>{Object.keys(columnGroups).length}</span>
									</div>
									<div className="rounded-2 p-3 shadow-sm" style={{ backgroundColor: 'rgba(13, 110, 253, 0.03)', border: '1px solid rgba(13, 110, 253, 0.2)' }}>
										<input
											type="text"
											placeholder="Group name"
											className="form-control form-control-sm mb-2"
											value={groupNameInput}
											onChange={(e) => setGroupNameInput(e.target.value)}
											style={{ fontSize: '11px', borderRadius: '6px' }}
										/>
										<select
											className="form-select form-select-sm mb-2"
											multiple
											value={selectedColumns}
											onChange={(e) => {
												const values = Array.from(e.target.selectedOptions, option => option.value);
												setSelectedColumns(values);
											}}
											style={{ fontSize: '11px', borderRadius: '6px', minHeight: '80px' }}
										>
											{availableFields.map(field => (
												<option key={field.key} value={field.key}>{field.header}</option>
											))}
										</select>
										<button
											className="btn btn-sm w-100 mb-3"
											style={{
												background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
												color: 'white',
												border: 'none',
												fontSize: '11px',
												fontWeight: '500',
												borderRadius: '6px',
												padding: '6px 12px'
											}}
											onClick={() => {
												if (groupNameInput && selectedColumns.length > 0) {
													createColumnGroup(groupNameInput, selectedColumns);
													setGroupNameInput('');
													setSelectedColumns([]);
												}
											}}
										>
											➕ Create Group
										</button>
										{Object.keys(columnGroups).length === 0 ? (
											<div className="text-center text-muted py-2" style={{ fontSize: '11px' }}>
												<div style={{ fontSize: '20px', opacity: 0.5 }}>📂</div>
												<div className="mt-1">No groups</div>
											</div>
										) : (
											<div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
												{Object.entries(columnGroups).map(([groupName, groupData]) => (
													<div key={groupName} className="badge bg-primary text-white" style={{ padding: '8px 10px', fontSize: '11px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '6px' }}>
														<span
															style={{ cursor: 'pointer', flex: 1 }}
															onClick={() => toggleColumnGroup(groupName)}
														>
															{groupData.collapsed ? '📁' : '📂'} {groupName}
														</span>
														<button
															onClick={() => removeColumnGroup(groupName)}
															className="btn-close btn-close-white"
															style={{ fontSize: '8px', padding: '0', width: '12px', height: '12px' }}
															title="Remove"
														/>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
				<div className="p-2">
					{serverSideFiltering && (
						<div
							className="d-flex justify-content-between align-items-center py-3 px-3 border-top"
							style={{
								backgroundColor: '#f8f9fa',
								borderRadius: '0 0 8px 8px'
							}}
						>
							{/* Info Section */}
							<div className="d-flex align-items-center gap-3">
								<div style={{ fontSize: '14px', fontWeight: '500', color: '#212529' }}>
									<span style={{ color: '#198754' }}>Page {queryParams.page}</span>
								</div>
								<div
									className="vr"
									style={{
										height: '24px',
										width: '2px',
										backgroundColor: '#dee2e6'
									}}
								></div>
								<div style={{ fontSize: '13px', color: '#6c757d' }}>
									<span className="fw-semibold" style={{ color: '#495057' }}>
										{filteredData.length || 0}
									</span>
									<span> records</span>
								</div>
							</div>

							{/* Pagination Controls */}
							<div className="d-flex align-items-center gap-2">
								{/* Previous */}
								<button
									type="button"
									onClick={() => handlePagination("Previous")}
									disabled={queryParams.page === 1}
									style={{
										padding: '6px 14px',
										fontSize: '13px',
										fontWeight: '500',
										border: '1px solid #198754',
										borderRadius: '6px',
										backgroundColor: 'white',
										color: queryParams.page === 1 ? '#adb5bd' : '#198754',
										cursor: queryParams.page === 1 ? 'not-allowed' : 'pointer',
										transition: 'all 0.2s ease',
										display: 'flex',
										alignItems: 'center',
										gap: '6px',
										opacity: queryParams.page === 1 ? 0.6 : 1
									}}
									onMouseEnter={(e) => {
										if (queryParams.page !== 1) {
											e.currentTarget.style.backgroundColor = '#d1e7dd';
											e.currentTarget.style.borderColor = '#198754';
										}
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = 'white';
										e.currentTarget.style.borderColor = '#198754';
									}}
								>
									<span>←</span>
									<span>Previous</span>
								</button>

								{/* Page Numbers */}
								<div className="d-flex gap-1">
									{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => {
										const isActive = queryParams.page === item;
										return (
											<button
												type="button"
												onClick={() => handlePagination(item)}
												key={item}
												aria-current={isActive ? "page" : undefined}
												style={{
													minWidth: '38px',
													height: '38px',
													padding: '6px',
													fontSize: '13px',
													fontWeight: isActive ? '600' : '500',
													border: `1.5px solid ${isActive ? '#198754' : '#dee2e6'}`,
													borderRadius: '6px',
													backgroundColor: isActive ? '#198754' : 'white',
													color: isActive ? 'white' : '#495057',
													cursor: 'pointer',
													transition: 'all 0.2s ease',
													boxShadow: isActive ? '0 2px 6px rgba(25, 135, 84, 0.25)' : 'none'
												}}
												onMouseEnter={(e) => {
													if (!isActive) {
														e.currentTarget.style.backgroundColor = '#d1e7dd';
														e.currentTarget.style.borderColor = '#198754';
														e.currentTarget.style.transform = 'translateY(-1px)';
													}
												}}
												onMouseLeave={(e) => {
													if (!isActive) {
														e.currentTarget.style.backgroundColor = 'white';
														e.currentTarget.style.borderColor = '#dee2e6';
														e.currentTarget.style.transform = 'translateY(0)';
													}
												}}
											>
												{item}
											</button>
										);
									})}
								</div>

								{/* Next */}
								<button
									type="button"
									onClick={() => handlePagination("Next")}
									style={{
										padding: '6px 14px',
										fontSize: '13px',
										fontWeight: '500',
										border: '1px solid #198754',
										borderRadius: '6px',
										backgroundColor: 'white',
										color: '#198754',
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										display: 'flex',
										alignItems: 'center',
										gap: '6px'
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.backgroundColor = '#d1e7dd';
										e.currentTarget.style.borderColor = '#198754';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = 'white';
										e.currentTarget.style.borderColor = '#198754';
									}}
								>
									<span>Next</span>
									<span>→</span>
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Drill Down Modal */}
				{drillDownData && (
					<div
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							backgroundColor: 'rgba(0,0,0,0.5)',
							zIndex: 10000,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}
						onClick={closeDrillDown}
					>
						<div
							style={{
								backgroundColor: 'white',
								borderRadius: '8px',
								padding: '20px',
								maxWidth: '90vw',
								maxHeight: '90vh',
								overflow: 'auto',
								boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
							}}
							onClick={(e) => e.stopPropagation()}
						>
							<div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
								<h5 className="mb-0">
									🔍 Drill Down: {drillDownData.groupField} = {drillDownData.groupKey}
								</h5>
								<button
									onClick={closeDrillDown}
									className="btn btn-sm btn-outline-danger"
									style={{ fontSize: '12px' }}
								>
									✕ Close
								</button>
							</div>

							<div style={{ fontSize: '12px' }}>
								<p className="text-muted mb-3">
									Showing {drillDownData.data.length} records
								</p>

								<div style={{ overflowX: 'auto' }}>
									<table className="table table-sm table-bordered table-hover" style={{ fontSize: '11px' }}>
										<thead style={{ backgroundColor: '#f8f9fa' }}>
											<tr>
												{drillDownData.data.length > 0 && Object.keys(drillDownData.data[0]).map(key => (
													<th key={key} style={{ padding: '8px', whiteSpace: 'nowrap' }}>
														{availableFields.find(f => f.key === key)?.header || key}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{drillDownData.data.map((row, idx) => (
												<tr key={idx}>
													{Object.keys(row).map(key => (
														<td key={key} style={{ padding: '6px' }}>
															{row[key]}
														</td>
													))}
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Share Configuration Modal */}
				{showShareModal && shareConfig && (
					<div
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							backgroundColor: 'rgba(0,0,0,0.5)',
							zIndex: 10000,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}
						onClick={() => setShowShareModal(false)}
					>
						<div
							style={{
								backgroundColor: 'white',
								borderRadius: '8px',
								padding: '25px',
								maxWidth: '600px',
								width: '90%',
								boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
							}}
							onClick={(e) => e.stopPropagation()}
						>
							<div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
								<h5 className="mb-0">🔗 Share Configuration</h5>
								<button
									onClick={() => setShowShareModal(false)}
									className="btn btn-sm btn-outline-danger"
									style={{ fontSize: '12px' }}
								>
									✕ Close
								</button>
							</div>

							<div style={{ fontSize: '13px' }}>
								<p className="text-muted mb-3">
									Share this exact table configuration (pivot settings, filters, formatting, chart type, etc.) with others.
								</p>

								<div className="mb-4">
									<label className="form-label fw-bold" style={{ fontSize: '12px' }}>Share URL:</label>
									<div className="input-group">
										<input
											type="text"
											className="form-control form-control-sm"
											value={shareConfig.url}
											readOnly
											style={{ fontSize: '11px', fontFamily: 'monospace' }}
										/>
										<button
											className="btn btn-sm btn-primary"
											onClick={() => copyToClipboard(shareConfig.url)}
											style={{ fontSize: '11px' }}
										>
											📋 Copy URL
										</button>
									</div>
									<small className="text-muted">Anyone with this URL can load your exact configuration</small>
								</div>

								<div className="mb-3">
									<label className="form-label fw-bold" style={{ fontSize: '12px' }}>Configuration JSON:</label>
									<div className="input-group">
										<textarea
											className="form-control form-control-sm"
											value={shareConfig.json}
											readOnly
											rows={6}
											style={{ fontSize: '10px', fontFamily: 'monospace' }}
										/>
									</div>
									<div className="mt-2">
										<button
											className="btn btn-sm btn-outline-primary"
											onClick={() => copyToClipboard(shareConfig.json)}
											style={{ fontSize: '11px' }}
										>
											📋 Copy JSON
										</button>
										<small className="text-muted ms-2">Save this JSON to restore configuration later</small>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Schedule Reports Modal */}
				{showScheduleModal && (
					<div
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							backgroundColor: 'rgba(0,0,0,0.5)',
							zIndex: 10000,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}
						onClick={() => setShowScheduleModal(false)}
					>
						<div
							style={{
								backgroundColor: 'white',
								borderRadius: '8px',
								padding: '25px',
								maxWidth: '500px',
								width: '90%',
								boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
							}}
							onClick={(e) => e.stopPropagation()}
						>
							<div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
								<h5 className="mb-0">⏰ Schedule Reports</h5>
								<button
									onClick={() => setShowScheduleModal(false)}
									className="btn btn-sm btn-outline-danger"
									style={{ fontSize: '12px' }}
								>
									✕ Close
								</button>
							</div>

							<div style={{ fontSize: '13px' }}>
								<p className="text-muted mb-3">
									Automatically generate and email this report on a schedule.
								</p>

								<div className="mb-3">
									<div className="form-check form-switch mb-3">
										<input
											className="form-check-input"
											type="checkbox"
											id="enableSchedule"
											checked={scheduleConfig.enabled}
											onChange={(e) => setScheduleConfig({ ...scheduleConfig, enabled: e.target.checked })}
										/>
										<label className="form-check-label" htmlFor="enableSchedule">
											Enable Scheduled Reports
										</label>
									</div>
								</div>

								{scheduleConfig.enabled && (
									<>
										<div className="mb-3">
											<label className="form-label" style={{ fontSize: '12px' }}>Frequency:</label>
											<select
												className="form-select form-select-sm"
												value={scheduleConfig.frequency}
												onChange={(e) => setScheduleConfig({ ...scheduleConfig, frequency: e.target.value })}
											>
												<option value="daily">📅 Daily</option>
												<option value="weekly">📆 Weekly (Monday)</option>
												<option value="monthly">📊 Monthly (1st of month)</option>
												<option value="custom">⚙️ Custom</option>
											</select>
										</div>

										<div className="mb-3">
											<label className="form-label" style={{ fontSize: '12px' }}>Time:</label>
											<input
												type="time"
												className="form-control form-control-sm"
												value={scheduleConfig.time}
												onChange={(e) => setScheduleConfig({ ...scheduleConfig, time: e.target.value })}
											/>
										</div>

										<div className="mb-3">
											<label className="form-label" style={{ fontSize: '12px' }}>Email Recipients:</label>
											<input
												type="email"
												className="form-control form-control-sm"
												placeholder="email@example.com, another@example.com"
												value={scheduleConfig.email}
												onChange={(e) => setScheduleConfig({ ...scheduleConfig, email: e.target.value })}
											/>
											<small className="text-muted">Separate multiple emails with commas</small>
										</div>

										<div className="mb-3">
											<label className="form-label" style={{ fontSize: '12px' }}>Export Format:</label>
											<div>
												<div className="form-check form-check-inline">
													<input
														className="form-check-input"
														type="radio"
														id="formatExcel"
														value="excel"
														checked={scheduleConfig.format === 'excel'}
														onChange={(e) => setScheduleConfig({ ...scheduleConfig, format: e.target.value })}
													/>
													<label className="form-check-label" htmlFor="formatExcel">
														📊 Excel
													</label>
												</div>
												<div className="form-check form-check-inline">
													<input
														className="form-check-input"
														type="radio"
														id="formatCSV"
														value="csv"
														checked={scheduleConfig.format === 'csv'}
														onChange={(e) => setScheduleConfig({ ...scheduleConfig, format: e.target.value })}
													/>
													<label className="form-check-label" htmlFor="formatCSV">
														📄 CSV
													</label>
												</div>
											</div>
										</div>

										<div className="alert alert-info" style={{ fontSize: '11px' }}>
											<strong>Note:</strong> Scheduled reports will be generated using the current table configuration.
											Any changes to filters, grouping, or formatting will be reflected in future reports.
										</div>

										<div className="d-flex gap-2 justify-content-end mt-3">
											<button
												className="btn btn-sm btn-secondary"
												onClick={() => setShowScheduleModal(false)}
											>
												Cancel
											</button>
											<button
												className="btn btn-sm btn-primary"
												onClick={() => {
													alert('Schedule saved! Reports will be sent to: ' + scheduleConfig.email);
													setShowScheduleModal(false);
												}}
											>
												💾 Save Schedule
											</button>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}