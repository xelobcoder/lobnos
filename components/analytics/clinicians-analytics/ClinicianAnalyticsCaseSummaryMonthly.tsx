'use client'
import React, { useEffect, useState } from 'react';
import { customFetch, reactSelectCustomStyles, currencyFormatter } from '../../Auth/customFetch';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	LabelList,
	AreaChart,
	Area,
	LineChart,
	Line
} from 'recharts';
import Select from 'react-select';
import {
	RiBarChartLine,
	RiErrorWarningLine,
	RiInboxLine,
	RiLineChartLine,
	RiBarChart2Line,
	RiUser3Line,
	RiMapPinLine,
	RiMailLine,
	RiPhoneLine
} from '@remixicon/react';

// Direct oklch color values
const COLOR_CLINICIAN = 'oklch(0.646 0.222 41.116)';
const COLOR_OTHER = 'oklch(0.6 0.118 184.704)';
const COLOR_LABEL_ON_BAR = 'oklch(0.98 0.01 0)'; // A very light color for text on dark bars

interface MonthlyCaseSummary {
	period: string; // format "YYYY-MM"
	total_clinician_cases: number;
	clinicians_total_cases: number;
	clinicians_revenue_generated: string;
	clinician_revenue_generated: string;
	percentage_revenue: string;
}

interface ChartDataPoint {
	month: string;  // Formatted month name (e.g., "Jan")
	totalClinicianCases: number;
	cliniciansTotalCases: number;
	cliniciansRevenueGenerated: number;
	clinicianRevenueGenerated: number;
	percentageRevenue: number;
}

type ChartType = 'area' | 'line' | 'bar';

interface ClinicianAnalyticsCaseSummaryMonthlyProps {
	clinicianId: number;
}

const monthNames = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const ClinicianAnalyticsCaseSummaryMonthly: React.FC<ClinicianAnalyticsCaseSummaryMonthlyProps> = ({ clinicianId }) => {
	const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
	const [clinicianDetails, setClinicianDetails] = useState<any>(null);
	const [selectedYear, setSelectedYear] = useState({ value: new Date().getFullYear(), label: new Date().getFullYear().toString() });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [chartType, setChartType] = useState<ChartType>('bar');

	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 5 }, (_, i) => ({
		value: currentYear - i,
		label: (currentYear - i).toString()
	}));

	useEffect(() => {
		const fetchMonthlyData = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await customFetch(
					`clinician/anal/case-summary/monthly/${clinicianId}?year=${selectedYear.value}`
				);
				let summaryArr = [];
				let details = null;
				if (response?.success && response.data && Array.isArray(response.data.monthlyCaseSummary)) {
					summaryArr = response.data.monthlyCaseSummary;
					if (Array.isArray(response.data.clinicianDetails) && response.data.clinicianDetails.length > 0) {
						details = response.data.clinicianDetails[0];
					}
				} else if (response?.success && Array.isArray(response.data)) {
					summaryArr = response.data;
				}
				if (details) setClinicianDetails(details);
				if (summaryArr.length) {
					const sortedData = summaryArr.sort((a: MonthlyCaseSummary, b: MonthlyCaseSummary) =>
						a.period.localeCompare(b.period)
					);
					const formattedData = sortedData.map((item: MonthlyCaseSummary) => {
						const monthNum = parseInt(item.period.split('-')[1]) - 1;
						return {
							month: monthNames[monthNum],
							totalClinicianCases: item.total_clinician_cases || 0,
							cliniciansTotalCases: item.clinicians_total_cases || 0,
							cliniciansRevenueGenerated: item.clinicians_revenue_generated ? parseFloat(item.clinicians_revenue_generated) : 0,
							clinicianRevenueGenerated: item.clinician_revenue_generated ? parseFloat(item.clinician_revenue_generated) : 0,
							percentageRevenue: item.percentage_revenue ? parseFloat(item.percentage_revenue) : 0
						};
					});
					setChartData(formattedData);
				} else {
					setChartData([]);
				}
			} catch (err) {
				setChartData([]);
				setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching data.');
			} finally {
				setLoading(false);
			}
		};

		fetchMonthlyData();
	}, [clinicianId, selectedYear.value]);

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload as ChartDataPoint;
			return (
				<div className="bg-white p-3 border rounded shadow-sm" style={{ minWidth: '250px' }}>
					<p className="mb-2 fw-bold text-body-emphasis">{label} ({selectedYear.label})</p>
					<div className="mb-2">
						<p className="mb-1" style={{ color: COLOR_CLINICIAN }}>
							<small>●</small> This Clinician Cases: <strong>{data.totalClinicianCases || 0}</strong>
						</p>
						<p className="mb-1 text-body-secondary">
							All Clinicians Cases: <strong>{data.cliniciansTotalCases || 0}</strong>
						</p>
						<p className="mb-1 text-body-secondary">
							All Clinicians Revenue: <strong>{data.cliniciansRevenueGenerated ? currencyFormatter.format(data.cliniciansRevenueGenerated) : '-'}</strong>
						</p>
						<p className="mb-1 text-body-secondary">
							This Clinician Revenue: <strong>{data.clinicianRevenueGenerated ? currencyFormatter.format(data.clinicianRevenueGenerated) : '-'}</strong>
						</p>
						<p className="mb-1 text-body-secondary">
							Revenue %: <strong>{data.percentageRevenue ? data.percentageRevenue.toFixed(2) : '0.00'}%</strong>
						</p>
					</div>
				</div>
			);
		}
		return null;
	};

	const renderContent = () => {
		if (loading) return (
			<div className="d-flex justify-content-center align-items-center" style={{ height: '350px' }}>
				<div className="spinner-border" style={{ color: COLOR_CLINICIAN }} role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);

		if (error) return (
			<div className="d-flex flex-column justify-content-center align-items-center text-danger-emphasis bg-danger-subtle p-4 rounded" style={{ height: '350px' }}>
				<RiErrorWarningLine size={48} className="mb-2" />
				<h5 className="fw-medium">Error Loading Data</h5>
				<p className="text-center mb-0">{error}</p>
			</div>
		);

		if (chartData.length === 0) return (
			<div className="d-flex flex-column justify-content-center align-items-center text-body-secondary bg-body-tertiary p-4 rounded" style={{ height: '350px' }}>
				<RiInboxLine size={48} className="mb-2" />
				<h5 className="fw-medium">No Data Available</h5>
				<p className="text-center mb-0">There is no monthly case data for the selected year ({selectedYear.label}).</p>
			</div>
		);

		return (
			<>
				<div className="d-flex justify-content-end gap-2 mb-3">
					<button
						onClick={() => setChartType('bar')}
						className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-primary'}`}
					>
						<RiBarChartLine className="me-1" />
						Bar
					</button>
					<button
						onClick={() => setChartType('area')}
						className={`btn btn-sm ${chartType === 'area' ? 'btn-primary' : 'btn-outline-primary'}`}
					>
						<RiBarChart2Line className="me-1" />
						Area
					</button>
					<button
						onClick={() => setChartType('line')}
						className={`btn btn-sm ${chartType === 'line' ? 'btn-primary' : 'btn-outline-primary'}`}
					>
						<RiLineChartLine className="me-1" />
						Line
					</button>
				</div>

				<div style={{ height: '350px', width: '100%' }}>
					<ResponsiveContainer width="100%" height="100%">
						{chartType === 'bar' ? (
							<BarChart
								data={chartData}
								margin={{ top: 20, right: 5, left: 0, bottom: 5 }}
								barCategoryGap="25%"
							>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
								<XAxis
									dataKey="month"
									tick={{ fontSize: 12, fill: 'var(--bs-secondary-color)' }}
									axisLine={{ stroke: 'var(--bs-border-color)' }}
								/>
								<YAxis
									tick={{ fontSize: 12, fill: 'var(--bs-secondary-color)' }}
									axisLine={{ stroke: 'var(--bs-border-color)' }}
								/>
								<Tooltip content={<CustomTooltip />} />
								<Legend />
								<Bar dataKey="totalClinicianCases" name="Clinician Cases" fill={COLOR_CLINICIAN} radius={[4, 4, 0, 0]} />
								<Bar dataKey="cliniciansTotalCases" name="Total Clinician Cases" fill={COLOR_OTHER} radius={[4, 4, 0, 0]} />
							</BarChart>
						) : (
							chartType === 'area' ? (
								<AreaChart
									data={chartData}
									margin={{ top: 20, right: 5, left: 0, bottom: 5 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" />
									<XAxis
										dataKey="month"
										tick={{ fontSize: 12, fill: 'var(--bs-secondary-color)' }}
										axisLine={{ stroke: 'var(--bs-border-color)' }}
									/>
									<YAxis
										tick={{ fontSize: 12, fill: 'var(--bs-secondary-color)' }}
										axisLine={{ stroke: 'var(--bs-border-color)' }}
									/>
									<Tooltip content={<CustomTooltip />} />
									<Legend />
									<Area
										type="monotone"
										dataKey="totalClinicianCases"
										name="Clinician Cases"
										stroke={COLOR_CLINICIAN}
										fill={COLOR_CLINICIAN}
										fillOpacity={0.2}
									/>
									<Area
										type="monotone"
										dataKey="cliniciansTotalCases"
										name="Total Clinician Cases"
										stroke={COLOR_OTHER}
										fill={COLOR_OTHER}
										fillOpacity={0.2}
									/>
								</AreaChart>
							) : (
								<LineChart
									data={chartData}
									margin={{ top: 20, right: 5, left: 0, bottom: 5 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" />
									<XAxis
										dataKey="month"
										tick={{ fontSize: 12, fill: 'var(--bs-secondary-color)' }}
										axisLine={{ stroke: 'var(--bs-border-color)' }}
									/>
									<YAxis
										tick={{ fontSize: 12, fill: 'var(--bs-secondary-color)' }}
										axisLine={{ stroke: 'var(--bs-border-color)' }}
									/>
									<Tooltip content={<CustomTooltip />} />
									<Legend />
									<Line
										type="monotone"
										dataKey="totalClinicianCases"
										name="Clinician Cases"
										stroke={COLOR_CLINICIAN}
										dot={true}
									/>
									<Line
										type="monotone"
										dataKey="cliniciansTotalCases"
										name="Total Clinician Cases"
										stroke={COLOR_OTHER}
										dot={true}
									/>
								</LineChart>
							)
						)}
					</ResponsiveContainer>
				</div>

				<div className="table-responsive mt-4">
					<table className="table table-striped table-hover">
						<thead className="table-light">
							<tr>
								<th>Month</th>
								<th className="text-end">This Clinician Cases</th>
								<th className="text-end">All Clinicians Cases</th>
								<th className="text-end">All Clinicians Revenue</th>
								<th className="text-end">This Clinician Revenue</th>
								<th className="text-end">Revenue %</th>
							</tr>
						</thead>
						<tbody>
							{chartData.map((row) => (
								<tr key={row.month}>
									<td>{row.month}</td>
									<td className="text-end">{(row.totalClinicianCases || 0).toLocaleString()}</td>
									<td className="text-end">{(row.cliniciansTotalCases || 0).toLocaleString()}</td>
									<td className="text-end">{row.cliniciansRevenueGenerated ? currencyFormatter.format(row.cliniciansRevenueGenerated) : '-'}</td>
									<td className="text-end">{row.clinicianRevenueGenerated ? currencyFormatter.format(row.clinicianRevenueGenerated) : '-'}</td>
									<td className="text-end">{row.percentageRevenue ? row.percentageRevenue.toFixed(2) : '0.00'}%</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</>
		);
	};

	return (
		<div style={{ borderRadius: '0.75rem', background: '#fff' }}>
			<div className="card-header bg-body-tertiary d-flex flex-column flex-md-row justify-content-between align-items-md-center py-3 px-3 px-md-4">
				<div className="d-flex align-items-center mb-2 mb-md-0">
					<RiBarChart2Line size={24} style={{ color: COLOR_CLINICIAN }} className="me-2" />
					<h2 className="fs-5 fw-semibold text-body-emphasis mb-0">
						Monthly Case Distribution <span className="fw-normal text-body-secondary">({selectedYear.label})</span>
					</h2>
				</div>
				<div style={{ minWidth: '180px' }}>
					<Select
						options={yearOptions}
						value={selectedYear}
						onChange={(option) => setSelectedYear(option as { value: number; label: string })}
						isSearchable={false}
						styles={reactSelectCustomStyles}
						className="react-select-container"
						classNamePrefix="react-select"
						aria-label="Select year for monthly case summary"
					/>
				</div>
			</div>
			{clinicianDetails && (
				<div className="px-4 pt-3 pb-1 border-bottom bg-white">
					<div className="d-flex flex-wrap gap-3 align-items-center small text-secondary">
						<span><RiUser3Line className="me-1" /><strong>Name:</strong> {clinicianDetails.name}</span>
						{clinicianDetails.location && <span><RiMapPinLine className="me-1" /><strong>Location:</strong> {clinicianDetails.location}</span>}
						{clinicianDetails.email && <span><RiMailLine className="me-1" /><strong>Email:</strong> {clinicianDetails.email}</span>}
						{clinicianDetails.phone && <span><RiPhoneLine className="me-1" /><strong>Phone:</strong> {clinicianDetails.phone}</span>}
					</div>
				</div>
			)}
			<div className="card-body p-3 p-md-4">
				{renderContent()}
			</div>
		</div>
	);
};

export default ClinicianAnalyticsCaseSummaryMonthly;