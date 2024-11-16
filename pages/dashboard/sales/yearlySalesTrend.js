import { useEffect, useState } from "react";
import DashBoardLayoutSales from "../../../components/salesSummary/DashBoardLayout";
import { currencyFormatter, customFetch } from "../../../components/Auth/customFetch";
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
        <DashBoardLayoutSales>
            <h3>Yearly Sales Trend</h3>

            {loading ? (
                <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                    Loading or no data available...
                </p>
            ) : data.length > 0 ? (
                <>
                    <div style={{ width: "100%", height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart data={data} margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="year"
                                    angle={0}
                                    textAnchor="middle"
                                    interval={0}
                                />
                                <YAxis tickFormatter={(value) => currencyFormatter.format(value)} />
                                <Tooltip
                                    formatter={(value, name) => {
                                        const percentage = ((value / totalSales) * 100).toFixed(2);
                                        return [`${currencyFormatter.format(value)} (${percentage}%)`, name];
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="totalSales" fill="#5D8FB1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <table className="table table-bordered mt-4">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Total Sales</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.year}</td>
                                    <td>{currencyFormatter.format(entry.totalSales)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <p className="heightedBorder p-2 pls-color d-flex justify-content-center bg-s">
                    No data available...
                </p>
            )}
        </DashBoardLayoutSales>
    );
}
