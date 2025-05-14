"use client"
import { useEffect, useState } from "react";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

const SHADCN_ACCENT = "#3B82F6"; // blue-500
const SHADCN_MUTED_FOREGROUND = "#64748B"; // slate-500
const SHADCN_BORDER = "#E2E8F0"; // slate-200
const SHADCN_TOOLTIP_BG = "#FFFFFF";
const SHADCN_TOOLTIP_FG = "#0F172A"; // slate-900

export default function YearlySalesTrend() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const url = `financials/billing/summary?key=yearlySalesTrend`;
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
    }, []);

    const totalSales = data.reduce((sum, entry) => sum + entry.totalSales, 0);

    return (
        <div className="">
            <h4 className="fw-bold mb-4 alert alert-warning text-bg-light">Yearly Sales Trend</h4>

            {loading ? (
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Loading...</span>
                </div>
            ) : data.length > 0 ? (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-4" style={{ width: "100%", height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart data={data} margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={SHADCN_BORDER} />
                                <XAxis
                                    dataKey="year"
                                    angle={0}
                                    textAnchor="middle"
                                    interval={0}
                                    stroke={SHADCN_BORDER}
                                    tick={{ fill: SHADCN_MUTED_FOREGROUND, fontSize: 12 }}
                                    tickLine={{ stroke: SHADCN_BORDER }}
                                />
                                <YAxis 
                                    tickFormatter={(value) => currencyFormatter.format(value)}
                                    stroke={SHADCN_BORDER}
                                    tick={{ fill: SHADCN_MUTED_FOREGROUND, fontSize: 12 }}
                                    tickLine={{ stroke: SHADCN_BORDER }}
                                />
                                <Tooltip
                                    formatter={(value, name) => {
                                        const percentage = ((value / totalSales) * 100).toFixed(2);
                                        return [`${currencyFormatter.format(value)} (${percentage}%)`, "Total Sales"];
                                    }}
                                    contentStyle={{ 
                                        backgroundColor: SHADCN_TOOLTIP_BG, 
                                        borderRadius: '0.5rem', 
                                        borderColor: SHADCN_BORDER, 
                                        color: SHADCN_TOOLTIP_FG, 
                                        fontSize: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
                                    }}
                                    labelStyle={{ color: SHADCN_TOOLTIP_FG, marginBottom: '4px', fontWeight: '500' }}
                                    itemStyle={{ color: SHADCN_MUTED_FOREGROUND }}
                                    cursor={{ fill: `${SHADCN_ACCENT}1A` }}
                                />
                                <Legend 
                                    wrapperStyle={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '12px', paddingTop: '10px' }}
                                />
                                <Bar 
                                    dataKey="totalSales" 
                                    fill={SHADCN_ACCENT} 
                                    radius={[4, 4, 0, 0]}
                                    name="Total Sales"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="">
                        <table className="w-full text-sm text-left table mt-4">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Year</th>
                                    <th className="px-6 py-3">Total Sales</th>
                                    <th className="px-6 py-3">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry, index) => {
                                    const percentage = ((entry.totalSales / totalSales) * 100).toFixed(2);
                                    return (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">{entry.year}</td>
                                            <td className="px-6 py-4 font-medium">{currencyFormatter.format(entry.totalSales)}</td>
                                            <td className="px-6 py-4">{percentage}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                    No data available...
                </p>
            )}
        </div>
    );
}
