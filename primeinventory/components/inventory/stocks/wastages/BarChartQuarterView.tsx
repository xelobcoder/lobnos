'use client';

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	BarChart,
	Bar,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Cell,
} from "recharts";
import Select from "react-select";
import Loader from "../../../accessories/Loader";
import { currencyFormatter } from "../../../../Lib/fetcher";

type ChartType = "Bar" | "Area";

type QuarterlyDataBarChart = {
	month: number;
	debitAmount: number;
};

type ChartSelectorProps = {
	quarterlyData: QuarterlyDataBarChart[];
	quarter?: number;
};

const chartOptions = [
	{ value: "Bar", label: "Bar Chart" },
	{ value: "Area", label: "Area Chart" },
];

const COLORS = [
	"#004c6d",
	"#346888",
	"#5886a5",
	"#7aa6c2",
	"#9dc6e0",
	"#c1e7ff",
];

export default function ChartSelector({ quarterlyData, quarter }: ChartSelectorProps) {
	const [data, setData] = useState<{ month: string; wastages: number }[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [selectedChart, setSelectedChart] = useState<ChartType>("Bar");

	const monthCollection = useMemo(
		() => ({
			1: "January",
			2: "February",
			3: "March",
			4: "April",
			5: "May",
			6: "June",
			7: "July",
			8: "August",
			9: "September",
			10: "October",
			11: "November",
			12: "December",
		}),
		[]
	);

	const getChartData = useCallback(() => {
		let flow: number[] = [];
		if (quarter === 1) {
			flow = [1, 2, 3, 4];
		} else if (quarter === 2) {
			flow = [5, 6, 7, 8];
		} else if (quarter === 3) {
			flow = [9, 10, 11, 12];
		} else {
			flow = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
		}

		if (quarterlyData.length === 0) {
			setData([]);
		} else {
			const summarizedData = flow.map((month) => {
				const filteredData = quarterlyData.filter((item) => item.month === month);
				const totalDebitAmount = filteredData.reduce((total, item) => total + item.debitAmount, 0);
				return { month: monthCollection[month], wastages: totalDebitAmount };
			});

			const hasNonZeroWastages = summarizedData.some((entry) => entry.wastages !== 0);
			setData(hasNonZeroWastages ? summarizedData : []);
		}

		setIsLoading(false);
	}, [quarter, quarterlyData, monthCollection]);

	useEffect(() => {
		if (quarterlyData.length > 0) {
			getChartData();
		}
	}, [quarterlyData, getChartData]);

	if (isLoading) {
		return <Loader />;
	}

	if (data.length === 0) {
		return (
			<div className="alert alert-primary mx-2">
				<h3>No Quarterly Data Available For Chart</h3>
			</div>
		);
	}

	const renderChart = () => {
		switch (selectedChart) {
			case "Area":
				return (
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={data}>
							<XAxis dataKey="month" />
							<YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
							<Tooltip formatter={(value) => currencyFormatter.format(value as number)} />
							<Legend />
							<Area type="monotone" dataKey="wastages" stroke="#004c6d" fill="#004c6d" />
						</AreaChart>
					</ResponsiveContainer>
				);
			default:
				return (
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={data}>
							<XAxis dataKey="month" />
							<YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
							<Tooltip formatter={(value) => currencyFormatter.format(value as number)} />
							<Legend />
							<Bar dataKey="wastages" barSize={50}>
								{data.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				);
		}
	};

	return (
		<div className="my-2 m-2 p-2">
			<div className="col-4">
				<Select
					options={chartOptions}
					defaultValue={chartOptions[0]}
					onChange={(option) => setSelectedChart(option?.value as ChartType)}
					className="mb-3"
				/>
			</div>
			<div className="chart-container" style={{ width: '100%', height: '400px' }}>
				{renderChart()}
			</div>
		</div>
	);
}
