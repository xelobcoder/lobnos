import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const OutsourceBarChart = () => {
    const data = [
        { name: 'January', cases: 12, tests: 2 },
        { name: 'February', cases: 19, tests: 3 },
        { name: 'March', cases: 3, tests: 20 },
        { name: 'April', cases: 5, tests: 5 },
        { name: 'May', cases: 2, tests: 1 },
        { name: 'June', cases: 3, tests: 4 },
        { name: 'July', cases: 9, tests: 8 },
    ];

    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart
                data={data}
                margin={{
                    top: 20, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cases" fill="#8884d8" />
                <Bar dataKey="tests" fill="#82ca9d" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default OutsourceBarChart;
