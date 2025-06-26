"use client";
import React, { useEffect, useState } from "react";
import { customFetch, currencyFormatter } from "../../../components/Auth/customFetch";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { Button, Form } from "react-bootstrap";
import { RiRefreshFill } from "@remixicon/react";

interface DataEntry {
    hour: number;
    totalSales: number;
}

export default function SalesByHourOfDay() {
    const [data, setData] = useState<DataEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [chartType, setChartType] = useState("bar");
    const [totalSales, setTotalSales] = useState<number>(0);
    const [hourFilter, setHourFilter] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedDate) return;
            const url = `financials/billing/summary?key=salesByHourOfDay&startDate=${selectedDate}&endDate=${selectedDate}`;
            try {
                const fetchedData: DataEntry[] = await customFetch(url);
                const formattedData = fetchedData.map((entry) => ({
                    ...entry,
                    totalSales: Number(entry.totalSales) || 0,
                }));
                setData(formattedData);
                const calculatedTotalSales = formattedData.reduce((sum, entry) => sum + entry.totalSales, 0);
                setTotalSales(calculatedTotalSales);
            } catch (err) {
                setData([]);
                setTotalSales(0);
            } finally {
                setLoading(false);
            }
        };
        setLoading(true);
        fetchData();
    }, [selectedDate]);

    const formatHourRange = (hour: number): string => {
        const start = hour % 24;
        const end = (hour + 1) % 24;
        const formatTime = (h: number) => (h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`);
        return `${formatTime(start)} to ${formatTime(end)}`;
    };

    const allHours: number[] = Array.from({ length: 24 }, (_, index) => index);
    const filledData: DataEntry[] = allHours.map((hour) => {
        const hourData = data.find((entry) => entry.hour === hour);
        return hourData ? hourData : { hour, totalSales: 0 };
    });

    const filteredData = filledData.filter((entry) =>
        hourFilter === "" || formatHourRange(entry.hour).toLowerCase().includes(hourFilter.toLowerCase())
    );

    const getPercentageColor = (percentage: number): string => (percentage > 0 ? "green" : "red");

    const handleRefreshClick = async () => {
        setLoading(true);
        const url = `financials/billing/summary?key=salesByHourOfDay&startDate=${selectedDate}&endDate=${selectedDate}`;
        try {
            const fetchedData: DataEntry[] = await customFetch(url);
            const formattedData = fetchedData.map((entry) => ({
                ...entry,
                totalSales: Number(entry.totalSales) || 0,
            }));
            setData(formattedData);
            const calculatedTotalSales = formattedData.reduce((sum, entry) => sum + entry.totalSales, 0);
            setTotalSales(calculatedTotalSales);
        } catch (err) {
            setData([]);
            setTotalSales(0);
        } finally {
            setLoading(false);
        }
    };

    const toggleChartType = () => {
        setChartType(chartType === "bar" ? "line" : "bar");
    };

    const barFillColor = "#36a2eb";
    const borderRadiusValue = 5;

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', fontFamily: 'Arial, sans-serif' }}>
            <div className="row mb-3">
                <div className="col-12 col-md-6 d-flex align-items-center gap-3">
                    <Form.Label htmlFor="selectedDate" className="mb-0" style={{ fontWeight: 'bold' }}>
                        Date:
                    </Form.Label>
                    <Form.Control
                        type="date"
                        id="selectedDate"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ maxWidth: "200px", borderColor: '#ced4da', borderRadius: '0.25rem' }}
                    />
                    <Button variant="outline-secondary" size="sm" onClick={handleRefreshClick}>
                        <RiRefreshFill/> Refresh
                    </Button>
                </div>
                <div className="col-12 col-md-6 d-flex align-items-center justify-content-end gap-3">
                    <Form.Control
                        type="text"
                        placeholder="Filter by hour"
                        value={hourFilter}
                        onChange={(e) => setHourFilter(e.target.value)}
                        style={{ maxWidth: "200px" }}
                    />
                    <Button variant="outline-primary" size="sm" onClick={toggleChartType}>
                        Switch to {chartType === "bar" ? "Line Chart" : "Bar Chart"}
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    <div className=" pls-label">
                        Daily Hourly Sales
                    </div>
                    <div className="col-9">
                        <div style={{ height: "400px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === "bar" ? (
                                    <BarChart data={filteredData} margin={{ top: 20, right: 40, bottom: 60, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="hour"
                                            tickFormatter={formatHourRange}
                                            angle={-45}
                                            textAnchor="end"
                                            interval={0}
                                            style={{ fontSize: '0.8rem' }}
                                        />
                                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} style={{ fontSize: '0.8rem' }} />
                                        <Tooltip
                                            formatter={(value: number, name: string) => {
                                                const percentage = totalSales > 0 ? ((value / totalSales) * 100).toFixed(2) : "0.00";
                                                return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                            }}
                                            contentStyle={{ backgroundColor: '#f8f9fa', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                                        <Bar dataKey="totalSales" fill={barFillColor} radius={[borderRadiusValue, borderRadiusValue, 0, 0]} />
                                    </BarChart>
                                ) : (
                                    <LineChart data={filteredData} margin={{ top: 20, right: 40, bottom: 60, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="hour"
                                            tickFormatter={formatHourRange}
                                            angle={-45}
                                            textAnchor="end"
                                            interval={0}
                                            style={{ fontSize: '0.8rem' }}
                                        />
                                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} style={{ fontSize: '0.8rem' }} />
                                        <Tooltip
                                            formatter={(value: number, name: string) => {
                                                const percentage = totalSales > 0 ? ((value / totalSales) * 100).toFixed(2) : "0.00";
                                                return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                            }}
                                            contentStyle={{ backgroundColor: '#f8f9fa', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                                        <Line type="monotone" dataKey="totalSales" stroke={barFillColor} strokeWidth={2} />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="col-3">
                        <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
                            <table className="table table-bordered ttable" style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,.075)' }}>
                                <thead className="bg-light text-center">
                                    <tr>
                                        <th style={{ fontWeight: 'bold' }}>Hour</th>
                                        <th style={{ fontWeight: 'bold' }}>Sales</th>
                                        <th style={{ fontWeight: 'bold' }}>% </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((entry, index) => {
                                        const percentage = totalSales > 0 ? ((entry.totalSales / totalSales) * 100).toFixed(2) : "0.00";
                                        return (
                                            <tr key={index}>
                                                <td>{formatHourRange(entry.hour)}</td>
                                                <td>{currencyFormatter.format(entry.totalSales)}</td>
                                                <td style={{ color: getPercentageColor(Number(percentage)), fontWeight: "bold" }}>
                                                    {percentage}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
