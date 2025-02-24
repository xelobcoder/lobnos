"use client";

import React, { useEffect, useState } from "react";
import { currencyFormatter, customFetch } from "../../../components/Auth/customFetch";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

interface SalesData {
    week: string;
    totalSales: number;
}

const WeeklySalesTrend: React.FC = () => {
    const [data, setData] = useState<SalesData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const COLORS = [
        "#36A2EB",
        "#FF6384",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
        "#66BB6A",
        "#FFA726",
        "#42A5F5",
        "#AB47BC",
    ];

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `financials/billing/summary?key=weeklySalesTrend&startDate=${startDate}&endDate=${endDate}`;
            const response = await customFetch(url);
            if (response) {
                const formattedData = response.map((item: any) => ({
                    ...item,
                    totalSales: parseFloat(item.totalSales),
                }));
                setData(formattedData);
            } else {
                setError("Failed to fetch data");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Initial load: Fetch data automatically when the component mounts
    useEffect(() => {
        fetchData();
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setStartDate(e.target.value);
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setEndDate(e.target.value);

    const handleLoadData = () => {
        if (startDate && endDate) {
            fetchData();
        } else {
            setError("Please select both start and end dates.");
        }
    };

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fs-4 fw-bold mb-0 pls-label bg-secondary-subtle br-5  p-2">Weekly Sales Trend</h2>
            </div>
            <div className="d-flex flex-wrap mb-3">
                <div className="d-flex align-items-center me-3 mb-2">
                    <label className="me-2">Start</label>
                    <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={handleStartDateChange}
                    />
                </div>
                <div className="d-flex align-items-center me-3 mb-2">
                    <label className="me-2">End</label>
                    <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={handleEndDateChange}
                    />
                </div>
                <div className="d-flex align-items-center mb-2">
                    <button
                        onClick={handleLoadData}
                        className="btn btn-primary btn-sm pls-label"
                        disabled={loading || !startDate || !endDate}
                    >
                        {loading ? "Loading..." : "Load Data"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-danger-subtle text-danger rounded mb-3">
                    Error: {error}
                </div>
            )}

            {data.length > 0 ? (
                <div style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" fontSize={12} tickSize={5} />
                            <YAxis
                                tickFormatter={(value: number) => currencyFormatter.format(value)}
                                fontSize={12}
                                width={80}
                                label={{
                                    value: "Total Sales",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: "middle" },
                                }}
                            />
                            <Tooltip
                                formatter={(value: number) => [currencyFormatter.format(value), "Sales"]}
                                labelStyle={{ color: "black", fontSize: "12px" }}
                                contentStyle={{ fontSize: "12px" }}
                            />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                            <Line
                                type="monotone"
                                dataKey="totalSales"
                                stroke={COLORS[0]}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                !loading && <p className="p-2 text-center bg-secondary-subtle">No data available...</p>
            )}
        </div>
    );
};

export default WeeklySalesTrend;