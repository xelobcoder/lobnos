import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EmailLogsBarChart = ({ data }) => {
  return (
    <div >
      <ResponsiveContainer width="100%" height={300} style={{ backgroundColor: 'white' }}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" stackId="1" fill="#0d6efd" barSize={30} />
          <Bar dataKey="failed" stackId="2" fill="#d63384" barSize={30} />
          <Bar dataKey="success" stackId="3" fill="#198754" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmailLogsBarChart;
