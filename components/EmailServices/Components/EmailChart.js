import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EmailLogsBarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" stackId="a" fill="#8884d8" />
        <Bar dataKey="failed" stackId="a" fill="#FF0000" />
        <Bar dataKey="success" stackId="a" fill="#00FF00" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EmailLogsBarChart;
