import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line,
    ResponsiveContainer,
} from 'recharts';

const StatisticsDashboard = ({ data }) => {
    const {
        totalTestsPerScientist,
        testTrendsOverTime,
        approvedTestsPerScientist,
        testsByScientistApprovalRates,
    } = data;

    return (
        <div>

        </div>
    )
}
export default StatisticsDashboard;
