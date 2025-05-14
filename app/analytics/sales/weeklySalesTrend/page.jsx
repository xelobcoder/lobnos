"use client"
import { useEffect, useState } from "react";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function WeeklySalesTrend() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const url = `financials/billing/summary?key=weeklySalesTrend&startDate=${startDate}&endDate=${endDate}`;
            customFetch(url)
                .then((fetchedData) => {
                    setData(fetchedData);
                    setLoading(false);
                })
                .catch(() => {
                    setData([]);
                    setLoading(false);
                });
        };

        fetchData();
    }, [startDate, endDate]);

    const handleStartDateChange = (e) => setStartDate(e.target.value);
    const handleEndDateChange = (e) => setEndDate(e.target.value);

    const handleResetFilters = () => {
        setStartDate("");
        setEndDate("");
    };

    const totalSales = data.reduce((sum, entry) => sum + entry.totalSales, 0);

    return (
        <div>
            <h3 className="fw-bold mb-4 bg-secondary-subtle rounded p-3 d-flex align-items-center">
                Weekly Sales Trend
            </h3>

            <div className="d-flex flex-wrap gap-2 col-12 mb-3 bg-light p-3 rounded">
                <div className="d-flex align-items-center">
                    <label className="me-2">Start</label>
                    <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={handleStartDateChange}
                    />
                </div>
                <div className="d-flex align-items-center ms-2">
                    <label className="me-2">End</label>
                    <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={handleEndDateChange}
                    />
                </div>
                <button
                    onClick={handleResetFilters}
                    className="btn btn-outline-danger ms-2 d-flex align-items-center"
                >
                    Reset
                </button>
            </div>

            {loading ? (
                <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                    Loading or no data available...
                </p>
            ) : data.length > 0 ? (
                <div style={{ width: "100%", height: 400 }}>
                    <ResponsiveContainer>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" />
                            <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                            <Tooltip
                                formatter={(value, name) => {
                                    const percentage = ((value / totalSales) * 100).toFixed(2);
                                    return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="totalSales" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                    No data available...
                </p>
            )}
        </div>
    );
}