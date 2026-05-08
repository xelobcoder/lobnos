"use client";
import React from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";
import { currencyFormatter } from "../../../../components/Auth/customFetch";

// Colors from monthlySalesTrend
const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BAR = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';

export interface CommissionChartData {
	service_date: string;
	commission_earned: string;
}

interface CommissionLineChartProps {
	data: {
		service_date: string;
		commission_earned: string;
	}[];
	view?: 'bar' | 'line';
}

export default function CommissionLineChart({ data, view }: CommissionLineChartProps) {
	const chartData = React.useMemo(() => {
		const groupedByDate = data.reduce((acc, item) => {
			const dateKey = dayjs(item.service_date).format("YYYY-MM-DD");
			const amount = Number(item.commission_earned);

			if (!Number.isFinite(amount) || amount <= 0) {
				return acc;
			}

			acc[dateKey] = (acc[dateKey] || 0) + amount;
			return acc;
		}, {} as Record<string, number>);

		return Object.entries(groupedByDate)
			.sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
			.map(([service_date, commission_earned]) => ({
				service_date,
				commission_earned,
				dateLabel: dayjs(service_date).format("MMM D, YYYY"),
			}));
	}, [data]);

	// Use view prop if provided, otherwise auto-switch
	let useBar = chartData.length > 12;
	if (view === 'bar') useBar = true;
	if (view === 'line') useBar = false;
	const ChartComponent = useBar ? BarChart : LineChart;

	return (
		<div style={{ width: "100%", height: 350, marginBottom: 32 }}>
			<ResponsiveContainer>
				<ChartComponent data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 45 }} barGap={useBar ? 4 : undefined} barCategoryGap={useBar ? "20%" : undefined}>
					<CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} vertical={false} />
					<XAxis dataKey="dateLabel" tick={{ fontSize: 12, fill: COLOR_TEXT_MUTED }} angle={useBar ? -45 : 0} textAnchor={useBar ? "end" : "middle"} height={useBar ? 60 : 30} interval="preserveStartEnd" axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
					<YAxis allowDecimals={false} tick={{ fontSize: 12, fill: COLOR_TEXT_MUTED }} tickFormatter={(value) => currencyFormatter.format(value)} axisLine={false} tickLine={false} width={95} />
					<Tooltip
						content={({ active, payload }) => {
							if (active && payload && payload.length) {
								const entry = payload[0].payload;
								return (
									<div style={{
										background: "var(--bs-body-bg)", border: `1px solid ${COLOR_BORDER}`,
										borderRadius: 8, padding: 12, minWidth: 120, fontSize: 13, color: "var(--bs-body-color)"
									}}>
										<div style={{ marginBottom: 6 }}>
											<span style={{ color: COLOR_TEXT_MUTED, fontSize: 12 }}>Date</span>
											<div style={{ fontWeight: 600 }}>{entry.dateLabel}</div>
										</div>
										<div>
											<span style={{ color: COLOR_TEXT_MUTED, fontSize: 12 }}>Commission</span>
											<div style={{ fontWeight: 600, color: COLOR_ACCENT }}>{currencyFormatter.format(entry.commission_earned)}</div>
										</div>
									</div>
								);
							}
							return null;
						}}
						cursor={{ fill: 'var(--bs-tertiary-bg)' }}
					/>
					<Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }} />
					{useBar ? (
						<Bar
							dataKey="commission_earned"
							name="Commission Earned"
							fill={COLOR_BAR}
							radius={4}
							maxBarSize={100}
						/>
					) : (
						<Line
							type="monotone"
							dataKey="commission_earned"
							name="Commission Earned"
							stroke={COLOR_ACCENT}
							strokeWidth={3}
							dot={{ r: 4 }}
							activeDot={{ r: 6 }}
						/>
					)}
				</ChartComponent>
			</ResponsiveContainer>
		</div>
	);
}
