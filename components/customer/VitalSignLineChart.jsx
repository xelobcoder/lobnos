import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VitalSignLineChart = ({ data, title, dataKey, strokeColor }) => {
    return (
        <div className="p-2 bg-light heightedBorder bg-secondary-subtle">
            <h5>{title}</h5>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey={dataKey} stroke={strokeColor} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default VitalSignLineChart;
