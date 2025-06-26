import { useEffect, useState } from "react";
import { DirectFetchResponse } from "../Lib";
import styles from "../../../../styles/SmsTemplateList.module.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { month, test_count, monthly_approval_rate } = payload[0].payload;
        return (
            <div className="bg-white p-2 border rounded shadow-sm pls-color">
                <p className="mb-1 fw-bold">Month: {month}</p>
                <p className="mb-1">
                    <span className="fw-bold">Test Count: </span>{test_count}
                </p>
                <p className="mb-0">
                    <span className="fw-bold">Approval Rate: </span>{monthly_approval_rate}%
                </p>
            </div>
        );
    }
    return null;
};

export default function MonthlyApprovalRateByMonthAndYear() {
    const [data, setData] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        DirectFetchResponse(setData, `ascension/analytics/monthlyApprovalRate?year=${year}`, setIsLoading);
    }, []);

    const yearHandler = (event) => {
        const { value } = event.target;
        setYear(value);
        const valueLen = value.toString().length;
        if (valueLen === 4) {
            DirectFetchResponse(setData, `ascension/analytics/monthlyApprovalRate?year=${value}`, setIsLoading);
        }
    };

    if (isLoading) return <div>Please Wait!!!. Loading Data.........</div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="pls-label">
                    Monthly Ascension Count With Sample Approval Rates
                </div>
                <div>
                    <input
                        value={year}
                        onChange={yearHandler}
                        className="custom-input"
                        type="number"
                    />
                </div>
            </div>
            <div className="row">
                {/* Chart Column */}
                <div className="col-md-6">
                    <div style={{ width: '100%', height: 400, marginBottom: '2rem' }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={data}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                {/* Remove CartesianGrid for a plain look */}
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar
                                    dataKey="monthly_approval_rate"
                                    fill={COLORS[0]}
                                    name="Approval Rate (%)"
                                    barSize={30}
                                    radius={[10, 10, 0, 0]}
                                />
                                <Bar
                                    dataKey="test_count"
                                    fill={COLORS[1]}
                                    name="Total Test"
                                    barSize={30}
                                    radius={[10, 10, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table Column */}
                <div className="col-md-6">
                    <table className={`${styles.table} pls-label table-sm`}>
                        <thead className="table-sm">
                            <tr>
                                <th>Month</th>
                                <th>Year</th>
                                <th>Total Test</th>
                                <th>Approval Rate (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    <td className="text-capitalize">{item.month}</td>
                                    <td>{item.year}</td>
                                    <td>{item.test_count}</td>
                                    <td>{item.monthly_approval_rate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}