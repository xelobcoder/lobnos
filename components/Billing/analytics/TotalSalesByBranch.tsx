"use client";
import React, { useEffect, useState } from "react";
import { currencyFormatter, customFetch } from "../../../components/Auth/customFetch";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

interface SalesData {
    branchid: number;
    totalSales: number;
    name: string;
}

const TotalSalesByBranch: React.FC = () => {
    const [data, setData] = useState<SalesData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<"pie" | "bar" | "table">("pie");
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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const url = `financials/billing/summary?key=totalSalesByBranch&startDate=${startDate}&endDate=${endDate}`;
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

        fetchData();
    }, [startDate, endDate]);

    const handleToggleView = () => {
        setView((prev) => {
            if (prev === "pie") return "bar";
            if (prev === "bar") return "table";
            return "pie";
        });
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setStartDate(e.target.value);
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setEndDate(e.target.value);

    if (loading)
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "150px" }}>
                <div className="spinner">
                    <style jsx>{`
                        .spinner {
                          width: 40px;
                          height: 40px;
                          border-radius: 50%;
                          background: radial-gradient(farthest-side, #474bff 94%, #0000) top/9px 9px no-repeat,
                                      conic-gradient(#0000 30%, #474bff);
                          -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 9px), #000 0);
                          animation: spinner-c7wet2 1s infinite linear;
                        }
                        @keyframes spinner-c7wet2 {
                          100% { transform: rotate(1turn); }
                        }
                    `}</style>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="p-3 bg-danger-subtle text-danger rounded">
                Error: {error}
            </div>
        );

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fs-4 fw-bold mb-0 pls-label bg-secondary-subtle p-2 br-5 ">Total Sales by Branch</h2>
            </div>
            <div className="d-flex flex-wrap mb-3">
                <div className="d-flex align-items-center me-3 mb-2">
                    <label className="me-2">Start</label>
                    <input type="date" className="form-control" value={startDate} onChange={handleStartDateChange} />
                </div>
                <div className="d-flex align-items-center me-3 mb-2">
                    <label className="me-2">End</label>
                    <input type="date" className="form-control" value={endDate} onChange={handleEndDateChange} />
                </div>
                <div className="d-flex align-items-center mb-2">
                    <button onClick={handleToggleView} className="btn btn-primary btn-sm pls-label ">
                        Switch to {view === "pie" ? "Bar Chart" : view === "bar" ? "Table" : "Pie Chart"}
                    </button>
                </div>
            </div>

            {data.length > 0 ? (
                view === "pie" ? (
                    <div style={{ height: "300px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="totalSales"
                                    label={({ name, percent }: any) =>
                                        `${name} (${(percent * 100).toFixed(1)}%)`
                                    }
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [value, "Sales"]}
                                    contentStyle={{ fontSize: "12px" }}
                                />
                                <Legend
                                    formatter={(value, entry: any) =>
                                        `${value}: ${entry.payload.totalSales} sales`
                                    }
                                    wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : view === "bar" ? (
                    <div style={{ height: "300px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                barSize={30}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} tickSize={5} />
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
                                <Bar dataKey="totalSales" radius={[4, 4, 0, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <table className="table table-bordered ttable">
                        <thead>
                            <tr>
                                <th>Branch Name</th>
                                <th>Total Sales</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.name}</td>
                                    <td>{currencyFormatter.format(entry.totalSales)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            ) : (
                <p className="p-2 text-center bg-secondary-subtle">No data available...</p>
            )}
        </div>
    );
};

export default TotalSalesByBranch;